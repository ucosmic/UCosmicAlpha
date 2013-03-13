using System;
using System.Linq;
using UCosmic.Domain.Activities;
using UCosmic.Domain.Employees;
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
        private readonly IUnitOfWork _unitOfWork;

        public ActivityEntitySeeder(IProcessQueries queryProcessor
                                    , ICommandEntities entities
                                    , IHandleCommands<CreateMyNewActivity> createActivity
                                    , IHandleCommands<CreateActivityLocation> createActivityLocation
                                    , IHandleCommands<CreateActivityValues> createActivityValues
                                    , IHandleCommands<CreateActivityTag> createActivityTag
                                    , IHandleCommands<CreateActivityType> createActivityType
                                    , IUnitOfWork unitOfWork
        )
        {
            _createActivity = createActivity;
            _createActivityLocation = createActivityLocation;
            _createActivityValues = createActivityValues;
            _createActivityTag = createActivityTag;
            _createActivityType = createActivityType;
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

                EmployeeModuleSettings employeeModuleSettings =
                    _queryProcessor.Execute(new EmployeeModuleSettingsByPersonId(person.RevisionId));
                if (employeeModuleSettings == null) throw new Exception("No EmployeeModuleSettings for USF.");

                CreateMyNewActivity createMyNewActivityCommand = null;


                // ACTIVITY 1
                Guid entityId = new Guid("95F98FB4-EFB2-4F8E-AE79-E2B23F04D4FE");
                bool activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        EntityId = entityId,
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        ActivityId = activity.RevisionId,
                        Title =
                            "Understanding Causation of the Permian/Triassic Boundary, Largest Mass Extinction in Earth History",
                        Content =
                            "Permian/Triassic (P/Tr) Boundary Global Events—The P/Tr boundary represents the largest mass extinction in Earth history, yet its causes remain uncertain. I am investigating critical questions related to the extent and intensity of Permo-Triassic deep-ocean anoxia, patterns of upwelling of toxic sulfidic waters onto shallow-marine shelves and platforms, and the relationship of such events to global C-isotopic excursions and the delayed recovery of marine biotas during the Early Triassic. I am working on the P/Tr boundary globally.",
                        StartsOn = new DateTime(2003, 3, 1),
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        EmployeeActivityTypeId = employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Research")).Id
                    });
                
                    _createActivityType.Handle(new CreateActivityType
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        EmployeeActivityTypeId = employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Teaching")).Id
                    });

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "Canada").RevisionId,
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        ActivityId = activity.RevisionId,
                        Text = "Vietnam",
                        DomainType = ActivityTagDomainType.Place,
                        DomainKey = _entities.Get<Place>().Single(x => x.OfficialName == "Vietnam").RevisionId,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        ActivityId = activity.RevisionId,
                        Text = "India",
                        DomainType = ActivityTagDomainType.Place,
                        DomainKey = _entities.Get<Place>().Single(x => x.OfficialName == "India").RevisionId,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        ActivityId = activity.RevisionId,
                        Text = "India",
                        DomainType = ActivityTagDomainType.Place,
                        DomainKey = _entities.Get<Place>().Single(x => x.OfficialName == "Japan").RevisionId,
                        Mode = activity.Mode
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 1


                // ACTIVITY 2
                entityId = new Guid("894A9E42-F693-4268-826A-C78618D8D6D0");
                activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        EntityId = entityId,
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        ActivityId = activity.RevisionId,
                        Title = "Professional Development Program for Teachers of English at Shandong University",
                        Content = "In Summer 2008, the Teaching English as a Second Language (TESL) Program delivered a professional development program for teachers of English at Shandong University in Jinan, China. Program instructors included two TESL doctoral students and one colleague living in the Czech Republic. Three courses were offered: Theory to Practice; Research in Second Language Acquisition; and Instructional Technology in English Language Teaching. 48 Chinese teachers completed the program. ",
                        StartsOn = new DateTime(2003, 6, 1),
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        EmployeeActivityTypeId = employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Service")).Id
                    });
            
                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 2


                // ACTIVITY 3
                entityId = new Guid("6C03F4D0-FBB6-41CB-8E98-D9B129EFF0F8");
                activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        EntityId = entityId,
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        ActivityId = activity.RevisionId,
                        Title = "Workshop Preparation: Air pollution and Chinese Historic Site",
                        Content = "Drs. Tim Keener and Mingming Lu went to China in Oct. of 2006 to plan for an air quality workshop on the impact of air pollution and the Chinese historic sites, to be held in Xi’an, China in the fall of 2008. They have visited Tsinghua Univ., the XISU and discussed the details of the workshop plan with Prof. Wu, Associate Dean in the School of Tourism. they have visted Shanxi Archeology Research Institute, and Chinese Acedemy of Science in Xian, to meet potentail workshop participants. Drs. Lu and Keener is developing a proposal to NSF for the workshop.",
                        StartsOn = new DateTime(2006, 10, 9),
                        EndsOn = new DateTime(2006, 10, 10),
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        EmployeeActivityTypeId = employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Conference")).Id
                    });

                    _createActivityType.Handle(new CreateActivityType
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        EmployeeActivityTypeId = employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Teaching")).Id
                    });

                    _createActivityType.Handle(new CreateActivityType
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        EmployeeActivityTypeId = employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Honors")).Id
                    });

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 3


                // ACTIVITY 4
                entityId = new Guid("8ABCB82E-7ACA-41D6-93CD-637C2006804E");
                activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        EntityId = entityId,
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        ActivityId = activity.RevisionId,
                        Title = "Guest performer and teacher, China Saxophone Festival, Dalian, China",
                        Content = "Adj Professor, Professor EmeritusJazz Studies, Saxophone Studies, Ensembles & Conducting College Conservatory of Music",
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        EmployeeActivityTypeId = employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Creative")).Id
                    });

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 4


                // ACTIVITY 5
                entityId = new Guid("F0754F12-8E4E-4557-B9E0-32A173CB36DA");
                activityExists = _entities.Get<Activity>().Count(x => x.EntityId == entityId) > 0;
                if (!activityExists)
                {
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        EntityId = entityId,
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);
                    _unitOfWork.SaveChanges();

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        ActivityId = activity.RevisionId,
                        Title = "Fulbright Scholar Award to Research and Teach at Zhejiang University",
                        Content = "I will be conducting research and teaching two courses to medical and public health students at Zhejiang University in Hangzhou China. I will also be working closely with Dr. Tingzhong Yang who directs an institute that studies tobacco related problems in China. Further I wish to explore differences in health knowledge, attitudes and behaviors between Chinese and US college students.",
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);
                    _unitOfWork.SaveChanges();

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityType.Handle(new CreateActivityType
                    {
                        ActivityValuesId = activityValues.RevisionId,
                        EmployeeActivityTypeId = employeeModuleSettings.ActivityTypes.Single(x => x.Type.Contains("Awards")).Id
                    });

                    _createActivityLocation.Handle(new CreateActivityLocation
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