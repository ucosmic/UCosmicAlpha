using System;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.External
{
    public class UsfDepartmentImporter
    {
        [DataContract]
        private class DepartmentRecord
        {
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
        private readonly IHandleCommands<UpdateEstablishmentHierarchy> _hierarchy;
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
                                     IHandleCommands<UpdateEstablishmentHierarchy> hierarchy,
                                     DateTime? lastFacultyProfileActivityDate )
        {
            _entities = entities;
            _createEstablishment = createEstablishment;
            _unitOfWork = unitOfWork;
            _lastFacultyProfileActivityDate = lastFacultyProfileActivityDate;
            _hierarchy = hierarchy;
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
            _campuses.Add("USF Tampa", "USF Tampa Campus");
            _campuses.Add("ST.PETE", "USF St. Petersburg Campus");
            _campuses.Add("USF St. Petersburg", "USF St. Petersburg Campus");
            _campuses.Add("SARASOTA", "USF Sarasota-Manatee Campus");
            _campuses.Add("USF Sarasota", "USF Sarasota-Manatee Campus");

            string establishmentType = KnownEstablishmentType.UniversityCampus.AsSentenceFragment();
            _campusEstablishmentType =
                _entities.Get<EstablishmentType>().SingleOrDefault(t => t.EnglishName == establishmentType);
            if (_campusEstablishmentType == null) { throw new Exception("Campus EstablishmentType not found."); }

            establishmentType = KnownEstablishmentType.College.AsSentenceFragment();
            _collegeEstablishmentType =
                _entities.Get<EstablishmentType>().SingleOrDefault(t => t.EnglishName == establishmentType);
            if (_collegeEstablishmentType == null) { throw new Exception("College EstablishmentType not found."); }

            establishmentType = KnownEstablishmentType.Department.AsSentenceFragment();
            _departmentEstablishmentType =
                _entities.Get<EstablishmentType>().SingleOrDefault(t => t.EnglishName == establishmentType);
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
            var serializer = new DataContractJsonSerializer(typeof(Record));
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
                DepartmentRecord department = record.DEPARTMENTS[i];

                /* Attempt to find existing department by id */
                var existingDepartment =
                    _entities.Get<Establishment>().SingleOrDefault(e => e.ExternalId == department.DEPTID);

                /* If not found, add. */
                if ((existingDepartment == null) &&
                    (!String.IsNullOrWhiteSpace(department.DEPARTMENT)) &&
                    (!String.IsNullOrWhiteSpace(department.COLLEGE))
                   )
                {
                    /* Make sure we have USF and Campuses. */
                    if (_usf == null) { UsfEstablishmentsSetup(); }

                    /* Get the campus name. */
                    var campusOfficialName = _campuses[department.INSTITUTION];
                    if (campusOfficialName == null)
                    {
                        string message = String.Format("USF campus name {0} not found", department.INSTITUTION);
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
                    var college = _entities.Get<Establishment>().FirstOrDefault(e => e.OfficialName == department.COLLEGE);
                    if (college == null)
                    {
                        var createCollege = new UsfCreateEstablishment()
                        {
                            OfficialName = department.COLLEGE,
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
                        OfficialName = department.DEPARTMENT,
                        ExternalId = department.DEPTID,
                        IsMember = true,
                        ParentId = college.RevisionId,
                        TypeId = _departmentEstablishmentType.RevisionId
                    };
                    _createEstablishment.Handle(createDepartment);
                    _unitOfWork.SaveChanges();
                }
            }

            _usf = _entities.Get<Establishment>()
                            //.EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                            //{
                            //    e => e.Offspring.Select(o => o.Ancestor.Parent),
                            //    e => e.Offspring.Select(o => o.Offspring.Parent),
                            //    e => e.Offspring.Select(o => o.Ancestor.Children),
                            //    e => e.Offspring.Select(o => o.Offspring.Children),
                            //    e => e.Children.Select(c => c.Children.Select(g => g.Children)),
                            //    e => e.Children.Select(c => c.Ancestors.Select(a => a.Ancestor))
                            //})
                            .SingleOrDefault(e => e.OfficialName == "University of South Florida");
            _hierarchy.Handle(new UpdateEstablishmentHierarchy(_usf));

            EmployeeModuleSettings employeeModuleSettings = _entities.Get<EmployeeModuleSettings>()
                .SingleOrDefault(p => p.Establishment.RevisionId == _usf.RevisionId);
            if (employeeModuleSettings == null) { throw new Exception("No EmployeeModuleSettings for USF."); }


            /* TBD = Update ExternalSyncDate */
        }
    }
}
