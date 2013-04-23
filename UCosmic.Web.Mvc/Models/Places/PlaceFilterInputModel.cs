using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class PlaceFilterInputModel
    {
        public int? ParentId { get; set; }
        public bool? IsCountry { get; set; }
        public bool? IsContinent { get; set; }
        public bool? IsEarth { get; set; }
        public bool? IsWater { get; set; }
        public bool? IsAdmin1 { get; set; }
        public bool? IsAdmin2 { get; set; }
        public bool? IsAdmin3 { get; set; }
        public IEnumerable<int> WoeIds { get; set; }
        public IEnumerable<int> GeoNameIds { get; set; }
    }

    public static class PlaceFilterInputProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PlaceFilterInputModel, FilteredPlaces>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.UseValue(
                        new Dictionary<Expression<Func<Place, object>>, OrderByDirection>
                        {
                            { x => x.OfficialName, OrderByDirection.Ascending },
                        }
                    ))
                ;
            }
        }
    }
}