using System;
using System.IO;

namespace UCosmic.Import
{
    public abstract class StreamDataImporter : IStreamDataImporter
    {
        protected Stream Stream { get; set; }
        protected ICommandEntities Entities { get; set; }

        protected StreamDataImporter(Stream stream, ICommandEntities entities)
        {
            if (stream == null) { throw new ArgumentNullException("stream"); }
            if (entities == null) { throw new ArgumentNullException("entities"); }

            Stream = stream;
            Entities = entities;
        }

        public void Import()
        {
        }
    }
}
