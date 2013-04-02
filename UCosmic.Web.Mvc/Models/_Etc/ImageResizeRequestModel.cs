using AutoMapper;
using ImageResizer;

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

    public static class ImageResizeRequestProfiler
    {
        public class ModelToImageResizerSettingsProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<ImageResizeRequestModel, ResizeSettings>()
                    .ConvertUsing(model =>
                    {
                        var settings = new ResizeSettings();
                        if (model.MaxHeight.HasValue && model.MaxHeight.Value > 0)
                            settings.MaxHeight = model.MaxHeight.Value;
                        if (model.MaxWidth.HasValue && model.MaxWidth.Value > 0)
                            settings.MaxWidth = model.MaxWidth.Value;
                        if (model.MaxSide.HasValue && model.MaxSide.Value > 0)
                        {
                            settings.MaxWidth = model.MaxSide.Value;
                            settings.MaxHeight = model.MaxSide.Value;
                        }
                        return settings;
                    })
                ;
            }
        }
    }
}