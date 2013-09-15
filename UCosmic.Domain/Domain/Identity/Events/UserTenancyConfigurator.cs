using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Identity
{
    public class UserTenancyConfigurator : IHandleEvents<ApplicationStarted>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryStore;
        private readonly IHandleCommands<UpdateEmployeeModuleSettings> _updateEmployeeModuleSettings;

        public UserTenancyConfigurator(ICommandEntities entities
            , IStoreBinaryData binaryStore
            , IHandleCommands<UpdateEmployeeModuleSettings> updateEmployeeModuleSettings
        )
        {
            _entities = entities;
            _binaryStore = binaryStore;
            _updateEmployeeModuleSettings = updateEmployeeModuleSettings;
        }

        public void Handle(ApplicationStarted @event)
        {
            /* One time to get icons in blob storage */
#if true
            {
                /* ----- Global View and Find an Expert Icons ----- */

                var iconsBinaryPath = string.Format("{0}/{1}/", EmployeeConsts.SettingsBinaryStoreBasePath,
                                                          EmployeeConsts.IconsBinaryStorePath);

                //* Create default Global View icon */
                if (_binaryStore.Get(iconsBinaryPath + EmployeeConsts.DefaultGlobalViewIconGuid) == null)
                {
                    string filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                                    @"..\UCosmic.Web.Mvc\images\icons\global\",
                                                    "global_24_black.png");

                    using (var fileStream = File.OpenRead(filePath))
                    {
                        var content = fileStream.ReadFully();
                        _binaryStore.Put(iconsBinaryPath + EmployeeConsts.DefaultGlobalViewIconGuid, content);
                    }
                }

                //* Create default Find an Expert icon */
                if (_binaryStore.Get(iconsBinaryPath + EmployeeConsts.DefaultFindAnExpertIconGuid) == null)
                {
                    var filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                                 @"..\UCosmic.Web.Mvc\images\icons\nounproject\",
                                                 "noun_project_5795_compass.svg");
                    using (var fileStream = File.OpenRead(filePath))
                    {
                        var content = fileStream.ReadFully();
                        _binaryStore.Put(iconsBinaryPath + EmployeeConsts.DefaultFindAnExpertIconGuid, content);
                    }
                }

                /* ----- Activity Type icons for USF ----- */
                var activityTypeFilenames = new[]
                {
                    "noun_project_762_idea.svg",
                    "noun_project_14888_teacher.svg",
                    "noun_project_17372_medal.svg",
                    "noun_project_16986_podium.svg",
                    "noun_project_401_briefcase.svg"
                };

                var activityTypeFilenameMap = new Dictionary<string, string>
                {
                    {"noun_project_762_idea.svg", "5117FFC4-C3CD-42F8-9C68-6B4362930A99"},
                    {"noun_project_14888_teacher.svg", "0033E48C-95CD-487B-8B0D-571E71EFF844"},
                    {"noun_project_17372_medal.svg", "8C746B8A-6B24-4881-9D4D-D830FBCD723A"},
                    {"noun_project_16986_podium.svg", "E44978F8-3664-4F7A-A2AF-6A0446D38099"},
                    {"noun_project_401_briefcase.svg", "586DDDBB-DE01-429B-8428-57A9D03189CB"}
                };

                var activityTypeIconBinaryPath = string.Format("{0}/{1}/{2}/", EmployeeConsts.SettingsBinaryStoreBasePath,
                                                            1,   // USF
                                                            EmployeeConsts.IconsBinaryStorePath);


                for (var i = 0; i < activityTypeFilenames.Length; i += 1)
                {
                    string iconBinaryFilePath =
                        String.Format("{0}{1}", activityTypeIconBinaryPath,
                                      activityTypeFilenameMap[activityTypeFilenames[i]]);

                    if (_binaryStore.Get(iconBinaryFilePath) == null)
                    {
                        string filePath = string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                                                        @"..\UCosmic.Web.MVC\images\icons\nounproject\",
                                                        activityTypeFilenames[i]);

                        using (var fileStream = File.OpenRead(filePath))
                        {
                            var content = fileStream.ReadFully();
                            _binaryStore.Put(iconBinaryFilePath, content);
                        }
                    }
                }
            }
#endif

#if true
                /* ----- Update the EmployeeModuleSettings rows ----- */
            {
                var iconsBinaryPath = string.Format("{0}/{1}/", EmployeeConsts.SettingsBinaryStoreBasePath,
                                                          EmployeeConsts.IconsBinaryStorePath);

                /* ----- Activity Type icons for USF ----- */
                //var activityTypeFilenames = new string[]
                //{
                //    "noun_project_762_idea.svg",
                //    "noun_project_14888_teacher.svg",
                //    "noun_project_17372_medal.svg",
                //    "noun_project_16986_podium.svg",
                //    "noun_project_401_briefcase.svg"
                //};

                var activityTypeFilenameMap = new Dictionary<string, string>
                {
                    {"noun_project_762_idea.svg", "5117FFC4-C3CD-42F8-9C68-6B4362930A99"},
                    {"noun_project_14888_teacher.svg", "0033E48C-95CD-487B-8B0D-571E71EFF844"},
                    {"noun_project_17372_medal.svg", "8C746B8A-6B24-4881-9D4D-D830FBCD723A"},
                    {"noun_project_16986_podium.svg", "E44978F8-3664-4F7A-A2AF-6A0446D38099"},
                    {"noun_project_401_briefcase.svg", "586DDDBB-DE01-429B-8428-57A9D03189CB"}
                };

                var activityTypeIconBinaryPath = string.Format("{0}/{1}/{2}/", EmployeeConsts.SettingsBinaryStoreBasePath,
                                                            1,   // USF
                                                            EmployeeConsts.IconsBinaryStorePath);


                var settings = _entities.Get<EmployeeModuleSettings>().SingleOrDefault(x => x.Establishment.WebsiteUrl == "www.usf.edu" /* USF */);
                if (settings == null) { return; }

                EmployeeActivityType activityType;

                activityType =
                    settings.ActivityTypes.Single(a => a.Type == "Research or Creative Endeavor");
                activityType.IconLength =
                    _binaryStore.Get(activityTypeIconBinaryPath + activityTypeFilenameMap["noun_project_762_idea.svg"])
                                .Length;
                activityType.IconMimeType = "image/svg+xml";
                activityType.IconName = "Research.svg";
                activityType.IconPath = activityTypeIconBinaryPath;
                activityType.IconFileName = activityTypeFilenameMap["noun_project_762_idea.svg"];

                activityType =
                    settings.ActivityTypes.Single(a => a.Type == "Teaching or Mentoring");
                activityType.IconLength =
                    _binaryStore.Get(activityTypeIconBinaryPath +
                                     activityTypeFilenameMap["noun_project_14888_teacher.svg"]).Length;
                activityType.IconMimeType = "image/svg+xml";
                activityType.IconName = "Teaching.svg";
                activityType.IconPath = activityTypeIconBinaryPath;
                activityType.IconFileName = activityTypeFilenameMap["noun_project_14888_teacher.svg"];

                activityType =
                    settings.ActivityTypes.Single(a => a.Type == "Award or Honor");
                activityType.IconLength =
                    _binaryStore.Get(activityTypeIconBinaryPath +
                                     activityTypeFilenameMap["noun_project_17372_medal.svg"]).Length;
                activityType.IconMimeType = "image/svg+xml";
                activityType.IconName = "Award.svg";
                activityType.IconPath = activityTypeIconBinaryPath;
                activityType.IconFileName = activityTypeFilenameMap["noun_project_17372_medal.svg"];

                activityType =
                    settings.ActivityTypes.Single(
                        a => a.Type == "Conference Presentation or Proceeding");
                activityType.IconLength =
                    _binaryStore.Get(activityTypeIconBinaryPath +
                                     activityTypeFilenameMap["noun_project_16986_podium.svg"]).Length;
                activityType.IconMimeType = "image/svg+xml";
                activityType.IconName = "Conference.svg";
                activityType.IconPath = activityTypeIconBinaryPath;
                activityType.IconFileName = activityTypeFilenameMap["noun_project_16986_podium.svg"];

                activityType =
                    settings.ActivityTypes.Single(
                        a => a.Type == "Professional Development, Service or Consulting");
                activityType.IconLength =
                    _binaryStore.Get(activityTypeIconBinaryPath +
                                     activityTypeFilenameMap["noun_project_401_briefcase.svg"]).Length;
                activityType.IconMimeType = "image/svg+xml";
                activityType.IconName = "Professional.svg";
                activityType.IconPath = activityTypeIconBinaryPath;
                activityType.IconFileName = activityTypeFilenameMap["noun_project_401_briefcase.svg"];


                var updateCommand = new UpdateEmployeeModuleSettings(settings.Id)
                {
                    EmployeeFacultyRanks = settings.FacultyRanks,
                    NotifyAdminOnUpdate = settings.NotifyAdminOnUpdate,
                    NotifyAdmins = settings.NotifyAdmins,
                    PersonalInfoAnchorText = settings.PersonalInfoAnchorText,
                    Establishment = settings.Establishment,
                    EmployeeActivityTypes = settings.ActivityTypes,
                    OfferCountry = settings.OfferCountry,
                    OfferActivityType = settings.OfferActivityType,
                    OfferFundingQuestions = settings.OfferFundingQuestions,
                    InternationalPedigreeTitle = settings.InternationalPedigreeTitle,

                    GlobalViewIconLength = _binaryStore.Get(iconsBinaryPath + EmployeeConsts.DefaultGlobalViewIconGuid).Length,
                    GlobalViewIconMimeType = "image/png",
                    GlobalViewIconName = "GlobalViewIcon.png",
                    GlobalViewIconPath = iconsBinaryPath,
                    GlobalViewIconFileName = EmployeeConsts.DefaultGlobalViewIconGuid,

                    FindAnExpertIconLength = _binaryStore.Get(iconsBinaryPath + EmployeeConsts.DefaultFindAnExpertIconGuid).Length,
                    FindAnExpertIconMimeType = "image/svg+xml",
                    FindAnExpertIconName = "FindAnExpertIcon.svg",
                    FindAnExpertIconPath = iconsBinaryPath,
                    FindAnExpertIconFileName = EmployeeConsts.DefaultFindAnExpertIconGuid,
                };

                _updateEmployeeModuleSettings.Handle(updateCommand);
            }
#endif
        }
    }
}