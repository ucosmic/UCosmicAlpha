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
    public class EmployeeActivityTypesRepository// : ILocationsRepository
	{

        public IList<String> EmployeeActivityTypes_By_establishmentId(int? EstablishmentId)
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            const string sql = "select type  FROM [UCosmicTest].[employees].[employeeactivitytype] " +
                  " where establishmentid=3306";
            IList<String> activityLocations = connectionFactory.SelectList<String>(DB.UCosmic, sql);
            
            return activityLocations;
        }
        
	}
}