using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Files;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [Authorize]
    [RoutePrefix("api/activities")]
    public class ActivitiesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;

        public ActivitiesController(IProcessQueries queryProcessor)
        {
            _queryProcessor = queryProcessor;
        }

        [POST("page")]
        public PageOfActivityApiModel Page(ActivitySearchInputModel input)
        {
            if (input.PageSize < 1) { throw new HttpResponseException(HttpStatusCode.BadRequest); }

            ActivitiesByPersonIdMode query = Mapper.Map<ActivitySearchInputModel, ActivitiesByPersonIdMode>(input);

            PagedQueryResult<Activity> activities = _queryProcessor.Execute(query);

            PageOfActivityApiModel model = Mapper.Map<PageOfActivityApiModel>(activities);

            return model;
        }

        [GET("locations")]
        public IEnumerable<ActivityLocationNameApiModel> GetLocations()
        {
            var activityPlaces = _queryProcessor.Execute(new FilteredPlaces
            {
                IsCountry = true,
                //IsBodyOfWater = true,
                IsEarth = true
            });

            var model = Mapper.Map<ActivityLocationNameApiModel[]>(activityPlaces);

            return model;
        }        

        [DELETE("delete/{id}")]
        public HttpResponseMessage Delete(int id)
        {
            //var command = new UpdateActivity();
            //Mapper.Map(model, command);

            //try
            //{
            //    _profileUpdateHandler.Handle(command);
            //}
            //catch (ValidationException ex)
            //{
            //    var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
            //    return badRequest;
            //}

            return Request.CreateResponse(HttpStatusCode.OK, string.Format("Activity '{0}' was deleted successfully.", id));
        }

        [GET("docproxy/{docId}")]
        public HttpResponseMessage GetDocProxy(int docId)
        {
            HttpResponseMessage response = new HttpResponseMessage();
            ActivityDocument document = _queryProcessor.Execute(new ActivityDocumentById(docId));
            byte[] contentData = null;

            /* If the ActivityDocument has an image, resize and use. */
            if (document.Image != null)
            {
                MemoryStream fullImageStream = new MemoryStream(document.Image.Data);
                System.Drawing.Image fullImage = System.Drawing.Image.FromStream(fullImageStream);
                Stream proxyStream = fullImage.ResizeImageConstrained(
                    Int32.Parse(ConfigurationManager.AppSettings["ProxyImageHeight"]),
                    Int32.Parse(ConfigurationManager.AppSettings["ProxyImageWidth"]),
                    System.Drawing.Imaging.ImageFormat.Png);

                System.Drawing.Image resizedImage = System.Drawing.Image.FromStream(proxyStream);
                
                MemoryStream stream = new MemoryStream();
                resizedImage.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                contentData = stream.ToArray();
            }
            /* If the ActivityDocument has no image, let's use the mime type image proxy. */
            else if (document.File != null)
            {
                Image dbImage = _queryProcessor.Execute(new ProxyImageByMimeType(document.File.MimeType));
                contentData = (dbImage != null) ? dbImage.Data : null;
            }

            /* Return the generic document proxy, if we haven't found one at this point. */
            if (contentData == null)
            {
                Image dbImage = _queryProcessor.Execute(new ImageByName("GenericDocument"));
                contentData = (dbImage != null) ? dbImage.Data : null;
            }

            if (contentData != null)
            {
                response.Content = new ByteArrayContent(contentData);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(ConfigurationManager.AppSettings["ProxyImageMimeType"]);
                response.StatusCode = HttpStatusCode.OK;
            }
            else
            {
                response.StatusCode = HttpStatusCode.NotFound;
            }

            return response;
        }
    }
}
