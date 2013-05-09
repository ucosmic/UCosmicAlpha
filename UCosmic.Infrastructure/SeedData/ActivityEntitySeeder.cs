using System;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.SeedData
{
    public class ActivityEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateMyNewActivity> _createActivity;
        private readonly IHandleCommands<CreateActivityLocation> _createActivityLocation;
        private readonly IHandleCommands<CreateActivityValues> _createActivityValues;
        private readonly IHandleCommands<CreateActivityTag> _createActivityTag;
        private readonly IHandleCommands<CreateActivityType> _createActivityType;
        private readonly IHandleCommands<CreateActivityDocument> _createActivityDocument;
        private readonly IUnitOfWork _unitOfWork;

        public ActivityEntitySeeder(IProcessQueries queryProcessor
                                    , ICommandEntities entities
                                    , IHandleCommands<CreateMyNewActivity> createActivity
                                    , IHandleCommands<CreateActivityLocation> createActivityLocation
                                    , IHandleCommands<CreateActivityValues> createActivityValues
                                    , IHandleCommands<CreateActivityTag> createActivityTag
                                    , IHandleCommands<CreateActivityType> createActivityType
                                    , IHandleCommands<CreateActivityDocument> createActivityDocument
                                    , IUnitOfWork unitOfWork
        )
        {
            _createActivity = createActivity;
            _createActivityLocation = createActivityLocation;
            _createActivityValues = createActivityValues;
            _createActivityTag = createActivityTag;
            _createActivityType = createActivityType;
            _createActivityDocument = createActivityDocument;
            _unitOfWork = unitOfWork;
            _queryProcessor = queryProcessor;
            _entities = entities;
        }

        public void Seed()
        {
            /* ----- USF People Activities ----- */

            { // Douglas Corarito
                Person person = _entities.Get<Person>().SingleOrDefault(x => x.FirstName == "Douglas" && x.LastName == "Corarito");
                if (person == null) throw new Exception("USF person Douglas Corarito not found");

                User user = _entities.Get<User>().SingleOrDefault(x => x.Person.RevisionId == person.RevisionId);
                if (user == null) throw new Exception("USF person Douglas Corarito has no User.");

                string[] developerRoles = new string[]
                    {
                        RoleName.AuthorizationAgent,
                        RoleName.EstablishmentLocationAgent,
                        RoleName.EstablishmentAdministrator,
                        RoleName.ElmahViewer,
                        RoleName.InstitutionalAgreementManager,
                        RoleName.InstitutionalAgreementSupervisor,
                        RoleName.EmployeeProfileManager,
                    };
                GenericIdentity identity = new GenericIdentity(user.Name);
                GenericPrincipal principal = new GenericPrincipal(identity, developerRoles);

                EmployeeModuleSettings employeeModuleSettings =
                    _queryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for USF.");

                CreateMyNewActivity createMyNewActivityCommand;


                // ACTIVITY 1
                Guid entityId = new Guid("95F98FB4-EFB2-4F8E-AE79-E2B23F04D4FE");
                bool activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity(principal, ActivityMode.Draft.AsSentenceFragment())
                    {
                        EntityId = entityId
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues(principal, activity.RevisionId, activity.Mode)
                    {
                        Title =
                            "Understanding Causation of the Permian/Triassic Boundary, Largest Mass Extinction in Earth History",
                        Content =
                            "Permian/Triassic (P/Tr) Boundary Global Events—The P/Tr boundary represents the largest mass extinction in Earth history, yet its causes remain uncertain. I am investigating critical questions related to the extent and intensity of Permo-Triassic deep-ocean anoxia, patterns of upwelling of toxic sulfidic waters onto shallow-marine shelves and platforms, and the relationship of such events to global C-isotopic excursions and the delayed recovery of marine biotas during the Early Triassic. I am working on the P/Tr boundary globally.",
                        StartsOn = new DateTime(2003, 3, 1),
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType(principal, activityValues.RevisionId,
                        employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Research")).Id ));

                    _createActivityType.Handle(new CreateActivityType(principal, activityValues.RevisionId,
                        employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Teaching")).Id ));

                    _createActivityLocation.Handle(new CreateActivityLocation(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _createActivityLocation.Handle(new CreateActivityLocation(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "Canada").RevisionId,
                    });

                    /* ----- Add Tags ----- */

                    _createActivityTag.Handle(new CreateActivityTag(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        Text = "Vietnam",
                        DomainType = ActivityTagDomainType.Place,
                        DomainKey = _entities.Get<Place>().Single(x => x.OfficialName == "Vietnam").RevisionId,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        Text = "India",
                        DomainType = ActivityTagDomainType.Place,
                        DomainKey = _entities.Get<Place>().Single(x => x.OfficialName == "India").RevisionId,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        Text = "Japan",
                        DomainType = ActivityTagDomainType.Place,
                        DomainKey = _entities.Get<Place>().Single(x => x.OfficialName == "Japan").RevisionId,
                        Mode = activity.Mode
                    });

                    /* ----- Add Documents ----- */

                    _createActivityDocument.Handle(new CreateActivityDocument(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        FileId = _entities.Get<LoadableFile>().Single(x => x.Name == "02E6D488-B3FA-4D79-848F-303779A53ABE").Id,
                        Mode = activity.Mode,
                        Title = "Dissertation Excerpt"
                    });

                    _createActivityDocument.Handle(new CreateActivityDocument(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        FileId = _entities.Get<LoadableFile>().Single(x => x.Name == "10EC87BD-3A95-439D-807A-0F57C3F89C8A").Id,
                        Mode = activity.Mode,
                        Title = "Research Funding Breakdown"
                    });

                    _createActivityDocument.Handle(new CreateActivityDocument(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        FileId = _entities.Get<LoadableFile>().Single(x => x.Name == "1322FF22-E863-435E-929E-765EB95FB460").Id,
                        Mode = activity.Mode,
                        Title = "Conference Presentation"
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 1


                // ACTIVITY 2
                entityId = new Guid("894A9E42-F693-4268-826A-C78618D8D6D0");
                activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity(principal, ActivityMode.Draft.AsSentenceFragment())
                    {
                        EntityId = entityId
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues(principal, activity.RevisionId, activity.Mode)
                    {
                        Title = "Professional Development Program for Teachers of English at Shandong University",
                        Content = "In Summer 2008, the Teaching English as a Second Language (TESL) Program delivered a professional development program for teachers of English at Shandong University in Jinan, China. Program instructors included two TESL doctoral students and one colleague living in the Czech Republic. Three courses were offered: Theory to Practice; Research in Second Language Acquisition; and Instructional Technology in English Language Teaching. 48 Chinese teachers completed the program. ",
                        StartsOn = new DateTime(2003, 6, 1)
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType(principal, activityValues.RevisionId,
                        employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Service")).Id ));

                    _createActivityLocation.Handle(new CreateActivityLocation(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    //_createActivityDocument.Handle(new CreateActivityDocument
                    //{
                    //    ActivityValuesId = activityValues.RevisionId,
                    //    FileId = _entities.Get<LoadableFile>().Single(x => x.Name == "14E5C461-2E5E-4E63-9701-DC3F009AB98E").Id,
                    //    Mode = activity.Mode,
                    //    Title = "Village Teaching Session"
                    //});

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 2


                // ACTIVITY 3
                entityId = new Guid("6C03F4D0-FBB6-41CB-8E98-D9B129EFF0F8");
                activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity(principal, ActivityMode.Draft.AsSentenceFragment())
                    {
                        EntityId = entityId
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues(principal, activity.RevisionId, activity.Mode)
                    {
                        Title = "Workshop Preparation: Air pollution and Chinese Historic Site",
                        Content = "Drs. Tim Keener and Mingming Lu went to China in Oct. of 2006 to plan for an air quality workshop on the impact of air pollution and the Chinese historic sites, to be held in Xi’an, China in the fall of 2008. They have visited Tsinghua Univ., the XISU and discussed the details of the workshop plan with Prof. Wu, Associate Dean in the School of Tourism. they have visted Shanxi Archeology Research Institute, and Chinese Acedemy of Science in Xian, to meet potentail workshop participants. Drs. Lu and Keener is developing a proposal to NSF for the workshop.",
                        StartsOn = new DateTime(2006, 10, 9),
                        EndsOn = new DateTime(2006, 10, 10)
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType(principal, activityValues.RevisionId,
                        employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Conference")).Id ));

                    _createActivityType.Handle(new CreateActivityType(principal, activityValues.RevisionId,
                        employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Teaching")).Id ));

                    _createActivityType.Handle(new CreateActivityType(principal, activityValues.RevisionId,
                        employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Honor")).Id ));

                    _createActivityLocation.Handle(new CreateActivityLocation(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    //_createActivityDocument.Handle(new CreateActivityDocument
                    //{
                    //    ActivityValuesId = activityValues.RevisionId,
                    //    FileId = _entities.Get<LoadableFile>().Single(x => x.Name == "322BF184-32C3-49CA-8C97-18ABE32CFD8A").Id,
                    //    Mode = activity.Mode,
                    //    Title = "Wildlife Sounds Early 2000"
                    //});

                    //_createActivityDocument.Handle(new CreateActivityDocument
                    //{
                    //    ActivityValuesId = activityValues.RevisionId,
                    //    FileId = _entities.Get<LoadableFile>().Single(x => x.Name == "3D3C0976-5117-4D5A-AF25-1B53166C550C").Id,
                    //    Mode = activity.Mode,
                    //    Title = "Factory Activity"
                    //});

                    //_createActivityDocument.Handle(new CreateActivityDocument
                    //{
                    //    ActivityValuesId = activityValues.RevisionId,
                    //    FileId = _entities.Get<LoadableFile>().Single(x => x.Name == "5FE682FD-F161-4669-A2C4-974F5B0F8BB1").Id,
                    //    Mode = activity.Mode,
                    //    Title = "General Movie"
                    //});

                    _createActivityDocument.Handle(new CreateActivityDocument(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        FileId = _entities.Get<LoadableFile>().Single(x => x.Name == "817DB81E-53FC-47E1-A1DE-B8C108C7ACD6").Id,
                        Mode = activity.Mode,
                        Title = "Make a contribution form"
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 3


                // ACTIVITY 4
                entityId = new Guid("8ABCB82E-7ACA-41D6-93CD-637C2006804E");
                activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity(principal, ActivityMode.Draft.AsSentenceFragment())
                    {
                        EntityId = entityId
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues(principal, activity.RevisionId, activity.Mode)
                    {
                        Title = "Guest performer and teacher, China Saxophone Festival, Dalian, China",
                        Content = "Adj Professor, Professor EmeritusJazz Studies, Saxophone Studies, Ensembles & Conducting College Conservatory of Music"
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType(principal, activityValues.RevisionId,
                        employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Creative")).Id ));

                    _createActivityLocation.Handle(new CreateActivityLocation(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _createActivityDocument.Handle(new CreateActivityDocument(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        ImageId = _entities.Get<Image>().Single(x => x.Name == "5C62D74E-E8EE-4B9A-95F3-B2ABB1F6F912").Id,
                        Mode = activity.Mode,
                        Title = "Photo of the site"
                    });

                    _createActivityDocument.Handle(new CreateActivityDocument(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        ImageId = _entities.Get<Image>().Single(x => x.Name == "A44FAB3B-DEBA-4F14-8965-E379569066A9").Id,
                        Mode = activity.Mode,
                        Title = "Grads working hard"
                    });

                    _createActivityDocument.Handle(new CreateActivityDocument(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        ImageId = _entities.Get<Image>().Single(x => x.Name == "C0DA4900-762B-4B26-AE03-843CBB7C0E7B").Id,
                        Mode = activity.Mode,
                        Title = "Map of the incident"
                    });

                    _createActivityDocument.Handle(new CreateActivityDocument(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        ImageId = _entities.Get<Image>().Single(x => x.Name == "E4E53300-08D3-47C0-954C-BF15EF54F0A3").Id,
                        Mode = activity.Mode,
                        Title = "Sunrise over the delta"
                    });

                    _createActivityDocument.Handle(new CreateActivityDocument(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        ImageId = _entities.Get<Image>().Single(x => x.Name == "EE23D741-C50D-40D5-8214-C18DF68CC6D3").Id,
                        Mode = activity.Mode,
                        Title = "Me"
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 4


                // ACTIVITY 5
                entityId = new Guid("F0754F12-8E4E-4557-B9E0-32A173CB36DA");
                activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity(principal, ActivityMode.Draft.AsSentenceFragment())
                    {
                        EntityId = entityId
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues(principal, activity.RevisionId, activity.Mode)
                    {
                        Title = "Fulbright Scholar Award to Research and Teach at Zhejiang University",
                        Content = "I will be conducting research and teaching two courses to medical and public health students at Zhejiang University in Hangzhou China. I will also be working closely with Dr. Tingzhong Yang who directs an institute that studies tobacco related problems in China. Further I wish to explore differences in health knowledge, attitudes and behaviors between Chinese and US college students."
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType(principal, activityValues.RevisionId,
                        employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Award")).Id ));

                    _createActivityLocation.Handle(new CreateActivityLocation(principal)
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 5

            } // Douglas Corarito
        }
    }

}