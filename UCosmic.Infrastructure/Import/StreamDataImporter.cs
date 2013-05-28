using System.IO;

namespace UCosmic.Import
{
    public abstract class StreamDataImporter : IStreamDataImporter
    {
        protected Stream Stream { get; set; }
        protected ICommandEntities Entities { get; set; }

        protected StreamDataImporter(Stream stream, ICommandEntities entities)
        {
            Stream = stream;
            Entities = entities;
        }

        public void Import()
        {
        }
    }
}
