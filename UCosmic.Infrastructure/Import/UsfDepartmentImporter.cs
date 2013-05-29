using System;
using System.IO;
using System.Runtime.Serialization;
using UCosmic.Domain.Establishments;

namespace UCosmic.Import
{
    class UsfDepartmentImporter : StreamDataImporter
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

        UsfDepartmentImporter(Stream stream, ICommandEntities entities)
            : base(stream, entities)
        {
        }

        public new void Import()
        {
            DataContractSerializer serializer = new DataContractSerializer(typeof(Record[]));
            Record[] records = (Record[])serializer.ReadObject(Stream);
            int numRecords = records.Length;
            if (numRecords == 0)
            {
                throw new Exception();
            }
        }

    }
}
