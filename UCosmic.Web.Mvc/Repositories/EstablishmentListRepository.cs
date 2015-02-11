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
    public class EstablishmentListApiReturn
    {
        public int forestablishmentId;
        public string text;
    }
    public class EstablishmentListRepository// : ISummaryRepository
	{

        public IList<EstablishmentListApiReturn> EstablishmentList_By_establishment(string Establishment)
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT top 10   [text], forestablishmentId FROM [Establishments].[EstablishmentName] een " +
                  " where text like '%";
            sql += Establishment + "%'";
            sql += " order by [text]";
            IList<EstablishmentListApiReturn> activityLocations = connectionFactory.SelectList<EstablishmentListApiReturn>(DB.UCosmic, sql);
            
            return activityLocations;
        }
        
	}
}