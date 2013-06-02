using System;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
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
            [DataMember] public string FACULTY_RANK;
            [DataMember] public string POSITION_TITLE;
            [DataMember] public string INSTITUTIONAL_AFFILIATION;
            [DataMember] public string COLLEGE;
            [DataMember] public string DEPARTMENT_PROGRAM;
        }

        [DataContract]
        private class Record
        {
            [DataMember] public string LAST_ACTIVITY_DATE;
            [DataMember] public string LASTNAME;
            [DataMember] public string FIRSTNAME;
            [DataMember] public string MIDDLENAME;
            [DataMember] public string SUFFIX;
            [DataMember] public string GENDER;
            [DataMember] public string USF_EMAIL_ADDRESS;
            [DataMember] public ProfileRecord[] PROFILES;
        }

        private readonly ICommandEntities _entities;
        private readonly Establishment _usf;

        public UsfFacultyImporter(ICommandEntities entities)
        {
            _entities = entities;

            /* Get root USF Establishment. */
            _usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
            if (_usf == null) { throw new Exception("USF Establishment not found."); }
        }

        public void Import(int userId)
        {
            /* Setup for web api call to USF service. */

            /* Wait for data. */
                /* If we timeout or error, nothing is imported leave. */
            Record record = null;

            DateTime? facultyInfoLastActivityDate = null;
            if (!String.IsNullOrEmpty(record.LAST_ACTIVITY_DATE))
            {
                facultyInfoLastActivityDate = DateTime.Parse(record.LAST_ACTIVITY_DATE);
            }

            /* Compare the last activity date to what we have stored. */
            var employeeModuleSettings = _entities.Get<EmployeeModuleSettings>()
                         .SingleOrDefault(s => s.Establishment.RevisionId == _usf.RevisionId);

            /* If the LAD does not match, we need to update the USF department list. */
            if (facultyInfoLastActivityDate != employeeModuleSettings.EstablishmentsExternalSyncDate)
            {
                var departmentImporter = new UsfDepartmentImporter(_entities, facultyInfoLastActivityDate);
                departmentImporter.Import();
            }

            /* Update faculty profile information. */
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

            /* If this user is not affiliated with USF, leave. */
            if (establishment.RevisionId != _usf.RevisionId) { goto Exit; }

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
