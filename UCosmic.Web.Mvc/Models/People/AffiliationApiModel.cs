using System;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.People;
namespace UCosmic.Web.Mvc.Models
{
    public class AffiliationApiModel
    {
        public int AffiliationId { get; set; }
        public int PersonId { get; set; }
        public int EstablishmentId { get; set; }
        public bool IsDefault { get; set; }
        public string JobTitles { get; set; }
        public EmployeeSettingsFacultyRankApiModel FacultyRank { get; set; }
        public AffiliatedEstablishmentApiModel[] Establishments { get; set; }

        internal static readonly Expression<Func<Affiliation, object>>[] EagerLoad = new Expression<Func<Affiliation, object>>[]
        {
            x => x.Establishment.Type.Category,
            x => x.Establishment.Ancestors.Select(y => y.Ancestor),
            x => x.FacultyRank,
        };
    }

    public static class AffiliationApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Affiliation, AffiliationApiModel>()
                    .ForMember(d => d.AffiliationId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.Establishments, o => o.ResolveUsing(s =>
                    {
                        var establishments = new[] { s.Establishment }.Union(s.Establishment.Ancestors.Select(x => x.Ancestor));
                        return establishments.OrderBy(x => x.Ancestors.Count);
                    }))
                ;
            }
        }
    }
}