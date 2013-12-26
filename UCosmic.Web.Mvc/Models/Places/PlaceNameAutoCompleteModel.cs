using AutoMapper;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class PlaceNameAutoCompleteModel
    {
        public int PlaceId { get; set; }
        public string OfficialName { get; set; }
        public string[] MatchedNames { get; set; }
    }

    public static class PlaceNameAutoCompleteProfiler
    {
        public class DocumentToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<PlaceDocument, PlaceNameAutoCompleteModel>()
                    .ForMember(d => d.MatchedNames, o => o.Ignore())
                ;
            }
        }
    }
}