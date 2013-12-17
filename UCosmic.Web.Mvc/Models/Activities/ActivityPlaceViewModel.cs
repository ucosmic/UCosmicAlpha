using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPlaceViewModel
    {
        public string PlaceName { get; set; }
        public MapPointModel PlaceCenter { get; set; }
    }

    public static class ActivityPlaceViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityLocation, ActivityPlaceViewModel>()
                    .ForMember(d => d.PlaceName, o => o.MapFrom(s => s.Place.OfficialName))
                ;
            }
        }
    }
}