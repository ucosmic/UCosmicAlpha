using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;

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

        [GET("circle")]
        public HttpResponseMessage GetCircle([FromUri] int text)
        {
            var strokeColor = Color.FromArgb(255, 255, 255);
            var fillColor = Color.FromArgb(204, 0, 0);
            var textColor = Color.FromArgb(255, 255, 255);

            using (var strokeBrush = new SolidBrush(strokeColor))
            using (var fillBrush = new SolidBrush(fillColor))
            using (var textBrush = new SolidBrush(textColor))
            using (var textFormat = new StringFormat())
            using (var textFont = new Font("Arial", 26, FontStyle.Bold, GraphicsUnit.Pixel))
            using (var canvasImage = new Bitmap(48, 48))
            using (var canvasGraphics = Graphics.FromImage(canvasImage))
            {
                // stroke & fill the circle
                canvasGraphics.SmoothingMode = SmoothingMode.AntiAlias;
                canvasGraphics.FillEllipse(strokeBrush, 0, 0, 47, 47);
                canvasGraphics.FillEllipse(fillBrush, 4, 4, 39, 39);

                // text the circle
                canvasGraphics.TextRenderingHint = TextRenderingHint.AntiAlias;
                var textBox = new Rectangle(0, 1, 48, 48);
                textFormat.Alignment = StringAlignment.Center;
                textFormat.LineAlignment = StringAlignment.Center;
                canvasGraphics.DrawString(text.ToString(CultureInfo.InvariantCulture), textFont, textBrush, textBox, textFormat);

                // resize the graphic
                using (var resizedImage = new Bitmap(24, 24))
                using (var resizedGraphics = Graphics.FromImage(resizedImage))
                {
                    resizedGraphics.CompositingQuality = CompositingQuality.HighQuality;
                    resizedGraphics.SmoothingMode = SmoothingMode.HighQuality;
                    resizedGraphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    resizedGraphics.DrawImage(canvasImage, 0, 0, 24, 24);

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
