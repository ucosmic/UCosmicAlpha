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
    public class DegreesRepository
    {


        public IList<DegreeQueryResultsSearchSummary> DegreeSearchResultSummary(DegreesSearchInputModel input, int EstablishmentId)
        {
            
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT  distinct  d.[RevisionId] as degree_id " +
              ",d.[PersonId] as person_id " +
              ",d.institutionId as establishment_id " +
              ",elip.placeId as country_id " +
              "FROM [Employees].[Degree] d " +
              "inner join establishments.establishmentlocationInPlace elip on elip.establishmentlocationid = d.institutionId " +
              "inner join establishments.establishment ee on ee.revisionId = d.institutionId " +
              "inner join places.geoplanetplace gpp on gpp.placeid = elip.placeId  and gpp.typeCode=12" +
              "inner join [People].Person people on d.personId=people.revisionid " +
              "left outer join people.affiliation pa on pa.personId=people.revisionid and people.isActive=1 " +
              "left outer join establishments.establishmentNode een on pa.establishmentid=een.offspringId " +
               "where (pa.establishmentid=" + EstablishmentId + " or een.AncestorId= " + EstablishmentId + ")";
            if (input.AncestorId.HasValue)
            {
                sql += " and d.institutionId=" + input.AncestorId;
            }
            if (input.CountryCode != null)
            {
                sql += " and gpp.countryCode='" + input.CountryCode + "' ";
            }
            if (input.Keyword != null)
            {
                sql += " and (d.title='" + input.Keyword + "' or d.fieldofstudy like '%" + input.Keyword + "%' " +
                    "or d.YearAwarded like '%" + input.Keyword + "%' " +
                    "or ee.officialName like '%" + input.Keyword + "%' " +
                    "or gpp.englishName like '%" + input.Keyword + "%' " +
                    "or people.displayName like '%" + input.Keyword + "%' " + 
                    "or d.fieldofstudy like '%" + input.Keyword + "%' )" ;
            }
            IList<DegreeQueryResultsSearchSummary> degreeSummary = connectionFactory.SelectList<DegreeQueryResultsSearchSummary>(DB.UCosmic, sql);

            return degreeSummary;
        }

    }
}