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

        public IList<ActivitySummaryApiQueryResultModel> ActivitySummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId)
        {

            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "select aa.revisionid as id, pp.officialname, eat.type  FROM [ActivitiesV2].[ActivityLocation] al" +
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
            if (PlaceId > 0)
            {
                sql += " and pp.revisionid=" + PlaceId;
            }

            IList<ActivitySummaryApiQueryResultModel> activitySummary = connectionFactory.SelectList<ActivitySummaryApiQueryResultModel>(DB.UCosmic, sql);

            return activitySummary;
        }
        public IList<AgreementSummaryApiQueryResultModel> AgreementSummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT Distinct  aa.[Id] ,aa.[Type], pp.OfficialName " +
              "FROM [agreements].[agreementParticipant] aap " +
              "inner join [Agreements].[Agreement] aa on aa.id = aap.agreementId " +
              "inner join [agreements].[agreementParticipant] aap2 on aa.id = aap2.agreementId and aap2.isowner = 0 " +
              "inner join establishments.establishment ee on ee.revisionId = aap2.establishmentId " +
              "inner join establishments.establishmentLocation eel on eel.revisionId = ee.revisionid " +
              "inner join establishments.establishmentLocationInPlace eelip on eelip.establishmentLocationId = eel.revisionId " +
              "inner join places.place pp on pp.revisionid = eelip.placeId and pp.iscountry = 1 " +
              "where aa.status != 'inactive' and pp.officialName is not NULL and aap.isowner = 1 and aap.establishmentid = " + EstablishmentId ;
            if (PlaceId > 0)
            {
                sql += " and pp.revisionid=" + PlaceId;
            }
            IList<AgreementSummaryApiQueryResultModel> agreementSummary = connectionFactory.SelectList<AgreementSummaryApiQueryResultModel>(DB.UCosmic, sql);
           
            return agreementSummary;
        }

        public IList<DegreeSummaryApiQueryResultModel> DegreeSummaryByEstablishment_Place(int? EstablishmentId, int? PlaceId)
        {
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT  distinct  d.[RevisionId] as degreeId " +
              ",d.[PersonId] as personId " +
              ",ee.revisionId as establishmentId " +
              ",pp.revisionId as placeId " +
              "FROM [Employees].[Degree] d " +
              "inner join [establishments].establishment ee on ee.revisionId = d.institutionId  " +
              "inner join establishments.establishmentlocation el on ee.revisionId = el.revisionId  " +
              "inner join establishments.establishmentlocationInPlace elip on elip.establishmentlocationid = el.revisionId " +
              "inner join places.place pp on pp.revisionId = elip.placeId " +
              "inner join people.affiliation pa on pa.personid = d.personid " +
              "where pa.establishmentId = " + EstablishmentId;
            if (PlaceId > 0)
            {
                sql += " and pp.revisionid=" + PlaceId;
            }
            IList<DegreeSummaryApiQueryResultModel> degreeSummary = connectionFactory.SelectList<DegreeSummaryApiQueryResultModel>(DB.UCosmic, sql);

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