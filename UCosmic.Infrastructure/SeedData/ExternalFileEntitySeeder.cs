using System;
using System.IO;
using System.Linq;
using UCosmic.Domain.Files;

namespace UCosmic.SeedData
{
    public class ExternalFileEntitySeeder : ISeedData
    {
        private readonly IStoreBinaryData _binaryData;
        private readonly IQueryEntities _entities;

        public ExternalFileEntitySeeder(IStoreBinaryData binaryData
            , IQueryEntities entities
        )
        {
            _binaryData = binaryData;
            _entities = entities;
        }

        public void Seed()
        {
            var basePath = AppDomain.CurrentDomain.BaseDirectory +
                              @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\";

            var externalFiles = _entities.Query<ExternalFile>().ToArray();
            foreach (var externalFile in externalFiles.Where(x => !_binaryData.Exists(x.Path)))
            {
                using (var fileStream = File.OpenRead(string.Format("{0}{1}", basePath, externalFile.Name)))
                {
                    var content = fileStream.ReadFully();
                    _binaryData.Put(externalFile.Path, content);
                }
            }
        }
    }
}
