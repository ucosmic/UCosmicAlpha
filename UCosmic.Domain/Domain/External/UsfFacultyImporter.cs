#pragma warning disable 649

using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Runtime.Serialization;
using System.Security.Principal;
using System.Threading;
using Newtonsoft.Json;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;


namespace UCosmic.Domain.External
{
    // TODO: affst
    public class UsfFacultyImporter : IHandleEvents<UserCreated>
    {
        [DataContract]
        private class ProfileRecord
        {
            [DataMember(Name = "College")]
            public string College;
            [DataMember(Name = "Department/Program")]
            public string Department;
            [DataMember(Name = "DEPTID")]
            public string DeptId;
            [DataMember(Name = "Faculty Rank")]
            public string FacultyRank;
            [DataMember(Name = "Institutional Affiliation")]
            public string InstitutionalAffiliation;
            [DataMember(Name = "Position Title")]
            public string PositionTitle;
        }

        [DataContract]
        private class Record
        {
            [DataMember(Name = "lastUpdate")]
            public string LastActivityDate; // MM-DD-YYYY
            [DataMember(Name = "Last Name")]
            public string LastName;
            [DataMember(Name = "First Name")]
            public string FirstName;
            [DataMember(Name = "Middle Name")]
            public string MiddleName;
            [DataMember(Name = "Suffix")]
            public string Suffix;
            [DataMember(Name = "Gender")]
            public string Gender;
            [DataMember(Name = "USF Email Address")]
            public string UsfEmailAddress;
            [DataMember(Name = "profile")]
            public ProfileRecord[] Profiles;
        }

        private const string ServiceSyncName = "UsfFacultyProfile"; // Also used in SensativeData.sql
        private readonly ICommandEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateServiceSync> _updateServiceSync;
        private readonly IHandleCommands<UpdateMyProfile> _updateMyProfile;
        private readonly IHandleCommands<CreateEmailAddress> _createEmailAddress;
        private readonly IHandleCommands<UsfCreateEstablishment> _createUsfEstablishment;
        private readonly IHandleCommands<UsfUpdateEstablishment> _updateUsfEstablishment;
        private readonly IHandleCommands<UpdateEstablishmentHierarchy> _updateHierarchy;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogExceptions _exceptionLogger;
        private EstablishmentType _collegeEstablishmentType;
        private EstablishmentType _departmentEstablishmentType;

        public UsfFacultyImporter(ICommandEntities entities
            , IProcessQueries queryProcessor
            , IHandleCommands<UpdateServiceSync> updateServiceSync
            , IHandleCommands<UpdateMyProfile> updateMyProfile
            , IHandleCommands<CreateEmailAddress> createEmailAddress
            , IHandleCommands<UsfCreateEstablishment> createUsfEstablishment
            , IHandleCommands<UsfUpdateEstablishment> updateUsfEstablishment
            , IHandleCommands<UpdateEstablishmentHierarchy> updateHierarchy
            , IUnitOfWork unitOfWork
            , ILogExceptions exceptionLogger
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
            _updateServiceSync = updateServiceSync;
            _updateMyProfile = updateMyProfile;
            _createEmailAddress = createEmailAddress;
            _createUsfEstablishment = createUsfEstablishment;
            _updateUsfEstablishment = updateUsfEstablishment;
            _updateHierarchy = updateHierarchy;
            _unitOfWork = unitOfWork;
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
                Record record;

                var serviceSync = _entities.Get<ServiceSync>().SingleOrDefault(s => s.Name == ServiceSyncName);
                if (serviceSync == null)
                {
                    var ex = new Exception("Could not find ServiceSync for USF.");
                    _exceptionLogger.Log(ex);
                    return;
                }

                Debug.WriteLine(DateTime.Now + "ServiceSync Table Row:");
                Debug.WriteLine("Name: " + serviceSync.Name);
                Debug.WriteLine("ExternalSyncDate: " + (serviceSync.ExternalSyncDate.HasValue ? serviceSync.ExternalSyncDate.Value.ToString(CultureInfo.InvariantCulture) : "NULL"));
                Debug.WriteLine("LastUpdateAttempt: " + (serviceSync.LastUpdateAttempt.HasValue ? serviceSync.LastUpdateAttempt.Value.ToString(CultureInfo.InvariantCulture) : "NULL"));
                Debug.WriteLine("UpdateFailCount: " + (serviceSync.UpdateFailCount.HasValue ? serviceSync.UpdateFailCount.Value.ToString(CultureInfo.InvariantCulture) : "NULL"));
                Debug.WriteLine("LastUpdateResult: " + serviceSync.LastUpdateResult);

                Debug.Write(DateTime.Now + " Attempting to get service ticket...");

                //string serviceTicket = UsfCas.GetServiceTicket(serviceSync.ServiceUsername,
                //                                               serviceSync.ServicePassword,
                //                                               UsfFacultyInfo.CasUri);
                var serviceTicket = _queryProcessor.Execute(new UsfCasTicket(
                    serviceSync.ServiceUsername, serviceSync.ServicePassword));

                if (!String.IsNullOrEmpty(serviceTicket))
                {
                    Debug.WriteLine("success");

                    //var service = new UsfFacultyInfo();

                    /* We might want to set User.Person.DefaultEmail when user is created. */
                    //using (var stream = service.Open(serviceTicket, user.Name))
                    //{
                    //    var serializer = new DataContractJsonSerializer(typeof (Record));
                    //    record = (Record) serializer.ReadObject(stream);
                    //}
                    //
                    //service.Close();

                    //var response = service.Get(serviceTicket, user.Name);
                    //record = JsonConvert.DeserializeObject<Record>(response);
                    var json = _queryProcessor.Execute(new UsfCasFacultyResponse(serviceTicket, user.Name));
                    record = JsonConvert.DeserializeObject<Record>(json);
                }
                else
                {
                    Debug.Write("failed");
                    throw new Exception("Unable to obtain service ticket to USF CAS service.");
                }
#endif
                /* No record, done. */
                if (record == null)
                {
                    Debug.WriteLine(DateTime.Now + " No record");
                    throw new Exception("Error getting faculty record.");
                }

                /* If no email address, we're done. */
                if (record.UsfEmailAddress == null)
                {
                    Debug.WriteLine(DateTime.Now + " No email address provided");
                    return;
                }

                /* The record's email address does not match? */
                {
                    int atIndex = record.UsfEmailAddress.IndexOf('@');
                    if (atIndex == -1)
                    {
                        string message = String.Format("Malformed record email address: {0}", record.UsfEmailAddress);
                        throw new Exception(message);
                    }
                    string recordEmail = record.UsfEmailAddress.Substring(0, atIndex);

                    atIndex = user.Name.IndexOf('@');
                    string userEmail = user.Name.Substring(0, atIndex);

                    if (recordEmail != userEmail)
                    {
                        Debug.WriteLine(DateTime.Now + " Emails don't match: record=" + record.UsfEmailAddress +
                                        ", user=" + user.Name);
                        throw new Exception(string.Format(
                            "Error getting faculty record (emails don't match). USF Record: '{0}'; UCosmic Record: '{1}'", recordEmail, userEmail));
                    }
                }

                /* Get the last activity date from the record */
                DateTime? facultyInfoLastActivityDate;
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
                    (facultyInfoLastActivityDate != serviceSync.ExternalSyncDate) ||
                    "failed".Equals(serviceSync.LastUpdateResult, StringComparison.OrdinalIgnoreCase))
                {
                    Debug.WriteLine(DateTime.Now + " Update USF establishments required.");

                    if (serviceSync.LastUpdateResult != "inprogress")
                    {
                        try
                        {
                            var updateServiceSync = new UpdateServiceSync(serviceSync.Id)
                            {
                                LastUpdateAttempt = DateTime.UtcNow,
                                LastUpdateResult = "inprogress"
                            };
                            _updateServiceSync.Handle(updateServiceSync);
                            _unitOfWork.SaveChanges();

                            Debug.WriteLine(DateTime.Now + " USF: Department imported started.");

                            var departmentImported = new UsfDepartmentImporter(
                                _entities, _queryProcessor, _createUsfEstablishment, _updateUsfEstablishment, _updateServiceSync, _updateHierarchy, _unitOfWork);
                            departmentImported.Handle();

                            _entities.Reload(serviceSync);

                            Debug.WriteLine(DateTime.Now + " Department list update result: " + serviceSync.LastUpdateResult);
                        }
                        catch // dbUpdateConcurrencyException (OptimisticConcurrencyException)
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
                        Debug.WriteLine(DateTime.Now + " Waiting for department list update to complete");
                    }
                }
                else
                {
                    Debug.WriteLine(DateTime.Now + " No USF establishments update required.");
                }

                /* Wait for department list update to complete, or timeout. */
                if (hiearchyUpdateInProgress)
                {
                    long start = DateTime.Now.Ticks;
                    long duration = 0;
                    const long timeoutMs = 5 * 60 * 1000;

                    while (hiearchyUpdateInProgress && (duration < timeoutMs))
                    {
                        if (serviceSync.LastUpdateResult != "inprogress")
                        {
                            hiearchyUpdateInProgress = false;
                        }
                        else
                        {
                            Thread.Sleep(1000);
                            _entities.Reload(serviceSync);
                        }

                        duration = (DateTime.Now.Ticks - start) / TimeSpan.TicksPerMillisecond;
                    }

                    if (duration >= timeoutMs)
                    {
                        throw new Exception("ServiceSync update timeout");
                    }
                }

                if (serviceSync.LastUpdateResult == "succeeded")
                {
                    var usf = _entities.Get<Establishment>()
                                       .SingleOrDefault(e => e.OfficialName.Contains("University of South Florida"));
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

                        Establishment campus;
                        Establishment college;
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
                        Gender = record.Gender[0].ToString(CultureInfo.InvariantCulture).ToUpper(),
                        Affiliations = affiliations
                    };
                    _updateMyProfile.Handle(updateProfile);
                    _unitOfWork.SaveChanges();

                    // always store email when it exists
                    if (!string.IsNullOrWhiteSpace(record.UsfEmailAddress))
                        _createEmailAddress.Handle(new CreateEmailAddress(record.UsfEmailAddress, user.Person)
                        {
                            IsConfirmed = true,
                        });

                    /* Update fail count */
                    {
                        long start = DateTime.Now.Ticks;
                        long duration = 0;
                        const long timeoutMs = 5 * 60 * 1000;
                        bool busy = true;

                        while (busy && (duration < timeoutMs))
                        {
                            try
                            {
                                var updateServiceSyncCommand = new UpdateServiceSync(serviceSync.Id)
                                {
                                    UpdateFailCount = 0
                                };

                                _updateServiceSync.Handle(updateServiceSyncCommand);
                                _unitOfWork.SaveChanges();

                                busy = false;
                            }
                            catch // DbUpdateConcurrencyException
                            {
                                Thread.Sleep(1000);
                                _entities.Reload(serviceSync);
                            }

                            duration = (DateTime.Now.Ticks - start) / TimeSpan.TicksPerMillisecond;
                        }

                        if (duration >= timeoutMs)
                        {
                            throw new Exception("ServiceSync update timeout");
                        }
                    }

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
                    //Debug.WriteLine("Person root establishment = " + establishment.OfficialName);
                }

                /* Get root USF Establishment. */
                var usf = _entities.Get<Establishment>().SingleOrDefault(e => e.WebsiteUrl.Equals("www.usf.edu"));
                if (usf == null)
                {
                    throw new Exception("Unable to get establishment University of South Florida");
                }

                /* If this user is not affiliated with USF, ignore. */
                if (establishment.RevisionId == usf.RevisionId)
                {
                    Debug.WriteLine(DateTime.Now + " USF: Importing faculty profile for " + user.Name);
                    Import(@event.Principal, @event.UserId);
                }
            }
            catch (Exception ex)
            {
                try
                {
                    int? updateFailCount = 0;

                    /* Force state to 'failed' */
                    var serviceSync = _entities.Get<ServiceSync>().SingleOrDefault(s => s.Name == ServiceSyncName);
                    if (serviceSync != null)
                    {
                        _entities.Reload(serviceSync);

                        updateFailCount = serviceSync.UpdateFailCount.HasValue ? serviceSync.UpdateFailCount + 1 : 1;

                        var updateServiceSync = new UpdateServiceSync(serviceSync.Id)
                        {
                            LastUpdateResult = "failed",
                            UpdateFailCount = updateFailCount
                        };

                        _updateServiceSync.Handle(updateServiceSync);
                        _unitOfWork.SaveChanges();
                    }

                    // do not ignore any exceptions
                    const int importServiceFailIgnoreCount = 0;
                    Debug.WriteLine(DateTime.Now + " USF: FailCount = " + updateFailCount);
                    Debug.WriteLine(DateTime.Now + " USF: ERROR " + ex);
                    if (updateFailCount > importServiceFailIgnoreCount)
                    {
                        _exceptionLogger.Log(ex);
                    }
                }
                catch (Exception ex1)
                {
                    Debug.WriteLine(DateTime.Now + " USF: Fail " + ex1.Message);
                }
            }

            /* For those callers that need synchronization. */
            @event.Signal.Set();
        }

    }
}
