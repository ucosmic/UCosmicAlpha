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
    public class ProgramListAllApiReturn
    {
        public string program;
        public string name;
        public bool is_standard;
        public string establishment_id;
    }
    public class ProgramListAllRepository// : ISummaryRepository
	{

        public IList<ProgramListAllApiReturn> Program_List_All()
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT code as program, name, isStandard as is_standard, establishmentid as establishment_id " +
                "FROM [UCosmicTest].[Students].[studentprogramdata] ";
            IList<ProgramListAllApiReturn> activityLocations = connectionFactory.SelectList<ProgramListAllApiReturn>(DB.UCosmic, sql);
            
            return activityLocations;
        }
        
	}

}