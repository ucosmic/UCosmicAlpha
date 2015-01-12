using System.Collections.Generic;
//using UCosmic.Exceptions;
using UCosmic.Interfaces;
using UCosmic.Factories;
using System.Web.Security;
using System;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;


namespace UCosmic.Repositories
{
    public class ActivitySnapshotRepository
	{

        public IList<ActivitySnapshotApiQueryResultModel> LocationsByEstablishment_Place(int? EstablishmentId)
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            // decrypt the password. Use this once all passwords have been encrypted.
            // string pw = FormsAuthentication.HashPasswordForStoringInConfigFile(password.Trim(), "sha1");
            string sql = "select aa.revisionid as id, pp.revisionId as placeId, people.revisionId as personId  FROM [ActivitiesV2].[ActivityLocation] al" +
                  " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                  " inner join Places.place pp on al.placeId=pp.revisionid" +
                  " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                  " inner join [People].Person people on aa.personId=people.revisionid" +
                  " left outer join people.affiliation pa on pa.personId=people.revisionid" +
                  " inner join [identity].[user] iu on iu.personId=people.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                  " left outer join employees.employeeactivitytype eat on eat.establishmentId=iu.tenantId and eat.id = at.typeId" +
                  " left outer join establishments.establishmentNode een on pa.establishmentid=een.offspringId" +
                  " where (pa.establishmentid=" + EstablishmentId + " or een.AncestorId=" + EstablishmentId + ") and aa.mode='public' and av.mode='public' and aa.EditSourceId is null";
            

            //const string sql = "select eat.[type],  count(eat.[type]) as typeCount  FROM [ActivitiesV2].[ActivityLocation] al" +
            //      " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
            //      " inner join Places.place pp on al.placeId=pp.revisionid" +
            //      " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
            //      " inner join [People].Person people on aa.personId=people.revisionid" +
            //      " inner join [identity].[user] iu on iu.personId=people.revisionid" +
            //      " inner join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
            //      " inner join employees.employeeactivitytype eat on eat.establishmentId=iu.tenantId" +
            //      " where iu.tenantId=3306 group by eat.[type]";
            //connectionFactory.
            IList<ActivitySnapshotApiQueryResultModel> activitySnapshot = connectionFactory.SelectList<ActivitySnapshotApiQueryResultModel>(DB.UCosmic, sql);
            //IList<ActivityLocationsApiModel> activityLocations = connectionFactory.SelectList<ActivityLocationsApiModel>(DB.UCosmic, sql, new { un = username });

            return activitySnapshot;
        }
	}
}