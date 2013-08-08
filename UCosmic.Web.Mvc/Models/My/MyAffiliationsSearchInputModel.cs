using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class MyAffiliationsSearchInputModel : BaseSearchInputModel
    {
        public bool? IsDefault { get; set; }
    }

    public static class AffiliationSearchInputModelProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<MyAffiliationsSearchInputModel, MyAffiliations>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.Ignore())
                ;
            }
        }
    }
}