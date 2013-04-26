using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Files;
using UCosmic.Domain.People;
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
        public int Id { get; set; }
        public int? FileId { get; set; }
        public int? ImageId { get; set; }
        public int ProxyWidth { get; set; }
        public int ProxyHeight { get; set; }
        public bool Visible { get; set; }
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
                    .ForMember(d => d.FileId,
                               o => o.MapFrom(s => (s.File != null) ? s.FileId : null))
                    .ForMember(d => d.ImageId,
                               o => o.MapFrom(s => (s.Image != null) ? s.ImageId : null))
                    .ForMember(d => d.ProxyWidth,
                               o => o.UseValue(ConfigurationManager.AppSettings["ProxyImageWidth"]))
                    .ForMember(d => d.ProxyHeight,
                               o => o.UseValue(ConfigurationManager.AppSettings["ProxyImageHeight"]))
                    .ForMember(d => d.Title,
                               o => o.MapFrom(s => s.Title ?? ((s.File != null) ? s.File.Title : s.Image.Title)))
                    .ForMember(d => d.Extension,
                               o => o.MapFrom(s => (s.File != null) ? s.File.Extension : s.Image.Extension))
                    .ForMember(d => d.Size,
                               o => o.MapFrom(s => (s.File != null) ? s.File.Length.ToFileSize() : s.Image.Size.ToFileSize()))
                    .ForMember(d => d.ModeText, o => o.MapFrom(s => s.ModeText))
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
                    .ForMember(d => d.DomainTypeText, o => o.MapFrom(s => s.DomainType.AsSentenceFragment()))
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
            //public class LoadableFileResolver : ValueResolver<ActivityDocumentApiModel, LoadableFile>
            //{
            //    private readonly IQueryEntities _entities;

            //    public LoadableFileResolver(IQueryEntities entities)
            //    {
            //        _entities = entities;
            //    }

            //    protected override LoadableFile ResolveCore(ActivityDocumentApiModel source)
            //    {
            //        return (source.FileId != null) ? _entities.Query<LoadableFile>().SingleOrDefault(x => x.Id == source.FileId) : null;
            //    }
            //}

            //public class ImageResolver : ValueResolver<ActivityDocumentApiModel, Image>
            //{
            //    private readonly IQueryEntities _entities;

            //    public ImageResolver(IQueryEntities entities)
            //    {
            //        _entities = entities;
            //    }

            //    protected override Image ResolveCore(ActivityDocumentApiModel source)
            //    {
            //        return (source.ImageId != null) ? _entities.Query<Image>().SingleOrDefault(x => x.Id == source.ImageId) : null;
            //    }
            //}

            //public class TypeResolver : ValueResolver<ActivityTypeApiModel, ActivityType>
            //{
            //    private readonly IQueryEntities _entities;

            //    public TypeResolver(IQueryEntities entities)
            //    {
            //        _entities = entities;
            //    }

            //    protected override ActivityType ResolveCore(ActivityTypeApiModel source)
            //    {
            //        return _entities.Query<ActivityType>().SingleOrDefault(x => x.RevisionId == source.TypeId);
            //    }
            //}

            //public class PlaceResolver : ValueResolver<ActivityLocationApiModel, Place>
            //{
            //    private readonly IQueryEntities _entities;

            //    public PlaceResolver(IQueryEntities entities)
            //    {
            //        _entities = entities;
            //    }

            //    protected override Place ResolveCore(ActivityLocationApiModel source)
            //    {
            //        return (source.PlaceId != 0) ? _entities.Query<Place>().SingleOrDefault(x => x.RevisionId == source.PlaceId) : null;
            //    }
            //}

            //public class PersonResolver : ValueResolver<ActivityApiModel, Person>
            //{
            //    private readonly IQueryEntities _entities;

            //    public PersonResolver(IQueryEntities entities)
            //    {
            //        _entities = entities;
            //    }

            //    protected override Person ResolveCore(ActivityApiModel source)
            //    {
            //        return (source.PersonId != 0) ? _entities.Query<Person>().SingleOrDefault(x => x.RevisionId == source.PersonId) : null;
            //    }
            //}

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
                    //.ForMember(d => d.File, o => o.ResolveUsing<LoadableFileResolver>())
                    .ForMember(d => d.File, o => o.Ignore())
                    .ForMember(d => d.FileId, o => o.MapFrom( s => s.FileId))
                    //.ForMember(d => d.Image, o => o.ResolveUsing<ImageResolver>())
                    .ForMember(d => d.Image, o => o.Ignore())
                    .ForMember(d => d.ImageId, o => o.MapFrom(s => s.ImageId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.FromBase64String(s.Version)))
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
                    //.ForMember(d => d.Type, o => o.ResolveUsing<TypeResolver>())
                    .ForMember(d => d.Type, o => o.Ignore())
                    .ForMember(d => d.TypeId, o => o.MapFrom(s => s.TypeId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.FromBase64String(s.Version)))
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
                    .ForMember(d => d.DomainType, o => o.MapFrom(s => s.DomainTypeText.AsEnum<ActivityTagDomainType>()))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.FromBase64String(s.Version)))
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
                    //.ForMember(d => d.Place, o => o.ResolveUsing<PlaceResolver>())
                    .ForMember(d => d.Place, o => o.Ignore())
                    .ForMember(d => d.PlaceId, o => o.MapFrom(s => s.PlaceId))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.FromBase64String(s.Version)))
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
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.FromBase64String(s.Version)))
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
                     //.ForMember(d => d.Person, o => o.ResolveUsing<PersonResolver>())
                    .ForMember(d => d.Person, o => o.Ignore())
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.PersonId))
                    .ForMember(d => d.Values, o => o.ResolveUsing<ActivityValuesResolver>())
                    .ForMember(d => d.UpdatedOnUtc, o => o.MapFrom(s => s.WhenLastUpdated))
                    .ForMember(d => d.UpdatedByPrincipal, o => o.MapFrom(s => s.WhoLastUpdated))
                    .ForMember(d => d.Version, o => o.MapFrom(s => Convert.FromBase64String(s.Version)))
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