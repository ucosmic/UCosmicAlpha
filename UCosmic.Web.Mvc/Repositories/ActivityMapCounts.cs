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


namespace UCosmic.Repositories
{
    public class ActivityMapCountRepository// : ILocationsRepository
    {
        private static string AddSqlFilter(string sql, ActivitySearchInputModel input)
        {
            if (input.PlaceIds != null && input.PlaceIds.Length > 0 && input.PlaceIds[0] != 0)
            {
                sql += " and (";
                foreach ( var placeId in input.PlaceIds.Select((x,i) => new { Value = x, Index=i }) )
                {
                    if (placeId.Index > 0)
                    {
                        sql += " or al.placeId=" + placeId.Value + " or pp2.revisionid=" + placeId.Value; 
                    }
                    else
                    {
                        sql += " al.placeId=" + placeId.Value + " or pp2.revisionid=" + placeId.Value; 
                    }    
                }
                sql += ")";
            }
            if (input.ActivityTypeIds != null && input.ActivityTypeIds.Length > 0 && input.ActivityTypeIds[0] != 0)
            {
                sql += " and (";
                foreach (var activityTypeId in input.ActivityTypeIds.Select((x, i) => new { Value = x, Index = i }))
                {
                    if (activityTypeId.Index > 0)
                    {
                        sql += " or at.typeId=" + activityTypeId.Value;
                    }
                    else
                    {
                        sql += " at.typeId=" + activityTypeId.Value;
                    }
                }
                sql += ")";
            }
            if (input.PlaceNames != null && input.PlaceNames.Length > 0 && input.PlaceNames[0] != null)
            {
                sql += " and (";
                foreach ( var placeName in input.PlaceNames.Select((x,i) => new { Value = x, Index=i }) )
                {
                    if (placeName.Index > 0)
                    {
                        sql += " or pp1.officialname='" + placeName.Value + "' or pp2.officialname='" + placeName.Value + "'"; 
                    }
                    else
                    {
                        sql += " pp1.officialname='" + placeName.Value + "' or pp2.officialname='" + placeName.Value + "'"; 
                    }    
                }
                sql += ")";
            }
            if(input.IncludeUndated != null ){
                if (input.IncludeUndated == false)
                {
                    if (input.Since != null && input.Since != "")
                    {
                        sql += " and av.startson >= '" + input.Since + "'"; 
                    }
                    if (input.Until != null && input.Until != "")
                    {
                        sql += " and av.endson <= '" + input.Until + "'"; 
                    }
                }
                else
                {
                    if (input.Since != null && input.Since != "")
                    {
                        sql += " and (av.startson >= '" + input.Since + "' or av.startson is null)"; 
                    }
                    if (input.Until != null && input.Until != "")
                    {
                        sql += " and (av.endson <= '" + input.Until + "' or av.endson is null)"; 
                    }
                }
            }
            else
            {
                if (input.Since != null && input.Since != "")
                {
                    sql += " and av.startson >= '" + input.Since + "'";
                }
                if (input.Until != null && input.Until != "")
                {
                    sql += " and av.endson <= '" + input.Until + "'"; 
                }
            }
            if (input.Keyword != null && input.Keyword != "")
            {
                string[] keywords;
                keywords = input.Keyword.Split(default(string[]), StringSplitOptions.RemoveEmptyEntries);
                sql += " and (";
                foreach (var keyword in keywords.Select((x, i) => new { Value = x, Index = i }))
                {
                    if (keyword.Index > 0)
                    {

                        sql += " or pp1.officialname='" + keyword.Value + "' or pp2.officialname='" + keyword.Value + "'";
                        sql += " or people.displayname='" + keyword.Value + "' or people.firstname='" + keyword.Value + "' or people.lastname='" + keyword.Value + "'";
                        sql += " or iu.name='" + keyword.Value + "'";
                        sql += " or atag.text like '%" + keyword.Value + "%'";
                        sql += " or av.title like '%" + keyword.Value + "%' or av.contentsearchable like '%" + keyword.Value + "%'"; 
                    }
                    else
                    {
                        sql += " pp1.officialname='" + keyword.Value + "' or pp2.officialname='" + keyword.Value + "'";
                        sql += " or people.displayname='" + keyword.Value + "' or people.firstname='" + keyword.Value + "' or people.lastname='" + keyword.Value + "'";
                        sql += " or iu.name='" + keyword.Value + "'";
                        sql += " or atag.text like '%" + keyword.Value + "%'";
                        sql += " or av.title like '%" + keyword.Value + "%' or av.contentsearchable like '%" + keyword.Value + "%'"; 
                    }
                }
                sql += ")";
            }
            return sql;
        }
        public IList<ActivityMapCountsApiQueryResultModel> ActivityMapCount_Country(ActivitySearchInputModel input, int? ancestorId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "select distinct aa.revisionid, pp1.revisionid as id,  pp1.latitude, pp1.longitude, gnt.continentcode as code, " +
                  " pp1.isContinent, pp1.isCountry, pp1.isRegion, pp1.isWater," + 
                  " CASE WHEN (gnt.continentcode = 'AF' and pp1.iscontinent = 1) THEN 'Africa' " +
                  " WHEN (gnt.continentcode = 'AN' and pp1.iscontinent = 1) THEN 'Antarctica' " +
                  " WHEN (gnt.continentcode = 'AS' and pp1.iscontinent = 1) THEN 'Asia' " +
                  " WHEN (gnt.continentcode = 'EU' and pp1.iscontinent = 1) THEN 'Europe' " +
                  " WHEN (gnt.continentcode = 'NA' and pp1.iscontinent = 1) THEN 'North America' " +
                  " WHEN (gnt.continentcode = 'OC' and pp1.iscontinent = 1) THEN 'Oceana' " +
                  " WHEN (gnt.continentcode = 'SA' and pp1.iscontinent = 1) THEN 'South America' " +
                  "ELSE pp1.officialName END as name  " +
                " FROM [ActivitiesV2].[ActivityLocation] al" +
                  " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                  " inner join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityTag] atag on atag.activityValuesId=av.revisionid" +//may not have tags
                  " inner join Places.place pp1 on al.placeId=pp1.revisionid" +
                  " left outer join Places.place pp2 on pp1.parentid=pp2.revisionid" +
                  " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                  " inner join [People].Person people on aa.personId=people.revisionid" +
                  " inner join [identity].[user] iu on iu.personId=people.revisionid" +
                  " inner join Places.geonamestoponym gnt on gnt.placeId=pp1.revisionid" +
                  " where iu.tenantId=" + ancestorId + " and aa.mode='public'";
            //ActivityMapCountRepository activityMapCountRepository = new ActivityMapCountRepository();
            if (input != null)
            {
                sql = AddSqlFilter(sql, input);
            }

            
            IList<ActivityMapCountsApiQueryResultModel> ActivityMapCounts = connectionFactory.SelectList<ActivityMapCountsApiQueryResultModel>(DB.UCosmic, sql);

            return ActivityMapCounts;
        }
        public IList<ActivityMapCountsApiQueryResultModel> ActivityMapCount_Water(ActivitySearchInputModel input, int? ancestorId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "select distinct aa.revisionid, pp1.revisionid as id, pp1.officialName as name, pp1.latitude, pp1.longitude, code = '' FROM [ActivitiesV2].[ActivityLocation] al" +
                  " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                  " inner join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityTag] atag on atag.activityValuesId=av.revisionid" +//may not have tags
                  " inner join Places.place pp1 on al.placeId=pp1.revisionid" +
                  " left outer join Places.place pp2 on pp1.parentid=pp2.revisionid" + // may not need but would have to change filter
                  " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                  " inner join [People].Person people on aa.personId=people.revisionid" +
                  " inner join [identity].[user] iu on iu.personId=people.revisionid" +
                  " where iu.tenantId=" + ancestorId + " and pp1.isWater = 1 and aa.mode='public'";
            if (input != null)
            {
                sql = AddSqlFilter(sql, input);
            }
            //if(Type == "country"){
            //    sql += "pp1.isCountry = 1";
            //}
            IList<ActivityMapCountsApiQueryResultModel> ActivityMapCounts = connectionFactory.SelectList<ActivityMapCountsApiQueryResultModel>(DB.UCosmic, sql);

            return ActivityMapCounts;
        }

        public IList<ActivityMapCountsApiQueryResultModel> ActivityMapCount_Continent(ActivitySearchInputModel input, int? ancestorId)
        {

            
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "select distinct aa.revisionid, pp1.revisionid as id, pp1.latitude, pp1.longitude, pp1.isContinent, " +
                  " CASE WHEN pp1.iswater = 1 THEN 'WATER' WHEN pp1.isearth = 1 THEN 'GLOBAL' ELSE gnt.continentcode END as code, " + 
                  "CASE WHEN pp1.iswater = 1 THEN 'Bodies Of Water' WHEN pp1.isearth = 1 THEN 'Global'  " + 
                  "WHEN gnt.continentcode = 'AF' THEN 'Africa' " + 
                  "WHEN gnt.continentcode = 'AN' THEN 'Antarctica' " + 
                  " WHEN gnt.continentcode = 'AS' THEN 'Aisa' " + 
                  "WHEN gnt.continentcode = 'EU' THEN 'Europe' " + 
                  "WHEN gnt.continentcode = 'NA' THEN 'North America' " + 
                  "WHEN gnt.continentcode = 'OC' THEN 'Oceana' " + 
                  "ELSE 'South America' END as name  " + 
                  " FROM [ActivitiesV2].[ActivityLocation] al" +
                  " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                  " inner join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityTag] atag on atag.activityValuesId=av.revisionid" +//may not have tags
                  " inner join Places.place pp1 on al.placeId=pp1.revisionid" +
                  " left outer join Places.place pp2 on pp1.parentid=pp2.revisionid" +//may not have parent
                  " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                  " inner join [People].Person people on aa.personId=people.revisionid" +
                  " inner join [identity].[user] iu on iu.personId=people.revisionid" +
                  " inner join Places.geonamestoponym gnt on gnt.placeId=pp1.revisionid" +
                  " where iu.tenantId=" + ancestorId + " and pp1.isregion != 1 and aa.mode='public'";
            if (input != null)
            {
                sql = AddSqlFilter(sql, input);
            }
            //if(Type == "country"){
            //    sql += "pp1.isCountry = 1";
            //}
            IList<ActivityMapCountsApiQueryResultModel> ActivityMapCounts = connectionFactory.SelectList<ActivityMapCountsApiQueryResultModel>(DB.UCosmic, sql);

            return ActivityMapCounts;
        }
    }
}