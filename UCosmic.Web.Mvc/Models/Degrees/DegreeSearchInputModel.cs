using AutoMapper;
using UCosmic.Domain.Degrees;

namespace UCosmic.Web.Mvc.Models
{
    public class DegreeSearchInputModel : BaseSearchInputModel
    {
        public string OrderBy { get; set; }
    }

    public static class DegreeSearchInputProfiler
    {
        public class ModelToQueriesProfile: Profile
        {
            protected override void Configure()
            {
                CreateMap<DegreeSearchInputModel, DegreesByPersonId>()
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.MapFrom(x => DegreeApiModel.EagerLoads))
                ;

                CreateMap<DegreeSearchInputModel, MyDegrees>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.MapFrom(x => DegreeApiModel.EagerLoads))
                ;
            }
        }
    }
}