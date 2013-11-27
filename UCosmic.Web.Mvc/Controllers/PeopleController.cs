using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.Web.Mvc.Models;
using UCosmic.Domain.People;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Degrees;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class PeopleController : Controller
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public PeopleController(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        [GET("people/{personId:int}")]
        public virtual ActionResult Index(int personId)
        {
            ViewBag.personId = personId;
            return View();
        }

        [GET("people/{personId:int}/card")]
        [ChildActionOnly]
        public virtual ActionResult GetCard(int personId)
        {
            var entity = _queryProcessor.Execute(new PersonById(personId)
            {
                EagerLoad = new Expression<Func<Person, object>>[]
                {
                    x => x.Affiliations,
                    x => x.Emails,
                }

            });
            if (entity == null) return HttpNotFound();

            var model = Mapper.Map<PersonViewModel>(entity);

            return PartialView(MVC.People.Views._Card, model);
        }

        [GET("people/{personId:int}/activities")]
        public virtual ActionResult Activities(int personId, ActivityPublicInputModel input)
        {
            var query = new ActivitiesByPersonId(User, personId);
            Mapper.Map(input, query);
            var entities = _queryProcessor.Execute(query);

            var model = Mapper.Map<PageOfActivityPublicViewModel>(entities);
            ViewBag.keyword = input.Keyword;
            ViewBag.personId = personId;
            ViewBag.countryCode = input.CountryCode;
            ViewBag.orderBy = input.OrderBy;
            return View(model);
        }

        [GET("people/{personId:int}/degrees")]
        public virtual ActionResult Degrees(int personId, DegreeSearchInputModel input)
        {
            var query = new DegreesByPersonId(personId);
            Mapper.Map(input, query);
            var entities = _queryProcessor.Execute(query);

            var model = Mapper.Map<PageOfDegreePublicViewModel>(entities);
            return View(model);
        }

        [GET("people/{personId:int}/affiliations")]
        [ChildActionOnly]
        public virtual ActionResult GetAffiliations(int personId)
        {
            var query = new AffiliationsByPerson(User, personId);
            var entities = _queryProcessor.Execute(query);
            entities = _queryProcessor.Execute(query)
                .Where( x => x.IsDefault != true)
                //.SelectMany(x => x.Establishment.Ancestors)
                ;
            var entities2 = _queryProcessor.Execute(query)
                .Where(x => x.IsDefault != true)
                .SelectMany(x => x.Establishment.Ancestors)
                ;
            //select the ancestors then union with the affiliations establishments
            //try 6 and 

            // questions. if a person is associated with suny, but this is a top level establishment with no ancestors, would we show this? 
            // So if a guy's default affiliation is uc -> department of Science, we would not show this in his public profie? Would he have to
            // put it again for it to show up?

            var models = entities.Select(x => new AffiliationViewModel
            {
                
            });
            



            
            //var ownersQueryable = _entities.Query<Agreement>()
            //     .Where(x => x.VisibilityText == publicText)
            //     .SelectMany(x => x.Participants)
            //     .Where(x => x.IsOwner)
            //     .Select(x => x.Establishment)
            //     .Where(x => x.IsMember)
            //     .Distinct()
            // ;
            //var ancestorsQueryable = _entities.Query<Establishment>()
            //    .Where(x => x.Offspring.Any(y => ownersQueryable.Select(z => z.RevisionId).Contains(y.OffspringId)))
            //    .Distinct()
            //;
            //var owners = ownersQueryable.Union(ancestorsQueryable).ToArray();

            //var models = owners.Select(x => new AgreementOwningTenant
            //{
            //    Id = x.RevisionId,
            //    ParentId = x.Parent != null ? x.Parent.RevisionId : (int?)null,
            //    OfficialName = x.OfficialName,
            //    WebsiteUrl = x.WebsiteUrl,
            //    StyleDomain = x.WebsiteUrl.StartsWith("www.", StringComparison.OrdinalIgnoreCase)
            //        ? x.WebsiteUrl.Substring(4) : x.WebsiteUrl,

            //}).ToArray();

            //Mapper.Map(input, query);

            //var model = Mapper.Map<AffiliationViewModel>(entities);

            //var model = Mapper.Map<AffiliationViewModel>(entity);

            return PartialView(MVC.People.Views._Affiliations, models);
        }
    }
}
