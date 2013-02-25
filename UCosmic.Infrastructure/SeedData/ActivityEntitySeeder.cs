using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Security.Principal;
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
        private readonly IUnitOfWork _unitOfWork;

        public ActivityEntitySeeder(IProcessQueries queryProcessor
                                    , ICommandEntities entities
                                    , IHandleCommands<CreateMyNewActivity> createActivity
                                    , IHandleCommands<CreateActivityLocation> createActivityLocation
                                    , IHandleCommands<CreateActivityValues> createActivityValues
                                    , IHandleCommands<CreateActivityTag> createActivityTag
                                    , IUnitOfWork unitOfWork
        )
        {
            _createActivity = createActivity;
            _createActivityLocation = createActivityLocation;
            _createActivityValues = createActivityValues;
            _createActivityTag = createActivityTag;
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

                { // ACTIVITY 1
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    ActivityType activityType = employeeModuleSettings.ActivityTypes.Single(x => x.Type == "Research");
                    if (activityType == null) { throw new Exception("USF 'Research' ActivityType not found."); }

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        Activity = activity,
                        Title =
                            "Understanding Causation of the Permian/Triassic Boundary, Largest Mass Extinction in Earth History",
                        Content =
                            "Permian/Triassic (P/Tr) Boundary Global Events—The P/Tr boundary represents the largest mass extinction in Earth history, yet its causes remain uncertain. I am investigating critical questions related to the extent and intensity of Permo-Triassic deep-ocean anoxia, patterns of upwelling of toxic sulfidic waters onto shallow-marine shelves and platforms, and the relationship of such events to global C-isotopic excursions and the delayed recovery of marine biotas during the Early Triassic. I am working on the P/Tr boundary globally.",
                        StartsOn = new DateTime(2003, 3, 1),
                        TypeId = activityType.Id,
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValues = activityValues,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValues = activityValues,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "Canada").RevisionId,
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "Vietnam",
                        DomainType = ActivityTagDomainType.Place,
                        DomainKey = _entities.Get<Place>().Single(x => x.OfficialName == "Vietnam").RevisionId,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "India",
                        DomainType = ActivityTagDomainType.Place,
                        DomainKey = _entities.Get<Place>().Single(x => x.OfficialName == "India").RevisionId,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "India",
                        DomainType = ActivityTagDomainType.Place,
                        DomainKey = _entities.Get<Place>().Single(x => x.OfficialName == "Japan").RevisionId,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "UNIVERSITY OF SASKATCHEWAN",
                        DomainType = ActivityTagDomainType.Custom,
                        IsInstitution = true,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "UNIVERSITY OF CALGARY",
                        DomainType = ActivityTagDomainType.Custom,
                        IsInstitution = true,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "CHINA UNIVERSITY OF GEOSCIENCES",
                        DomainType = ActivityTagDomainType.Custom,
                        IsInstitution = true,
                        Mode = activity.Mode
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 1


                { // ACTIVITY 2
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    ActivityType activityType = employeeModuleSettings.ActivityTypes.Single(x => x.Type == "Teaching/Mentoring");
                    if (activityType == null) { throw new Exception("USF 'Teaching/Mentoring' ActivityType not found."); }

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        Activity = activity,
                        Title = "Professional Development Program for Teachers of English at Shandong University",
                        Content = "In Summer 2008, the Teaching English as a Second Language (TESL) Program delivered a professional development program for teachers of English at Shandong University in Jinan, China. Program instructors included two TESL doctoral students and one colleague living in the Czech Republic. Three courses were offered: Theory to Practice; Research in Second Language Acquisition; and Instructional Technology in English Language Teaching. 48 Chinese teachers completed the program. ",
                        StartsOn = new DateTime(2003, 6, 1),
                        TypeId = activityType.Id,
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValues = activityValues,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "SHANDONG UNIVERSITY",
                        DomainType = ActivityTagDomainType.Custom,
                        IsInstitution = true,
                        Mode = activity.Mode
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 2

                { // ACTIVITY 3
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    ActivityType activityType = employeeModuleSettings.ActivityTypes.Single(x => x.Type == "Conference Participation");
                    if (activityType == null) { throw new Exception("USF 'Conference Participation' ActivityType not found."); }

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        Activity = activity,
                        Title = "Workshop Preparation: Air pollution and Chinese Historic Site",
                        Content = "Drs. Tim Keener and Mingming Lu went to China in Oct. of 2006 to plan for an air quality workshop on the impact of air pollution and the Chinese historic sites, to be held in Xi’an, China in the fall of 2008. They have visited Tsinghua Univ., the XISU and discussed the details of the workshop plan with Prof. Wu, Associate Dean in the School of Tourism. they have visted Shanxi Archeology Research Institute, and Chinese Acedemy of Science in Xian, to meet potentail workshop participants. Drs. Lu and Keener is developing a proposal to NSF for the workshop.",
                        StartsOn = new DateTime(2006, 10, 9),
                        EndsOn = new DateTime(2006, 10, 10),
                        TypeId = activityType.Id,
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValues = activityValues,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "XIAN INTERNATIONAL STUDIES UNIVERSITY",
                        DomainType = ActivityTagDomainType.Custom,
                        IsInstitution = true,
                        Mode = activity.Mode
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "TSINGHUA UNIVERSITY CHINA",
                        DomainType = ActivityTagDomainType.Custom,
                        IsInstitution = true,
                        Mode = activity.Mode
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 3

                { // ACTIVITY 4
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    ActivityType activityType = employeeModuleSettings.ActivityTypes.Single(x => x.Type == "Creative Endeavor");
                    if (activityType == null) { throw new Exception("USF 'Creative Endeavor' ActivityType not found."); }

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        Activity = activity,
                        Title = "Guest performer and teacher, China Saxophone Festival, Dalian, China",
                        Content = "Adj Professor, Professor EmeritusJazz Studies, Saxophone Studies, Ensembles & Conducting College Conservatory of Music",
                        TypeId = activityType.Id,
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValues = activityValues,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 4

                { // ACTIVITY 5
                    createMyNewActivityCommand = new CreateMyNewActivity
                    {
                        User = user,
                        ModeText = ActivityMode.Draft.AsSentenceFragment()
                    };

                    _createActivity.Handle(createMyNewActivityCommand);

                    Activity activity = createMyNewActivityCommand.CreatedActivity;

                    ActivityType activityType = employeeModuleSettings.ActivityTypes.Single(x => x.Type == "Honor/Award");
                    if (activityType == null) { throw new Exception("USF 'Honor/Award' ActivityType not found."); }

                    CreateActivityValues createActivityValuesCommand = new CreateActivityValues
                    {
                        Activity = activity,
                        Title = "Fulbright Scholar Award to Research and Teach at Zhejiang University",
                        Content = "I will be conducting research and teaching two courses to medical and public health students at Zhejiang University in Hangzhou China. I will also be working closely with Dr. Tingzhong Yang who directs an institute that studies tobacco related problems in China. Further I wish to explore differences in health knowledge, attitudes and behaviors between Chinese and US college students.",
                        TypeId = activityType.Id,
                        Mode = activity.Mode
                    };

                    _createActivityValues.Handle(createActivityValuesCommand);

                    ActivityValues activityValues = createActivityValuesCommand.CreatedActivityValues;

                    _createActivityLocation.Handle(new CreateActivityLocation
                    {
                        ActivityValues = activityValues,
                        PlaceId = _entities.Get<Place>().Single(x => x.OfficialName == "China").RevisionId,
                    });

                    _createActivityTag.Handle(new CreateActivityTag
                    {
                        Activity = activity,
                        Text = "ZHEJIANG UNIVERSITY",
                        DomainType = ActivityTagDomainType.Custom,
                        IsInstitution = true,
                        Mode = activity.Mode
                    });

                    _unitOfWork.SaveChanges();
                } // ACTIVITY 5

            } // Douglas Corarito
        }
    }

}