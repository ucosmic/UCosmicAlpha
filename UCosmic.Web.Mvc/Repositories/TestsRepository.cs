using System.Collections.Generic;
//using UCosmic.Exceptions;
using UCosmic.Interfaces;
using UCosmic.Factories;
using System.Web.Security;
using System;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;
using System.Threading.Tasks;


namespace UCosmic.Repositories
{
    public class TestsRepository : ISummaryRepository
    {

        public async Task<IList<Tests_idb_QueryResultModel>> test_idb_ByEstablishment_limit(int? EstablishmentId, int offset, int limit)
        {

            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            //int offset = page * page_size;
            string sql = "select distinct top " + limit + "  aa.revisionid as id,  people.revisionId as personId, av.title, startsOn, endsOn, al.placeId as place_id, " +
                   " CASE WHEN endsOn is not null THEN endsOn When ongoing = 1 then '2999-01-01 00:00:00.000' When startsOn is not null then startsOn ELSE '1901-01-01 00:00:00.000' End as endsOnCalc, " +
                //" CASE When startsOn is not null THEN startsOn when endsOn is not null then endsOn ELSE '2999-01-01 00:00:00.000' End as startsOn, " +
                   " CASE When startsOn is not null THEN startsOn ELSE '1901-01-01 00:00:00.000' End as startsOnCalc, " +
                   " CASE When lastName is not null THEN lastName ELSE 'zzzzzzzz' End as lastNameSort, " +
                   " CASE When firstName is not null THEN firstName ELSE 'zzzzzzzz' End as firstNameSort, " +
                   " CASE When ongoing = 1 THEN 1  ELSE 0 End as onGoingSort, " +
                   " people.firstname,people.lastname, people.displayName,  eeat.id as typeId, " + //eeat.type,
                   " startsFormat as startsonformat, endsformat as endsonformat, ongoing, " +
                //" CASE WHEN (gnt.continentcode = 'AF' and pp1.iscontinent = 1) THEN 'Africa' " +
                //" WHEN (gnt.continentcode = 'AN' and pp1.iscontinent = 1) THEN 'Antarctica' " +
                //" WHEN (gnt.continentcode = 'AS' and pp1.iscontinent = 1) THEN 'Asia' " +
                //" WHEN (gnt.continentcode = 'EU' and pp1.iscontinent = 1) THEN 'Europe' " +
                //" WHEN (gnt.continentcode = 'NA' and pp1.iscontinent = 1) THEN 'North America' " +
                //" WHEN (gnt.continentcode = 'OC' and pp1.iscontinent = 1) THEN 'Oceana' " +
                //" WHEN (gnt.continentcode = 'SA' and pp1.iscontinent = 1) THEN 'South America' " +
                //" ELSE pp1.officialName END as locationName " +
                   " iu.name as id_name, atag.text as tag_text, av.contentsearchable  " +
                   " FROM [ActivitiesV2].[ActivityLocation] al" +
                   " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                   " left outer join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                   " left outer join [ActivitiesV2].[ActivityTag] atag on atag.activityValuesId=av.revisionid" +//may not have tags
                   " left outer join employees.employeeactivitytype eeat on eeat.id = at.typeid" +
                //" inner join Places.place pp1 on al.placeId=pp1.revisionid" +
                   " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                   " inner join [People].Person people on aa.personId=people.revisionid" +
                   " inner join people.affiliation pa on pa.personId=people.revisionid" +
                   " inner join establishments.establishmentNode een on pa.establishmentid=een.offspringId" +
                   " inner join [identity].[user] iu on iu.personId=people.revisionid" +
                //" left outer join Places.geonamestoponym gnt on gnt.placeId=pp1.revisionid" +
                   " where (pa.establishmentid=" + EstablishmentId + " or een.AncestorId=" + EstablishmentId + ") and aa.mode='public' and av.mode='public' and aa.EditSourceId is null" +
                   " and aa.revisionId > " + (offset) + //"and aa.revisionId < " + offset +
                   " order by aa.revisionId";


            IList<Tests_idb_QueryResultModel> activitySummary = await connectionFactory.SelectList2<Tests_idb_QueryResultModel>(DB.UCosmic, sql);

            return activitySummary;
        }

        public async Task<IList<Tests_idb_QueryResultModel>> test_idb_ByEstablishment(int? EstablishmentId)
        {

            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            //int offset = page * page_size;
            string sql = "select distinct  aa.revisionid as id,  people.revisionId as personId, av.title, startsOn, endsOn, al.placeId as place_id, " +
                   " CASE WHEN endsOn is not null THEN endsOn When ongoing = 1 then '2999-01-01 00:00:00.000' When startsOn is not null then startsOn ELSE '1901-01-01 00:00:00.000' End as endsOnCalc, " +
                //" CASE When startsOn is not null THEN startsOn when endsOn is not null then endsOn ELSE '2999-01-01 00:00:00.000' End as startsOn, " +
                   " CASE When startsOn is not null THEN startsOn ELSE '1901-01-01 00:00:00.000' End as startsOnCalc, " +
                   " CASE When lastName is not null THEN lastName ELSE 'zzzzzzzz' End as lastNameSort, " +
                   " CASE When firstName is not null THEN firstName ELSE 'zzzzzzzz' End as firstNameSort, " +
                   " CASE When ongoing = 1 THEN 1  ELSE 0 End as onGoingSort, " +
                   " people.firstname,people.lastname, people.displayName,  eeat.id as typeId, " + //eeat.type,
                   " startsFormat as startsonformat, endsformat as endsonformat, ongoing, aa.personId, " +
                //" CASE WHEN (gnt.continentcode = 'AF' and pp1.iscontinent = 1) THEN 'Africa' " +
                //" WHEN (gnt.continentcode = 'AN' and pp1.iscontinent = 1) THEN 'Antarctica' " +
                //" WHEN (gnt.continentcode = 'AS' and pp1.iscontinent = 1) THEN 'Asia' " +
                //" WHEN (gnt.continentcode = 'EU' and pp1.iscontinent = 1) THEN 'Europe' " +
                //" WHEN (gnt.continentcode = 'NA' and pp1.iscontinent = 1) THEN 'North America' " +
                //" WHEN (gnt.continentcode = 'OC' and pp1.iscontinent = 1) THEN 'Oceana' " +
                //" WHEN (gnt.continentcode = 'SA' and pp1.iscontinent = 1) THEN 'South America' " +
                //" ELSE pp1.officialName END as locationName " +
                   " atag.text as tag_text, av.contentsearchable  " +
                   " FROM [ActivitiesV2].[ActivityLocation] al" +
                   " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                   " left outer join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                   " left outer join [ActivitiesV2].[ActivityTag] atag on atag.activityValuesId=av.revisionid" +//may not have tags
                   " left outer join employees.employeeactivitytype eeat on eeat.id = at.typeid" +
                //" inner join Places.place pp1 on al.placeId=pp1.revisionid" +
                   " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                   " inner join [People].Person people on aa.personId=people.revisionid" +
                   " inner join people.affiliation pa on pa.personId=people.revisionid" +
                   //" inner join establishments.establishmentNode een on pa.establishmentid=een.offspringId" +
                   //" inner join [identity].[user] iu on iu.personId=people.revisionid" +
                //" left outer join Places.geonamestoponym gnt on gnt.placeId=pp1.revisionid" +
                   " where (pa.establishmentid=" + EstablishmentId + ") and aa.mode='public' and av.mode='public' and aa.EditSourceId is null" +
                   //" and aa.revisionId > " +
                   " order by aa.revisionId";


            IList<Tests_idb_QueryResultModel> activitySummary = await connectionFactory.SelectList2<Tests_idb_QueryResultModel>(DB.UCosmic, sql);

            return activitySummary;
        }

        public async Task<IList<Tests_idb_person_affiliation_QueryResultModel>> test_idb_person_affiliations_ByEstablishment(int? EstablishmentId)
        {

            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            //int offset = page * page_size;
            string sql = "SELECT pa2.[PersonId], pa2.establishmentId  " +
              "FROM [UCosmicTest].[People].[Affiliation] pa  " +
              "inner join [UCosmicTest].[People].[Affiliation] pa2 on pa2.personid = pa.personid  " +
              "where pa.establishmentid = " + EstablishmentId + " and pa2.establishmentid != " + EstablishmentId;


            IList<Tests_idb_person_affiliation_QueryResultModel> activitySummary = await connectionFactory.SelectList2<Tests_idb_person_affiliation_QueryResultModel>(DB.UCosmic, sql);

            return activitySummary;
        }
    }
}