using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Security.Principal;
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

        private readonly static object Lock1 = new object();
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdateEmployeeModuleSettings> _updateEmployeeModuleSettings;
        private readonly IHandleCommands<UpdateMyProfile> _updateMyProfile;
        private readonly IProcessEvents _eventProcessor;
        private readonly ILogExceptions _exceptionLogger;

        public UsfFacultyImporter( ICommandEntities entities,
                                   IHandleCommands<UpdateEmployeeModuleSettings> updateEmployeeModuleSettings,
                                   IHandleCommands<UpdateMyProfile> updateMyProfile,
                                   IProcessEvents eventProcessor,
                                   ILogExceptions exceptionLogger )
        {
            _entities = entities;
            _updateEmployeeModuleSettings = updateEmployeeModuleSettings;
            _updateMyProfile = updateMyProfile;
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

            var usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
            if (usf == null)
            {
                throw new Exception("USF Establishment not found.");
            }

#if STREAM_FROM_FILE
            {
                string filePath = string.Format("{0}{1}", AppDomain.CurrentDomain.BaseDirectory,
                                                @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\USFSampleFacultyProfile.json");

                if (File.Exists(filePath))
                {
                    using (var stream = new FileStream(filePath, FileMode.Open))
                    {
                        var serializer = new DataContractJsonSerializer(typeof (Record));
                        record = (Record) serializer.ReadObject(stream);

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
                            var serializer = new DataContractJsonSerializer(typeof (Record));
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

            if (record == null)
            {
                throw new Exception("Error getting faculty record.");
            }

            if (record.UsfEmailAddress == null)
            {
                return;
            }

            if (record.UsfEmailAddress != user.Person.DefaultEmail.Value)
            {
                throw new Exception("Error getting faculty record (emails don't match).");
            }

            DateTime? facultyInfoLastActivityDate = null;
            if (!String.IsNullOrEmpty(record.LastActivityDate))
            {
                facultyInfoLastActivityDate = DateTime.Parse(record.LastActivityDate);
            }

            bool updateDepartments = false;

            lock (Lock1)
            {
                var employeeModuleSettings = _entities.Get<EmployeeModuleSettings>()
                                                      .SingleOrDefault(s => s.Establishment.RevisionId == usf.RevisionId);
                if ((employeeModuleSettings != null) &&
                     (!employeeModuleSettings.EstablishmentsExternalSyncDate.HasValue ||
                     (facultyInfoLastActivityDate != employeeModuleSettings.EstablishmentsExternalSyncDate))
                   )
                {
                    if (employeeModuleSettings.EstablishmentsLastUpdateResult != "inprogress")
                    {
                        var updateSettings = new UpdateEmployeeModuleSettings(employeeModuleSettings.Id)
                        {
                            EstablishmentsLastUpdateAttempt = DateTime.UtcNow,
                            EstablishmentsLastUpdateResult = "inprogress"
                        };

                        _updateEmployeeModuleSettings.Handle(updateSettings);

                        updateDepartments = true;
                    }
                    else
                    {
                        Debug.WriteLine(DateTime.Now + " USF: Establishment update in-progress.  Started: " + employeeModuleSettings.EstablishmentsLastUpdateAttempt);
                    }
                }
            }

            /*
             * We are making a tradeoff, here, between responsiveness and convenience.  If we determine
             * that the USF hierarchy needs to be updated, we will start a new task to do so.  However,
             * we will not import the profile info for this person.   Why?
             * 
             * 1. Obtaining the department list data and then processing it is a long process. Making
             * the user wait is not a good practice. ( > 50 seconds )
             * 
             * 2. Since the USF service does not notify us when the department list has changed, the
             * only time we CAN know is when faculty profile data is imported.
             * 
             * 3. This is not mission critical data.  The user can always manually enter profile info.
            */
            if (updateDepartments)
            {
                _eventProcessor.Raise(new UsfStaleEstablishmentHierarchy());
                Debug.WriteLine(DateTime.Now + " USF: UsfStaleEstablishmentHierarchy event raised.");
            }
            else
            {
                var employeeModuleSettings = _entities.Get<EmployeeModuleSettings>()
                   .SingleOrDefault(s => s.Establishment.RevisionId == usf.RevisionId);

                if (employeeModuleSettings != null)
                {
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

                    Debug.WriteLine(DateTime.Now + " USF: " + user.Person.DefaultEmail.Value + " updated.");
                }
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
                _exceptionLogger.Log(ex);
            }

            Exit:;

            /* For those callers that need synchronization. */
            @event.Signal.Set();
        }

    }
}
