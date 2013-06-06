using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

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
        private readonly IProcessEvents _eventProcessor;

        public UsfFacultyImporter( ICommandEntities entities,
                                   IHandleCommands<UpdateEmployeeModuleSettings> updateEmployeeModuleSettings,
                                   IProcessEvents eventProcessor)
        {
            _entities = entities;
            _updateEmployeeModuleSettings = updateEmployeeModuleSettings;
            _eventProcessor= eventProcessor;
        }

        public void Import(int userId)
        {
            Record record = null;
#if DEBUG
            string rawRecord = null;
#endif

#if true
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
#else
            /* Service here */
#endif

            Debug.WriteLine(DateTime.Now + " USF: ----- BEGIN RECORD -----");
            Debug.WriteLine(rawRecord);
            Debug.WriteLine(DateTime.Now + " USF: ----- END RECORD -----");

            DateTime? facultyInfoLastActivityDate = null;
            if (!String.IsNullOrEmpty(record.LastActivityDate))
            {
                facultyInfoLastActivityDate = DateTime.Parse(record.LastActivityDate);
            }

            /* Get root USF Establishment. */
            var usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
            if (usf == null) { throw new Exception("USF Establishment not found."); }

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

            if (updateDepartments)
            {
                _eventProcessor.Raise(new UsfStaleEstablishmentHierarchy());
                Debug.WriteLine(DateTime.Now + " USF: UsfStaleEstablishmentHierarchy event raised.");
            }
            else
            {
                /* Update faculty profile information. */
            }
        }


        // --------------------------------------------------------------------------------
        /*
        */
        // --------------------------------------------------------------------------------
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
                Debug.WriteLine(DateTime.Now + " USF: Importing faculty profile for " + user.Person.DefaultEmail);
                Import(@event.UserId);
            }
            catch
            {
                /* Maybe ElmahLog here? */
            }


        Exit:;

            /* For those callers that need synchronization. */
            @event.Signal.Set();
        }

    }
}
