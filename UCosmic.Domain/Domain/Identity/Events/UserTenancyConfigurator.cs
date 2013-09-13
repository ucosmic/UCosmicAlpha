using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.Identity
{
    public class UserTenancyConfigurator : IHandleEvents<ApplicationStarted>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStoreBinaryData _binaryStore;

        public UserTenancyConfigurator(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IStoreBinaryData binaryStore
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _binaryStore = binaryStore;
        }

        public void Handle(ApplicationStarted @event)
        {

            /* 9/13/2013 - Dan, was this already run on production? */
#if false
            if (@event == null) throw new ArgumentNullException("event");

            var users = _entities.Get<User>()
                .EagerLoad(_entities, new Expression<Func<User, object>>[]
                {
                    x => x.Person.Affiliations,
                })
                .Where(x => !x.TenantId.HasValue && x.Person.Affiliations.Any(y => y.IsDefault)).ToArray();
            if (!users.Any()) return;

            foreach (var user in users)
            {
                var defaultAffiliation = user.Person.Affiliations.SingleOrDefault(x => x.IsDefault);
                if (defaultAffiliation != null)
                {
                    user.TenantId = defaultAffiliation.EstablishmentId;
                }
            }
            _unitOfWork.SaveChanges();
#endif

            /* One time to get icons in blob storage */
#if false
            {
                /* ----- Global View and Find an Expert Icons */

                var iconsBinaryPath = string.Format("{0}/{1}/", EmployeeConsts.SettingsBinaryStoreBasePath,
                                                          EmployeeConsts.IconsBinaryStorePath);

                /* Create default Global View icon */
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

                /* Create default Find an Expert icon */
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
                var activityTypeFilenames = new string[]
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
                                                            3306,   // USF
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
        }
    }
}