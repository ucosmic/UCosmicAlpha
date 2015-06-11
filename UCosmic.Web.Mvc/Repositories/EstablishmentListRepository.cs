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
    public class EstablishmentListAllApiReturn
    {
        public int establishment;
        public string official_name;
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
    public class EstablishmentListAllRepository// : ISummaryRepository
	{

        public IList<EstablishmentListAllApiReturn> EstablishmentList_All_By_establishment()
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT ee.[RevisionId] as establishment," +
	            "Case when en.translationtolanguageid=1 then [text] else officialName end as official_name " +
                "FROM [UCosmicPreview].[Establishments].[Establishment] ee " +
                "left join establishments.establishmentname en on en.forestablishmentid = ee.revisionid and en.translationtolanguageid=1 " +
	            "where ee.iscurrent=1 and ee.isdeleted=0";
            IList<EstablishmentListAllApiReturn> activityLocations = connectionFactory.SelectList<EstablishmentListAllApiReturn>(DB.UCosmic, sql);
            
            return activityLocations;
        }
        
	}

}