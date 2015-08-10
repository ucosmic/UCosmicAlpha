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
    }
    public class CountryListAllRepository// : ISummaryRepository
	{

        public IList<CountryListAllApiReturn> Country_List_All()
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT [RevisionId] as country, [OfficialName] as official_name " +
                "FROM [Places].[Place] " +
                "where iscountry=1";
            IList<CountryListAllApiReturn> activityLocations = connectionFactory.SelectList<CountryListAllApiReturn>(DB.UCosmic, sql);
            
            return activityLocations;
        }
        
	}

}