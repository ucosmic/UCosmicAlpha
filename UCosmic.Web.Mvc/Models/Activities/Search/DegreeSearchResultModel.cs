using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using AutoMapper;
using UCosmic.Domain.Degrees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class DegreeSearchResultModel
    {
        public int DegreeId { get; set; }
        public string Title { get; set; }
        public string FieldOfStudy { get; set; }
        public int? YearAwarded { get; set; }
        public DegreeSearchResultOwnerModel Owner { get; set; }
        public DegreeSearchResultEstablishmentModel AlmaMater { get; set; }

        public class DegreeSearchResultOwnerModel
        {
            public int PersonId { get; set; }
            public string DisplayName { get; set; }
            public string LastCommaFirst { get; set; }
        }

        public class DegreeSearchResultEstablishmentModel
        {
            public int EstablishmentId { get; set; }
            public string TranslatedName { get; set; }
            public string OfficialName { get; set; }
        }
    }

    public class PageOfDegreeSearchResultModel : PageOf<DegreeSearchResultModel>
    {
    }

    public static class DegreeSearchResultProfiler
    {
        public class EntitiyToModel : Profile
        {
            public static IList<Expression<Func<Degree, object>>> EagerLoad = new Expression<Func<Degree, object>>[]
            {
                x => x.Person,
                x => x.Institution.Names.Select(y => y.TranslationToLanguage),
            };

            protected override void Configure()
            {
                CreateMap<Degree, DegreeSearchResultModel>()
                    .ForMember(d => d.DegreeId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.Owner, o => o.MapFrom(s => s.Person))
                    .ForMember(d => d.AlmaMater, o => o.MapFrom(s => s.Institution))
;
            }
        }

        public class PersonToOwner : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, DegreeSearchResultModel.DegreeSearchResultOwnerModel>()
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.LastCommaFirst, o => o.ResolveUsing(s =>
                    {
                        if (!string.IsNullOrWhiteSpace(s.LastName))
                        {
                            var builder = new StringBuilder(s.LastName);
                            if (!string.IsNullOrWhiteSpace(s.Salutation) || !string.IsNullOrWhiteSpace(s.FirstName) ||
                                !string.IsNullOrWhiteSpace(s.MiddleName) || !string.IsNullOrWhiteSpace(s.Suffix))
                                builder.Append(",");
                            if (!string.IsNullOrWhiteSpace(s.Salutation))
                                builder.Append(string.Format(" {0}", s.Salutation));
                            if (!string.IsNullOrWhiteSpace(s.FirstName))
                                builder.Append(string.Format(" {0}", s.FirstName));
                            if (!string.IsNullOrWhiteSpace(s.MiddleName))
                                builder.Append(string.Format(" {0}", s.MiddleName));
                            if (!string.IsNullOrWhiteSpace(s.Suffix))
                                builder.Append(string.Format(" {0}", s.Suffix));
                            return builder.ToString();
                        }
                        return s.DisplayName;
                    }))
                ;
            }
        }

        public class EstablishmentToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Establishment, DegreeSearchResultModel.DegreeSearchResultEstablishmentModel>()
                    .ForMember(d => d.EstablishmentId, o => o.MapFrom(s => s.RevisionId))
                ;
            }
        }

        public class PageQueryResultToPageOfItems : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Degree>, PageOfDegreeSearchResultModel>();
            }
        }
    }
}