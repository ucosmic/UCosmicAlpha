using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

/*
    For Activities:
 
    1. Activities for USF People (in campus/college/department if specified)
            AND with keywords that match in Title,
                    or Description,
                    or  Tags
            AND that are associated with Locations,
            AND are of Types

    2. Add to this list, Activities for USF People (in campus/college/department if specified)
    that have keywords that match Geographic Expertise Description
 
    3. Add to this list, Activities for USF People (in campus/college/department if specified)
    that have keywords that match a Person's Display Name
 
    4. Restrict Activity list to only those Activities that fall between From/To Dates
*/


namespace UCosmic.Domain.Activities
{
    public class ActivitySearch : BaseEntityQuery<Activity>, IDefineQuery<IEnumerable<Activity>>
    {
        public int EstablishmentId { get; set; }
        public int[] PlaceIds { get; set; }
        public int[] ActivityTypes { get; set; }
        public string[] Tags { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public bool NoUndated { get; set; }
        public int? CampusId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }       

        public ActivitySearch( int inEstablishmentId )
        {
            EstablishmentId = inEstablishmentId;
        }
    }

    public class HandleActivitySearchQuery : IHandleQueries<ActivitySearch, IEnumerable<Activity>>
    {
        private readonly string _publicActivityModeText = ActivityMode.Public.AsSentenceFragment();
        private readonly IQueryEntities _entities;

        public HandleActivitySearchQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public IEnumerable<Activity> Handle(ActivitySearch query)
        {
            if (query == null) throw new ArgumentNullException("query");

            /* Select all activities where person is affiliated with establishment, campus/college/department */
            var activities = _entities.Query<Activity>()
                                      .Where(
                                          a => /* only public activities */
                                          (a.ModeText == _publicActivityModeText)

                                          /* not activity edit copies */
                                          && !a.EditSourceId.HasValue

                                          && a.Person.Affiliations.Any(
                                              /* must be associated with establishment */
                                              pa => (pa.EstablishmentId == query.EstablishmentId)
                                                    /* check for campus association */
                                                    && (!query.CampusId.HasValue ||
                                                        (pa.CampusId.HasValue &&
                                                         (pa.CampusId.Value == query.CampusId.Value)))
                                                    /* check for college association */
                                                    && (!query.CollegeId.HasValue ||
                                                        (pa.CollegeId.HasValue &&
                                                         (pa.CollegeId.Value == query.CollegeId.Value)))
                                                    /* check for department association */
                                                    && (!query.DepartmentId.HasValue ||
                                                        (pa.DepartmentId.HasValue &&
                                                         (pa.DepartmentId.Value == query.DepartmentId.Value)))
                                                 )
                );

            /* If places provided, restrict */
            if ((query.PlaceIds != null) && (query.PlaceIds.Length > 0))
            {
                activities =
                    activities.Where(a => (a.Values.Any(v => v.ModeText == _publicActivityModeText)) &&
                                          (a.Values.Any(v => v.Locations.Any(l => query.PlaceIds.Contains(l.PlaceId))))
                        );
            }

            /* If activity types provided, restrict.  Note: Pass NULL if establishment does not have activity types. */
            if (query.ActivityTypes != null)
            {
                activities =
                    activities.Where(a => (a.Values.Any(v => v.ModeText == _publicActivityModeText)) &&
                                          (a.Values.Any(v => v.Types.Any(t => query.ActivityTypes.Contains(t.TypeId))))
                        );
            }

            /* If tags provided, restrict:
             * 
                a. Activity title, or
                b. Activity description, or
                c. Activity tags
            */
            if ((query.Tags != null) && (query.Tags.Length > 0))
            {
                activities =
                    activities.Where(a => (a.Values.Any(v => v.ModeText == _publicActivityModeText)) &&
                                          (a.Values.Any(
                                              v =>
                                              query.Tags.Any(
                                                  t =>
                                                  v.Title.Contains(t) ||
                                                  v.Content.Contains(t) ||
                                                  (v.Tags.Any(
                                                      vt =>
                                                      String.Compare(vt.Text, t, true, CultureInfo.InvariantCulture) ==
                                                      0)))
                                              ))
                        );
            }


            /* ADD GeographiceExpertise.Description Tag matches */
            if ((query.Tags != null) && (query.Tags.Length > 0))
            {
                var geoExpertise = _entities.Query<GeographicExpertise.GeographicExpertise>()
                                            .Where(ge =>
                                                   ge.Person.Affiliations.Any(
                                                       /* must be associated with establishment */
                                                       pa => (pa.EstablishmentId == query.EstablishmentId)
                                                             /* check for campus association */
                                                             && (!query.CampusId.HasValue ||
                                                                 (pa.CampusId.HasValue &&
                                                                  (pa.CampusId.Value == query.CampusId.Value)))
                                                             /* check for college association */
                                                             && (!query.CollegeId.HasValue ||
                                                                 (pa.CollegeId.HasValue &&
                                                                  (pa.CollegeId.Value == query.CollegeId.Value)))
                                                             /* check for department association */
                                                             && (!query.DepartmentId.HasValue ||
                                                                 (pa.DepartmentId.HasValue &&
                                                                  (pa.DepartmentId.Value == query.DepartmentId.Value)))
                                                       )
                    );

                /* GeographicExpertise Description */
                if (geoExpertise.Any())
                {
                    var establishmentActivities = _entities.Query<Activity>()
                                                           .Where(
                                                               a => /* only public activities */
                                                               (a.ModeText == _publicActivityModeText)

                                                               /* not activity edit copies */
                                                               && !a.EditSourceId.HasValue

                                                               && a.Person.Affiliations.Any(
                                                                   /* must be associated with establishment */
                                                                   pa => (pa.EstablishmentId == query.EstablishmentId)
                                                                   /* check for campus association */
                                                                   && (!query.CampusId.HasValue ||
                                                                       (pa.CampusId.HasValue &&
                                                                        (pa.CampusId.Value == query.CampusId.Value)))
                                                                   /* check for college association */
                                                                   && (!query.CollegeId.HasValue ||
                                                                       (pa.CollegeId.HasValue &&
                                                                        (pa.CollegeId.Value == query.CollegeId.Value)))
                                                                   /* check for department association */
                                                                   && (!query.DepartmentId.HasValue ||
                                                                       (pa.DepartmentId.HasValue &&
                                                                        (pa.DepartmentId.Value ==
                                                                         query.DepartmentId.Value)))
                                                                   )
                        );

                    var relatedGeoExpertise = establishmentActivities.Join(geoExpertise,
                                                                           a => a.PersonId,
                                                                           ge => ge.PersonId,
                                                                           (a, ge) => new
                                                                           {
                                                                               Activity = a,
                                                                               GeoExpertise = ge
                                                                           });

                    var moreActivities = relatedGeoExpertise
                        .Where(
                            rge =>
                            query.Tags.Any(
                                t => rge.GeoExpertise.Description.Contains(t)))
                        .Select(j => j.Activity);

                    if (moreActivities.Any())
                    {
                        activities = activities.Concat(moreActivities).Distinct();
                    }
                }
            }

            /* ADD Person.DisplayName Tag matches */
            if ((query.Tags != null) && (query.Tags.Length > 0))
            {
                var moreActivities = _entities.Query<Activity>()
                                              .Where(
                                                  a => /* only public activities */
                                                  (a.ModeText == _publicActivityModeText)

                                                  /* not activity edit copies */
                                                  && !a.EditSourceId.HasValue

                                                  /* affiliated with establishment */
                                                  && a.Person.Affiliations.Any(
                                                      /* must be associated with establishment */
                                                      pa => (pa.EstablishmentId == query.EstablishmentId)
                                                            /* check for campus association */
                                                            && (!query.CampusId.HasValue ||
                                                                (pa.CampusId.HasValue &&
                                                                 (pa.CampusId.Value == query.CampusId.Value)))
                                                            /* check for college association */
                                                            && (!query.CollegeId.HasValue ||
                                                                (pa.CollegeId.HasValue &&
                                                                 (pa.CollegeId.Value == query.CollegeId.Value)))
                                                            /* check for department association */
                                                            && (!query.DepartmentId.HasValue ||
                                                                (pa.DepartmentId.HasValue &&
                                                                 (pa.DepartmentId.Value == query.DepartmentId.Value)))
                                                      )

                                                 /* tag matches on display name */
                                                 && query.Tags.Any(
                                                      t =>
                                                      a.Person.DisplayName.Contains(t))
                    );

                if (moreActivities.Any())
                {
                    activities = activities.Concat(moreActivities).Distinct();
                }
            } /* ADD Person.DisplayName Tag matches */

            /* RESTRICT From/To Dates */
            if (query.FromDate.HasValue || query.ToDate.HasValue || query.NoUndated)
            {
                DateTime toDateUtc = query.ToDate.HasValue ? query.ToDate.Value : new DateTime(DateTime.UtcNow.Year + 1, 1, 1);
                DateTime fromDateUtc = query.FromDate.HasValue ? query.FromDate.Value : new DateTime(DateTime.MinValue.Year, 1, 1);

                activities = activities.ApplyDateRange(fromDateUtc,
                                                       toDateUtc,
                                                       query.NoUndated /* include undated */,
                                                       false /* no future */);
            }

            return activities;
        }
    }
}
