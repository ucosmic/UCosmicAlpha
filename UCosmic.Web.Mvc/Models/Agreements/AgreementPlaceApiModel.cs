using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementPlaceApiModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int[] AgreementIds { get; set; }
        public bool IsEarth { get; set; }
        public bool IsContinent { get; set; }
        public bool IsCountry { get; set; }
        public bool IsAdmin1 { get; set; }
        public bool IsAdmin2 { get; set; }
        public bool IsAdmin3 { get; set; }
        public int AgreementCount { get { return (AgreementIds == null) ? 0 : AgreementIds.Length; } }
        //public PlaceApiModel[] Ancestors { get; set; } // eager loading this slows down query
        public MapPointModel Center { get; set; }
    }

    public static class AgreementPlaceProfiler
    {
        public class QueryResultToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementPartnerPlaceResult, AgreementPlaceApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.Place.RevisionId))
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.Place.OfficialName))
                    .ForMember(d => d.Type, o => o.MapFrom(s => s.Place.GeoPlanetPlace != null ? s.Place.GeoPlanetPlace.Type.EnglishName : null))
                    //.ForMember(d => d.Ancestors, o => o.MapFrom(s => s.Place.Ancestors
                    //    .OrderByDescending(x => x.Separation)
                    //    .Select(x => x.Ancestor)
                    //    .Where(x => !x.IsEarth)
                    //))
                    .ForMember(d => d.Center, o => o.MapFrom(s => s.Place.Center))
                    .ForMember(d => d.IsEarth, o => o.MapFrom(s => s.Place.IsEarth))
                    .ForMember(d => d.IsContinent, o => o.MapFrom(s => s.Place.IsContinent))
                    .ForMember(d => d.IsCountry, o => o.MapFrom(s => s.Place.IsCountry))
                    .ForMember(d => d.IsAdmin1, o => o.MapFrom(s => s.Place.IsAdmin1))
                    .ForMember(d => d.IsAdmin2, o => o.MapFrom(s => s.Place.IsAdmin2))
                    .ForMember(d => d.IsAdmin3, o => o.MapFrom(s => s.Place.IsAdmin3))
                    .ForMember(d => d.AgreementIds, o => o.UseValue(new int[0]))
                ;
            }
        }
    }
}