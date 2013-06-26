using AutoMapper;

namespace UCosmic.Domain.Places
{
    internal static class GeoPlanetConverter
    {
        internal static GeoPlanetPlace ToEntity(this NGeo.Yahoo.GeoPlanet.Place geoPlanetPlace)
        {
            return (geoPlanetPlace != null) ? Mapper.Map<GeoPlanetPlace>(geoPlanetPlace) : null;
        }

        internal static GeoPlanetPlaceType ToEntity(this NGeo.Yahoo.GeoPlanet.PlaceType geoPlanetPlaceType)
        {
            return (geoPlanetPlaceType != null) ? Mapper.Map<GeoPlanetPlaceType>(geoPlanetPlaceType) : null;
        }

        internal static Place ToPlace(this GeoPlanetPlace geoPlanetPlace)
        {
            if (geoPlanetPlace == null) return null;

            var place = Mapper.Map<Place>(geoPlanetPlace);
            place.GeoPlanetPlace = geoPlanetPlace;
            return place;
        }

    }

    public static class GeoPlanetProfiler
    {
        public class PlaceToEntityProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<NGeo.Yahoo.GeoPlanet.Place, GeoPlanetPlace>()
                    .ForMember(d => d.EnglishName, o => o.MapFrom(s => s.Name))
                    .ForMember(d => d.Uri, o => o.MapFrom(s => s.Uri.ToString()))
                    .ForMember(d => d.Country, o => o.MapFrom(s => (s.Country != null)
                        ? Mapper.Map<GeoPlanetAdmin>(s.Country) : new GeoPlanetAdmin()))
                    .ForMember(d => d.Admin1, o => o.MapFrom(s => (s.Admin1 != null)
                        ? Mapper.Map<GeoPlanetAdmin>(s.Admin1) : new GeoPlanetAdmin()))
                    .ForMember(d => d.Admin2, o => o.MapFrom(s => (s.Admin2 != null)
                        ? Mapper.Map<GeoPlanetAdmin>(s.Admin2) : new GeoPlanetAdmin()))
                    .ForMember(d => d.Admin3, o => o.MapFrom(s => (s.Admin3 != null)
                        ? Mapper.Map<GeoPlanetAdmin>(s.Admin3) : new GeoPlanetAdmin()))
                    .ForMember(d => d.Locality1, o => o.MapFrom(s => (s.Locality1 != null)
                        ? Mapper.Map<GeoPlanetLocality>(s.Locality1) : new GeoPlanetLocality()))
                    .ForMember(d => d.Locality2, o => o.MapFrom(s => (s.Locality2 != null)
                        ? Mapper.Map<GeoPlanetLocality>(s.Locality2) : new GeoPlanetLocality()))
                    .ForMember(d => d.Parent, o => o.Ignore())
                    .ForMember(d => d.Children, o => o.Ignore())
                    .ForMember(d => d.Ancestors, o => o.Ignore())
                    .ForMember(d => d.Offspring, o => o.Ignore())
                    .ForMember(d => d.BelongTos, o => o.Ignore())
                    .ForMember(d => d.Place, o => o.Ignore())
                ;
            }
        }

        public class PlaceTypeToEntityProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<NGeo.Yahoo.GeoPlanet.PlaceType, GeoPlanetPlaceType>()
                    .ForMember(d => d.EnglishName, o => o.MapFrom(s => s.Name))
                    .ForMember(d => d.EnglishDescription, o => o.MapFrom(s => s.Description))
                    .ForMember(d => d.Uri, o => o.MapFrom(s => s.Uri.ToString()))
                ;
            }
        }

        public class PointToValueObjectProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<NGeo.Yahoo.GeoPlanet.Point, Coordinates>();
            }
        }

        public class BoundingBoxToValueObjectProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<NGeo.Yahoo.GeoPlanet.BoundingBox, BoundingBox>();
            }
        }

        public class AdminToValueObjectProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<NGeo.Yahoo.GeoPlanet.Admin, GeoPlanetAdmin>()
                    .ForMember(d => d.TypeName, o => o.MapFrom(s => s.Type))
                ;
            }
        }

        public class LocalityToValueObjectProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<NGeo.Yahoo.GeoPlanet.Locality, GeoPlanetLocality>()
                    .ForMember(d => d.TypeName, o => o.MapFrom(s => s.Type))
                ;
            }
        }

        public class GeoPlanetPlaceToPlaceProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<GeoPlanetPlace, Place>()
                    .ForMember(d => d.OfficialName, o => o.ResolveUsing(s => s.EnglishName))
                    .ForMember(d => d.IsEarth, o => o.ResolveUsing(s => s.WoeId == 1))
                    //.ForMember(d => d.IsContinent, o => o.ResolveUsing(s =>
                    //    s.Type.Code == 29))
                    //.ForMember(d => d.IsCountry, o => o.ResolveUsing(s =>
                    //    s.Type.Code == 12))
                    //.ForMember(d => d.IsAdmin1, o => o.ResolveUsing(s =>
                    //    s.Type.Code == 8))
                    //.ForMember(d => d.IsAdmin2, o => o.ResolveUsing(s =>
                    //    s.Type.Code == 9))
                    //.ForMember(d => d.IsAdmin3, o => o.ResolveUsing(s =>
                    //    s.Type.Code == 10))
                    .ForMember(d => d.ParentId, o => o.Ignore())
                    .ForMember(d => d.Parent, o => o.Ignore())
                    .ForMember(d => d.Children, o => o.Ignore())
                    .ForMember(d => d.Ancestors, o => o.Ignore())
                    .ForMember(d => d.Offspring, o => o.Ignore())
                    .ForMember(d => d.Names, o => o.Ignore())
                    .ForMember(d => d.GeoNamesToponym, o => o.Ignore())
                    .ForMember(d => d.GeoPlanetPlace, o => o.Ignore())
                    .ForMember(d => d.RevisionId, o => o.Ignore())
                    .ForMember(d => d.EntityId, o => o.Ignore())
                    .ForMember(d => d.CreatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.CreatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.UpdatedOnUtc, o => o.Ignore())
                    .ForMember(d => d.UpdatedByPrincipal, o => o.Ignore())
                    .ForMember(d => d.Version, o => o.Ignore())
                    .ForMember(d => d.IsCurrent, o => o.Ignore())
                    .ForMember(d => d.IsArchived, o => o.Ignore())
                    .ForMember(d => d.IsDeleted, o => o.Ignore())
                ;
            }
        }
    }
}
