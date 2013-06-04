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
        private readonly IHandleCommands<UsfCreateEstablishment> _createEstablishment;
        private readonly IHandleCommands<UpdateEstablishmentHierarchy> _hierarchy;
        private readonly IUnitOfWork _unitOfWork;

        public UsfFacultyImporter( ICommandEntities entities,
                                   IHandleCommands<UsfCreateEstablishment> createEstablishment,
                                   IHandleCommands<UpdateEstablishmentHierarchy> hierarchy,
                                   IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _createEstablishment = createEstablishment;
            _hierarchy = hierarchy;
            _unitOfWork = unitOfWork;
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

            /* Get root USF Establishment. */
            var usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
            if (usf == null) { throw new Exception("USF Establishment not found."); }

            /* Compare the last activity date to what we have stored. */
            var employeeModuleSettings = _entities.Get<EmployeeModuleSettings>()
                         .SingleOrDefault(s => s.Establishment.RevisionId == usf.RevisionId);

            /* If the LAD does not match, we need to update the USF department list. */
            if (facultyInfoLastActivityDate != employeeModuleSettings.EstablishmentsExternalSyncDate)
            {
                Stream stream = null; // UsfDepartmentListService.get()

                var departmentImporter = new UsfDepartmentImporter( _entities,
                                                                    _createEstablishment,
                                                                    _unitOfWork,
                                                                    _hierarchy,
                                                                    facultyInfoLastActivityDate);
                departmentImporter.Import(stream);
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
