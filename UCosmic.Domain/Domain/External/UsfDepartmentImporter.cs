using System;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.External
{
    public class UsfDepartmentImporter
    {
        [DataContract]
        private class DepartmentRecord
        {
            [DataMember]
            public string LAST_ACTIVITY_DATE;
            [DataMember]
            public string DEPTID;
            [DataMember]
            public string INSTITUTION;
            [DataMember]
            public string COLLEGE;
            [DataMember]
            public string DEPARTMENT;
        }

        [DataContract]
        private class Record
        {
            [DataMember]
            public string LAST_ACTIVITY_DATE;
            [DataMember]
            public DepartmentRecord[] DEPARTMENTS;
        }

        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UsfCreateEstablishment> _createEstablishment;
        private readonly IUnitOfWork _unitOfWork;
        private DateTime? _lastFacultyProfileActivityDate;
        private Establishment _usf;
        private StringDictionary _campuses;
        private EstablishmentType _campusEstablishmentType;
        private EstablishmentType _collegeEstablishmentType;
        private EstablishmentType _departmentEstablishmentType;

        // ----------------------------------------------------------------------
        /*
        */
        // ----------------------------------------------------------------------
        public UsfDepartmentImporter(ICommandEntities entities,
                                     IHandleCommands<UsfCreateEstablishment> createEstablishment,
                                     IUnitOfWork unitOfWork,
                                     DateTime? lastFacultyProfileActivityDate)
        {
            _entities = entities;
            _createEstablishment = createEstablishment;
            _unitOfWork = unitOfWork;
            _lastFacultyProfileActivityDate = lastFacultyProfileActivityDate;

            _usf = null;
        }

        // ----------------------------------------------------------------------
        /*
        */
        // ----------------------------------------------------------------------
        public void UsfEstablishmentsSetup()
        {
            _usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
            if (_usf == null) { throw new Exception("USF Establishment not found."); }

            _campuses = new StringDictionary();
            _campuses.Add("TAMPA", "USF Tampa Campus");
            _campuses.Add("ST.PETE", "USF St. Petersburg Campus");
            _campuses.Add("SARASOTA", "USF Sarasota-Manatee Campus");

            _campusEstablishmentType =
                _entities.Get<EstablishmentType>()
                         .SingleOrDefault(
                             t => t.EnglishName == KnownEstablishmentType.UniversityCampus.AsSentenceFragment());
            if (_campusEstablishmentType == null) { throw new Exception("Campus EstablishmentType not found."); }

            _collegeEstablishmentType =
                _entities.Get<EstablishmentType>()
                         .SingleOrDefault(
                             t => t.EnglishName == KnownEstablishmentType.College.AsSentenceFragment());
            if (_collegeEstablishmentType == null) { throw new Exception("College EstablishmentType not found."); }

            _departmentEstablishmentType =
                _entities.Get<EstablishmentType>()
                         .SingleOrDefault(
                             t => t.EnglishName == KnownEstablishmentType.Department.AsSentenceFragment());
            if (_departmentEstablishmentType == null) { throw new Exception("Department EstablishmentType not found."); }

            /* Make sure campuses exist. */
            foreach (string officialName in _campuses.Values)
            {
                var campus = _entities.Get<Establishment>().SingleOrDefault(c => c.OfficialName == officialName);
                if (campus == null)
                {
                    var createCampus = new UsfCreateEstablishment()
                    {
                        OfficialName = officialName,
                        IsMember = true,
                        ParentId = _usf.RevisionId,
                        TypeId = _campusEstablishmentType.RevisionId
                    };

                    _createEstablishment.Handle(createCampus);
                    _unitOfWork.SaveChanges();
                }
            }
        }

        // ----------------------------------------------------------------------
        /*
        */
        // ----------------------------------------------------------------------
        public void Import(Stream stream)
        {
            var serializer = new DataContractSerializer(typeof(Record[]));
            var record = (Record)serializer.ReadObject(stream);

            /* If the department list last activity date does not exists, error (?). */
            if (String.IsNullOrWhiteSpace(record.LAST_ACTIVITY_DATE))
            {
                return;
            }

            DateTime lastDepartmentListActivityDate = DateTime.Parse(record.LAST_ACTIVITY_DATE);

            /* If the faculty and department list last activity dates match, leave. */
            if (_lastFacultyProfileActivityDate.HasValue &&
                (_lastFacultyProfileActivityDate.Value == lastDepartmentListActivityDate))
            {
                return;
            }

            /* If the department list is empty, leave. */
            if (record.DEPARTMENTS.Length == 0)
            {
                return;
            }

            for (int i = 0; i < record.DEPARTMENTS.Length; i += 1)
            {
                /* Attempt to find existing department by id */
                var existingDepartment =
                    _entities.Get<Establishment>().SingleOrDefault(e => e.ExternalId == record.DEPARTMENTS[i].DEPTID);

                /* If not found, add. */
                if ((existingDepartment == null) &&
                    (!String.IsNullOrWhiteSpace(record.DEPARTMENTS[i].DEPARTMENT)) &&
                    (!String.IsNullOrWhiteSpace(record.DEPARTMENTS[i].COLLEGE))
                   )
                {
                    /* Make sure we have USF and Campuses. */
                    if (_usf == null) { UsfEstablishmentsSetup(); }

                    /* Get the campus name. */
                    var campusOfficialName = _campuses[record.DEPARTMENTS[i].INSTITUTION];
                    if (campusOfficialName == null)
                    {
                        string message = String.Format("USF campus name {0} not found", record.DEPARTMENTS[i].INSTITUTION);
                        throw new Exception(message);
                    }

                    /* Get the campus. */
                    var campus = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == campusOfficialName);
                    if (campus == null)
                    {
                        string message = String.Format("USF campus {0} not found", campusOfficialName);
                        throw new Exception(message);
                    }

                    /* Does the college exist? If not, create it. */
                    var college = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == record.DEPARTMENTS[i].COLLEGE);
                    if (college == null)
                    {
                        var createCollege = new UsfCreateEstablishment()
                        {
                            OfficialName = record.DEPARTMENTS[i].COLLEGE,
                            IsMember = true,
                            ParentId = campus.RevisionId,
                            TypeId = _collegeEstablishmentType.RevisionId
                        };
                        _createEstablishment.Handle(createCollege);
                        _unitOfWork.SaveChanges();

                        college = createCollege.CreatedEstablishment;
                    }

                    /* Create department/program. */
                    var createDepartment = new UsfCreateEstablishment()
                    {
                        OfficialName = record.DEPARTMENTS[i].COLLEGE,
                        ExternalId = record.DEPARTMENTS[i].DEPTID,
                        IsMember = true,
                        ParentId = college.RevisionId,
                        TypeId = _departmentEstablishmentType.RevisionId
                    };
                    _createEstablishment.Handle(createDepartment);
                    _unitOfWork.SaveChanges();
                }
            }
        }
    }
}
