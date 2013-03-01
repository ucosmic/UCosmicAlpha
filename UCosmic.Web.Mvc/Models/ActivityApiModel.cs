using System;
using System.Collections.Generic;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Places;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityTypeNameApiModel
    {
        public int Id { get; set; }
        public string Type { get; set; }
    }

    public class ActivityLocationNameApiModel
    {
        public int PlaceId { get; set; }
        public bool IsCountry { get; set; }
        public bool IsBodyOfWater { get; set; }
        public bool IsEarth { get; set; }
        public string OfficialName { get; set; }
    }

    public class ActivityLocationApiModel
    {
        public int RevisionId { get; set; }
        public byte[] Version { get; set; }
        public int ActivityValuesId { get; set; }
        public int PlaceId { get; set; }
    }

    public class ActivityTagApiModel
    {
        public int RevisionId { get; set; }
        public byte[] Version { get; set; }
        public int ActivityId { get; protected internal set; }
        public int Number { get; set; }
        public string Text { get; set; }
        public string DomainTypeText { get; set; }
        public int? DomainKey { get; set; }
        public string ModeText { get; set; }
    }

    public class ActivityValuesApiModel
    {
        public int RevisionId { get; set; }
        public byte[] Version { get; set; }
        public int ActivityId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public ICollection<ActivityLocationApiModel> Locations { get; set; }
        public int? TypeId { get; set; }
        public string ModeText { get; set; }
    }

    public class ActivityApiModel
    {
        public int RevisionId { get; set; }
        public byte[] Version { get; set; }
        public int PersonId { get; set; }
        public int Number { get; set; }
        public Guid EntityId { get; set; }
        public string ModeText { get; protected set; }
        public ICollection<ActivityValuesApiModel> Values { get; set; }     // only Values with same mode as Activity
        public ICollection<ActivityTagApiModel> Tags { get; set; }          // only Tags with same mode as Activity
    }

    public class ActivitySearchInputModel
    {
        public int PersonId { get; set; }
        public string OrderBy { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }

    public class PageOfActivityApiModel : PageOf<ActivityApiModel> { }

    public static class ActivityApiProfiler
    {
        public class EntityToModelProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<ActivityType, ActivityTypeNameApiModel>();

                CreateMap<ActivityTag, ActivityTagApiModel>();

                CreateMap<ActivityValues, ActivityValuesApiModel>();

                CreateMap<ActivityLocation, ActivityLocationApiModel>();

                CreateMap<Activity, ActivityApiModel>()
                    .ForMember(d => d.Values, o => o.MapFrom(s => s.Values));

                CreateMap<ActivitySearchInputModel, ActivitiesByPersonIdMode>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.ModeText, o => o.Ignore());

                CreateMap<Place, ActivityLocationNameApiModel>()
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.IsBodyOfWater, o => o.Ignore()); // Temporary
            }
        }

        public class PagedQueryResultToPageOfItemsProfiler : Profile
        {
            protected override void Configure()
            {
                CreateMap<PagedQueryResult<Activity>, PageOfActivityApiModel>();
            }
        }

    }


}