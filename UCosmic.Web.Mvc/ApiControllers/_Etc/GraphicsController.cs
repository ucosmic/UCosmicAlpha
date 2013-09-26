using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/graphics")]
    public class GraphicsController : ApiController
    {
        [GET("")]
        public HttpResponseMessage GetDefault()
        {
            throw new HttpResponseException(HttpStatusCode.Forbidden);
        }

        private int[] ParseRGB(string rgb)
        {
            int[] comps = new int[3];
            int i = 0;
            Match match = Regex.Match(rgb, "[0-9]+");
            while (match.Success)
            {
                comps[i++] = Int32.Parse(match.Value);
                match = match.NextMatch();
            }

            return (comps.Length == 3) ? comps : new int[0];
        }

        [GET("circle")]
        [CacheHttpGet(Duration = 3600)]
        public HttpResponseMessage GetCircle([FromUri] CircleGraphicRequestModel model)
        {
            if (model.Side < 16 || model.Side > 48)
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Size must be between 16 and 48.", "text/plain");

            if (model.Opacity < 0.0 || model.Opacity > 1.0)
                return Request.CreateResponse(HttpStatusCode.BadRequest, "Opacity must be between 0.0 and 1.0.", "text/plain");

            // compute colors
            var alpha = (int)Math.Ceiling(model.Opacity * 255);
            var strokeColor = Color.FromArgb(alpha, 255, 255, 255);
            var fillColor = Color.FromArgb(alpha, 204, 0, 0);
            var textColor = Color.FromArgb(alpha, 255, 255, 255);

            if (!String.IsNullOrEmpty(model.StrokeColor))
            {
                int[] comps = ParseRGB(model.StrokeColor);
                if (comps.Length == 3)
                {
                    strokeColor = Color.FromArgb(alpha, comps[0], comps[1], comps[2]);
                }
            }

            if (!String.IsNullOrEmpty(model.FillColor))
            {
                int[] comps = ParseRGB(model.FillColor);
                if (comps.Length == 3)
                {
                    fillColor = Color.FromArgb(alpha, comps[0], comps[1], comps[2]);
                }
            }

            if (!String.IsNullOrEmpty(model.TextColor))
            {
                int[] comps = ParseRGB(model.TextColor);
                if (comps.Length == 3)
                {
                    textColor = Color.FromArgb(alpha, comps[0], comps[1], comps[2]);
                }
            }

            if (!String.IsNullOrEmpty(model.Color))
            {
                int[] comps = ParseRGB(model.Color);
                if (comps.Length == 3)
                {
                    strokeColor = Color.FromArgb(alpha, comps[0], comps[1], comps[2]);
                    fillColor = Color.FromArgb(alpha, comps[0], comps[1], comps[2]);
                    textColor = Color.FromArgb(alpha, comps[0], comps[1], comps[2]);
                }
            }

            // compute text
            var text = string.IsNullOrWhiteSpace(model.Text) ? "" : model.Text.Trim();
            var textPixels = 26;
            if (text.Length == 3) textPixels = 18;
            if (text.Length == 4) textPixels = 16;
            if (text.Length > 4) text = "!";

            using (var strokeBrush = new SolidBrush(strokeColor))
            using (var fillBrush = new SolidBrush(fillColor))
            using (var textBrush = new SolidBrush(textColor))
            using (var textFormat = new StringFormat())
            using (var textFont = new Font("Arial", textPixels, FontStyle.Bold, GraphicsUnit.Pixel))
            using (var canvasImage = new Bitmap(48, 48))
            using (var canvasGraphics = Graphics.FromImage(canvasImage))
            {
                // stroke & fill the circle
                canvasGraphics.SmoothingMode = SmoothingMode.AntiAlias;
                canvasGraphics.FillEllipse(strokeBrush, 0, 0, 47, 47);
                canvasGraphics.FillEllipse(fillBrush, 4, 4, 39, 39);

                // text the circle
                if (!string.IsNullOrWhiteSpace(text))
                {
                    canvasGraphics.TextRenderingHint = TextRenderingHint.AntiAlias;
                    var textBox = new Rectangle(0, 1, 48, 48);
                    textFormat.Alignment = StringAlignment.Center;
                    textFormat.LineAlignment = StringAlignment.Center;
                    canvasGraphics.DrawString(text, textFont, textBrush, textBox, textFormat);
                }

                // resize the graphic
                using (var resizedImage = new Bitmap(model.Side, model.Side))
                using (var resizedGraphics = Graphics.FromImage(resizedImage))
                {
                    resizedGraphics.CompositingQuality = CompositingQuality.HighQuality;
                    resizedGraphics.SmoothingMode = SmoothingMode.HighQuality;
                    resizedGraphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    resizedGraphics.DrawImage(canvasImage, 0, 0, model.Side, model.Side);

                    // stream the graphic
                    var stream = new MemoryStream();
                    resizedImage.Save(stream, ImageFormat.Png);
                    stream.Position = 0;
                    var response = new HttpResponseMessage(HttpStatusCode.OK)
                    {
                        Content = new StreamContent(stream),
                    };
                    response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/png");

                    return response;
                }
            }
        }
    }
}
