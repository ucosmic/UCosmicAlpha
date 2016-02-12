using System.Collections.Generic;
//using UCosmic.Exceptions;
using UCosmic.Interfaces;
using UCosmic.Factories;
using System.Web.Security;
using System;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;
using UCosmic.Domain.Establishments;


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
        public int parent_id;
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

        public EstablishmentApiScalarModel Establishment_By_Id(int EstablishmentId)
        {
            
            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT revisionId as id, parentId, verticalRank as rank, typeId, UCosmicCode, CollegeBoardDesignatedIndicator as ceebCode, officialName, officialName as contextName, isUnverified " + 
                " FROM [Establishments].[Establishment]  " +
                  " where revisionId = " + EstablishmentId;
            IList<EstablishmentApiScalarModel> establishments = connectionFactory.SelectList<EstablishmentApiScalarModel>(DB.UCosmic, sql);

            return establishments[0];
        }
        
        public bool Update_Establishment_Name_By_Id(string officialName, int id)
        {

            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "update [Establishments].[Establishment] set officialName = @officialName where revisionid=@id";
            connectionFactory.Execute(DB.UCosmic, sql, new 
            { 
                officialName = officialName, 
                id = id
            }, System.Data.CommandType.Text);
            return true;


            //SqlConnectionFactory connectionFactory = new SqlConnectionFactory();


            //string sql = "update `Order` set paid = @paid where id=@orderId";




            ////IList<Account> users = connectionFactory.SelectList<Account>(DB.TrustaffMed, sql, new { un = username, pw = password });
            //connectionFactory.Execute(DB.OrderFoodLive, sql, new
            //{
            //    paid = 1,
            //    orderId = Convert.ToInt32(orderId)
            //}, commandType: System.Data.CommandType.Text);

        }
	}
    public class EstablishmentListAllRepository// : ISummaryRepository
	{

        public IList<EstablishmentListAllApiReturn> EstablishmentList_All_By_establishment()
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT ee.[RevisionId] as establishment, ee.parentid as parent_id, " +
	            "Case when en.translationtolanguageid=1 then [text] else officialName end as official_name " +
                "FROM [UCosmicPreview].[Establishments].[Establishment] ee " +
                "left join establishments.establishmentname en on en.forestablishmentid = ee.revisionid and en.translationtolanguageid=1 " +
	            "where ee.iscurrent=1 and ee.isdeleted=0";
            IList<EstablishmentListAllApiReturn> activityLocations = connectionFactory.SelectList<EstablishmentListAllApiReturn>(DB.UCosmic, sql);
            
            return activityLocations;
        }
        
	}

}