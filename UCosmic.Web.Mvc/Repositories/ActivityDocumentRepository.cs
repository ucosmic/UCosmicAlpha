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
    public class ActivityDocumentApiReturn
    {
        public string fileName;
        public string path;
    }
    public class ActivityDocumentRepository// : ISummaryRepository
	{

        public IList<ActivityDocumentApiReturn> ActivityDocument_By_Id(int id)
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            string sql = "SELECT TOP 1 [FileName],[Path] from [ActivitiesV2].[ActivityDocument] " +
                  " where revisionId = ";
            sql += id;

            IList<ActivityDocumentApiReturn> activityDocument = connectionFactory.SelectList<ActivityDocumentApiReturn>(DB.UCosmic, sql);
            
            return activityDocument;
        }
        
	}
}