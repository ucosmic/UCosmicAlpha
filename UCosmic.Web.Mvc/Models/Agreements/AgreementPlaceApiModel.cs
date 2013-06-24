using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementPlaceApiModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int[] AgreementIds { get; set; }
        public int AgreementCount { get { return (AgreementIds == null) ? 0 : AgreementIds.Length; } }
    }

    public static class AgreementPlaceProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Place, AgreementPlaceApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.OfficialName))
                    .ForMember(d => d.Type, o => o.MapFrom(s => s.GeoPlanetPlace != null ? s.GeoPlanetPlace.Type.EnglishName : null))
                    .ForMember(d => d.AgreementIds, o => o.UseValue(new int[0]))
                ;
            }
        }
    }
}