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
	public class SummaryRepository : ISummaryRepository
	{

        public IList<ActivitySummaryApiQueryResultModel> ActivitySummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId, int? selectedEstablishmentId, string selectedEstablishment)
        {

            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "select distinct aa.revisionid as id, pp.officialname, eat.type, eat.id as type_id, people.revisionid as person_id  FROM [ActivitiesV2].[ActivityLocation] al" +
                  " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityTag] atag on atag.activityValuesId=av.revisionid " +
                  " inner join Places.place pp on al.placeId=pp.revisionid" +
                  " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                  " inner join [People].Person people on aa.personId=people.revisionid" +
                  " left outer join people.affiliation pa on pa.personId=people.revisionid" +
                  " inner join [identity].[user] iu on iu.personId=people.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                  " left outer join employees.employeeactivitytype eat on eat.establishmentId=iu.tenantId and eat.id = at.typeId" +
                  " left outer join establishments.establishmentNode een on pa.establishmentid=een.offspringId" +
                  " where (pa.establishmentid=" + EstablishmentId + " or een.AncestorId=" + EstablishmentId + ") and aa.mode='public' and av.mode='public' and aa.EditSourceId is null";
            if (PlaceId > 0)
            {
                sql += " and (pp.revisionid=" + PlaceId + "or (atag.DomainType = 'Place' and atag.DomainKey = " + PlaceId + "))";
            }
            if (selectedEstablishmentId > 0)
            {
                sql += " and ((atag.DomainType = 'Establishment' and atag.DomainKey = " + selectedEstablishmentId + ") or av.title like '%" + selectedEstablishment + "%' or av.contentsearchable like '%" + selectedEstablishment + "%')";
            }

            IList<ActivitySummaryApiQueryResultModel> activitySummary = connectionFactory.SelectList<ActivitySummaryApiQueryResultModel>(DB.UCosmic, sql);

            return activitySummary;
        }
        public IList<ActivityMapSummaryApiQueryResultModel> ActivityMapSummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId)
        {

            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "select distinct aa.revisionid, pp1.revisionid as id, gnt.continentcode, " +
                  " pp1.isContinent, pp1.isCountry, pp1.isRegion, pp1.isWater,gnt.countryCode, " +
                  " CASE WHEN (gnt.continentcode = 'AF' and pp1.iscontinent = 1) THEN 'Africa' " +
                  " WHEN (gnt.continentcode = 'AN' and pp1.iscontinent = 1) THEN 'Antarctica' " +
                  " WHEN (gnt.continentcode = 'AS' and pp1.iscontinent = 1) THEN 'Asia' " +
                  " WHEN (gnt.continentcode = 'EU' and pp1.iscontinent = 1) THEN 'Europe' " +
                  " WHEN (gnt.continentcode = 'NA' and pp1.iscontinent = 1) THEN 'North America' " +
                  " WHEN (gnt.continentcode = 'OC' and pp1.iscontinent = 1) THEN 'Oceana' " +
                  " WHEN (gnt.continentcode = 'SA' and pp1.iscontinent = 1) THEN 'South America' " +
                  "ELSE pp1.officialName END as officialname  " +
                  " FROM [ActivitiesV2].[ActivityLocation] al" +
                  " inner join [ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                  " left outer join [ActivitiesV2].[ActivityTag] atag on atag.activityValuesId=av.revisionid" +//may not have tags
                  " inner join Places.place pp1 on al.placeId=pp1.revisionid" +
                  " inner join [ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                  //" left outer join [ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                  " inner join [People].Person people on aa.personId=people.revisionid" +
                  " left outer join people.affiliation pa on pa.personId=people.revisionid" +
                  " left outer join establishments.establishmentNode een on pa.establishmentid=een.offspringId" +
                  " inner join [identity].[user] iu on iu.personId=people.revisionid" +
                  " left outer join employees.employeeactivitytype eat on eat.establishmentId=iu.tenantId and eat.id = at.typeId" +
                  " inner join Places.geonamestoponym gnt on gnt.placeId=pp1.revisionid" +
                  " left outer join Places.GeoPlanetPlace gpp on gpp.placeId=pp1.revisionid " +
                  " left outer join Places.GeoPlanetPlaceBelongTo gppbt on gppbt.placeWoeId=gpp.woeid" +
                  " left outer join Places.GeoPlanetPlace gpp2 on gppbt.BelongToWoeId=gpp2.woeid" +
                  " left outer join Places.place pp2 on gpp2.placeId=pp2.revisionid " +
                  " where (pa.establishmentid=" + EstablishmentId + " or een.AncestorId=" + EstablishmentId + ") and aa.mode='public' and av.mode='public' and aa.EditSourceId is null";
            if (PlaceId > 0)
            {
                sql += " and (pp.revisionid=" + PlaceId + "or (atag.DomainType = 'Place' and atag.DomainKey = " + PlaceId + "))";
            }
            //if (selectedEstablishmentId > 0)
            //{
            //    sql += " and (atag.DomainType = 'Establishment' and atag.DomainKey = " + selectedEstablishmentId + ")";
            //}


            IList<ActivityMapSummaryApiQueryResultModel> activitySummary = connectionFactory.SelectList<ActivityMapSummaryApiQueryResultModel>(DB.UCosmic, sql);

            return activitySummary;
        }

        public IList<AgreementSummaryApiQueryResultModel> AgreementSummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId, int? selectedEstablishmentId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT Distinct  aa.[Id] ,aa.[Type], pp.OfficialName " +
              "FROM [agreements].[agreementParticipant] aap " +
              "inner join [Agreements].[Agreement] aa on aa.id = aap.agreementId " +
              "inner join [agreements].[agreementParticipant] aap2 on aa.id = aap2.agreementId and aap2.isowner = 0 " +
              "inner join establishments.establishment ee on ee.revisionId = aap2.establishmentId " +
              "left outer join establishments.establishmentNode een on aap2.establishmentid=een.offspringId " +
              "inner join establishments.establishmentLocation eel on eel.revisionId = ee.revisionid " +
              "inner join establishments.establishmentLocationInPlace eelip on eelip.establishmentLocationId = eel.revisionId " +
              "inner join places.place pp on pp.revisionid = eelip.placeId and pp.iscountry = 1 " +
              " where aa.status != 'inactive' and pp.officialName is not NULL and aap.isowner = 1 and (aap.establishmentid=" + EstablishmentId + " or een.AncestorId=" + EstablishmentId + ")";
            if (PlaceId > 0)
            {
                sql += " and pp.revisionid=" + PlaceId;
            }
            if (selectedEstablishmentId > 0)
            {
                sql += " and aap2.establishmentId=" + selectedEstablishmentId;
            }
            IList<AgreementSummaryApiQueryResultModel> agreementSummary = connectionFactory.SelectList<AgreementSummaryApiQueryResultModel>(DB.UCosmic, sql);
           
            return agreementSummary;
        }
        public IList<AgreementMapSummaryApiQueryResultModel> AgreementMapSummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT Distinct  aa.[Id] , pp.OfficialName,gnt.CountryCode " +
              "FROM [agreements].[agreementParticipant] aap " +
              "inner join [Agreements].[Agreement] aa on aa.id = aap.agreementId " +
              "inner join [agreements].[agreementParticipant] aap2 on aa.id = aap2.agreementId and aap2.isowner = 0 " +
              "inner join establishments.establishment ee on ee.revisionId = aap2.establishmentId " +
              "left outer join establishments.establishmentNode een on aap2.establishmentid=een.offspringId " +
              "inner join establishments.establishmentLocation eel on eel.revisionId = ee.revisionid " +
              "inner join establishments.establishmentLocationInPlace eelip on eelip.establishmentLocationId = eel.revisionId " +
              "inner join places.place pp on pp.revisionid = eelip.placeId and pp.iscountry = 1 " +
              " inner join Places.geonamestoponym gnt on gnt.placeId=pp.revisionid " +
              " where aa.status != 'inactive' and pp.officialName is not NULL and aap.isowner = 1 and (aap.establishmentid=" + EstablishmentId + " or een.AncestorId=" + EstablishmentId + ")";
            if (PlaceId > 0)
            {
                sql += " and pp.revisionid=" + PlaceId;
            }
            //if (selectedEstablishmentId > 0)
            //{
            //    sql += " and aap2.establishmentId=" + selectedEstablishmentId;
            //}
            IList<AgreementMapSummaryApiQueryResultModel> agreementSummary = connectionFactory.SelectList<AgreementMapSummaryApiQueryResultModel>(DB.UCosmic, sql);

            return agreementSummary;
        }

        public IList<DegreeSummaryApiQueryResultModel> DegreeSummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId, int? selectedEstablishmentId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT  distinct  d.[RevisionId] as degreeId " +
              ",d.[PersonId] as personId " +
              ",d.revisionId as establishmentId " +
              ",gpp.countryCode " +
              "FROM [Employees].[Degree] d " +
              //"inner join [establishments].establishment ee on ee.revisionId = d.institutionId  " +
              //"inner join establishments.establishmentlocation el on ee.revisionId = el.revisionId  " +
              "inner join establishments.establishmentlocationInPlace elip on elip.establishmentlocationid = d.institutionId " +
              //"inner join places.place pp on pp.revisionId = elip.placeId " +
              "inner join places.geoplanetplace gpp on gpp.placeid = elip.placeId " +
              "inner join [People].Person people on d.personId=people.revisionid " +
              "left outer join people.affiliation pa on pa.personId=people.revisionid " +
              "left outer join establishments.establishmentNode een on pa.establishmentid=een.offspringId " +
              "inner join [identity].[user] iu on iu.personId=people.revisionid " +
               "where (pa.establishmentid=" + EstablishmentId +  " or een.AncestorId= " + EstablishmentId + ")";
            if (PlaceId > 0)
            {
                sql += " and elip.placeId=" + PlaceId;
            }
            if (selectedEstablishmentId > 0)
            {
                sql += " and d.institutionId=" + selectedEstablishmentId;
            }
            IList<DegreeSummaryApiQueryResultModel> degreeSummary = connectionFactory.SelectList<DegreeSummaryApiQueryResultModel>(DB.UCosmic, sql);

            return degreeSummary;
        }

        public IList<DegreeMapSummaryApiQueryResultModel> DegreeMapSummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT  distinct  d.[RevisionId] as id , pp.OfficialName,gnt.CountryCode " +
              "FROM [Employees].[Degree] d " +
              "inner join [establishments].establishment ee on ee.revisionId = d.institutionId  " +
              "inner join establishments.establishmentlocation el on ee.revisionId = el.revisionId  " +
              "inner join establishments.establishmentlocationInPlace elip on elip.establishmentlocationid = el.revisionId " +
              "inner join places.place pp on pp.revisionId = elip.placeId " +
              " inner join Places.geonamestoponym gnt on gnt.placeId=pp.revisionid " +
              "inner join [People].Person people on d.personId=people.revisionid " +
              "left outer join people.affiliation pa on pa.personId=people.revisionid " +
              "left outer join establishments.establishmentNode een on pa.establishmentid=een.offspringId " +
              "inner join [identity].[user] iu on iu.personId=people.revisionid " +
               "where (pa.establishmentid=" + EstablishmentId +  " or een.AncestorId=" + EstablishmentId + ")";
            if (PlaceId > 0)
            {
                sql += " and pp.revisionid=" + PlaceId;
            }
            //if (selectedEstablishmentId > 0)
            //{
            //    sql += " and ee.revisionId=" + selectedEstablishmentId;
            //}
            IList<DegreeMapSummaryApiQueryResultModel> degreeSummary = connectionFactory.SelectList<DegreeMapSummaryApiQueryResultModel>(DB.UCosmic, sql);

            return degreeSummary;
        }

        public IList<AffiliationSummaryApiQueryResultModel> AffiliationSummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT distinct eia.[RevisionId] as affiliationId, eia.[PersonId] as personId, [Institution] as institution " +
              "FROM [Employees].[InternationalAffiliation] eia " +
              "inner join [Employees].InternationalAffiliationLocation eial " + 
              "on eial.internationalaffiliationid = eia.revisionid " +
              "inner join places.place pp on pp.revisionid = eial.placeid " +
              "inner join people.affiliation pa on pa.personid = eia.personid " +
              "where pa.establishmentId = " + EstablishmentId;
            if (PlaceId > 0)
            {
                sql += " and pp.revisionid=" + PlaceId;
            }
            IList<AffiliationSummaryApiQueryResultModel> AffiliationSummary = connectionFactory.SelectList<AffiliationSummaryApiQueryResultModel>(DB.UCosmic, sql);

            return AffiliationSummary;
        }
        public IList<ExpertiseSummaryApiQueryResultModel> ExpertiseSummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT distinct ege.[RevisionId] as expertiseId, ege.[PersonId] as personId, [description] " +
              "FROM [Employees].[GeographicExpertise] ege " +
              "inner join employees.geographicexpertiselocation egel on egel.expertiseId = ege.revisionid " +
              "inner join places.place pp on pp.revisionid = egel.placeid " +
              "inner join people.affiliation pa on pa.personid = ege.personid " +
              "where pa.establishmentId = " + EstablishmentId;
            if (PlaceId > 0)
            {
                sql += " and pp.revisionid=" + PlaceId;
            }
            IList<ExpertiseSummaryApiQueryResultModel> ExpertiseSummary = connectionFactory.SelectList<ExpertiseSummaryApiQueryResultModel>(DB.UCosmic, sql);

            return ExpertiseSummary;
        }        
	}
}