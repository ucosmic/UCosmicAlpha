using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Activities;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class ActivitiesSpikeController : Controller
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IQueryEntities _entities;

        public ActivitiesSpikeController(IProcessQueries queryProcessor, IQueryEntities entities)
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        [GET("activitiesspike/{activityId:int}")]
        public virtual ActionResult ActivitiesSpike(int activityId)
        {
            var model = new ActivityPublicViewModel();


            //var entity2 = _queryProcessor.Execute(new ActivityById(User, activityId));
            var entity = _queryProcessor.Execute(new PublicActivityById(User, activityId)
            {
                EagerLoad = new Expression<Func<ActivityValues, object>>[]
                {
                    x => x.Types.Select(y => y.Type),
                    x => x.Locations.Select(y => y.Place),
                    x => x.Tags,
                    x => x.Documents
                }
            });
            if (entity == null) return HttpNotFound();

            model = Mapper.Map<ActivityPublicViewModel>(entity);



            if (activityId == 1)
            {
                model = new ActivityPublicViewModel
                {
                    //Mode = new ActivityMode(),
                    Title = "Understanding Causation of the Permian/Triassic Boundary, Largest Mass Extinction in Earth History",
                    Content = "Permian/Triassic (P/Tr) Boundary Global Events—The P/Tr boundary represents the largest mass extinction in Earth history, yet its causes remain uncertain. I am investigating critical questions related to the extent and intensity of Permo-Triassic deep-ocean anoxia, patterns of upwelling of toxic sulfidic waters onto shallow-marine shelves and platforms, and the relationship of such events to global C-isotopic excursions and the delayed recovery of marine biotas during the Early Triassic. I am working on the P/Tr boundary globally.",
                    StartsOn = new DateTime(2010, 11, 18),
                    StartsFormat = "M/yyyy",
                    OnGoing = true,
                    IsExternallyFunded = true,
                    IsInternallyFunded = true,
                    //UpdatedByPrincipal = "yes",
                    //UpdatedOnUtc = new DateTime(1985, 12, 14),
                    Types = new ActivityTypeViewModel[]
                    {
                        new ActivityTypeViewModel{
                        TypeId = 1,
                        Text = "Research or Creative Endeavor",
                        },
                        new ActivityTypeViewModel{
                        TypeId = 2,
                        Text = "Teaching or Mentoring",
                        },
                        new ActivityTypeViewModel{
                        TypeId = 5,
                        Text = "Professional Development, Service or Consulting",
                        }
                    },
                    Places = new ActivityPlaceViewModel[]
                    {
                        new ActivityPlaceViewModel
                        {
                            //PlaceId = 1,
                            PlaceName = "Canada"
                        },
                        new ActivityPlaceViewModel
                        {
                            //PlaceId = 2,
                            PlaceName = "Columbia"
                        }
                    },
                    Tags = new ActivityTagViewModel[]
                    {
                        new ActivityTagViewModel
                        {
                            Text = "Vietnam",
                            //DomainType = new ActivityTagDomainType(),
                            //DomainKey = 2
                        },
                        new ActivityTagViewModel
                        {
                            Text = "India",
                            //DomainType = new ActivityTagDomainType(),
                            //DomainKey = 2
                        }
                    },
                    Documents = new ActivityDocumentApiModel[]
                    {
                        new ActivityDocumentApiModel
                        {
                            //ActivityId = 1,
                            DocumentId = 1,
                            Title = "Dissertation Excerpt",
                            FileName = "02E6D488-B3FA-4D79-848F-303779A53ABE.docx",
                            //ByteCount = 23452345
                        },
                        new ActivityDocumentApiModel
                        {
                            //ActivityId = 1,
                            DocumentId = 2,
                            Title = "Research Funding Breakdown",
                            FileName = "10EC87BD-3A95-439D-807A-0F57C3F89C8A.xls",
                            //ByteCount = 23452345
                        }
                    }
                };
            }else if (activityId == 2)
            {
                model = new ActivityPublicViewModel
                {
                    //Mode = new ActivityMode(),
                    Title = "Professional Development Program for Teachers of English at Shandong University",
                    Content = "In Summer 2008, the Teaching English as a Second Language (TESL) Program delivered a professional development program for teachers of English at Shandong University in Jinan, China. Program instructors included two TESL doctoral students and one colleague living in the Czech Republic. Three courses were offered: Theory to Practice; Research in Second Language Acquisition; and Instructional Technology in English Language Teaching. 48 Chinese teachers completed the program.",
                    StartsOn = new DateTime(2010, 11, 18),
                    StartsFormat = "M/yyyy",
                    EndsOn = new DateTime(2010, 11, 18),
                    EndsFormat = "M/yyyy",
                    OnGoing = false,
                    IsExternallyFunded = false,
                    IsInternallyFunded = true,
                    //UpdatedByPrincipal = "no",
                    //UpdatedOnUtc = new DateTime(1985, 12, 14),
                    Types = new ActivityTypeViewModel[]
                    {
                        new ActivityTypeViewModel{
                        TypeId = 1,
                        Text = "Research or Creative Endeavor",
                        },
                        new ActivityTypeViewModel{
                        TypeId = 2,
                        Text = "Teaching or Mentoring",
                        },
                        new ActivityTypeViewModel{
                        TypeId = 5,
                        Text = "Professional Development, Service or Consulting",
                        }
                    },
                    Places = new ActivityPlaceViewModel[]
                    {
                        new ActivityPlaceViewModel
                        {
                            //PlaceId = 1,
                            PlaceName = "Mexico"
                        },
                        new ActivityPlaceViewModel
                        {
                            //PlaceId = 2,
                            PlaceName = "Peru"
                        }
                    },
                    Tags = new ActivityTagViewModel[]
                    {
                        new ActivityTagViewModel
                        {
                            Text = "Japan",
                            //DomainType = new ActivityTagDomainType(),
                            //DomainKey = 2
                        },
                        new ActivityTagViewModel
                        {
                            Text = "Audencia Nantes School of Management",
                            //DomainType = new ActivityTagDomainType(),
                            //DomainKey = 2
                        }
                    },
                    Documents = new ActivityDocumentApiModel[]
                    {
                        new ActivityDocumentApiModel
                        {
                            //ActivityId = 1,
                            DocumentId = 1,
                            Title = "Conference Presentation",
                            FileName = "1322FF22-E863-435E-929E-765EB95FB460.ppt",
                            //ByteCount = 23452345
                        },
                        new ActivityDocumentApiModel
                        {
                            //ActivityId = 1,
                            DocumentId = 2,
                            Title = "Make a contribution form",
                            FileName = "817DB81E-53FC-47E1-A1DE-B8C108C7ACD6.pdf",
                            //ByteCount = 23452345
                        }
                    }
                };
            }
            else
            {
                model = new ActivityPublicViewModel
                {
                    //Mode = new ActivityMode(),
                    Title = "Workshop Preparation: Air pollution and Chinese Historic Site",
                    Content = "Drs. Tim Keener and Mingming Lu went to China in Oct. of 2006 to plan for an air quality workshop on the impact of air pollution and the Chinese historic sites, to be held in Xi’an, China in the fall of 2008. They have visited Tsinghua Univ., the XISU and discussed the details of the workshop plan with Prof. Wu, Associate Dean in the School of Tourism. they have visted Shanxi Archeology Research Institute, and Chinese Acedemy of Science in Xian, to meet potentail workshop participants. Drs. Lu and Keener is developing a proposal to NSF for the workshop.",
                    StartsOn = new DateTime(2010, 11, 18),
                    StartsFormat = "M/yyyy",
                    EndsOn = new DateTime(2010, 11, 18),
                    EndsFormat = "M/yyyy",
                    OnGoing = true,
                    IsExternallyFunded = true,
                    IsInternallyFunded = false,
                    //UpdatedByPrincipal = "maybe",
                    //UpdatedOnUtc = new DateTime(1985, 12, 14),
                    Types = new ActivityTypeViewModel[]
                    {
                        new ActivityTypeViewModel{
                        TypeId = 1,
                        Text = "Research or Creative Endeavor",
                        },
                        new ActivityTypeViewModel{
                        TypeId = 2,
                        Text = "Teaching or Mentoring",
                        },
                        new ActivityTypeViewModel{
                        TypeId = 5,
                        Text = "Professional Development, Service or Consulting",
                        }
                    },
                    Places = new ActivityPlaceViewModel[]
                    {
                        new ActivityPlaceViewModel
                        {
                            //PlaceId = 1,
                            PlaceName = "China"
                        },
                        new ActivityPlaceViewModel
                        {
                            //PlaceId = 2,
                            PlaceName = "Brazil"
                        }
                    },
                    Tags = new ActivityTagViewModel[]
                    {
                        new ActivityTagViewModel
                        {
                            Text = "Vietnam",
                            //DomainType = new ActivityTagDomainType(),
                            //DomainKey = 2
                        },
                        new ActivityTagViewModel
                        {
                            Text = "India",
                            //DomainType = new ActivityTagDomainType(),
                            //DomainKey = 2
                        }
                    },
                    Documents = new ActivityDocumentApiModel[]
                    {
                        new ActivityDocumentApiModel
                        {
                            //ActivityId = 1,
                            DocumentId = 1,
                            Title = "Photo of the site",
                            FileName = "5C62D74E-E8EE-4B9A-95F3-B2ABB1F6F912.gif",
                            //ByteCount = 23452345
                        },
                        new ActivityDocumentApiModel
                        {
                            //ActivityId = 1,
                            DocumentId = 2,
                            Title = "Grads working hard",
                            FileName = "A44FAB3B-DEBA-4F14-8965-E379569066A9.png",
                            //ByteCount = 23452345
                        }
                    }
                };
            }
            return View(model);
        }

    }
}
