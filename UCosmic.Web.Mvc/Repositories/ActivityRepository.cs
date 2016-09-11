using System.Collections.Generic;
//using UCosmic.Exceptions;
using UCosmic.Interfaces;
using UCosmic.Factories;
using UCosmic.Repositories;
using System.Web.Security;
using System;
using System.Linq;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;
using System.Text.RegularExpressions;

//http://stackoverflow.com/questions/554013/regular-expression-to-split-on-spaces-unless-in-quotes
namespace UCosmic.Repositories
{
    public class ActivityRepository// : ISummaryRepository
    {
        private static string AddSqlFilter(string sql, ActivitySearchInputModel input)
        {
            //if (input.PlaceIds != null && input.PlaceIds.Length > 0 && input.PlaceIds[0] != 0)
            //{
            //    sql += " and (";
            //    foreach (var placeId in input.PlaceIds.Select((x, i) => new { Value = x, Index = i }))
            //    {
            //        if (placeId.Index > 0)
            //        {
            //            sql += " or al.placeId=" + placeId.Value;// +" or pp2.revisionid=" + placeId.Value;
            //        }
            //        else
            //        {
            //            sql += " al.placeId=" + placeId.Value;// +" or pp2.revisionid=" + placeId.Value;
            //        }
            //    }
            //    sql += ")";
            //}
            //if (input.PlaceNames != null && input.PlaceNames.Length > 0 && input.PlaceNames[0] != null && input.PlaceNames[0].Length > 0)
            //{
            //    sql += " and (";
            //    foreach (var placeName in input.PlaceNames.Select((x, i) => new { Value = x, Index = i }))
            //    {
            //        if (placeName.Index > 0)
            //        {
            //            sql += " or pp1.officialname='" + placeName.Value + "' or pp2.officialname='" + placeName.Value + "'";
            //        }
            //        else
            //        {
            //            sql += " pp1.officialname='" + placeName.Value + "' or pp2.officialname='" + placeName.Value + "'";
            //        }
            //    }
            //    sql += ")";
            //}
            if (input.Keyword != null && input.Keyword != "")
            {
                List<string> keywords;

                input.Keyword = input.Keyword.Replace("+", "+ ");
                keywords = Regex
                    .Matches(input.Keyword, "(?<match>[^\\s\"]+)|\"(?<match>[^\"]*)\"")
                    .Cast<Match>()
                    .Select(m => m.Groups["match"].Value)
                    .ToList();
                sql += " and ((";


                foreach (var keyword in keywords.Select((x, i) => new { Value = x, Index = i }))
                {
                    string not = "";
                    string or = "or";
                    string keywordValue = "";

                    if (keywords[keyword.Index].IndexOf("+") == 0 || keyword.Value.IndexOf("-") == 0)
                    {
                        sql += ")";
                    }

                    if (keyword.Value.IndexOf("-") == 0)
                    {
                        not = "!";
                        or = "and";
                        keywordValue = keyword.Value.Replace("-", "");

                        if (keyword.Index > 0)
                        {
                            sql += " " + or + "(";
                        }
                        sql += "( pp1.officialname " + not + "='" + keywordValue + "' ";// +or + " (pp2.officialname " + not + "='" + keywordValue + "' or pp2.officialname is null)";
                        sql += " " + or + " (people.displayname not like '%" + keywordValue + "%' or people.displayname is null)";
                        sql += " " + or + " (people.firstname not like '%" + keywordValue + "%' or people.firstname is null)";
                        sql += " " + or + " (people.lastname not like '%" + keywordValue + "%' or people.lastname is null)";
                        sql += " " + or + " (iu.name not like '%" + keywordValue + "%' or iu.name is null)";
                        sql += " " + or + " (atag.text not like '%" + keywordValue + "%' or atag.text is null)";
                        sql += " " + or + " (av.title not like '%" + keywordValue + "%'  or av.title is null)" + or + " (av.contentsearchable not like '%" + keywordValue + "%'  or av.contentsearchable is null))";

                    }
                    else if (keyword.Value != "+")
                    {
                        keywordValue = keyword.Value;
                        if (keyword.Index > 0 && keywords[keyword.Index - 1].IndexOf("+") != 0)
                        {
                            sql += " " + or;
                        }
                        else if (keyword.Index > 0 && keywords[keyword.Index - 1].IndexOf("+") == 0)
                        {
                            sql += " and (";
                        }

                        sql += "( pp1.officialname " + not + "='" + keywordValue + "' ";// +or + " pp2.officialname " + not + "='" + keywordValue + "'";
                        sql += " " + or + " (people.displayname like '%" + keywordValue + "%')";
                        sql += " " + or + " (people.firstname like '%" + keywordValue + "%')";
                        sql += " " + or + " (people.lastname like '%" + keywordValue + "%')";
                        sql += " " + or + " (iu.name like '%" + keywordValue + "%')";

                        sql += " " + or + " atag.text  like '%" + keywordValue + "%'";
                        sql += " " + or + " av.title  like '%" + keywordValue + "%' " + or + " av.contentsearchable  like '%" + keywordValue + "%' )";


                    }

                }
                sql += "))";
            }
            return sql;
        }
        public static IList<ActivityQueryResultModel> ActivitiesPageBy(ActivitySearchInputModel input, int? ancestorId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "select distinct aa.revisionid as id,  people.revisionId as personId, av.title, startsOn, endsOn, al.placeId as place_id, " +
                  " CASE WHEN endsOn is not null THEN endsOn When ongoing = 1 then '2999-01-01 00:00:00.000' When startsOn is not null then startsOn ELSE '1901-01-01 00:00:00.000' End as endsOnCalc, " +
                //" CASE When startsOn is not null THEN startsOn when endsOn is not null then endsOn ELSE '2999-01-01 00:00:00.000' End as startsOn, " +
                  " CASE When startsOn is not null THEN startsOn ELSE '1901-01-01 00:00:00.000' End as startsOnCalc, " +
                  " CASE When lastName is not null THEN lastName ELSE 'zzzzzzzz' End as lastNameSort, " +
                  " CASE When firstName is not null THEN firstName ELSE 'zzzzzzzz' End as firstNameSort, " +
                  " CASE When ongoing = 1 THEN 1  ELSE 0 End as onGoingSort, " +
                  " people.firstname,people.lastname, people.displayName, eeat.type, eeat.id as typeId, " +
                  " startsFormat as startsonformat, endsformat as endsonformat, ongoing, " +
                  " CASE WHEN (gnt.continentcode = 'AF' and pp1.iscontinent = 1) THEN 'Africa' " +
                  " WHEN (gnt.continentcode = 'AN' and pp1.iscontinent = 1) THEN 'Antarctica' " +
                  " WHEN (gnt.continentcode = 'AS' and pp1.iscontinent = 1) THEN 'Asia' " +
                  " WHEN (gnt.continentcode = 'EU' and pp1.iscontinent = 1) THEN 'Europe' " +
                  " WHEN (gnt.continentcode = 'NA' and pp1.iscontinent = 1) THEN 'North America' " +
                  " WHEN (gnt.continentcode = 'OC' and pp1.iscontinent = 1) THEN 'Oceana' " +
                  " WHEN (gnt.continentcode = 'SA' and pp1.iscontinent = 1) THEN 'South America' " +
                  " ELSE pp1.officialName END as locationName  " +
                  " FROM [ActivitiesV2].[ActivityLocation] al" +
                  " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityTag] atag on atag.activityValuesId=av.revisionid" +//may not have tags
                  " left outer join employees.employeeactivitytype eeat on eeat.id = at.typeid" +
                  " inner join Places.place pp1 on al.placeId=pp1.revisionid" +
                //" left outer join Places.place pp2 on pp1.parentid=pp2.revisionid" +
                  " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                  " inner join [People].Person people on aa.personId=people.revisionid" +
                  " inner join people.affiliation pa on pa.personId=people.revisionid" +
                  " inner join establishments.establishmentNode een on pa.establishmentid=een.offspringId" +
                  " inner join [identity].[user] iu on iu.personId=people.revisionid" +
                  " left outer join Places.geonamestoponym gnt on gnt.placeId=pp1.revisionid" +
                  //" left outer join Places.GeoPlanetPlace gpp on gpp.placeId=pp1.revisionid " +
                  //" left outer join Places.GeoPlanetPlaceBelongTo gppbt on gppbt.placeWoeId=gpp.woeid" +
                  //" left outer join Places.GeoPlanetPlace gpp2 on gppbt.BelongToWoeId=gpp2.woeid" +
                  //" left outer join Places.place pp2 on gpp2.placeId=pp2.revisionid " +
                  " where (pa.establishmentid=" + ancestorId + " or een.AncestorId=" + ancestorId + ") and aa.mode='public' and av.mode='public' and aa.EditSourceId is null";
            //ActivityMapCountRepository activityMapCountRepository = new ActivityMapCountRepository();
            //int endPosition = 10;
            //int startPosition = 1;

            if (input != null)
            {
                sql = AddSqlFilter(sql, input);

                string ascDesc = "desc";
                string orderBy = input.OrderBy;
                if (orderBy != null)
                {
                    orderBy = orderBy.Replace("location", "locationName");
                    if (orderBy.IndexOf("asc") > -1)
                    {
                        orderBy = orderBy.Replace("-asc", "");
                        ascDesc = "asc";
                    }
                    else
                    {
                        orderBy = orderBy.Replace("-desc", "");
                    }
                    if (orderBy.Contains("recency"))
                    {
                        if (ascDesc.Contains("desc"))
                        {
                            sql += " order by onGoingSort desc, endsOnCalc desc, startsOnCalc desc, locationName asc, lastNameSort asc, firstNameSort asc, av.title asc";
                        }
                        else
                        {
                            sql += " order by onGoingSort asc, endsOnCalc asc, startsOnCalc asc, locationName asc, lastNameSort asc, firstNameSort asc, av.title asc";
                        }
                    }
                    else if (orderBy.Contains("lastname"))
                    {
                        orderBy = "lastNameSort";
                        sql += " order by " + orderBy + " " + ascDesc + ", firstNameSort asc, onGoingSort desc, endsOnCalc desc, startsOnCalc desc, locationName asc, av.title asc";
                    }
                    else if (orderBy.Contains("locationName"))
                    {
                        sql += " order by " + orderBy + " " + ascDesc + ", onGoingSort desc, endsOnCalc desc, startsOnCalc desc, lastNameSort asc, firstNameSort asc, av.title asc";
                    }
                    else if (orderBy.Contains("title"))
                    {
                        sql += " order by " + orderBy + " " + ascDesc + ", onGoingSort desc, endsOnCalc desc, startsOnCalc desc, locationName asc, lastNameSort asc, firstNameSort asc";
                    }
                    else
                    {
                        sql += " order by " + orderBy + " " + ascDesc + ", onGoingSort desc, endsOnCalc desc, startsOnCalc desc, locationName asc, lastNameSort asc, firstNameSort asc, av.title asc";
                    }

                }
            }
            else
            {
                sql += " order by onGoingSort desc, endsOnCalc desc, startsOnCalc desc, locationName asc, lastNameSort asc, firstNameSort asc, av.title asc";

            }



            IList<ActivityQueryResultModel> ActivityQueryResult = connectionFactory.SelectList<ActivityQueryResultModel>(DB.UCosmic, sql);

            return ActivityQueryResult;
        }
        public IList<ActivityTypesApiQueryResultModel> ActivityTypesByEstablishment(int? EstablishmentId)
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            // decrypt the password. Use this once all passwords have been encrypted.
            string sql = "SELECT  id ,[Type] ,[Rank] FROM [Employees].[EmployeeActivityType] where establishmentId=3306";


            IList<ActivityTypesApiQueryResultModel> activitySnapshot = connectionFactory.SelectList<ActivityTypesApiQueryResultModel>(DB.UCosmic, sql);

            return activitySnapshot;
        }
    }
}