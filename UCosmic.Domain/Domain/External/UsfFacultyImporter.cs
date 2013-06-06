using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Threading.Tasks;
using UCosmic.Domain.Employees;
using UCosmic.Domain.People;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;


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

        private readonly static object _lock1 = new object();
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UsfCreateEstablishment> _createUsfEstablishment;
        private readonly IHandleCommands<UpdateEmployeeModuleSettings> _updateEmployeeModuleSettings;
        private readonly IHandleCommands<UpdateEstablishmentHierarchy> _hierarchy;
        private readonly IUnitOfWork _unitOfWork;

        public UsfFacultyImporter( ICommandEntities entities,
                                   IHandleCommands<UsfCreateEstablishment> createUsfEstablishment,
                                   IHandleCommands<UpdateEmployeeModuleSettings> updateEmployeeModuleSettings,
                                   IHandleCommands<UpdateEstablishmentHierarchy> hierarchy,
                                   IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _createUsfEstablishment = createUsfEstablishment;
            _updateEmployeeModuleSettings = updateEmployeeModuleSettings;
            _hierarchy = hierarchy;
            _unitOfWork = unitOfWork;
        }

        public void Import(int userId)
        {
            Record record = null;

#if true
            string filePath = string.Format("{0}{1}", AppDomain.CurrentDomain.BaseDirectory,
                                @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\USFSampleFacultyProfile.json");

            if (File.Exists(filePath))
            {
                using (var stream = new FileStream(filePath, FileMode.Open))
                {
                    var serializer = new DataContractJsonSerializer(typeof(Record));
                    record = (Record)serializer.ReadObject(stream);
                }
            }
#else
            /* Service here */
#endif

            DateTime? facultyInfoLastActivityDate = null;
            if (!String.IsNullOrEmpty(record.LastActivityDate))
            {
                facultyInfoLastActivityDate = DateTime.Parse(record.LastActivityDate);
            }

            /* Get root USF Establishment. */
            var usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
            if (usf == null) { throw new Exception("USF Establishment not found."); }

            EmployeeModuleSettings employeeModuleSettings = null;
            bool updateDepartments = false;

            lock (_lock1)
            {      
                employeeModuleSettings = _entities.Get<EmployeeModuleSettings>()
                                                      .SingleOrDefault(s => s.Establishment.RevisionId == usf.RevisionId);
                if ( (employeeModuleSettings != null) &&
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
                }
            }

            if ((employeeModuleSettings != null) && updateDepartments)
            {
                Task.Factory.StartNew(() => UpdateDepartments( _entities,
                                                                _createUsfEstablishment,
                                                                _updateEmployeeModuleSettings,
                                                                _hierarchy,
                                                                _unitOfWork,
                                                                facultyInfoLastActivityDate,
                                                                employeeModuleSettings ));
            }
            else
            {
                /* Update faculty profile information. */                
            }
        }

        public static void UpdateDepartments( ICommandEntities entities,
                                              IHandleCommands<UsfCreateEstablishment> createUsfEstablishment,
                                              IHandleCommands<UpdateEmployeeModuleSettings> updateEmployeeModuleSettings,
                                              IHandleCommands<UpdateEstablishmentHierarchy> hierarchy,
                                              IUnitOfWork unitOfWork,
                                              DateTime? lastFacultyProfileActivityDate,
                                              EmployeeModuleSettings employeeModuleSettings )
        {
            try
            {
                UsfDepartmentImporter departmentImporter = null;

#if true
                string filePath = string.Format("{0}{1}", AppDomain.CurrentDomain.BaseDirectory,
                                   @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\USFDepartmentList.json");

                if (File.Exists(filePath))
                {
                    using (var stream = new FileStream(filePath, FileMode.Open))
                    {
                        departmentImporter = new UsfDepartmentImporter( entities,
                                                                        createUsfEstablishment,
                                                                        unitOfWork,
                                                                        hierarchy,
                                                                        lastFacultyProfileActivityDate
                                                                       );
                        departmentImporter.Import(stream);
                    }
                }
#else
                var departmentImporter = new UsfDepartmentImporter( entities,
                                                                    createEstablishment,
                                                                    unitOfWork,
                                                                    hierarchy,
                                                                    lastFacultyProfileActivityDate );

                departmentImporter.Import(stream);
#endif

                var updateSettings = new UpdateEmployeeModuleSettings(employeeModuleSettings.Id)
                {
                    EstablishmentsExternalSyncDate = departmentImporter.LastDepartmentListActivityDate,
                    EstablishmentsLastUpdateResult = "succeeded",
                    EstablishmentsUpdateFailCount = 0
                };

                updateEmployeeModuleSettings.Handle(updateSettings);
            }
            catch (Exception ex)
            {
                string errorMessage = ex.Message;

                var updateSettings = new UpdateEmployeeModuleSettings(employeeModuleSettings.Id)
                {
                    EstablishmentsLastUpdateResult = "failed",
                    EstablishmentsUpdateFailCount = employeeModuleSettings.EstablishmentsUpdateFailCount + 1
                };

                updateEmployeeModuleSettings.Handle(updateSettings);

                int maxFailCount = Int32.Parse(ConfigurationManager.AppSettings["UsfDepartmentListUpdateMaxFailCountBeforeErrorMail"]);
                if (employeeModuleSettings.EstablishmentsUpdateFailCount >= maxFailCount)
                {
                    //MailMessage message = new MailMessage( fromAddress,
                    //                                       toAddress,
                    //                                       "UCosmic: Error updating USF Departments",
                    //                                       body );
                }
            }
        }

        public void Handle(UserCreated @event)
        {
            /* Don't import faculty profile information if seeding. */
            if (@event.Seeding) { goto Exit; }

            /* Get the user. */
            var user = _entities.Get<User>().SingleOrDefault(u => u.RevisionId == @event.UserId);
            if (user == null) { goto Exit; }

            /* Get root Establishment of User. */
            Establishment establishment = user.Person.DefaultAffiliation.Establishment;
            while (establishment.Parent != null)
            {
                establishment = establishment.Parent;
            }

            /* Get root USF Establishment. */
            var usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
            if (usf == null) { throw new Exception("USF Establishment not found."); }

            /* If this user is not affiliated with USF, leave. */
            if (establishment.RevisionId != usf.RevisionId) { goto Exit; }

            try
            {
                Import(@event.UserId);
            }
            catch
            {

            }


        Exit:;

            /* For those callers that need synchronization. */
            @event.Signal.Set();
        }

    }
}
