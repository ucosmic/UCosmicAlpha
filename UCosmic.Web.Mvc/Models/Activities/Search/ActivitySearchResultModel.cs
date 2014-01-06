using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivitySearchResultModel
    {
        public ActivityMode Mode { get; set; }
        public int ActivityId { get; set; }
        public string Title { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public bool? OnGoing { get; set; }
        public ActivityTypeViewModel[] Types { get; set; }
        public ActivityPlaceViewModel[] Places { get; set; }
        public ActivitySearchResultOwnerModel Owner { get; set; }

        public class ActivitySearchResultOwnerModel
        {
            public int PersonId { get; set; }
            public string DisplayName { get; set; }
            public string LastCommaFirst { get; set; }
        }
    }

    public class PageOfActivitySearchResultModel : PageOf<ActivitySearchResultModel>
    {
    }

    public static class ActivitySearchResultProfiler
    {
        public class EntitiyToModel : Profile
        {

            public static IList<Expression<Func<ActivityValues, object>>> EagerLoad = new Expression<Func<ActivityValues, object>>[]
            {
                x => x.Types.Select(y => y.Type),
                x => x.Locations.Select(y => y.Place),
                x => x.Activity.Person,
            };

            protected override void Configure()
            {
                CreateMap<ActivityValues, ActivitySearchResultModel>()
                    .ForMember(d => d.Owner, o => o.MapFrom(s => s.Activity.Person))
                    .ForMember(d => d.Places, o => o.MapFrom(s => s.Locations.OrderBy(x => x.Place.OfficialName)))
                    .ForMember(d => d.Types, o => o.MapFrom(s => s.Types.OrderBy(x => x.Type.Rank)))
                ;
            }
        }

        public class PersonToOwner : Profile
        {
            protected override void Configure()
            {
                CreateMap<Person, ActivitySearchResultModel.ActivitySearchResultOwnerModel>()
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

        public class PageQueryResultToPageOfItems : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<ActivityValues>, PageOfActivitySearchResultModel>();
            }
        }
    }
}