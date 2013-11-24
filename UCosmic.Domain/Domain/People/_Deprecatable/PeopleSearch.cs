//using System;
//using System.Collections.Generic;
//using System.Globalization;
//using System.Linq;
//using UCosmic.Domain.Activities;

///*
//    For People:

//    1. USF People (in campus/college/department if specified) that have Activities with keywords that match in Title,
//                        or Description,
//                        or Tags
//    AND that are associated with Locations,
//    AND are of Types
//    AND that fall between From/To Dates
 

//    2. Add to this list, USF People (in campus/college/department if specified) that have keywords that match Degrees
//        AND restrict to only those Degrees Awarded Years that fall between From/To Dates
 
//    3. Add to this list, USF People (in campus/college/department if specified) that have keywords that match Geographic Expertise Description
 
//    4. Add to this list, USF People (in campus/college/department if specified) that have keywords that match Language Expertise Language or Dialect
 
//    5. Add to this list, USF People (in campus/college/department if specified)
//    that have keywords that match a Person's Display Name
//*/

//namespace UCosmic.Domain.People
//{
//    public class PeopleSearch : BaseEntityQuery<Person>, IDefineQuery<PersonSearchResult>
//    {
//        public int EstablishmentId { get; set; }
//        public int[] PlaceIds { get; set; }
//        public int[] ActivityTypes { get; set; }
//        public bool IncludeDegrees { get; set; }
//        public string[] Tags { get; set; }
//        public DateTime? FromDate { get; set; }
//        public DateTime? ToDate { get; set; }
//        public bool NoUndated { get; set; }
//        public int InstitutionId { get; set; }
//        public int? CampusId { get; set; }
//        public int? CollegeId { get; set; }
//        public int? DepartmentId { get; set; }     

//        public PeopleSearch( int inEstablishmentId )
//        {
//            EstablishmentId = inEstablishmentId;
//        }
//    }

//    public class PersonSearchResult
//    {
//            /* People matched by Activity criteria */
//        public IEnumerable<Activity> Activities { get; set; }

//            /* People matched by Geographic Expertise criteria */
//        public IEnumerable<GeographicExpertise.GeographicExpertise> GeographicExpertise { get; set; }

//            /* People matched by Language Expertise criteria */
//        public IEnumerable<LanguageExpertise.LanguageExpertise> LanguageExpertise { get; set; }

//            /* People matched by Degree criteria */
//        public IEnumerable<Degrees.Degree> Degrees { get; set; }

//            /* People matched by Display Name */
//        public IEnumerable<Person> Names { get; set; }
//    }

//    public class HandlePeopleSearchQuery : IHandleQueries<PeopleSearch, PersonSearchResult>
//    {
//        private readonly string _publicActivityModeText = ActivityMode.Public.AsSentenceFragment();
//        private readonly IQueryEntities _entities;

//        public HandlePeopleSearchQuery(IQueryEntities entities)
//        {
//            _entities = entities;
//        }

//        public PersonSearchResult Handle(PeopleSearch query)
//        {
//            if (query == null) throw new ArgumentNullException("query");

//            throw new NotSupportedException("Part of Affiliation Verticalization");

////            var results = new PersonSearchResult();

////            /* Select all activites where people are affiliated with establishment, campus/college/department */
////            var activities = _entities.Query<Activity>()
////                                      .Where(
////                                          a => /* only public activities */
////                                          (a.ModeText == _publicActivityModeText)

////                                          /* not activity edit copies */
////                                          && (a.Original == null)

////                                          && a.Person.Affiliations.Any(
////                                              /* must be associated with establishment */
////                                              pa => (pa.EstablishmentId == query.EstablishmentId)
////                                                    /* check for campus association */
////                                                    && (!query.CampusId.HasValue ||
////                                                        (pa.CampusId.HasValue &&
////                                                         (pa.CampusId.Value == query.CampusId.Value)))
////                                                    /* check for college association */
////                                                    && (!query.CollegeId.HasValue ||
////                                                        (pa.CollegeId.HasValue &&
////                                                         (pa.CollegeId.Value == query.CollegeId.Value)))
////                                                    /* check for department association */
////                                                    && (!query.DepartmentId.HasValue ||
////                                                        (pa.DepartmentId.HasValue &&
////                                                         (pa.DepartmentId.Value == query.DepartmentId.Value)))

////                                                 )
////                );

////            /* If tags provided, restrict:
////             * 
////                a. Activity title, or
////                b. Activity description, or
////                c. Activity tags
////            */
////            if ((query.Tags != null) && (query.Tags.Length > 0))
////            {
////                activities =
////                    activities.Where(a => (a.Values.Any(v => (v.ModeText == _publicActivityModeText)
////                                                             && query.Tags.Any(
////                                                                 t =>
////                                                                 v.Title.Contains(t) ||
////                                                                 v.Content.Contains(t) ||
////                                                                 (v.Tags.Any(
////                                                                     vt =>
////                                                                     String.Compare(vt.Text, t, true,
////                                                                                    CultureInfo.InvariantCulture) ==
////                                                                     0)))
////                                              ))
////                        );
////            }

////            /* If places provided, restrict */
////            if ((query.PlaceIds != null) && (query.PlaceIds.Length > 0))
////            {
////                activities =
////                    activities.Where(a => (a.Values.Any(v => (v.ModeText == _publicActivityModeText) &&
////                                                             v.Locations.Any(l => query.PlaceIds.Contains(l.PlaceId))
////                                              )
////                                          )
////                        );
////            }

////            /* If activity types provided, restrict */
////            if ((query.ActivityTypes != null) && (query.ActivityTypes.Length > 0))
////            {
////                activities =
////                    activities.Where(a => (a.Values.Any(v => (v.ModeText == _publicActivityModeText)
////                                                             && v.Types.Any(t => query.ActivityTypes.Contains(t.TypeId)))
////                                          )
////                        );
////            }

////            /* If date range provided, restrict */
////            if (query.FromDate.HasValue || query.ToDate.HasValue)
////            {
////                DateTime toDateUtc = query.ToDate.HasValue
////                                         ? query.ToDate.Value
////                                         : new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
////                DateTime fromDateUtc = query.FromDate.HasValue
////                                           ? query.FromDate.Value
////                                           : new DateTime(DateTime.MinValue.Year, 1, 1);

////                activities = activities.ApplyDateRange(fromDateUtc,
////                                                       toDateUtc,
////                                                       query.NoUndated /* include undated? */,
////                                                       false /* no future */);
////            }

////            /* Set of unique people filtered by establishment, place and activity types */
////            results.Activities = activities.Distinct();

////#if FALSE
////            /* ADD People that Degree.Title contains supplied degrees
////             *  AND restrict to only those Degrees Awarded Years that fall between From/To Dates*/
////            if ((query.Degrees != null) && (query.Degrees.Length > 0))
////            {
////                var degrees = _entities.Query<Degrees.Degree>().Where(d =>
////                                                                      d.Person.Affiliations.Any(
////                                                                          /* must be associated with establishment */
////                                                                          pa =>
////                                                                          (pa.EstablishmentId == query.EstablishmentId)
////                                                                          /* check for campus association */
////                                                                          && (!query.CampusId.HasValue ||
////                                                                              (pa.CampusId.HasValue &&
////                                                                               (pa.CampusId.Value ==
////                                                                                query.CampusId.Value)))
////                                                                          /* check for college association */
////                                                                          && (!query.CollegeId.HasValue ||
////                                                                              (pa.CollegeId.HasValue &&
////                                                                               (pa.CollegeId.Value ==
////                                                                                query.CollegeId.Value)))
////                                                                          /* check for department association */
////                                                                          && (!query.DepartmentId.HasValue ||
////                                                                              (pa.DepartmentId.HasValue &&
////                                                                               (pa.DepartmentId.Value ==
////                                                                                query.DepartmentId.Value)))
////                                                                          )
////                    );

////                degrees = degrees.Where(d => query.Degrees.Contains(d.Title));

////                if (query.FromDate.HasValue || query.ToDate.HasValue)
////                {
////                    DateTime toDateUtc = query.ToDate.HasValue
////                                             ? query.ToDate.Value
////                                             : new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
////                    DateTime fromDateUtc = query.FromDate.HasValue
////                                               ? query.FromDate.Value
////                                               : new DateTime(DateTime.MinValue.Year, 1, 1);

////                    degrees =
////                        degrees.Where(d => (d.YearAwarded.HasValue && (d.YearAwarded.Value >= fromDateUtc.Year)) &&
////                                           (d.YearAwarded.HasValue && (d.YearAwarded < toDateUtc.Year)));
////                }

////                results.Degrees = degrees.Distinct();
////            }
////#endif

////            /* ADD People that have degrees
////             *  AND restrict to only those Degrees Awarded Years that fall between From/To Dates*/
////            if (query.IncludeDegrees)
////            {
////                var degrees = _entities.Query<Degrees.Degree>().Where(d =>
////                                                                      d.Person.Affiliations.Any(
////                                                                          /* must be associated with establishment */
////                                                                          pa =>
////                                                                          (pa.EstablishmentId == query.EstablishmentId)
////                                                                              /* check for campus association */
////                                                                          && (!query.CampusId.HasValue ||
////                                                                              (pa.CampusId.HasValue &&
////                                                                               (pa.CampusId.Value ==
////                                                                                query.CampusId.Value)))
////                                                                              /* check for college association */
////                                                                          && (!query.CollegeId.HasValue ||
////                                                                              (pa.CollegeId.HasValue &&
////                                                                               (pa.CollegeId.Value ==
////                                                                                query.CollegeId.Value)))
////                                                                              /* check for department association */
////                                                                          && (!query.DepartmentId.HasValue ||
////                                                                              (pa.DepartmentId.HasValue &&
////                                                                               (pa.DepartmentId.Value ==
////                                                                                query.DepartmentId.Value)))
////                                                                          )
////                    );

////                if (query.FromDate.HasValue || query.ToDate.HasValue)
////                {
////                    DateTime toDateUtc = query.ToDate.HasValue
////                                             ? query.ToDate.Value
////                                             : new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
////                    DateTime fromDateUtc = query.FromDate.HasValue
////                                               ? query.FromDate.Value
////                                               : new DateTime(DateTime.MinValue.Year, 1, 1);

////                    degrees =
////                        degrees.Where(d => (d.YearAwarded.HasValue && (d.YearAwarded.Value >= fromDateUtc.Year)) &&
////                                           (d.YearAwarded.HasValue && (d.YearAwarded < toDateUtc.Year)));
////                }

////                results.Degrees = degrees.Distinct();
////            }


////            /* ADD GeographiceExpertise.Description Tag matches */
////            if ((query.Tags != null) && (query.Tags.Length > 0))
////            {
////                var geoExpertise = _entities.Query<GeographicExpertise.GeographicExpertise>()
////                                            .Where(ge =>
////                                                   ge.Person.Affiliations.Any(
////                                                       /* must be associated with establishment */
////                                                       pa => (pa.EstablishmentId == query.EstablishmentId)
////                                                             /* check for campus association */
////                                                             && (!query.CampusId.HasValue ||
////                                                                 (pa.CampusId.HasValue &&
////                                                                  (pa.CampusId.Value == query.CampusId.Value)))
////                                                             /* check for college association */
////                                                             && (!query.CollegeId.HasValue ||
////                                                                 (pa.CollegeId.HasValue &&
////                                                                  (pa.CollegeId.Value == query.CollegeId.Value)))
////                                                             /* check for department association */
////                                                             && (!query.DepartmentId.HasValue ||
////                                                                 (pa.DepartmentId.HasValue &&
////                                                                  (pa.DepartmentId.Value == query.DepartmentId.Value)))
////                                                       )
////                    );

////                /* GeographicExpertise Description */
////                if (geoExpertise.Any())
////                {
////                    results.GeographicExpertise = geoExpertise
////                        .Where(ge => query.Tags.Any(t => ge.Description.Contains(t)))
////                        .Distinct();
////                }
////            } /* ADD GeographiceExpertise.Description Tag matches */

////            /* ADD LanguageExpertise.Language and Dialect Tag matches */
////            if ((query.Tags != null) && (query.Tags.Length > 0))
////            {
////                var langExpertise = _entities.Query<LanguageExpertise.LanguageExpertise>()
////                                             .Where(le =>
////                                                    le.Person.Affiliations.Any(
////                                                        /* must be associated with establishment */
////                                                        pa => (pa.EstablishmentId == query.EstablishmentId)
////                                                              /* check for campus association */
////                                                              && (!query.CampusId.HasValue ||
////                                                                  (pa.CampusId.HasValue &&
////                                                                   (pa.CampusId.Value == query.CampusId.Value)))
////                                                              /* check for college association */
////                                                              && (!query.CollegeId.HasValue ||
////                                                                  (pa.CollegeId.HasValue &&
////                                                                   (pa.CollegeId.Value == query.CollegeId.Value)))
////                                                              /* check for department association */
////                                                              && (!query.DepartmentId.HasValue ||
////                                                                  (pa.DepartmentId.HasValue &&
////                                                                   (pa.DepartmentId.Value == query.DepartmentId.Value)))
////                                                        )
////                    );

////                /* languageExpertise Language or Dialect */
////                if (langExpertise.Any())
////                {
////                    results.LanguageExpertise = langExpertise
////                        .Where(
////                            le =>
////                            query.Tags.Any(
////                                t =>
////                                (le.Language.Names.Any(
////                                    ln => ln.Text.Contains(t))) ||
////                                (String.Compare(le.Dialect, t, true, CultureInfo.InvariantCulture) == 0))
////                        )
////                        .Distinct();
////                }
////            } /* ADD LanguageExpertise.Language and Dialect Tag matches */

////            /* ADD Person.DisplayName Tag matches */
////            if ((query.Tags != null) && (query.Tags.Length > 0))
////            {
////                var morePeople = _entities.Query<Person>()
////                                          .Where(p =>
////                                                 /* affiliated with establishment */
////                                                 p.Affiliations.Any(
////                                                     /* must be associated with establishment */
////                                                     pa => (pa.EstablishmentId == query.EstablishmentId)
////                                                           /* check for campus association */
////                                                           && (!query.CampusId.HasValue ||
////                                                               (pa.CampusId.HasValue &&
////                                                                (pa.CampusId.Value == query.CampusId.Value)))
////                                                           /* check for college association */
////                                                           && (!query.CollegeId.HasValue ||
////                                                               (pa.CollegeId.HasValue &&
////                                                                (pa.CollegeId.Value == query.CollegeId.Value)))
////                                                           /* check for department association */
////                                                           && (!query.DepartmentId.HasValue ||
////                                                               (pa.DepartmentId.HasValue &&
////                                                                (pa.DepartmentId.Value == query.DepartmentId.Value)))

////                                                     )

////                                                 /* tag matches on display name */
////                                                 && query.Tags.Any(
////                                                     t =>
////                                                     p.DisplayName.Contains(t))
////                    );


////                if (morePeople.Any())
////                {
////                    results.Names = morePeople.Distinct();
////                }
////            } /* ADD Person.DisplayName Tag matches */

////            return results;
//        }
//    }
//}
