using System;
using System.Collections.ObjectModel;
using System.Data;
using System.Diagnostics;
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
            [DataMember(Name = "College")] public string College;
            [DataMember(Name = "Department/Program")] public string Department;
            [DataMember(Name = "DEPTID")] public string DeptId;
            [DataMember(Name = "Faculty Rank")] public string FacultyRank;
            [DataMember(Name = "Institutional Affiliation")] public string InstitutionalAffiliation;
            [DataMember(Name = "Position Title")] public string PositionTitle;
        }

        [DataContract]
        private class Record
        {
            [DataMember(Name = "lastUpdate")] public string LastActivityDate; // MM-DD-YYYY
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
        private EstablishmentType _collegeEstablishmentType;
        private EstablishmentType _departmentEstablishmentType;

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
            var user = _entities.Get<User>().Single(u => u.RevisionId == userId);
            if (user.Person == null) { throw new Exception("Person not found."); }

            string establishmentType = KnownEstablishmentType.College.AsSentenceFragment();
            _collegeEstablishmentType = _entities.Get<EstablishmentType>().Single(t => t.EnglishName == establishmentType);

            establishmentType = KnownEstablishmentType.Department.AsSentenceFragment();
            _departmentEstablishmentType = _entities.Get<EstablishmentType>().Single(t => t.EnglishName == establishmentType);

#if false
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
                Record record = null;

                var serviceSync = _entities.Get<ServiceSync>().SingleOrDefault(s => s.Name == ServiceSyncName);
                if (serviceSync == null)
                {
                    var ex = new Exception("Could not find ServiceSync for USF.");
                    _exceptionLogger.Log(ex);
                    return;
                }

                string serviceTicket = UsfCas.GetServiceTicket(serviceSync.ServiceUsername,
                                                               serviceSync.ServicePassword,
                                                               UsfFacultyInfo.CasUri);
                if (!String.IsNullOrEmpty(serviceTicket))
                {
                    var service = new UsfFacultyInfo();

                    /* We might want to set User.Person.DefaultEmail when user is created. */
                    using (var stream = service.Open(serviceTicket, user.Name))
                    {
                        var serializer = new DataContractJsonSerializer(typeof (Record));
                        record = (Record) serializer.ReadObject(stream);
                    }

                    service.Close();
                }
                else
                {
                    throw new Exception("Unable to obtain service ticket to USF CAS service.");
                }
#endif
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
                else
                {
                    throw new Exception("Last activity date not provided.");
                }


                bool hiearchyUpdateInProgress = false;

                /* Determine if we need to update the USF Hiearchy. */

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

                /* Wait for department list update to complete, or timeout. */
                {
                    long start = DateTime.Now.Ticks;
                    long duration = 0;
#if false
                    while (hiearchyUpdateInProgress)
#else
                    const long timeoutMs = 2 /* min */ * 60 /* sec */ * 1000 /* ms */;
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

                        duration = (DateTime.Now.Ticks - start)/TimeSpan.TicksPerMillisecond;
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

                    var affiliations = new Collection<UpdatePerson.Affiliation>();

                    for (int i = 0; i < record.Profiles.Count(); i += 1)
                    {
                        ProfileRecord profile = record.Profiles[i];

                        Establishment campus = null;
                        Establishment college = null;
                        Establishment department = null;

                        if (!String.IsNullOrEmpty(profile.DeptId))
                        {
                            var collegeOrDepartment = _entities.Get<Establishment>()
                                                               .SingleOrDefault(e => e.ExternalId == profile.DeptId);
                            if (collegeOrDepartment != null)
                            {
                                if (collegeOrDepartment.Type.RevisionId == _departmentEstablishmentType.RevisionId)
                                {
                                    department = collegeOrDepartment;
                                    college = department.Parent;
                                    campus = college.Parent;
                                }
                                else if (collegeOrDepartment.Type.RevisionId == _collegeEstablishmentType.RevisionId)
                                {
                                    college = collegeOrDepartment;
                                    campus = college.Parent;
                                }
                                else
                                {
                                    string message =
                                        String.Format("USF specified establishment type is unknown for DeptId {0}",
                                                      profile.DeptId);
                                    throw new Exception(message);
                                }
                            }
                            else
                            {
                                string message = String.Format("USF Departement ID {0} not found",
                                                               profile.DeptId);
                                throw new Exception(message);
                            }
                        }
                        else
                        {
                            string message = String.Format("USF Departement ID not provided for {0}, {1}, {2}",
                                profile.InstitutionalAffiliation,
                                profile.College,
                                profile.Department);

                            throw new Exception(message);
                        }

                        int? campusId = (campus != null) ? (int?)campus.RevisionId : null;
                        int? collegeId = (college != null) ? (int?)college.RevisionId : null;
                        int? departmentId = (department != null) ? (int?)department.RevisionId : null;
                        int? facultyRankId = null;

                        {
                            int number;
                            if (Int32.TryParse(profile.FacultyRank, out number))
                            {
                                if ((number >= 1) && (number <= employeeModuleSettings.FacultyRanks.Count))
                                {
                                    var facultyRank =
                                        employeeModuleSettings.FacultyRanks.SingleOrDefault(r => r.Number == number);

                                    if (facultyRank != null)
                                    {
                                        facultyRankId = facultyRank.Id;
                                    }
                                }
                            }
                        }

                        var affiliation = new UpdatePerson.Affiliation
                        {
                            EstablishmentId = usf.RevisionId,
                            JobTitles = profile.PositionTitle,
                            IsDefault = false,
                            IsPrimary = false,
                            IsAcknowledged = true,
                            IsClaimingStudent = false,
                            IsClaimingEmployee = true,
                            IsClaimingInternationalOffice = false,
                            IsClaimingAdministrator = false,
                            IsClaimingFaculty = true,
                            IsClaimingStaff = false,
                            CampusId = campusId,
                            CollegeId = collegeId,
                            DepartmentId = departmentId,
                            FacultyRankId = facultyRankId
                        };

                        affiliations.Add(affiliation);
                    }

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
                        Affiliations = affiliations
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
