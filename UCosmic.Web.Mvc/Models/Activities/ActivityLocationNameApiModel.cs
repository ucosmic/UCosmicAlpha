using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityLocationNameApiModel
    {
        public int Id { get; set; }
        public bool IsCountry { get; set; }
        public bool IsBodyOfWater { get; set; }
        public bool IsEarth { get; set; }
        public string OfficialName { get; set; }
    }

    public static class ActivityLocationNameApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Place, ActivityLocationNameApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.IsBodyOfWater, o => o.Ignore()) // Temporary
                ;
            }
        }
    }
}