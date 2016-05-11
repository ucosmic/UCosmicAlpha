using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using System.Threading;
using Newtonsoft.Json;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.External
{
    public class ImportUsfEstablishments
    {
        internal ImportUsfEstablishments(IPrincipal principal, UsfFacultyProfileService service, string lastUpdate)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (service == null) throw new ArgumentNullException("service");
            Principal = principal;
            Service = service;
            LastUpdate = lastUpdate;
        }

        internal IPrincipal Principal { get; private set; }
        internal UsfFacultyProfileService Service { get; private set; }
        internal string LastUpdate { get; private set; }
        internal WorkReportBuilder ReportBuilder { get; set; }
    }

    public class HandleImportUsfEstablishmentsCommand : IHandleCommands<ImportUsfEstablishments>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateEstablishment> _createEstablishment;
        private readonly IHandleCommands<CreateEstablishmentName> _createEstablishmentName;
        private readonly IHandleCommands<UpdateEstablishmentHierarchy> _updateHierarchy;

        public HandleImportUsfEstablishmentsCommand(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateEstablishment> createEstablishment
            , IHandleCommands<CreateEstablishmentName> createEstablishmentName
            , IHandleCommands<UpdateEstablishmentHierarchy> updateHierarchy
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _createEstablishment = createEstablishment;
            _createEstablishmentName = createEstablishmentName;
            _updateHierarchy = updateHierarchy;
        }

        public void Handle(ImportUsfEstablishments command)
        {
            if (command == null) throw new ArgumentNullException("command");
            var reportBuilder = command.ReportBuilder ?? new WorkReportBuilder("Import USF Departments");
            var service = command.Service;
            string error_details = "";
            try
            {
                #region Skip import if not necessary

                // do we need to re-import?
                reportBuilder.Report("Determining whether USF department import should be skipped.");
                var isSkippable = !string.IsNullOrWhiteSpace(service.LastUpdate) // data has already been sync'd at least once
                    // and the last sync date equals the command's requesting sync date
                    && (string.IsNullOrWhiteSpace(command.LastUpdate) || service.LastUpdate.Equals(command.LastUpdate))
                    // and the status does not indicate a failure or in-progress state
                    && service.Status == UsfFacultyProfileAttribute.Ready.ToString();
                if (isSkippable)
                {
                    reportBuilder.Report("USF department import will be skipped.");
                    return; // note this will also happen when command.SyncDate == null
                }

                #endregion
                #region Wait on import already in progress

                // is there already an import in progress?
                // if so, wait on it to change
                reportBuilder.Report("Determining whether or not USF department import is in progress.");
                _entities.Reload(command.Service.Integration); // freshen status from db
                if (service.Status == UsfFacultyProfileAttribute.InProgress.ToString())
                {
                    // wait for the process to complete
                    reportBuilder.Report("USF Department import is in progress, wait for completion.");
                    WaitOnProgress(command, reportBuilder);

                    // if was in progress, and is now ready, do not import again
                    if (command.Service.Status == UsfFacultyProfileAttribute.Ready.ToString())
                    {
                        reportBuilder.Report("USF Department import is ready, parallel import succeeded.");
                        return;
                    }
                }

                #endregion
                #region Update status, invoke USF service, and load comparison data

                // begin progress
                reportBuilder.Report("Setting status to '{0}'.", UsfFacultyProfileAttribute.InProgress.ToString());
                command.Service.Status = UsfFacultyProfileAttribute.InProgress.ToString();
                _entities.Update(command.Service.Integration);
                _entities.SaveChanges();
                reportBuilder.Report("Status set to '{0}'.", UsfFacultyProfileAttribute.InProgress.ToString());

                // invoke departments service
                reportBuilder.Report("Invoking USF department service.");
                var departmentsData = _queryProcessor.Execute(new UsfDepartments(command.Service) { ReportBuilder = reportBuilder });
                if (departmentsData == null || departmentsData.Departments == null)
                    throw new InvalidOperationException(string.Format(
                        "Could not obtain departments data for '{0}_{1}'service integration.",
                        command.Service.Integration.Name, command.Service.Integration.TenantId));
                reportBuilder.Report("Deserialized USF department response to CLR object.");
                reportBuilder.Report("JSON value of deserialized response is:");
                //reportBuilder.Report(JsonConvert.SerializeObject(departmentsData));//taken out because it is too large 8-1-2014

                // establishment types will be used later when creating establishments
                reportBuilder.Report("Loading establishment type entities.");

                var establishmentTypeName = KnownEstablishmentType.UniversityCampus.AsSentenceFragment();
                reportBuilder.Report("test1");
                var campusType = _entities.Query<EstablishmentType>().Single(t => t.EnglishName == establishmentTypeName);
                reportBuilder.Report("test2");
                establishmentTypeName = KnownEstablishmentType.College.AsSentenceFragment();
                reportBuilder.Report("test3");
                var collegeType = _entities.Query<EstablishmentType>().Single(t => t.EnglishName == establishmentTypeName);
                reportBuilder.Report("test4");
                establishmentTypeName = KnownEstablishmentType.Department.AsSentenceFragment();
                reportBuilder.Report("test5");
                var departmentType = collegeType;//_entities.Query<EstablishmentType>().Single(t => t.EnglishName == establishmentTypeName);
                reportBuilder.Report("test6");

                reportBuilder.Report("Order the service results by campus, college, deptid.");
                //foreach (var name in departmentsData.Departments.SelectMany(x => x.CampusName))
                //{
                //    reportBuilder.Report("campusName: " + name);
                //}
                // order the service results by campus, college, deptid
                departmentsData.Departments = departmentsData.Departments
                    .OrderBy(x => x.CampusName).ThenBy(x => x.CollegeName).ThenBy(x => x.DepartmentId).ToArray();

                // all units will be children of USF
                reportBuilder.Report("Loading USF establishment entity.");
                var usf = _entities.Get<Establishment>()
                    .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                    {
                        x => x.Children,
                        x => x.Offspring.Select(y => y.Offspring),
                    })
                    .Single(x => x.RevisionId == command.Service.Integration.TenantId);
                reportBuilder.Report("USF establishment entity loaded with id '{0}'.", usf.RevisionId);
                var isChanged = false;

                #endregion
                #region Populate campuses

                // populate the campuses first (they are ranked)
                var campusRanks = new Dictionary<string, int>
                {
                    { "Tampa", 1 },
                    { "Petersburg", 2 },
                    { "Sarasota", 3 },
                };
                var campusNames = departmentsData.Departments.Select(x => x.CampusName).Distinct().ToArray();
                //campusNames = campusNames.Union(new[] { "Unidentified Campus" }).ToArray();
                if (campusNames.Any(x => !campusRanks.Keys.Any(x.Contains)))
                    throw new InvalidOperationException(string.Format(
                        "USF Service returned unexpected campus '{0}'.",
                            campusNames.First(x => !campusRanks.Keys.Any(x.Contains))));
                reportBuilder.Report("Iterating over {0} campus names.", campusNames.Length);
                foreach (var campusName in campusNames)
                {
                    // note that the service returns USF Sarasota, but we want official name to be USF Sarasota-Manatee
                    var campusByName = usf.Children.SingleOrDefault(x => x.Names.Any(y => y.Text.Equals(campusName)));
                    if (campusByName == null)
                    {
                        var createCampusCommand = new CreateEstablishment(command.Principal)
                        {
                            NoCommit = true,
                            NoHierarchy = true,
                            Parent = usf,
                            TypeId = campusType.RevisionId,
                            Rank = campusRanks.Single(x => campusName.Contains(x.Key)).Value,
                            OfficialName = new CreateEstablishmentName(command.Principal)
                            {
                                NoCommit = true,
                                IsOfficialName = true,
                                Text = !campusName.Contains("Sarasota") ? campusName : "USF Sarasota-Manatee",
                            },
                        };
                        _createEstablishment.Handle(createCampusCommand);
                        if (campusName.Contains("Sarasota"))
                        {
                            var createCampusNameCommand = new CreateEstablishmentName(command.Principal)
                            {
                                NoCommit = true,
                                Owner = createCampusCommand.Created,
                                Text = campusName,
                            };
                            _createEstablishmentName.Handle(createCampusNameCommand);
                        }
                        isChanged = true;
                    }
                }

                #endregion
                #region Populate Colleges

                // get all unique combinations of campus / college
                var campusColleges = departmentsData.Departments
                    .Select(x => new { x.CampusName, x.CollegeName, }).Distinct()
                    .OrderBy(x => x.CampusName).ThenBy(x => x.CollegeName)
                    .ToArray();
                reportBuilder.Report("Iterating over {0} campus colleges.", campusColleges.Length);
                foreach (var campusCollege in campusColleges)
                {
                    var collegeInCampus = campusCollege;

                    // does the college already exist?
                    var campus = usf.Children
                        .Single(x => x.Names.Any(y => y.Text.Equals(collegeInCampus.CampusName)));
                    var officialName = string.Format("{0}, {1}", collegeInCampus.CollegeName, campus.OfficialName);
                    var collegeByName = campus.Children
                        .SingleOrDefault(x => x.OfficialName.Equals(officialName)
                            || x.Names.Any(y => y.Text.Equals(collegeInCampus.CollegeName) && y.IsContextName));
                    if (collegeByName != null) continue;

                    var createCollegeCommand = new CreateEstablishment(command.Principal)
                    {
                        NoCommit = true,
                        NoHierarchy = true,
                        Parent = campus,
                        TypeId = collegeType.RevisionId,
                        OfficialName = new CreateEstablishmentName(command.Principal)
                        {
                            NoCommit = true,
                            IsOfficialName = true,
                            Text = officialName,
                        },
                    };
                    _createEstablishment.Handle(createCollegeCommand);
                    var createCollegeNameCommand = new CreateEstablishmentName(command.Principal)
                    {
                        NoCommit = true,
                        IsContextName = true,
                        Owner = createCollegeCommand.Created,
                        Text = collegeInCampus.CollegeName,
                    };
                    _createEstablishmentName.Handle(createCollegeNameCommand);
                    isChanged = true;

                    // does this college have any department id's?
                    var customIds = departmentsData.Departments
                        .Where(x => x.CollegeName == collegeInCampus.CollegeName
                            && x.CampusName == collegeInCampus.CampusName
                            && string.IsNullOrWhiteSpace(x.DepartmentName)
                        )
                        .Select(x => x.DepartmentId).Distinct()
                        // it is possible that this custom DEPTID is named elsewhere
                        .Where(x => !departmentsData.Departments
                            .Any(y => y.DepartmentId == x && !string.IsNullOrWhiteSpace(y.DepartmentName)))
                        .ToArray();
                    //var doubleCheckCustomIds = departmentsData.Departments
                    //    .Where(x => customIds.Contains(x.DepartmentId)).ToArray();

                    foreach (var customId in customIds)
                    {
                        createCollegeCommand.Created.CustomIds.Add(new EstablishmentCustomId
                        {
                            Owner = createCollegeCommand.Created,
                            Value = customId,
                        });
                    }
                }

                #endregion
                #region Populate Departments

                // we are going to skip all unnamed departments
                var namedDepartments = departmentsData.Departments
                    .Where(x => !string.IsNullOrWhiteSpace(x.DepartmentName))
                    .ToArray();
                reportBuilder.Report("Iterating over {0} named departments.", namedDepartments.Length);
                foreach (var departmentData in namedDepartments)
                {
                    var campus = usf.Children
                        .Single(x => x.Names.Any(y => y.Text.Equals(departmentData.CampusName)));
                    var college = campus.Children
                        .Single(x => x.Names.Any(y => y.Text.Equals(departmentData.CollegeName)));
                    var officialName = string.Format("{0}, {1}, {2}", departmentData.DepartmentName, departmentData.CollegeName, campus.OfficialName);
                    error_details = "test 1";
                    // is the name of the department the same as the name of the college?
                    if (departmentData.DepartmentName == departmentData.CollegeName)
                    {
                        if (college.CustomIds.All(x => x.Value != departmentData.DepartmentId))
                        {
                            college.CustomIds.Add(new EstablishmentCustomId
                            {
                                Owner = college,
                                Value = departmentData.DepartmentId,
                            });
                            isChanged = true;
                        }
                        continue;
                    }
                    error_details = "test 2";
                    // does the department already exist?
                    var departmentByName = college.Children
                        .SingleOrDefault(x => x.OfficialName.Equals(officialName)
                             || x.Names.Any(y => y.Text.Equals(departmentData.DepartmentName)));
                    var departmentById = college.Children
                        .SingleOrDefault(x => x.CustomIds.Select(y => y.Value).Contains(departmentData.DepartmentId));
                    error_details = "test 33" + " - " + departmentData.CollegeName + " - " + departmentData.DepartmentId + " - " + departmentData.DepartmentName;

                    if (departmentByName == null)
                    {
                        if (departmentById == null)
                        {
                            error_details = "test 4";
                            var createDepartmentCommand = new CreateEstablishment(command.Principal)
                            {
                                NoCommit = true,
                                NoHierarchy = true,
                                Parent = college,
                                TypeId = departmentType.RevisionId,
                                OfficialName = new CreateEstablishmentName(command.Principal)
                                {
                                    NoCommit = true,
                                    IsOfficialName = true,
                                    Text = officialName,
                                },
                            };
                            _createEstablishment.Handle(createDepartmentCommand);
                            var createDepartmentNameCommand = new CreateEstablishmentName(command.Principal)
                            {
                                NoCommit = true,
                                IsContextName = true,
                                Owner = createDepartmentCommand.Created,
                                Text = departmentData.DepartmentName,
                            };
                            _createEstablishmentName.Handle(createDepartmentNameCommand);
                            departmentByName = createDepartmentCommand.Created;
                        }
                        else
                        {
                            error_details = "test 5";
                            var formerContextNames = departmentById.Names.Where(x => x.IsContextName).ToArray();
                            foreach (var formerContextName in formerContextNames)
                            {
                                formerContextName.IsFormerName = true;
                                formerContextName.IsContextName = false;
                            }

                            var newContextName = formerContextNames.SingleOrDefault(x => x.Text == departmentData.DepartmentName);
                            if (newContextName != null)
                            {
                                newContextName.IsFormerName = false;
                                newContextName.IsContextName = true;
                            }
                            else
                                departmentById.Names.Add(new EstablishmentName
                                {
                                    ForEstablishment = departmentById,
                                    IsContextName = true,
                                    Text = departmentData.DepartmentName,
                                });
                            departmentById.Names.Single(x => x.IsOfficialName).Text = officialName;
                            departmentById.OfficialName = officialName;
                            departmentByName = departmentById;
                        }
                        isChanged = true;
                    }

                    if (departmentById == null)
                    {
                        error_details = "test 6";
                        departmentByName.CustomIds.Add(new EstablishmentCustomId
                        {
                            Owner = departmentByName,
                            Value = departmentData.DepartmentId,
                        });
                        isChanged = true;
                    }
                }

                #endregion
                #region Populate Unnamed Department Id's
                error_details = "test 7";


                var unnamedDepartments = departmentsData.Departments
                    //.FirstOrDefault(x => string.IsNullOrWhiteSpace(x.DepartmentName))
                    .Where(x => string.IsNullOrWhiteSpace(x.DepartmentName))
                    .ToArray();
                //if (unnamedDepartments == null){
                //    //unnamedDepartments = new string[0];
                //}else{
                //    unnamedDepartments = unnamedDepartments;
                //}
                    
                error_details = "test 8";
                foreach (var departmentData in unnamedDepartments)
                {
                    var campus = usf.Children
                        .Single(x => x.Names.Any(y => y.Text.Equals(departmentData.CampusName)));
                    error_details += ", campus" + campus.ExternalId;
                    var college = campus.Children
                        .Single(x => x.Names.Any(y => y.Text.Equals(departmentData.CollegeName)));
                    error_details += ", college" + college.ExternalId;
                    if (college.CustomIds.All(x => x.Value != departmentData.DepartmentId))
                    {
                        error_details += " in college.customIds";
                        college.CustomIds.Add(new EstablishmentCustomId
                        {
                            EstablishmentId = college.RevisionId,
                            Owner = college,
                            Value = departmentData.DepartmentId,
                        });
                        error_details += " 2 ";
                        isChanged = true;
                    }
                }

                #endregion

                error_details = "test 7";
                if (isChanged)
                { // TODO: only update hierarchy when establishments are added or removed
                    error_details = "test 8";
                    reportBuilder.Report("USF Department import has pending database changes.");
                    _updateHierarchy.Handle(new UpdateEstablishmentHierarchy(usf));
                    _entities.SaveChanges();
                    reportBuilder.Report("USF Department import pending database changes have been committed.");
                }

                error_details = "test 9";
                reportBuilder.Report("USF Department import is complete.");
                reportBuilder.Report("Setting status to '{0}'.", UsfFacultyProfileAttribute.Ready.ToString());
                command.Service.Status = UsfFacultyProfileAttribute.Ready.ToString();
                reportBuilder.Report("Setting last update to '{0}'.", command.LastUpdate);
                command.Service.LastUpdate = command.LastUpdate;
                _entities.Update(command.Service.Integration);
                _entities.SaveChanges();
                reportBuilder.Report("Status set to '{0}'.", UsfFacultyProfileAttribute.Ready.ToString());
            }
            catch
            {
                reportBuilder.Report("USF Department import encountered an exception.");
                _entities.DiscardChanges();
                reportBuilder.Report("Setting status to '{0}'.", UsfFacultyProfileAttribute.FailedState.ToString());
                reportBuilder.Report("error location '{0}'.", error_details);
                command.Service.Status = UsfFacultyProfileAttribute.FailedState.ToString();
                _entities.Update(command.Service.Integration);
                _entities.SaveChanges();
                reportBuilder.Report("Status set to '{0}'.", UsfFacultyProfileAttribute.FailedState.ToString());
                reportBuilder.Report("Rethrowing exception.");
                throw;
            }
        }

        private void WaitOnProgress(ImportUsfEstablishments command, WorkReportBuilder reportBuilder)
        {
            var ticks = DateTime.UtcNow.Ticks;
            long duration = 0;
            const long timeout = 5 * 60 * 1000; // five minutes
            reportBuilder.Report("Waiting up to '{0}' milliseconds.", timeout);
            while (command.Service.Status == UsfFacultyProfileAttribute.InProgress.ToString() && duration <= timeout)
            {
                Thread.Sleep(5000);
                _entities.Reload(command.Service.Integration);
                duration = (DateTime.UtcNow.Ticks - ticks) / TimeSpan.TicksPerMillisecond;
            }
            reportBuilder.Report("Finished waiting for progress, total duration was {0} milliseconds.", duration);
        }
    }
}
