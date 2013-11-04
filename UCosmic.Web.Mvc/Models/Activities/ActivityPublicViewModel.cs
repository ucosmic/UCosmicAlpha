using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityPublicViewModel
    {

        public ActivityMode Mode { get; set; }
        public int ActivityId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        // couldn't make this optional because I couldn't use ToString to format the date
        public DateTime StartsOn { get; set; }
        public DateTime EndsOn { get; set; }
        public string StartsFormat { get; set; }
        public string EndsFormat { get; set; }
        public bool? OnGoing { get; set; }
        public bool? IsExternallyFunded { get; set; }
        public bool? IsInternallyFunded { get; set; }
        public string UpdatedByPrincipal { get; set; }
        //public DateTime UpdatedOnUtc { get; set; }
        public ActivityTypeViewModel[] Types { get; set; }
        public ActivityPlaceViewModel[] Places { get; set; }
        public ActivityTagViewModel[] Tags { get; set; }
        public ActivityDocumentApiModel[] Documents { get; set; }
        //public string StartsOnString
        //{
        //    get
        //    {
        //        return StartsOn.ToString(StartsFormat);
        //    }
        //}
        //public string EndsOnString
        //{
        //    get { return StartsOn.ToString(EndsFormat); }
        //}

    }

    public class ActivityTypeViewModel
    {
        //public int ActivityId { get; set; }
        public int TypeId { get; set; }
        public string Text { get; set; }
        //public int Rank { get; set; }
    }

    public class ActivityPlaceViewModel
    {
        //public int ActivityId { get; set; }
        //public int PlaceId { get; set; }
        public string PlaceName { get; set; }
    }

    public class ActivityTagViewModel
    {
        //public int ActivityId { get; set; }
        public string Text { get; set; }
        //public ActivityTagDomainType DomainType { get; set; }
        //public int? DomainKey { get; set; }
    }

    public class ActivityDocumentViewModel
    {
        //public int ActivityId { get; set; }
        public int DocumentId { get; set; }
        public string Title { get; set; }
        public string FileName { get; set; }
        //public long ByteCount { get; set; }
        //public string Size
        //{
        //    get { return ByteCount.ToFileSize(); }
        //}
        //public string Extension
        //{
        //    get { return Path.GetExtension(FileName); }
        //}

    }
}