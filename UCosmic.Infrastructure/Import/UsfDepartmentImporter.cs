using System.IO;
using UCosmic.Domain.Establishments;

namespace UCosmic.Import
{
    class UsfDepartmentImporter : StreamDataImporter
    {
        private struct Record
        {
            public string deptid;
            public string institutionName;
            public string collegeName;
            public string departmentName;
        }

        UsfDepartmentImporter(Stream stream, ICommandEntities entities)
            : base(stream, entities)
        {
        }

        public new void Import()
        {
            Record record = new Record();
            Establishment establishment = null;

            while (GetNextRecord(ref record))
            {
                
            }
        }

        private bool GetNextRecord(ref Record record)
        {

            return false;
        }
    }
}
