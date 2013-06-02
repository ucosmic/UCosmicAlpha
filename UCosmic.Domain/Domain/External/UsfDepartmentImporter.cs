using System;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Security.Principal;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.External
{
    public class UsfDepartmentImporter
    {
        [DataContract]
        private class Record
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

        private Stream _stream;
        private readonly ICommandEntities _entities;
        private DateTime? _targetLastActivityDate;
        private readonly Establishment _usf;

        public UsfDepartmentImporter(ICommandEntities entities, DateTime? targetLastActivityDate)
        {
            _entities = entities;
            _targetLastActivityDate = targetLastActivityDate;
            _usf = _entities.Get<Establishment>().SingleOrDefault(e => e.OfficialName == "University of South Florida");
            if (_usf == null) { throw new Exception("USF Establishment not found."); }
        }

        // ----------------------------------------------------------------------
        /*
        */
        // ----------------------------------------------------------------------
        public void CreateCampuses()
        {
            /* Find campus */
            var campus = _entities.Get<Establishment>().SingleOrDefault(c => c.OfficialName == "USF Tampa Campus");
            if (campus == null)
            {
                var person = _entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Administrator" && x.LastName == "One");
                if (person == null) throw new Exception("USF Administrator One not found");

                var user = _entities.Get<User>().SingleOrDefault(x => x.Person.RevisionId == person.RevisionId);
                if (user == null) throw new Exception("USF Administrator One has no User.");

                var roles = new string[]
                    {
                        RoleName.EstablishmentAdministrator
                    };
                var identity = new GenericIdentity(user.Name);
                var principal = new GenericPrincipal(identity, roles);

                //public IPrincipal Principal { get; private set; }
                //public int? ParentId { get; set; }
                //public int TypeId { get; set; }
                //public CreateEstablishmentName OfficialName { get; set; }
                //public CreateEstablishmentUrl OfficialUrl { get; set; }
                //public UpdateEstablishmentLocation Location { get; set; }
                //public string CeebCode
                //{
                //    get { return _ceebCode; }
                //    set { _ceebCode = value == null ? null : value.Trim(); }
                //}

                //public string UCosmicCode
                //{
                //    get { return _uCosmicCode; }
                //    set { _uCosmicCode = value == null ? null : value.Trim(); }
                //}

                //public string ExternalId { get; set; }


                //var newEstablishment = new UsfCreateEstablishment()
                //{
                //    OfficialName = "USF College of Behavioral and Community Sciences Department of Communication Sciences & Disorders",
                //    IsMember = true,
                //    ParentId = college.RevisionId,
                //    TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                //        KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                //    OfficialWebsiteUrl = "csd.cbcs.usf.edu",
                //});


                //// make sure establishment does not already exist
                //var establishment = _queryProcessor.Execute(new EstablishmentByOfficialName(command.OfficialName));
                //if (!string.IsNullOrWhiteSpace(command.OfficialWebsiteUrl))
                //    establishment = _queryProcessor.Execute(new EstablishmentByUrl(command.OfficialWebsiteUrl));
                //if (establishment != null) return establishment;

                //_createEstablishment.Handle(command);
                //_unitOfWork.SaveChanges();
                //return command.CreatedEstablishment;



            }        
        }

        public void Import()
        {
            var serializer = new DataContractSerializer(typeof(Record[]));
            Record[] records = (Record[])serializer.ReadObject(_stream);
            int numRecords = records.Length;
            if (numRecords == 0)  { return; }

            for (int i = 0; i < records.Length; i += 1)
            {
                var record = records[i];

                /* Attempt to find existing department by id */
                var department = _entities.Get<Establishment>().SingleOrDefault(e => e.ExternalId == record.DEPTID);

                /* If not found, add */
                if (department == null)
                {

                }
            }
        }
    }
}
