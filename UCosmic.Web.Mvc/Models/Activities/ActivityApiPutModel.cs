using System;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityApiPutModel
    {
        public int Id { get; set; }
        public ActivityMode Mode { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? StartsOn { get; set; }
        public DateTime? EndsOn { get; set; }
        public bool? OnGoing { get; set; }
        public string DateFormat { get; set; }
        public bool? WasExternallyFunded { get; set; }
        public bool? WasInternallyFunded { get; set; }
        public ActivityTagApiPutModel[] Tags { get; set; }
        public int[] LocationPlaceIds { get; set; }
        public int[] TypeIds { get; set; }
    }
}