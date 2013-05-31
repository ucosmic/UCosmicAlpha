using System;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
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
            [DataMember] public string LAST_ACTIVITY;
            [DataMember] public string LASTNAME;
            [DataMember] public string FIRSTNAME;
            [DataMember] public string MIDDLENAME;
            [DataMember] public string SUFFIX;
            [DataMember] public string GENDER;
            [DataMember] public string USF_EMAIL_ADDRESS;
            [DataMember] public ProfileRecord[] PROFILES;
        }

        private readonly ICommandEntities _entities;

        public UsfFacultyImporter(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Import(int userId)
        {
            /* Setup for web api call to USF service. */

            /* Wait for data. */
                /* If we timeout or error, nothing is imported leave. */

            //DateTime? lastFacultyListActivityDate = GetLastDepartmentListActivityDate();

            /* Compare the last activity date to what we have stored. */
            //DateTime? lastDepartmentListActivityDate = GetLastDepartmentListActivityDate();

            /* If the LAD does not match, we need to update the USF departments. */
            /* Call UsfDepartementImporter.Import() */
            /* UpdateUsfEstablishmentHierarchy() That's going to be fun to write */

            /* Update faculty profile information. */
        }

        public void Handle(UserCreated @event)
        {
            /* Don't import faculty profile information if seeding. */
            if (@event.Seeding) { goto Exit; }

            /* Get the user. */
            var user = _entities.Get<User>().SingleOrDefault(u => u.RevisionId == @event.UserId);
            if (user == null) { goto Exit; }

            /* Get root USF Establishment. */
            var usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
            if (usf == null) { goto Exit; }

            /* Get root Establishment of User. */
            Establishment establishment = user.Person.DefaultAffiliation.Establishment;
            while (establishment.Parent != null)
            {
                establishment = establishment.Parent;
            }

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
