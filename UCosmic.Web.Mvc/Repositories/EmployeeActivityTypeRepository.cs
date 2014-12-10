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
    public class ActivityTypesApiReturn
    {
        public int TypeId;
        public string Type;
    }
    public class EmployeeActivityTypesRepository// : ILocationsRepository
	{

        public IList<ActivityTypesApiReturn> EmployeeActivityTypes_By_establishmentId(int? EstablishmentId)
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            const string sql = "select type, id as typeId  FROM [employees].[employeeactivitytype] " +
                  " where establishmentid=3306";
            IList<ActivityTypesApiReturn> activityLocations = connectionFactory.SelectList<ActivityTypesApiReturn>(DB.UCosmic, sql);
            
            return activityLocations;
        }
        
	}
}