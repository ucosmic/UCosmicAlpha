using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc
{
    public static class ImageResizer
    {
        public static MemoryStream ResizeImageConstrained(this Image inSourceImage,
                                                          int inDestCanvasWidth,
                                                          int inDestCanvasHeight,
                                                          ImageFormat inToFormat)
        {
            Debug.Assert(inDestCanvasWidth != 0);
            Debug.Assert(inDestCanvasHeight != 0);

            int srcWidth = inSourceImage.Width;
            int srcHeight = inSourceImage.Height;
            int width = inDestCanvasWidth;
            int height = inDestCanvasHeight;
            int x = 0;
            int y = 0;

            if ((srcWidth != inDestCanvasWidth) || (srcHeight != inDestCanvasHeight))
            {
                float scale;

                if (srcWidth > srcHeight)
                {
                    scale = (float)inDestCanvasWidth / (float)srcWidth;
                }
                else
                {
                    scale = (float)inDestCanvasHeight / (float)srcHeight;
                }

                width = (int)((float)srcWidth * scale);
                height = (int)((float)srcHeight * scale);
                x = (inDestCanvasWidth - width) / 2;
                y = (inDestCanvasHeight - height) / 2;
            }

            Image destImage = new Bitmap(inDestCanvasWidth, inDestCanvasHeight);

            Graphics g = Graphics.FromImage(destImage);
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;

            Rectangle destBounds = new Rectangle(0, 0, inDestCanvasWidth, inDestCanvasHeight);
            g.FillRectangle(new SolidBrush(Color.Transparent), destBounds);

            g.DrawImage(inSourceImage, x, y, width, height);

            MemoryStream memStream = new MemoryStream();
            destImage.Save(memStream, inToFormat);

            return memStream;
        }

        public static Stream ResizeImage(this byte[] imageContent, ImageResizeRequestModel resizeParameters)
        {
            if (imageContent == null) throw new ArgumentNullException("imageContent");
            if (resizeParameters == null) throw new ArgumentNullException("resizeParameters");

            Stream stream = new MemoryStream(imageContent);
            using (var image = Image.FromStream(stream))
            {
                return image.ResizeImage(resizeParameters);
            }
        }

        public static Stream ResizeImage(this string imagePath, ImageResizeRequestModel resizeParameters)
        {
            if (imagePath == null) throw new ArgumentNullException("imagePath");
            if (resizeParameters == null) throw new ArgumentNullException("resizeParameters");

            using (var image = Image.FromFile(imagePath))
            {
                return image.ResizeImage(resizeParameters);
            }
        }

        private static Stream ResizeImage(this Image image, ImageResizeRequestModel resizeParameters)
        {
            if (image == null) throw new ArgumentNullException("image");
            if (resizeParameters == null) throw new ArgumentNullException("resizeParameters");

            Stream stream;
            if (resizeParameters.MaxHeight.HasValue ||
                resizeParameters.MaxWidth.HasValue ||
                resizeParameters.MaxSide.HasValue)
            {
                var targetSize = resizeParameters.GetTargetSize(new Size(image.Width, image.Height));
                var quality = resizeParameters.GetQuality();

                if (quality == ImageResizeQuality.High)
                {
                    using (var thumbnailBitmap = new Bitmap(targetSize.Width, targetSize.Height))
                    {
                        thumbnailBitmap.SetResolution(72.0f, 72.0f);
                        using (var thumbnailGraph = Graphics.FromImage(thumbnailBitmap))
                        {
                            thumbnailGraph.CompositingQuality = CompositingQuality.HighQuality;
                            thumbnailGraph.SmoothingMode = SmoothingMode.HighQuality;
                            thumbnailGraph.InterpolationMode = InterpolationMode.HighQualityBicubic;

                            var imageRectangle = new Rectangle(0, 0, targetSize.Width, targetSize.Height);
                            thumbnailGraph.DrawImage(image, imageRectangle);

                            stream = new MemoryStream();
                            thumbnailBitmap.Save(stream, image.RawFormat);
                        }
                    }
                }
                else
                {
                    var abort = new Image.GetThumbnailImageAbort(() => false);
                    using (var thumbnailImage = image.GetThumbnailImage(
                        targetSize.Width, targetSize.Height, abort, IntPtr.Zero))
                    {
                        stream = new MemoryStream();
                        thumbnailImage.Save(stream, image.RawFormat);                       
                    }
                }
            }
            else
            {
                stream = new MemoryStream();
                image.Save(stream, image.RawFormat);
            }

            stream.Position = 0;

            return stream;
        }

        private static Size GetTargetSize(this ImageResizeRequestModel request, Size originalSize)
        {
            var maxWidth = request.GetMaxWidth(originalSize);
            var maxHeight = request.GetMaxHeight(originalSize);
            var aspectRatio = originalSize.GetAspectRatio();
            Size targetSize;

            // if image is taller than it is wide, aspect ratio will be less than 1
            // in these cases, adjust the width based on the height
            // also take this approach when the image is perfectly square (aspect ratio == 1.0)
            if (aspectRatio <= 1)
            {
                targetSize = originalSize.ReduceByHeight(maxHeight);

                // width can still be greater than maxWidth
                if (targetSize.Width > maxWidth)
                    // now we have to reduce the height based on the max width
                    targetSize = originalSize.ReduceByWidth(maxWidth);
            }
            // if image is wider than it is tall, aspect ratio will be greater than 1
            // in these cases, adjust the height based on the width
            else
            {
                targetSize = originalSize.ReduceByWidth(maxWidth);
                // height can still be greater than maxHeight
                if (targetSize.Height > maxHeight)
                    // now we have to reduce the width based on the max height
                    targetSize = originalSize.ReduceByHeight(maxHeight);
            }

            return targetSize;
        }

        private static Size ReduceByHeight(this Size originalSize, double maxHeight)
        {
            if (originalSize.Height <= maxHeight) return originalSize;

            var scale = maxHeight / originalSize.Height;
            var targetWidth = Math.Round(scale * originalSize.Width);
            var targetHeight = Math.Round(scale * originalSize.Height);
            var reducedSize = new Size(Convert.ToInt32(targetWidth), Convert.ToInt32(targetHeight));
            return reducedSize;
        }

        private static Size ReduceByWidth(this Size originalSize, double maxWidth)
        {
            if (originalSize.Width <= maxWidth) return originalSize;

            var scale = maxWidth / originalSize.Width;
            var targetWidth = Math.Round(scale * originalSize.Width);
            var targetHeight = Math.Round(scale * originalSize.Height);
            var reducedSize = new Size(Convert.ToInt32(targetWidth), Convert.ToInt32(targetHeight));
            return reducedSize;
        }

        private static double GetAspectRatio(this Size size)
        {
            var aspectRatio = (double)size.Width / size.Height;
            return aspectRatio;
        }

        private static double GetMaxWidth(this ImageResizeRequestModel request, Size originalSize)
        {
            var maxWidth = originalSize.Width; // no bounds on maximum width
            if (request.MaxSide.HasValue && request.MaxSide.Value > 0)
                maxWidth = request.MaxSide.Value;
            else if (request.MaxWidth.HasValue && request.MaxWidth.Value > 0)
                maxWidth = request.MaxWidth.Value;
            return maxWidth;
        }

        private static double GetMaxHeight(this ImageResizeRequestModel request, Size originalSize)
        {
            var maxHeight = originalSize.Height; // no bounds on maximum height
            if (request.MaxSide.HasValue && request.MaxSide.Value > 0)
                maxHeight = request.MaxSide.Value;
            else if (request.MaxHeight.HasValue && request.MaxHeight.Value > 0)
                maxHeight = request.MaxHeight.Value;
            return maxHeight;
        }

        private static ImageResizeQuality GetQuality(this ImageResizeRequestModel request)
        {
            if (request.Quality.HasValue && request.Quality == ImageResizeQuality.High)
                return request.Quality.Value;
            return ImageResizeQuality.Thumbnail;
        }
    }
}
