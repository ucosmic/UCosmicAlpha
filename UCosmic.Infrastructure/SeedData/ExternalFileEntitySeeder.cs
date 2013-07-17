using System;
using System.IO;
using System.Linq;
using UCosmic.Domain.Files;
using UCosmic.Domain.Agreements;
using UCosmic.Domain.Activities;

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
            var externalFiles = _entities.Query<ExternalFile>().ToArray();
            foreach (var externalFile in externalFiles.Where(x => !_binaryData.Exists(x.Path)))
                CopyFile(externalFile.Name, externalFile.Path);

            var agreementFiles = _entities.Query<AgreementFile>().ToArray();
            foreach (var agreementFile in agreementFiles.Where(x => !_binaryData.Exists(x.Path)))
                CopyFile(agreementFile.Name, agreementFile.Path);

            var activityDocuments = _entities.Query<ActivityDocument>().ToArray();
            foreach (var activityDocument in activityDocuments.Where(x => !_binaryData.Exists(x.Path)))
                CopyFile(activityDocument.FileName, activityDocument.Path);
        }

        private void CopyFile(string fileName, string filePath)
        {
            var basePath = string.Format("{0}{1}",
                AppDomain.CurrentDomain.BaseDirectory,
                @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\");

            using (var fileStream = File.OpenRead(string.Format("{0}{1}", basePath, fileName)))
                _binaryData.Put(filePath, fileStream.ReadFully());
        }
    }
}
