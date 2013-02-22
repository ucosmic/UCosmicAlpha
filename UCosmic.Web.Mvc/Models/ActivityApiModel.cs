using System;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTagApiModel
    {
        public int Number { get; protected internal set; }
        public string Text { get; protected internal set; }
        public string DomainTypeText { get; protected set; }
        public int? DomainKey { get; protected internal set; }        
    }

    public class ActivityApiModel
    {
        public int PersonId { get; protected internal set; }
        public int Number { get; protected internal set; }
        public Guid EntityId { get; protected internal set; }
        public string ModeText { get; protected set; }
        public string Title { get; protected internal set; }
        public string Content { get; protected internal set; }
        public DateTime? StartsOn { get; protected internal set; }
        public DateTime? EndsOn { get; protected internal set; }
        public int? CountryId { get; protected internal set; }
        public int? TypeId { get; protected internal set; }
        // Tags?
    }

    public class PageOfActivityApiModel : PageOf<ActivityApiModel> { }

    public static class ActivityApiProfiler
    {
        public class ViewToModelProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<Activity, ActivityApiModel>()
                    .ForMember(d => d.Title,  o => o.MapFrom( s => (s.Mode == ActivityMode.Public) ? s.Values.Title : s.DraftedValues.Title ))
                    .ForMember(d => d.Content, o => o.MapFrom(s => (s.Mode == ActivityMode.Public) ? s.Values.Content : s.DraftedValues.Content))
                    .ForMember(d => d.StartsOn, o => o.MapFrom(s => (s.Mode == ActivityMode.Public) ? s.Values.StartsOn : s.DraftedValues.StartsOn))
                    .ForMember(d => d.EndsOn, o => o.MapFrom(s => (s.Mode == ActivityMode.Public) ? s.Values.EndsOn : s.DraftedValues.EndsOn))
                    .ForMember(d => d.CountryId, o => o.MapFrom(s => (s.Mode == ActivityMode.Public) ? s.Values.CountryId : s.DraftedValues.CountryId))
                    .ForMember(d => d.TypeId, o => o.MapFrom(s => (s.Mode == ActivityMode.Public) ? s.Values.TypeId : s.DraftedValues.TypeId))                 
                    ;
            }
        }

        //public class PagedViewResultToPageOfModelsProfiler
        //    : PagedQueryResultToPageOfItemsProfiler<EstablishmentView, EstablishmentApiModel>
        //{
        //}

        public class PagedQueryResultToPageOfItemsProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Activity>, PageOfActivityApiModel>();
            }
        }

    }
}