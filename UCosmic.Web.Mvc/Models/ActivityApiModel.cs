using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Establishments;
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
        public int Id { get; set; }
        public bool IsCountry { get; set; }
        public bool IsBodyOfWater { get; set; }
        public bool IsEarth { get; set; }
        public string OfficialName { get; set; }
    }

    public class ActivityEstablishmentApiModel
    {
        public int Id { get; set; }
        public string OfficialName { get; set; }
    }

    public class ActivityLocationApiModel
    {
        public int Id { get; set; }
        public int PlaceId { get; set; }
    }

    public class ActivityTypeApiModel
    {
        public int Id { get; set; }
        public int TypeId { get; set; }
    }

    public class ActivityTagApiModel
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public string Text { get; set; }
        public string DomainTypeText { get; set; }
        public int? DomainKey { get; set; }
        public string ModeText { get; set; }
    }

    public class ActivityValuesApiModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public ICollection<ActivityLocationApiModel> Locations { get; set; }    // only Locations with same mode as Activity
        public ICollection<ActivityTypeApiModel> Types { get; set; }            // only Types with same mode as Activity
        public ICollection<ActivityTagApiModel> Tags { get; set; }              // only Tags with same mode as Activity
        public ICollection<ActivityDocumentApiModel> Documents { get; set; }    // only Documents with same mode as Activity
        public string ModeText { get; set; }
    }

    public class ActivityDocumentApiModel
    {
        public int Id { get; set; }
        public int? FileId { get; set; }
        public int? ImageId { get; set; }
        public int ProxyWidth { get; set; }
        public int ProxyHeight { get; set; }
        public bool Visible { get; set; }
        public string Title { get; set; }
        public string Extension { get; set; }
        public string Size { get; set; }
    }

    public class ActivityApiModel
    {
        public int Id { get; set; }
        public byte[] Version { get; set; }
        public int PersonId { get; set; }
        public int Number { get; set; }
        public Guid EntityId { get; set; }
        public string ModeText { get; protected set; }
        public ActivityValuesApiModel Values { get; set; }         // only Values with same mode as Activity
        public DateTime? WhenLastUpdated { get; set; }
        public string WhoLastUpdated { get; set; }
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
                CreateMap<ActivityDocument, ActivityDocumentApiModel>()
                    .ForMember(d => d.Id,
                               o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.ProxyWidth,
                               o => o.UseValue(ConfigurationManager.AppSettings["ProxyImageWidth"]))
                    .ForMember(d => d.ProxyHeight,
                               o => o.UseValue(ConfigurationManager.AppSettings["ProxyImageHeight"]))
                    .ForMember(d => d.Title,
                               o => o.MapFrom(s => s.Title ?? ((s.File != null) ? s.File.Title : s.Image.Title)))
                    .ForMember(d => d.Extension,
                               o => o.MapFrom(s => (s.File != null) ? s.File.Extension : s.Image.Extension))
                    .ForMember(d => d.Size,
                               o => o.MapFrom(s => (s.File != null) ? s.File.Length.ToFileSize() : s.Image.Size.ToFileSize()));

                CreateMap<ActivityType, ActivityTypeApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId));

                CreateMap<ActivityTag, ActivityTagApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId));

                CreateMap<ActivityValues, ActivityValuesApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId));

                CreateMap<ActivityLocation, ActivityLocationApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId));

                CreateMap<EstablishmentView, ActivityEstablishmentApiModel>();

                CreateMap<Activity, ActivityApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.Values, o => o.MapFrom(s => s.Values.First(a => a.Mode == s.Mode)))
                    .ForMember(d => d.WhenLastUpdated, o => o.MapFrom(s => s.UpdatedOnUtc))
                    .ForMember(d => d.WhoLastUpdated, o => o.MapFrom(s => s.UpdatedByPrincipal));

                CreateMap<ActivitySearchInputModel, ActivitiesByPersonId>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore());

                CreateMap<Place, ActivityLocationNameApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
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