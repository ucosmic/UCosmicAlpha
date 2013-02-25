using System;
using System.Collections.ObjectModel;
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

    public class ActivityLocationApiModel
    {
        public string PlaceOfficialName { get; protected internal set; }
        public int PlaceId { get; protected internal set; }
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
        public ICollection<ActivityLocationApiModel> ActivityLocations { get; protected internal set; }
        public int? TypeId { get; protected internal set; }
        public ICollection<ActivityTagApiModel> ActivityTags { get; protected internal set; }
    }

    //public class PageOfActivityApiModel : PageOf<ActivityApiModel> { }

    public static class ActivityApiProfiler
    {
        public class EntityToModelProfiler : Profile
        {
            protected override void Configure()
            {
                //CreateMap<ActivityTag, ActivityTagApiModel>();

                //CreateMap<ActivityLocation, ActivityLocationApiModel>();

                //CreateMap<Activity, ActivityApiModel>();
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
                //CreateMap<PagedQueryResult<Activity>, PageOfActivityApiModel>();
            }
        }

    }
}