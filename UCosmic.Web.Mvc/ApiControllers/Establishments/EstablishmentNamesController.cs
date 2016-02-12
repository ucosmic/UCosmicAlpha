using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
using UCosmic.Domain.Establishments;
using UCosmic.Web.Mvc.Models;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using UCosmic.Repositories;
using System.Threading;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [RoutePrefix("api/establishments")]
    public class EstablishmentNamesController : ApiController
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IValidator<CreateEstablishmentName> _createValidator;
        private readonly IHandleCommands<CreateEstablishmentName> _createHandler;
        private readonly IValidator<UpdateEstablishmentName> _updateValidator;
        private readonly IHandleCommands<UpdateEstablishmentName> _updateHandler;
        private readonly IHandleCommands<UpdateEstablishment> _updateHandler2;
        private readonly IHandleCommands<DeleteEstablishmentName> _deleteHandler;

        public EstablishmentNamesController(
             IProcessQueries queryProcessor
            , IHandleCommands<CreateEstablishmentName> createHandler
            , IValidator<CreateEstablishmentName> createValidator
            , IHandleCommands<UpdateEstablishmentName> updateHandler
            , IHandleCommands<UpdateEstablishment> updateHandler2
            , IValidator<UpdateEstablishmentName> updateValidator
            , IHandleCommands<DeleteEstablishmentName> deleteHandler
        )
        {
            _queryProcessor = queryProcessor;
            _createHandler = createHandler;
            _createValidator = createValidator;
            _updateHandler = updateHandler;
            _updateValidator = updateValidator;
            _deleteHandler = deleteHandler;
        }

        [GET("names", SitePrecedence = 1)]
        public PageOfEstablishmentNameModel GetByKeyword([FromUri] EstablishmentNameSearchInputModel input)
        {
            if (input.PageSize < 1)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var query = new EstablishmentNamesByKeyword
            {
                Keyword = input.Keyword,
                KeywordMatchStrategy = input.KeywordMatchStrategy,
                PageNumber = input.PageNumber,
                PageSize = input.PageSize,
                EagerLoad = new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment,
                    x => x.TranslationToLanguage.Names.Select(y => y.TranslationToLanguage),
                },
                OrderBy = new Dictionary<Expression<Func<EstablishmentName, object>>, OrderByDirection>
                {
                    { x => x.Text, OrderByDirection.Ascending },
                },
            };
            var entities = _queryProcessor.Execute(query);
            var model = Mapper.Map<PageOfEstablishmentNameModel>(entities);
            return model;
        }

        [GET("{establishmentId:int}/names")]
        public IEnumerable<EstablishmentNameApiModel> GetAll(int establishmentId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            if (!FindResources(establishmentId))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            // get names
            var entities = _queryProcessor.Execute(new EstablishmentNames(establishmentId)
            {
                EagerLoad = new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment,
                    x => x.TranslationToLanguage.Names.Select(y => y.TranslationToLanguage),
                },
                OrderBy = new Dictionary<Expression<Func<EstablishmentName, object>>, OrderByDirection>
                {
                    { x => x.IsOfficialName, OrderByDirection.Descending },
                    { x => x.IsFormerName, OrderByDirection.Ascending },
                    { x => x.Text, OrderByDirection.Ascending },
                }
            });

            // map to models and return
            var models = Mapper.Map<EstablishmentNameApiModel[]>(entities);
            return models;
        }

        [GET("{establishmentId:int}/names/{establishmentNameId:int}")]
        public EstablishmentNameApiModel Get(int establishmentId, int establishmentNameId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            if (!FindResources(establishmentId, establishmentNameId))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var entity = _queryProcessor.Execute(new EstablishmentNameById(establishmentNameId)
            {
                EagerLoad = new Expression<Func<EstablishmentName, object>>[]
                {
                    x => x.ForEstablishment,
                    x => x.TranslationToLanguage.Names.Select(y => y.TranslationToLanguage),
                },
            });

            var model = Mapper.Map<EstablishmentNameApiModel>(entity);
            return model;
        }

        [POST("{establishmentId:int}/names")]
        [Authorize(Roles = RoleName.EstablishmentAdministrator)]
        public HttpResponseMessage Post(int establishmentId, EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency
            
            if (!FindResources(establishmentId))
                throw new HttpResponseException(HttpStatusCode.NotFound);
            model.OwnerId = establishmentId;


            var command = new CreateEstablishmentName(User);
            Mapper.Map(model, command);

            try
            {
                _createHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            //if (model.IsOfficialName)
            //{
            //    EstablishmentApiScalarModel establishment = new EstablishmentApiScalarModel();

            //    EstablishmentListRepository establishmentRepository = new EstablishmentListRepository();
            //    //AgreementTypesRepository AgreementTypesRepository = new AgreementTypesRepository();
            //    establishment = establishmentRepository.Establishment_By_Id(model.OwnerId);

            //    establishment.OfficialName = model.Text;
            //    //model.Id = establishmentId;
            //    var command2 = new UpdateEstablishment(User, establishment.Id);
            //    Mapper.Map(establishment, command2);

            //    try
            //    {
            //        _updateHandler2.Handle(command2);
            //    }
            //    catch (ValidationException ex)
            //    {
            //        var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
            //        return badRequest;
            //    }
            //}

            


            //var response = Request.CreateResponse(HttpStatusCode.Created, Get(establishmentId, command.Id));
            var response = Request.CreateResponse(HttpStatusCode.Created,
                string.Format("Establishment name '{0}' was successfully created.", model.Text));
            var url = Url.Link(null, new
            {
                controller = "EstablishmentNames",
                action = "Get",
                establishmentId,
                establishmentNameId = command.Id,
            });
            Debug.Assert(url != null);
            response.Headers.Location = new Uri(url);

            new Thread(() =>
            {
                Run_Firebase_establishment_sync();
            }).Start();
            return response;
        }

        [PUT("{establishmentId:int}/names/{establishmentNameId:int}")]
        [Authorize(Roles = RoleName.EstablishmentAdministrator)]
        public HttpResponseMessage Put(int establishmentId, int establishmentNameId, EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            if (!FindResources(establishmentId, establishmentNameId))
                throw new HttpResponseException(HttpStatusCode.NotFound);
            model.OwnerId = establishmentId;
            model.Id = establishmentNameId;

            var command = new UpdateEstablishmentName(User);
            Mapper.Map(model, command);

            try
            {
                _updateHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            if (model.IsOfficialName)
            {
                EstablishmentListRepository establishmentRepository = new EstablishmentListRepository();
                try
                {
                    establishmentRepository.Update_Establishment_Name_By_Id(model.Text, model.OwnerId);
                }
                catch (ValidationException ex)
                {
                    var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                    return badRequest;
                }

                //EstablishmentApiScalarModel establishment = new EstablishmentApiScalarModel();

                //EstablishmentListRepository establishmentRepository = new EstablishmentListRepository();
                //establishment = establishmentRepository.Establishment_By_Id(model.OwnerId);

                //establishment.OfficialName = model.Text;
                //var command2 = new UpdateEstablishment(User, establishment.Id);
                //Mapper.Map(establishment, command2);

                //try
                //{
                //    _updateHandler2.Handle(command2);
                //}
                //catch (ValidationException ex)
                //{
                //    var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                //    return badRequest;
                //}
            }

            var response = Request.CreateResponse(HttpStatusCode.OK, "Establishment name was successfully updated.");
            new Thread(() =>
            {
                Run_Firebase_establishment_sync();
            }).Start();
            return response;
        }

        [DELETE("{establishmentId:int}/names/{establishmentNameId:int}")]
        [Authorize(Roles = RoleName.EstablishmentAdministrator)]
        public HttpResponseMessage Delete(int establishmentId, int establishmentNameId)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            if (!FindResources(establishmentId, establishmentNameId))
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var entity = Get(establishmentId, establishmentNameId);
            var command = new DeleteEstablishmentName(User, establishmentNameId);

            try
            {
                _deleteHandler.Handle(command);
            }
            catch (ValidationException ex)
            {
                var badRequest = Request.CreateResponse(HttpStatusCode.BadRequest, ex.Message, "text/plain");
                return badRequest;
            }

            var response = Request.CreateResponse(HttpStatusCode.OK,
                string.Format("Establishment name '{0}' was successfully deleted.", entity.Text));
            return response;
        }

        [POST("{establishmentId:int}/names/{establishmentNameId:int}/validate-text")]
        public HttpResponseMessage Validate(int establishmentId, int establishmentNameId, EstablishmentNameApiModel model)
        {
            //System.Threading.Thread.Sleep(2000); // test api latency

            model.OwnerId = establishmentId;
            model.Id = establishmentNameId;

            ValidationResult validationResult;
            string propertyName;
            if (model.OwnerId < 1 || model.Id < 1)
            {
                var command = new CreateEstablishmentName(User);
                Mapper.Map(model, command);
                validationResult = _createValidator.Validate(command);
                propertyName = command.PropertyName(y => y.Text);
            }
            else
            {
                var command = new UpdateEstablishmentName(User);
                Mapper.Map(model, command);
                validationResult = _updateValidator.Validate(command);
                propertyName = command.PropertyName(y => y.Text);
            }

            Func<ValidationFailure, bool> forText = x => x.PropertyName == propertyName;
            if (validationResult.Errors.Any(forText))
                return Request.CreateResponse(HttpStatusCode.BadRequest,
                    validationResult.Errors.First(forText).ErrorMessage, "text/plain");

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        private bool FindResources(int establishmentId, int? establishmentNameId = null)
        {
            var establishment = _queryProcessor.Execute(new EstablishmentById(establishmentId));
            if (establishment == null)
                return false;

            if (establishmentNameId.HasValue &&
                establishment.Names.SingleOrDefault(x => x.RevisionId == establishmentNameId.Value) == null)
                return false;

            return true;
        }

        
        public async void Run_Firebase_establishment_sync()//(CancellationToken cancellationToken)
        {

            IList<EstablishmentListAllApiReturn> model = new List<EstablishmentListAllApiReturn>();

            EstablishmentListAllRepository establishmentListRepository = new EstablishmentListAllRepository();
            //AgreementTypesRepository AgreementTypesRepository = new AgreementTypesRepository();
            model = establishmentListRepository.EstablishmentList_All_By_establishment();


            using (var client = new HttpClient())
            {
                // New code:
                client.BaseAddress = new Uri("https://ucosmic.firebaseio.com");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                foreach (EstablishmentListAllApiReturn establishment in model) // Loop through List with foreach.
                {
                    var xx = new { establishment = establishment.official_name, parent_id = establishment.parent_id };
                    //client.PutAsJsonAsync("students/establishments/" + establishment.establishment + ".json", xx);
                    try
                    {
                        //client.PutAsJsonAsync("students/establishments/" + establishment.establishment + ".json", xx);
                        HttpResponseMessage response = await client.PutAsJsonAsync("Establishments/Establishments/" + establishment.establishment + ".json", xx);
                    }
                    catch (Exception e)
                    {
                        var x = e;
                    }
                }
            }
        }
    }
}
