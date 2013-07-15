using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
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
        public string Version { get; set; }
    }

    public class ActivityTypeApiModel
    {
        public int Id { get; set; }
        public int TypeId { get; set; }
        public string Version { get; set; }
    }

    public class ActivityTagApiModel
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public string Text { get; set; }
        public string DomainTypeText { get; set; }
        public int? DomainKey { get; set; }
        public string ModeText { get; set; }
        public string Version { get; set; }
    }

    public class ActivityValuesApiModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }
        public string DateFormat { get; set; }
        public ICollection<ActivityLocationApiModel> Locations { get; set; }    // only Locations with same mode as Activity
        public ICollection<ActivityTypeApiModel> Types { get; set; }            // only Types with same mode as Activity
        public ICollection<ActivityTagApiModel> Tags { get; set; }              // only Tags with same mode as Activity
        public ICollection<ActivityDocumentApiModel> Documents { get; set; }    // only Documents with same mode as Activity
        public string ModeText { get; set; }
        public string Version { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
    }

    public class ActivityDocumentApiModel
    {
        public int ActivityId { get; set; }
        public int Id { get; set; }
        public string Title { get; set; }
        public string Extension { get; set; }
        public string Size { get; set; }
        public string ModeText { get; set; }
        public string Version { get; set; }
    }

    public class ActivityApiModel
    {
        public int Id { get; set; }
        public string Version { get; set; }
        public int PersonId { get; set; }
        public int Number { get; set; }
        public Guid EntityId { get; set; }
        public string ModeText { get; set; }
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

    public class ActivityEditState
    {
        public bool IsInEdit { get; set; }
        public string EditingUserName { get; set; }
        public string EditingUserEmail { get; set; }
    }

    public class ActivityPlaceCount
    {
        public int PlaceId;
        public string OfficialName;
        public int Count;
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
                    .ForMember(d => d.ActivityId,
                               o => o.MapFrom(s => s.ActivityValues.ActivityId))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Extension, o => o.MapFrom(s => Path.GetExtension(s.FileName).Substring(1)))
                    .ForMember(d => d.Size, o => o.MapFrom(s => s.Length))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                ;

                CreateMap<ActivityType, ActivityTypeApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.TypeId, o => o.MapFrom(s => s.TypeId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    ;

                CreateMap<ActivityTag, ActivityTagApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.DomainTypeText, o => o.MapFrom(s => s.DomainTypeText))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    ;

                CreateMap<ActivityLocation, ActivityLocationApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.PlaceId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    ;

                CreateMap<ActivityValues, ActivityValuesApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    .ForMember(d => d.WasExternallyFunded, o => o.MapFrom(s => s.WasExternallyFunded))
                    .ForMember(d => d.WasInternallyFunded, o => o.MapFrom(s => s.WasInternallyFunded))
                    ;

                CreateMap<Activity, ActivityApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.PersonId))
                    .ForMember(d => d.Values, o => o.MapFrom(s => s.Values.First(a => a.Mode == s.Mode)))
                    .ForMember(d => d.WhenLastUpdated, o => o.MapFrom(s => s.UpdatedOnUtc))
                    .ForMember(d => d.WhoLastUpdated, o => o.MapFrom(s => s.UpdatedByPrincipal))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.ToBase64String(s.Version)))
                    ;

                CreateMap<EstablishmentView, ActivityEstablishmentApiModel>();

                CreateMap<ActivitySearchInputModel, ActivitiesByPersonId>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore());

                CreateMap<Place, ActivityLocationNameApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.IsBodyOfWater, o => o.Ignore()); // Temporary
            }
        }

        public class ModelToEntityProfile : Profile
        {
            public class ActivityValuesResolver : ValueResolver<ActivityApiModel, ICollection<ActivityValues>>
            {
                protected override ICollection<ActivityValues> ResolveCore(ActivityApiModel source)
                {
                    var values = Mapper.Map<ActivityValues>(source.Values);
                    return new Collection<ActivityValues> { values };
                }
            }

            protected override void Configure()
            {
                CreateMap<ActivityDocumentApiModel, ActivityDocument>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Mode, o => o.Ignore())
                    .ForMember(d => d.FileName, o => o.Ignore())
                    .ForMember(d => d.MimeType, o => o.Ignore())
                    .ForMember(d => d.Length, o => o.MapFrom(s => s.Size))
                    .ForMember(d => d.Path, o => o.Ignore())
                    .ForMember(d => d.Version, o => o.MapFrom(s => String.IsNullOrEmpty(s.Version) ? null : Convert.FromBase64String(s.Version)))
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.ActivityValues, o => o.Ignore())
                    .ForMember(d => d.ActivityValuesId, o => o.Ignore())
                    .ForMember(d => d.CreatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.CreatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.UpdatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.IsCurrent, o => o.Ignore())
                    .ForMember(d => d.IsArchived, o => o.Ignore())
                    .ForMember(d => d.IsDeleted, o => o.Ignore())
                    ;

                CreateMap<ActivityTypeApiModel, ActivityType>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.Type, o => o.Ignore())
                    .ForMember(d => d.TypeId, o => o.MapFrom(s => s.TypeId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => String.IsNullOrEmpty(s.Version) ? null : Convert.FromBase64String(s.Version)))
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.ActivityValues, o => o.Ignore())
                    .ForMember(d => d.ActivityValuesId, o => o.Ignore())
                    .ForMember(d => d.CreatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.CreatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.UpdatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.IsCurrent, o => o.Ignore())
                    .ForMember(d => d.IsArchived, o => o.Ignore())
                    .ForMember(d => d.IsDeleted, o => o.Ignore())
                    ;

                CreateMap<ActivityTagApiModel, ActivityTag>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Mode, o => o.Ignore())
                    .ForMember(d => d.DomainTypeText, o => o.MapFrom(s => s.DomainTypeText))
                    .ForMember(d => d.DomainType, o => o.Ignore())
                    .ForMember(d => d.DomainKey, o => o.MapFrom(s => s.DomainKey))
                    .ForMember(d => d.Version, o => o.MapFrom(s => String.IsNullOrEmpty(s.Version) ? null : Convert.FromBase64String(s.Version)))
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.ActivityValues, o => o.Ignore())
                    .ForMember(d => d.ActivityValuesId, o => o.Ignore())
                    .ForMember(d => d.CreatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.CreatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.UpdatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.IsCurrent, o => o.Ignore())
                    .ForMember(d => d.IsArchived, o => o.Ignore())
                    .ForMember(d => d.IsDeleted, o => o.Ignore())
                    ;

                CreateMap<ActivityLocationApiModel, ActivityLocation>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.Place, o => o.Ignore())
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.PlaceId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => String.IsNullOrEmpty(s.Version) ? null : Convert.FromBase64String(s.Version)))
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.ActivityValues, o => o.Ignore())
                    .ForMember(d => d.ActivityValuesId, o => o.Ignore())
                    .ForMember(d => d.CreatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.CreatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.UpdatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.IsCurrent, o => o.Ignore())
                    .ForMember(d => d.IsArchived, o => o.Ignore())
                    .ForMember(d => d.IsDeleted, o => o.Ignore())
                    ;

                CreateMap<ActivityValuesApiModel, ActivityValues>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Mode, o => o.Ignore())
                    .ForMember(d => d.Version, o => o.MapFrom(s => String.IsNullOrEmpty(s.Version) ? null : Convert.FromBase64String(s.Version)))
                    .ForMember(d => d.Activity, o => o.Ignore())
                    .ForMember(d => d.ActivityId, o => o.Ignore())
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.CreatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.CreatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.UpdatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.IsCurrent, o => o.Ignore())
                    .ForMember(d => d.IsArchived, o => o.Ignore())
                    .ForMember(d => d.IsDeleted, o => o.Ignore())
                    ;

                CreateMap<ActivityApiModel, Activity>()
                    .ForMember(d => d.RevisionId, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
                    .ForMember(d => d.Mode, o => o.Ignore())
                    .ForMember(d => d.Person, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.PersonId))
                    .ForMember(d => d.Values, o => o.ResolveUsing<ActivityValuesResolver>())
                    .ForMember(d => d.UpdatedOnUtc, o => o.MapFrom(s => s.WhenLastUpdated))
                    .ForMember(d => d.UpdatedByPrincipal, o => o.MapFrom(s => s.WhoLastUpdated))
                    .ForMember(d => d.Version, o => o.MapFrom(s => String.IsNullOrEmpty(s.Version) ? null : Convert.FromBase64String(s.Version)))
                    .ForMember(d => d.EditSourceId, o => o.Ignore())
                    .ForMember(d => d.CreatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.CreatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.IsCurrent, o => o.Ignore())
                    .ForMember(d => d.IsArchived, o => o.Ignore())
                    .ForMember(d => d.IsDeleted, o => o.Ignore())
                    ;
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