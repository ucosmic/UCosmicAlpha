using System;
using System.Collections.ObjectModel;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/faculty-staff")]
    public class FacultyStaffController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public FacultyStaffController(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        /* Returns activity type counts for given place.*/
        [GET("activity-count/{establishmentId?}/{placeId?}")]
        public FacultyStaffSummaryModel GetActivityCount(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffSummaryModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value)); 
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                if (placeId.HasValue)
                {
                    var view = new ActivityPlaceActivityCountView(_queryProcessor, _entities, 
                                                                   establishment.RevisionId,
                                                                   placeId.Value);

                    model.PlaceId = view.PlaceId;
                    model.Count = view.Count;
                    model.CountOfPlaces = 1;

                    model.PlaceCounts = null;

                    if ((view.TypeCounts != null) && (view.TypeCounts.Count > 0))
                    {
                        foreach (var type in view.TypeCounts)
                        {
                            model.TypeCounts.Add(new FacultyStaffTypeCountModel
                            {
                                TypeId = type.TypeId,
                                Type = type.Type,
                                Count = type.Count
                            });
                        }
                    }
                }
                else
                {
                    var view = new ActivityGlobalActivityCountView(_queryProcessor, _entities,
                                                                    establishment.RevisionId);

                    model.Count = view.Count;
                    model.CountOfPlaces = view.CountOfPlaces;

                    foreach (var placeCount in view.PlaceCounts)
                    {
                        model.PlaceCounts.Add(new FacultyStaffPlaceCountModel
                        {
                            PlaceId = placeCount.PlaceId,
                            OfficialName = placeCount.OfficialName,
                            Count = placeCount.Count
                        });
                    }

                    foreach (var type in view.TypeCounts)
                    {
                        model.TypeCounts.Add(new FacultyStaffTypeCountModel
                        {
                            TypeId = type.TypeId,
                            Type = type.Type,
                            Count = type.Count
                        });
                    }
                }
            }


            return model;
        }

        /* Returns people counts for given place. */
        [GET("people-count/{establishmentId?}/{placeId?}")]
        public FacultyStaffSummaryModel GetPeopleCount(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffSummaryModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value));
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                if (placeId.HasValue)
                {
                    var view = new ActivityPlacePeopleCountView(_queryProcessor, _entities,
                                                                   establishment.RevisionId,
                                                                   placeId.Value);

                    model.PlaceId = view.PlaceId;
                    model.Count = view.Count;
                    model.CountOfPlaces = 1;

                    model.PlaceCounts = null;

                    foreach (var type in view.TypeCounts)
                    {
                        model.TypeCounts.Add(new FacultyStaffTypeCountModel
                        {
                            TypeId = type.TypeId,
                            Type = type.Type,
                            Count = type.Count
                        });
                    }
                }
                else
                {
                    var view = new ActivityGlobalPeopleCountView(_queryProcessor, _entities,
                                                                    establishment.RevisionId);


                    model.Count = view.Count;
                    model.CountOfPlaces = view.CountOfPlaces;

                    foreach (var placeCount in view.PlaceCounts)
                    {
                        model.PlaceCounts.Add(new FacultyStaffPlaceCountModel
                        {
                            PlaceId = placeCount.PlaceId,
                            OfficialName = placeCount.OfficialName,
                            Count = placeCount.Count
                        });
                    }

                    foreach (var type in view.TypeCounts)
                    {
                        model.TypeCounts.Add(new FacultyStaffTypeCountModel
                        {
                            TypeId = type.TypeId,
                            Type = type.Type,
                            Count = type.Count
                        });
                    }
                }
            }


            return model;
        }

        /* Returns activity trend count for place. */
        [GET("activity-trend/{establishmentId?}/{placeId?}")]
        public FacultyStaffTrendModel GetActivityTrend(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffTrendModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value));
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                if (placeId.HasValue)
                {
                    var view = new ActivityPlaceTrendActivityView( _queryProcessor, _entities,
                                                              establishment.RevisionId,
                                                              placeId.Value);

                    model.PlaceId = placeId.Value;

                    foreach (var data in view.Data)
                    {
                        model.TrendCounts.Add(new FacultyStaffTrendCountModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                }
                else
                {
                    var view = new ActivityGlobalTrendActivityView( _queryProcessor, 
                                                                    establishment.RevisionId );

                    foreach (var data in view.Data)
                    {
                        model.TrendCounts.Add(new FacultyStaffTrendCountModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                }
            }

            return model;
        }

        /* Returns people trend count for place. */
        [GET("people-trend/{establishmentId?}/{placeId?}")]
        public FacultyStaffTrendModel GetPeopleTrend(int? establishmentId, int? placeId)
        {
            var model = new FacultyStaffTrendModel();

            var tenancy = Request.Tenancy();
            Establishment establishment = null;

            if (establishmentId.HasValue && (establishmentId.Value != 0))
            {
                establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId.Value));
            }
            else
            {
                if (tenancy.TenantId.HasValue)
                {
                    establishment = _queryProcessor.Execute(new EstablishmentById(tenancy.TenantId.Value));
                }
                else if (!String.IsNullOrEmpty(tenancy.StyleDomain) && !"default".Equals(tenancy.StyleDomain))
                {
                    establishment = _queryProcessor.Execute(new EstablishmentByEmail(tenancy.StyleDomain));
                }
            }

            if (establishment != null)
            {
                if (placeId.HasValue)
                {
                    var view = new ActivityPlaceTrendPeopleView(_queryProcessor, _entities,
                                                              establishment.RevisionId,
                                                              placeId.Value);

                    model.PlaceId = placeId.Value;

                    foreach (var data in view.Data)
                    {
                        model.TrendCounts.Add(new FacultyStaffTrendCountModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                }
                else
                {
                    var view = new ActivityGlobalTrendPeopleView( _queryProcessor,
                                                                  establishment.RevisionId );

                    foreach (var data in view.Data)
                    {
                        model.TrendCounts.Add(new FacultyStaffTrendCountModel
                        {
                            Year = data.Year,
                            Count = data.Count
                        });
                    }
                }
            }

            return model;
        }
    }
}
