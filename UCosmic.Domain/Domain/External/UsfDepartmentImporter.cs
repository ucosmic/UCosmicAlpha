using System;
using System.IO;
using System.Runtime.Serialization;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.External
{
    public class UsfDepartmentImporter
    {
        [DataContract]
        private class Record
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

        public Stream Stream { get; set; }
        private readonly IQueryEntities _entities;

        public UsfDepartmentImporter(IQueryEntities entities)
        {
            _entities = entities;
        }

        public void Import()
        {
            DataContractSerializer serializer = new DataContractSerializer(typeof(Record[]));
            Record[] records = (Record[])serializer.ReadObject(Stream);
            int numRecords = records.Length;
            if (numRecords == 0)
            {
                throw new Exception();
            }
        }

        public void Handle(UserCreated @event)
        {
            Import();
        }
    }
}
