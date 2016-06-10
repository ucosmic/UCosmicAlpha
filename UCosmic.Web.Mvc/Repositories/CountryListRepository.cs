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
    public class CountryListAllApiReturn
    {
        public int country;
        public string official_name;
        public string name;
        public string code;
        public string place_type;
        public int id;
    }
    public class CountryListAllRepository// : ISummaryRepository
	{

        public IList<CountryListAllApiReturn> Country_List_All()
        {


            //SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            //string sql = "SELECT [RevisionId] as country, [OfficialName] as official_name " +
            //    "FROM [Places].[Place] " +
            //    "where iscountry=1";

            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT p.[RevisionId] as country, p.[OfficialName] as official_name, " +
				"p2.officialName as name, p2.revisionId as id,  gpp.countryCode as code, " +
                "CASE WHEN p2.isregion = 1 THEN 'region' WHEN p2.iswater = 1 THEN 'water' WHEN p2.iscontinent = 1 THEN 'continent' ELSE '' End as place_type " +
                "FROM [Places].[Place] p " +
                "left outer join Places.GeoPlanetPlace gpp on gpp.placeId = p.revisionid " +
                "left outer join Places.GeoPlanetPlaceBelongTo gppbt on gppbt.placeWoeId = gpp.woeId " +
                "left outer join Places.GeoPlanetPlace gpp2 on gpp2.woeId = gppbt.belongToWoeId " +
                "left outer join Places.Place p2 on gpp2.placeId = p2.revisionid " +
                "and (p2.isregion = 1 or p2.iscontinent = 1 or p2.iswater=1) " +
                "where p.iscountry=1";
            IList<CountryListAllApiReturn> activityLocations = connectionFactory.SelectList<CountryListAllApiReturn>(DB.UCosmic, sql);
            
            return activityLocations;
        }
        
	}

}