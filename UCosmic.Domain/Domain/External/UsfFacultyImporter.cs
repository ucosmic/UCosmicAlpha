using System;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Security.Principal;
using System.Threading;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

#pragma warning disable 649


namespace UCosmic.Domain.External
{
    public class UsfFacultyImporter : IHandleEvents<UserCreated>
    {
        [DataContract]
        private class ProfileRecord
        {
            [DataMember(Name = "Faculty Rank")] public string FacultyRank;
            [DataMember(Name = "Position Title")] public string PositionTitle;
            [DataMember(Name = "Institutional Affiliation")] public string InstitutionalAffiliation;
            [DataMember(Name = "College")] public string College;
            [DataMember(Name = "Department/Program")] public string Department;
        }

        [DataContract]
        private class Record
        {
            [DataMember(Name = "Last Activity Date")] public string LastActivityDate;
            [DataMember(Name = "Last Name")] public string LastName;
            [DataMember(Name = "First Name")] public string FirstName;
            [DataMember(Name = "Middle Name")] public string MiddleName;
            [DataMember(Name = "Suffix")] public string Suffix;
            [DataMember(Name = "Gender")] public string Gender;
            [DataMember(Name = "USF Email Address")] public string UsfEmailAddress;
            [DataMember(Name = "profile")] public ProfileRecord[] Profiles;
        }

        private const string ServiceSyncName = "UsfFacultyProfile"; // Also used in SensativeData.sql
        private readonly ICommandEntities _entities;
        private readonly IQueryEntities _query;
        private readonly IHandleCommands<UpdateServiceSync> _updateServiceSync;
        private readonly IHandleCommands<UpdateMyProfile> _updateMyProfile;
        private readonly IHandleCommands<CreateServiceSync> _createServiceSync;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;
        private readonly ILogExceptions _exceptionLogger;

        public UsfFacultyImporter(ICommandEntities entities,
                                  IQueryEntities query,
                                  IHandleCommands<UpdateServiceSync> updateServiceSync,
                                  IHandleCommands<UpdateMyProfile> updateMyProfile,
                                  IHandleCommands<CreateServiceSync> createServiceSync,
                                  IUnitOfWork unitOfWork,
                                  IProcessEvents eventProcessor,
                                  ILogExceptions exceptionLogger)
        {
            _entities = entities;
            _query = query;
            _updateServiceSync = updateServiceSync;
            _updateMyProfile = updateMyProfile;
            _createServiceSync = createServiceSync;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
            _exceptionLogger = exceptionLogger;
        }

        public void Import(IPrincipal principal, int userId)
        {
            Record record = null;
#if DEBUG
            string rawRecord = null;
#endif

            var user = _entities.Get<User>().SingleOrDefault(u => u.RevisionId == userId);
            if (user == null)
            {
                string message = String.Format("User id {0} not found.", userId);
                throw new Exception(message);
            }
            if (user.Person == null)
            {
                throw new Exception("Person not found.");
            }


#if true
            {
                string filePath = string.Format("{0}{1}", AppDomain.CurrentDomain.BaseDirectory,
                                                @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\USFSampleFacultyProfile.json");

                if (File.Exists(filePath))
                {
                    using (var stream = new FileStream(filePath, FileMode.Open))
                    {
                        var serializer = new DataContractJsonSerializer(typeof(Record));
                        record = (Record)serializer.ReadObject(stream);

                        stream.Seek(0, SeekOrigin.Begin);
                        StreamReader reader = new StreamReader(stream);
                        rawRecord = reader.ReadToEnd();
                    }
                }
            }
#else
            {
                var employeeModuleSettings = _entities.Get<EmployeeModuleSettings>()
                                                      .SingleOrDefault(s => s.Establishment.RevisionId == usf.RevisionId);

                if (employeeModuleSettings != null)
                {
                    string serviceTicket = UsfCas.GetServiceTicket(employeeModuleSettings.EstablishmentServiceUsername,
                                                                   employeeModuleSettings.EstablishmentServicePassword,
                                                                   UsfFacultyInfo.CasUri);
                    if (!String.IsNullOrEmpty(serviceTicket))
                    {
                        var service = new UsfFacultyInfo();

                        /* We might want to set User.Person.DefaultEmail when user is created. */
                        using (var stream = service.Open(serviceTicket, user.Name))
                        {
                            var serializer = new DataContractJsonSerializer(typeof(Record));
                            record = (Record)serializer.ReadObject(stream);

#if DEBUG
                            rawRecord = serializer.ToString();
#endif
                        }

                        service.Close();
                    }
                    else
                    {
                        throw new Exception("Unable to obtain service ticket to USF CAS service.");
                    }
                }
                else
                {
                    throw new Exception("Unable to call UsfFacultyInfo service. EmployeeModuleSettings not found.");
                }
            }
#endif

            Debug.WriteLine(DateTime.Now + " USF: ----- BEGIN RECORD -----");
            Debug.WriteLine(rawRecord);
            Debug.WriteLine(DateTime.Now + " USF: ----- END RECORD -----");

            /* No record, done. */
            if (record == null)
            {
                throw new Exception("Error getting faculty record.");
            }

            /* If no email address, we're done. */
            if (record.UsfEmailAddress == null)
            {
                return;
            }

            /* The record's email address does not match? */
            if (record.UsfEmailAddress != user.Name)
            {
                throw new Exception("Error getting faculty record (emails don't match).");
            }

            /* Get the last activity date from the record */
            DateTime? facultyInfoLastActivityDate = null;
            if (!String.IsNullOrEmpty(record.LastActivityDate))
            {
                facultyInfoLastActivityDate = DateTime.Parse(record.LastActivityDate);
            }

            /* Check for our ServiceSync table entry.  Create if necessary */
            var serviceSync = _entities.Get<ServiceSync>().SingleOrDefault(s => s.Name == ServiceSyncName);
            if (serviceSync == null)
            {
                var createServiceSyncCommand = new CreateServiceSync
                {
                    Name = ServiceSyncName
                };

                _createServiceSync.Handle(createServiceSyncCommand);
                _unitOfWork.SaveChanges();

                serviceSync = createServiceSyncCommand.CreatedServiceSync;
            }

            bool hiearchyUpdateInProgress = false;

            /* Determine if we need to update the USF Hiearchy. */
            if (serviceSync != null)
            {
                if (!serviceSync.ExternalSyncDate.HasValue ||
                    (facultyInfoLastActivityDate != serviceSync.ExternalSyncDate))
                {
                    if (serviceSync.LastUpdateResult != "inprogress")
                    {
                        var updateServiceSync = new UpdateServiceSync(serviceSync.Id)
                        {
                            LastUpdateAttempt = DateTime.UtcNow,
                            LastUpdateResult = "inprogress"
                        };

                        _updateServiceSync.Handle(updateServiceSync);

                        try
                        {
                            _unitOfWork.SaveChanges();

                            _eventProcessor.Raise(new UsfStaleEstablishmentHierarchy());
                            hiearchyUpdateInProgress = true; // inprogress because we just started it
                            Debug.WriteLine(DateTime.Now + " USF: UsfStaleEstablishmentHierarchy event raised.");
                        }
                        catch (OptimisticConcurrencyException)
                        {
                            hiearchyUpdateInProgress = true; // inprogress because another thread beat us to it
                            Debug.WriteLine(DateTime.Now + " USF: Establishment update in-progress.  Started: " +
                                            serviceSync.LastUpdateAttempt);
                        }

                    }
                    else
                    {
                        hiearchyUpdateInProgress = true; // inprogress because the current state is such
                        Debug.WriteLine(DateTime.Now + " USF: Establishment update in-progress.  Started: " +
                                        serviceSync.LastUpdateAttempt);
                    }
                }
            }
            else
            {
                Debug.WriteLine(DateTime.Now + " USF: Could get ServiceSync name " + ServiceSyncName);
                string message = String.Format("Could get ServiceSync name {0}", ServiceSyncName);
                throw new Exception(message);
            }

            /* Wait for department list update to complete, or timeout. */
            {
                const long timeoutMs = 240000;
                long start = DateTime.Now.Ticks;
                long duration = 0;
#if DEBUG
                while (hiearchyUpdateInProgress)
#else
                while (hiearchyUpdateInProgress && (duration < timeoutMs))
#endif
                {
                    serviceSync = _query.Query<ServiceSync>().SingleOrDefault(s => s.Name == ServiceSyncName);
                    if (serviceSync == null)
                    {
                        throw new Exception("ServiceSync deleted?");
                    }

                    if (serviceSync.LastUpdateResult != "inprogress")
                    {
                        hiearchyUpdateInProgress = false;
                    }
                    else
                    {
                        Thread.Sleep(1000);
                    }

                    duration = (DateTime.Now.Ticks - start) / TimeSpan.TicksPerMillisecond;
                }
            }

            if (serviceSync.LastUpdateResult == "succeeded")
            {
                var usf = _entities.Get<Establishment>()
                    .SingleOrDefault(e => e.OfficialName == "University of South Florida");
                if (usf == null)
                {
                    Debug.WriteLine(DateTime.Now + " USF: Establishment not found.");
                    throw new Exception("USF Establishment not found.");
                }

                var employeeModuleSettings = _entities.Get<EmployeeModuleSettings>()
                    .SingleOrDefault(s => s.Establishment.RevisionId == usf.RevisionId);
                if (employeeModuleSettings == null)
                {
                    Debug.WriteLine(DateTime.Now + " USF: Could not get EmployeeModuleSettings.");
                    throw new Exception("Could not get EmployeeModuleSettings for USF");
                }

                string title = record.Profiles[0].PositionTitle;
                var facultyRank = employeeModuleSettings.FacultyRanks.SingleOrDefault(r => r.Rank == title);
                int? facultyRankId = (facultyRank != null) ? (int?)facultyRank.Id : null;

                var updateProfile = new UpdateMyProfile(principal)
                {
                    PersonId = user.Person.RevisionId,
                    IsActive = true,
                    IsDisplayNameDerived = false,
                    DisplayName = String.Format("{0} {1}", record.FirstName, record.LastName),
                    Salutation = null,
                    FirstName = record.FirstName,
                    MiddleName = record.MiddleName,
                    LastName = record.LastName,
                    Suffix = record.Suffix,
                    Gender = record.Gender[0].ToString().ToUpper(),
                    FacultyRankId = facultyRankId,
                    JobTitles = record.Profiles[0].PositionTitle,
                    AdministrativeAppointments = ""
                };

                _updateMyProfile.Handle(updateProfile);
                _unitOfWork.SaveChanges();

                Debug.WriteLine(DateTime.Now + " USF: " + user.Name + " updated.");
            }
            else
            {
                Debug.WriteLine(DateTime.Now + " USF: Faculty not imported.  Departments not synced.");
            }
        }

        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
        public void Handle(UserCreated @event)
        {
            /* Don't import faculty profile information if seeding. */
            if (@event.Seeding)
            {
                goto Exit;
            }

            try
            {
                /* Get the user. */
                var user = _entities.Get<User>().SingleOrDefault(u => u.RevisionId == @event.UserId);
                if (user == null)
                {
                    string message = String.Format("Unable to get user id {0}", @event.UserId);
                    throw new Exception(message);
                }

                /* Get root Establishment of User. */
                Establishment establishment = user.Person.DefaultAffiliation.Establishment;
                while (establishment.Parent != null)
                {
                    establishment = establishment.Parent;
                }

                /* Get root USF Establishment. */
                var usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
                if (usf == null)
                {
                    throw new Exception("Unable to get establishment University of South Florida");
                }

                /* If this user is not affiliated with USF, ignore. */
                if (establishment.RevisionId == usf.RevisionId)
                {
                    Debug.WriteLine(DateTime.Now + " USF: Importing faculty profile for " + user.Person.DefaultEmail);
                    Import(@event.Principal, @event.UserId);
                }
            }
            catch (Exception ex)
            {
                /* Force state to 'failed' */
                var serviceSync = _entities.Get<ServiceSync>().SingleOrDefault(s => s.Name == ServiceSyncName);
                if (serviceSync != null)
                {
                    var updateServiceSync = new UpdateServiceSync(serviceSync.Id)
                    {
                        LastUpdateResult = "failed"
                    };

                    _updateServiceSync.Handle(updateServiceSync);
                    _unitOfWork.SaveChanges();
                }

                _exceptionLogger.Log(ex);
            }

        Exit: ;

            /* For those callers that need synchronization. */
            @event.Signal.Set();
        }

    }
}
