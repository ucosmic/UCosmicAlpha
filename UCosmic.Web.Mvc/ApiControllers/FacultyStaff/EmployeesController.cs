using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using MoreLinq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using ImageResizer;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Places;
using UCosmic.Repositories;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api")]
    public class EmployeesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;
        private readonly IStoreBinaryData _binaryData;

        public EmployeesController(IProcessQueries queryProcessor, IQueryEntities entities, IStoreBinaryData binaryData)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _binaryData = binaryData;
        }

        [CacheHttpGet(Duration = 60)]
        [GET("{domain}/employees/places")]
        public IEnumerable<EmployeesPlaceApiModel> GetPlaces(string domain, [FromUri] EmployeesPlacesInputModel input)
        {
            //throw new Exception();
            //System.Threading.Thread.Sleep(10000);

            var query = new EmployeePlaceViews(domain)
            {
                Countries = input.Countries,
                PlaceIds = input.PlaceIds,
                PlaceAgnostic = input.PlaceAgnostic,
            };
            var views = _queryProcessor.Execute(query);
            var models = Mapper.Map<EmployeesPlaceApiModel[]>(views);
            return models;
        }

        [CacheHttpGet(Duration = 60)]
        [GET("{establishmentId:int}/employees/places", ActionPrecedence = 1)]
        public IEnumerable<EmployeesPlaceApiModel> GetPlaces(int establishmentId, [FromUri] EmployeesPlacesInputModel input)
        {
            //throw new Exception();
            //System.Threading.Thread.Sleep(10000);

            var query = new EmployeePlaceViews(establishmentId)
            {
                Countries = input.Countries,
                PlaceIds = input.PlaceIds,
                PlaceAgnostic = input.PlaceAgnostic,
            };
           var views = _queryProcessor.Execute(query);
            var models = Mapper.Map<EmployeesPlaceApiModel[]>(views);
            return models;
        }

        [CacheHttpGet(Duration = 60)]
        [GET("{domain}/employees/activities/counts")]
        public EmployeeActivityCountsModel GetActivityCounts(string domain)
        {
            //throw new Exception();
            //System.Threading.Thread.Sleep(5000);

            var view = _queryProcessor.Execute(new EmployeeActivityCountsViewByEstablishment(domain));
            if (view == null)
            {
                view = new EmployeeActivityCountsView();
                var establishment = _queryProcessor.Execute(new EstablishmentByDomain(domain));
                if (establishment != null)
                    view.EstablishmentId = establishment.RevisionId;
            }

            var model = new EmployeeActivityCountsModel
            {
                ActivityCount = view.ActivityCount,
                PersonCount = view.PersonCount,
                LocationCount = view.LocationCount,
            };

            return model;
        }

        [CacheHttpGet(Duration = 60)]
        [GET("{establishmentId:int}/employees/activities/counts", ActionPrecedence = 1)]
        public EmployeeActivityCountsModel GetActivityCounts(int establishmentId)
        {
            //throw new Exception();
            //System.Threading.Thread.Sleep(5000);

            var view = _queryProcessor.Execute(new EmployeeActivityCountsViewByEstablishment(establishmentId));
            if (view == null)
            {
                view = new EmployeeActivityCountsView();
                var establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId));
                if (establishment != null)
                    view.EstablishmentId = establishment.RevisionId;
            }

            var model = new EmployeeActivityCountsModel
            {
                ActivityCount = view.ActivityCount,
                PersonCount = view.PersonCount,
                LocationCount = view.LocationCount,
            };

            return model;
        }

        [CacheHttpGet(Duration = 3600)]
        [GET("{domain}/employees/settings/icons/{name}")]
        public HttpResponseMessage GetSettingsIcon(string domain, string name)
        {
            //throw new Exception();
            //System.Threading.Thread.Sleep(2000);

            if (!"global-view".Equals(name, StringComparison.OrdinalIgnoreCase) &&
                !"find-expert".Equals(name, StringComparison.OrdinalIgnoreCase))

                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var pathAndMime = new { Path = "", Mime = "" };

            var tenant = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            if (tenant != null)
            {
                var tenantId = tenant.RevisionId;
                var settings = _queryProcessor.Execute(new EmployeeModuleSettingsByEstablishmentId(tenantId));
                if (settings != null)
                {
                    if ("global-view".Equals(name, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(settings.GlobalViewIconName))
                    {
                        pathAndMime = new
                        {
                            Path = string.Format("{0}{1}", settings.GlobalViewIconPath, settings.GlobalViewIconFileName),
                            Mime = settings.GlobalViewIconMimeType,
                        };
                    }
                    else if ("find-expert".Equals(name, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(settings.FindAnExpertIconFileName))
                    {
                        pathAndMime = new
                        {
                            Path = string.Format("{0}{1}", settings.FindAnExpertIconPath, settings.FindAnExpertIconFileName),
                            Mime = settings.FindAnExpertIconMimeType,
                        };
                    }
                }
            }

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            if (!string.IsNullOrWhiteSpace(pathAndMime.Path) && !string.IsNullOrWhiteSpace(pathAndMime.Mime))
            {
                var content = _binaryData.Get(pathAndMime.Path);
                if (content == null)
                    return new HttpResponseMessage(HttpStatusCode.NotFound);

                response.Content = new ByteArrayContent(content);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(pathAndMime.Mime);
                return response;
            }
            var stream = new MemoryStream(); // do not dispose, StreamContent will dispose internally
            var relativePath = string.Format("~/{0}", Links.images.icons.globe.shiny_24_png);
            ImageBuilder.Current.Build(relativePath, stream, new ResizeSettings());
            stream.Position = 0;
            response.Content = new StreamContent(stream);
            var defaultMime = new MediaTypeHeaderValue("image/png");
            response.Content.Headers.ContentType = defaultMime;
            return response;
        }

        [CacheHttpGet(Duration = 3600)]
        [GET("employees/settings/activity-types/{typeId:int}/icon")]
        public HttpResponseMessage GetSettingsActivityTypeIcon(int typeId)
        {
            //throw new Exception();
            //System.Threading.Thread.Sleep(2000);

            var activityType = _entities.Query<EmployeeActivityType>()
                .SingleOrDefault(x => x.Id == typeId);
            if (activityType == null)
                return Request.CreateResponse(HttpStatusCode.NotFound);

            var path = string.Format("{0}{1}", activityType.IconPath, activityType.IconFileName);
            var mime = activityType.IconMimeType;

            var binaryContent = _binaryData.Get(path);
            if (binaryContent == null || binaryContent.Length < 1)
                return new HttpResponseMessage(HttpStatusCode.NotFound);

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(binaryContent);
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(mime);
            return response;
        }

        //[CurrentModuleTab(ModuleTab.Employees)]
        //[GET("{domain}/employees/maptest")]
        [CacheHttpGet(Duration = 3600)]
        [GET("{domain}/employees/map")]
        public ActivitySearchResultMapModel[] GetMaptest(string domain, [FromUri] ActivitySearchInputModel input)
        {
            var query = new ActivityValuesBy();
            //var input = new ActivitySearchInputModel();
            
            input.PageSize = 10;
            Mapper.Map(input, query);
            var results = _queryProcessor.Execute(query);
            var Output = Mapper.Map<ActivitySearchResultMapModel[]>(results);

            //var model = new ActivitySearchMapModel
            //{
            //    Domain = domain,
            //    Input = input,
            //    Output = Output,
            //    ActivityTypes = Enumerable.Empty<ActivityTypeModel>(),
            //};
            //var settings = _queryProcessor.Execute(new EmployeeSettingsByEstablishment(domain)
            //{
            //    EagerLoad = new Expression<Func<EmployeeModuleSettings, object>>[]
            //    {
            //        x => x.ActivityTypes,
            //    }
            //});
            //if (settings != null && settings.ActivityTypes.Any())
            //    model.ActivityTypes = Mapper.Map<ActivityTypeModel[]>(settings.ActivityTypes.OrderBy(x => x.Rank));

            //var establishment = _queryProcessor.Execute(new EstablishmentByDomain(domain));
            //if (establishment == null) return HttpNotFound();
            //ViewBag.EmployeesEstablishmentId = establishment.RevisionId;
            //Session.LastEmployeeLens(Request);
            //Session.LastActivityLens(Request);

            return Output;
        }
        [CacheHttpGet(Duration = 3600)]
        [GET("{domain}/employees/continents")]
        public ActivitySearchResultPlacesCounted[] GetMapContinent(string domain, [FromUri] ActivitySearchInputModel input)
        {
            //var query = new ActivityValuesBy()
            //{
            //    EagerLoad = ActivitySearchResultMapContinentsModel.EagerLoad,
            //};
            //input.PageSize = 10;
            //Mapper.Map(input, query);
            //var results = _queryProcessor.Execute(query);
            //var Output = Mapper.Map<ActivitySearchResultMapContinentsModel[]>(results);
            //var grouped = Output.Where(x => x.Continents != null).SelectMany(x => x.Continents).GroupBy(g => g.Code).Select(g => new ActivitySearchResultPlacesCounted
            //{
            //    PlaceType = g.First().PlaceType,
            //    Name = g.First().Name,
            //    Id = g.First().Id,
            //    Code = g.First().Code,
            //    Center = g.First().Center,
            //    BoundingBox = g.First().BoundingBox,
            //    Count = g.Count()
            //}).ToArray();}


            var tenant = _queryProcessor.Execute(new EstablishmentByDomain(domain)).RevisionId as int?;
            if (input.AncestorId != null)
            {
                tenant = input.AncestorId;
            }
            if (tenant != null)
            {
                ActivityMapCountRepository activityMapCountRepository = new ActivityMapCountRepository();
                var Output = activityMapCountRepository.ActivityMapCount_Continent(input, tenant);
                var activityCount = Output.Count();
                Output.Add(new ActivityMapCountsApiQueryResultModel { id = 55949070, name = "Africa", latitude = 2.07079F, longitude = 15.80048F, code = "AF", isContinent = true });
                Output.Add(new ActivityMapCountsApiQueryResultModel { id = 55949070, name = "Antarctica", latitude = -78F, longitude = 45.5F, code = "AN", isContinent = true });
                Output.Add(new ActivityMapCountsApiQueryResultModel { id = 55949070, name = "Asia", latitude = 34.969669F, longitude = 99.819054F, code = "AS", isContinent = true });
                Output.Add(new ActivityMapCountsApiQueryResultModel { id = 55949070, name = "Europe", latitude = 52.976181F, longitude = 7.85784F, code = "EU", isContinent = true });
                Output.Add(new ActivityMapCountsApiQueryResultModel { id = 55949070, name = "North America", latitude = 44.330818F, longitude = -109.754723F, code = "NA", isContinent = true });
                Output.Add(new ActivityMapCountsApiQueryResultModel { id = 55949070, name = "Oceana", latitude = -30.941031F, longitude = 140.810654F, code = "OC", isContinent = true });
                Output.Add(new ActivityMapCountsApiQueryResultModel { id = 55949070, name = "South America", latitude = -23.030081F, longitude = -67.903702F, code = "SA", isContinent = true });
                //need to add for other continents as well
                var grouped = Output.GroupBy(g => g.code).Select(g => new ActivitySearchResultPlacesCounted
                {
                    ActivityCount = null,
                    Count = g.Count() - 1,//take off one for adding the default above
                    PlaceType = g.First().code == "WATER" ? "water" : g.First().code == "GLOBAL" ? "global" : "continent",
                    Name = g.First().code == "WATER" ? "Bodies Of Water" : g.First().code == "GLOBAL" ? "Global" : g.First().name,
                    Id = g.First().id,
                    Code = g.First().code,
                    Center = g.First().code == "WATER" ? new MapPointModel { Latitude = 0, Longitude = -180 } : g.First().code == "GLOBAL" ? new MapPointModel { Latitude = 76, Longitude = -180 } : g.Where(x => x.isContinent).First().center,
                    BoundingBox = null,
                }).ToArray();
                return grouped;
            }
            else
            {
                return null;
            }        
        }

        [CacheHttpGet(Duration = 3600)]
        [GET("{domain}/employees/countries")]
        public ActivitySearchResultPlacesCounted[] GetMapCountries(string domain, [FromUri] ActivitySearchInputModel input)
        {

            var tenant = _queryProcessor.Execute(new EstablishmentByDomain(domain)).RevisionId as int?;
            if (input.AncestorId != null)
            {
                tenant = input.AncestorId;
            }
            if (tenant != null)
            {
                ActivityMapCountRepository activityMapCountRepository = new ActivityMapCountRepository();
                var Output = activityMapCountRepository.ActivityMapCount_Country(input, tenant);
                //add continents only on zoomed
                var grouped = Output.GroupBy(g => g.name).Select(g => new ActivitySearchResultPlacesCounted
                {
                    ActivityCount = null,
                    Count = g.Count(),
                    PlaceType = g.First().isContinent ? "continent" : g.First().isCountry ? "country" : g.First().isRegion ? "region" : g.First().isWater ? "water" : "global",
                    Name = g.First().name,
                    Id = g.First().id,
                    Code = g.First().code,
                    Center = g.First().center,
                    BoundingBox = null,
                }).ToArray();
                return grouped;
            }
            else
            {
                return null;
            }
        }

        [CacheHttpGet(Duration = 3600)]
        [GET("{domain}/employees/waters")]
        public ActivitySearchResultPlacesCounted[] GetMapWaters(string domain, [FromUri] ActivitySearchInputModel input)
        {

            var tenant = _queryProcessor.Execute(new EstablishmentByDomain(domain)).RevisionId as int?;
            if (input.AncestorId != null)
            {
                tenant = input.AncestorId;
            }
            if (tenant != null)
            {
                ActivityMapCountRepository activityMapCountRepository = new ActivityMapCountRepository();
                var Output = activityMapCountRepository.ActivityMapCount_Water(input, tenant);
                //var activityCount = Output.Count();

                var grouped = Output.GroupBy(g => g.id).Select(g => new ActivitySearchResultPlacesCounted
                {
                    ActivityCount = null,
                    Count = g.Count(),
                    PlaceType = "water",
                    Name = g.First().name,
                    Id = g.First().id,
                    Code = null,
                    Center = g.First().center,
                    BoundingBox = null,
                }).ToArray();

                //var query = new ActivityValuesBy()
                //{
                //    EagerLoad = ActivitySearchResultMapContinentsModel.EagerLoad,
                //};

                //input.PageSize = 10;
                //Mapper.Map(input, query);
                //var results = _queryProcessor.Execute(query);
                //var Output = Mapper.Map<ActivitySearchResultMapWatersModel[]>(results);

                //var grouped = Output.Where(x => x.Waters != null).SelectMany(x => x.Waters).GroupBy(g => g.Id).Select(g => new ActivitySearchResultPlacesCounted
                //{
                //    PlaceType = g.First().PlaceType,
                //    Name = g.First().Name,
                //    Id = g.First().Id,
                //    Code = g.First().Code,
                //    Center = g.First().Center,
                //    BoundingBox = g.First().BoundingBox,
                //    Count = g.Count()
                //}).ToArray();

                return grouped;
            }
            else
            {
                return null;
            }
        }

        [CacheHttpGet(Duration = 3600)]
        [GET("{domain}/employees/regions")]
        public ActivitySearchResultPlacesCountedRegions[] GetMapRegions(string domain, [FromUri] ActivitySearchInputModel input)
        {
            var query = new ActivityValuesBy()
            {
                EagerLoad = ActivitySearchResultMapContinentsModel.EagerLoad,
            };

            input.PageSize = 10;
            Mapper.Map(input, query);
            var results = _queryProcessor.Execute(query);
            var Output = Mapper.Map<ActivitySearchResultMapRegionsModel[]>(results);

            var grouped = Output.Where(x => x.Regions != null).SelectMany(x => x.Regions).Where(x => x.Id == -1).GroupBy(g => g.Name).Select(g => new ActivitySearchResultPlacesCountedRegions
            {
                Name = g.First().Name,
                Id = g.First().Id,
                Count = g.Count()
            }).ToArray();

            return grouped;
        }
    }
}
