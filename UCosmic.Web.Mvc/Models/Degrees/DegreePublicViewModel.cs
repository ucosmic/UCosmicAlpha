using AutoMapper;
using UCosmic.Domain.Degrees;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class DegreePublicViewModel
    {
        public string Title { get; set; }
        public string FieldOfStudy { get; set; }
        public int? YearAwarded { get; set; }
        public Establishment Institution { get; set; }
        public int Id { get; set; }
    }

    public class PageOfDegreePublicViewModel : PageOf<DegreePublicViewModel>
    {
    }

    public static class DegreePublicViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Degree, DegreePublicViewModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    //.ForMember(d => d.Institution.OfficialName, o => o.MapFrom(s =>
                    //    s.Institution.Names.SingleOrDefault(x => x.IsOfficialName).Text))
                    //.ForMember(d => d.InstitutionOfficialName, o => o.MapFrom(s =>
                    //    s.Institution.Names.Where(x => x.IsOfficialName)))
                    ;
            }
        }

        public class PageQueryResultToPageOfItems : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Degree>, PageOfDegreePublicViewModel>();
            }
        }
    }

}