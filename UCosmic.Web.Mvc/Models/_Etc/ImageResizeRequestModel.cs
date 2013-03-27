namespace UCosmic.Web.Mvc.Models
{
    public class ImageResizeRequestModel
    {
        public int? MaxHeight { get; set; }
        public int? MaxWidth { get; set; }
        public int? MaxSide { get; set; }
        public ImageResizeQuality? Quality { get; set; }
    }

    public enum ImageResizeQuality
    {
        Thumbnail = 0,
        High = 1,
    }
}