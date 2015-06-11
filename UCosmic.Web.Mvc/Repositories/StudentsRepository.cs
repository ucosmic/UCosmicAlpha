using System.Collections.Generic;
//using UCosmic.Exceptions;
using UCosmic.Interfaces;
using UCosmic.Factories;
using System.Web.Security;
using System;
using System.Data.Entity;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;
using System.Data.SqlClient;
using Dapper;
using System.Linq;
using UCosmic.Domain.Establishments;


namespace UCosmic.Repositories
{

    public class StudentRepository
    {


        private SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
        public int? getEstablishmentId(String OfficialName)
        {

                string sql = @"select RevisionId from [Establishments].[Establishment] where OfficialName = @uCosmicAffiliation";
                try
                {
                    var student = new
                    {
                        uCosmicAffiliation = OfficialName
                    };
                    return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, student, System.Data.CommandType.Text);
                }
                catch (System.InvalidOperationException e)
                {
                    //Return "establishment does not exist error"
                    var ee = e;
                    return null;
                }

        }
        public int getPlaceId(String country)
        {
            string sql = @"select RevisionId from [Places].[Place] where OfficialName=@country";
            try
            {
                return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, new {country = country}, System.Data.CommandType.Text);
            }
            catch (System.InvalidOperationException e)
            {
                return -1;
            }
        }
    }
}