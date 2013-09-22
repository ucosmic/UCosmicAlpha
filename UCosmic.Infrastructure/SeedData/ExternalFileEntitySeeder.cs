using System;
using System.IO;
using System.Linq;
using UCosmic.Domain.Files;
using UCosmic.Domain.Agreements;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Employees;

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
                CopyFile(agreementFile.FileName, agreementFile.Path);

            var activityDocuments = _entities.Query<ActivityDocument>().ToArray();
            foreach (var activityDocument in activityDocuments.Where(x => !_binaryData.Exists(x.Path)))
                CopyFile(activityDocument.FileName, activityDocument.Path);

            var employeeModuleSettings = _entities.Query<EmployeeModuleSettings>()
                .ToArray();
            foreach (var employeeModuleSetting in employeeModuleSettings)
            {
                var globalIconPath = string.Format("{0}{1}", employeeModuleSetting.GlobalViewIconPath, employeeModuleSetting.GlobalViewIconFileName);
                if (!string.IsNullOrWhiteSpace(globalIconPath) && !_binaryData.Exists(globalIconPath))
                {
                    var localPath = UsfEmployeeModuleSettingsSeeder.UsfEmployeeModuleSettingIcons
                        .Single(x => x.Value.Second == employeeModuleSetting.GlobalViewIconName);
                    CopyFile(localPath.Key, globalIconPath);
                }

                var expertIconPath = string.Format("{0}{1}", employeeModuleSetting.FindAnExpertIconPath, employeeModuleSetting.FindAnExpertIconFileName);
                if (!string.IsNullOrWhiteSpace(expertIconPath) && !_binaryData.Exists(expertIconPath))
                {
                    var localPath = UsfEmployeeModuleSettingsSeeder.UsfEmployeeModuleSettingIcons
                        .Single(x => x.Value.Second == employeeModuleSetting.FindAnExpertIconName);
                    CopyFile(localPath.Key, expertIconPath);
                }

                foreach (var activityType in employeeModuleSetting.ActivityTypes)
                {
                    var iconPath = string.Format("{0}{1}", activityType.IconPath, activityType.IconFileName);
                    if (!string.IsNullOrWhiteSpace(iconPath) && !_binaryData.Exists(iconPath))
                    {
                        var localPath = UsfEmployeeModuleSettingsSeeder.UsfActivityTypeIcons
                            .Single(x => x.Value.Second == activityType.IconName);
                        CopyFile(localPath.Key, iconPath);
                    }
                }
            }
        }

        private void CopyFile(string fileName, string filePath)
        {
            if (string.IsNullOrWhiteSpace(fileName)) throw new ArgumentNullException("fileName");

            var basePath = string.Format("{0}{1}",
                AppDomain.CurrentDomain.BaseDirectory,
                @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\");

            using (var fileStream = File.OpenRead(string.Format("{0}{1}", basePath, fileName)))
                _binaryData.Put(filePath, fileStream.ReadFully());
        }
    }
}
