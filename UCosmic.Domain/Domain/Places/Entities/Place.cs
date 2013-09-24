using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using Newtonsoft.Json;

namespace UCosmic.Domain.Places
{
    public class Place : RevisableEntity, IEquatable<Place>
    {
        protected internal Place()
        {
            Center = new Coordinates(null, null);
            BoundingBox = new BoundingBox(null, null, null, null);

            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            Names = new Collection<PlaceName>();
            Children = new Collection<Place>();
            Ancestors = new Collection<PlaceNode>();
            Offspring = new Collection<PlaceNode>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public int? ParentId { get; protected internal set; }
        public virtual Place Parent { get; protected internal set; }

        public Coordinates Center { get; protected internal set; }
        public BoundingBox BoundingBox { get; protected internal set; }

        public string OfficialName { get; protected internal set; }
        public virtual ICollection<PlaceName> Names { get; protected internal set; }
        public virtual ICollection<Place> Children { get; protected set; }
        public virtual ICollection<PlaceNode> Ancestors { get; protected set; }
        public virtual ICollection<PlaceNode> Offspring { get; protected set; }

        public virtual GeoNamesToponym GeoNamesToponym { get; protected internal set; }
        public virtual GeoPlanetPlace GeoPlanetPlace { get; protected internal set; }

        public bool IsEarth { get; protected internal set; }
        public bool IsContinent { get; protected internal set; }
        public bool IsCountry { get; protected internal set; }
        public bool IsWater { get; protected internal set; }
        public bool IsRegion { get; protected internal set; }
        public bool IsAdmin1 { get; protected internal set; }
        public bool IsAdmin2 { get; protected internal set; }
        public bool IsAdmin3 { get; protected internal set; }

        public bool Equals(Place other)
        {
            return other != null && other.RevisionId.Equals(RevisionId);
        }

        public override bool Equals(object obj)
        {
            return ReferenceEquals(this, obj) || Equals(obj as Place);
        }

        public override int GetHashCode()
        {
            return RevisionId.GetHashCode();
        }

        public override string ToString()
        {
            var placeType = (GeoPlanetPlace != null) ? GeoPlanetPlace.Type.EnglishName : null;
            return (string.IsNullOrWhiteSpace(placeType)) ? OfficialName : string.Format("{0} ({1})", OfficialName, placeType);
        }
    }

    internal static class PlaceSerializer
    {
        internal static string ToJsonAudit(this Place entity)
        {
            var state = JsonConvert.SerializeObject(new
            {
                Id = entity.RevisionId,
                CenterLatitude = entity.Center.Latitude,
                CenterLongitude = entity.Center.Longitude,
                BoxNorthEastLatitude = entity.BoundingBox.Northeast.Latitude,
                BoxNorthEastLongitude = entity.BoundingBox.Northeast.Longitude,
                BoxSouthWestLatitude = entity.BoundingBox.Southwest.Latitude,
                BoxSouthWestLongitude = entity.BoundingBox.Southwest.Longitude,
                entity.OfficialName,
                ParentId = entity.Parent != null ? entity.Parent.RevisionId : (int?)null,
                GeoNamesToponymId = entity.GeoNamesToponym != null ? entity.GeoNamesToponym.GeoNameId : (int?)null,
                GeoPlanetWoeId = entity.GeoPlanetPlace != null ? entity.GeoPlanetPlace.WoeId : (int?)null,
                entity.IsEarth,
                entity.IsContinent,
                entity.IsCountry,
                entity.IsWater,
                entity.IsRegion,
                entity.IsAdmin1,
                entity.IsAdmin2,
                entity.IsAdmin3,
            });
            return state;
        }
    }
}