using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using Dapper;
using UCosmic.Interfaces;
using System.Configuration;

namespace UCosmic.Factories
{
	public class SqlConnectionFactory : ISqlConnectionFactory
	{
		public IDbConnection GetConnection(DB database)
		{
			//var connection = new MySql.Data.MySqlClient.MySqlConnection();
			var connection = new SqlConnection(); //MySql.Data.MySqlClient.MySqlConnection();
			switch (database)
			{
				case DB.UCosmic:
					//connection.ConnectionString = ConfigurationManager.ConnectionStrings["OrderFoodLive"].ConnectionString;// @"Driver={MySQL ODBC 3.51 Driver};SERVER=OrderFoodLive.db.9410136.hostedresource.com; DATABASE=OrderFoodLive;UID=OrderFoodLive;PWD=defense5745!T";
					connection.ConnectionString = ConfigurationManager.ConnectionStrings["UCosmicContext"].ConnectionString;// @"Driver={MySQL ODBC 3.51 Driver};SERVER=OrderFoodLive.db.9410136.hostedresource.com; DATABASE=OrderFoodLive;UID=OrderFoodLive;PWD=defense5745!T";
					//Globals.GetTrustaffMedConnectionString();
					break;
			}
			return connection;
		}
		
		public IList<x> SelectList<x>(IDbConnection connection, string sql, object arguments)
		{
			connection.Open();
			IList<x> result = connection.Query<x>(sql, arguments).ToList();
			connection.Close();
			return result;
		}

        public IList<x> SelectList<x>(IDbConnection connection, string sql)
        {
            connection.Open();
            IList<x> result = connection.Query<x>(sql).ToList();
            connection.Close();
            return result;
        }
		

		public IList<x> SelectList<x>(IDbConnection connection, string sql, object parameters, CommandType commandtype)
		{
			connection.Open();
			IList<x> result = connection.Query<x>(sql, param: parameters, commandType: commandtype).ToList();
			connection.Close();
			return result;
		}

		public IList<x> SelectList<x>(DB database, string sql, object arguments)
		{
			var connection = GetConnection(database);
			return SelectList<x>(connection, sql, arguments);
		}

        public IList<x> SelectList<x>(DB database, string sql)
        {
            var connection = GetConnection(database);
            return SelectList<x>(connection, sql);
        }

		public void Execute(IDbConnection connection, string sql, object parameters)
		{
			this.Execute(connection, sql, parameters, CommandType.StoredProcedure);
		}

		public void Execute(IDbConnection connection, string sql, object parameters, CommandType commandType)
		{
			connection.Open();
			connection.Execute(sql: sql, param: parameters, commandType: commandType);
			connection.Close();
		}

		public void Execute(DB database, string sql, object parameters)
		{
			var connection = GetConnection(database);
			Execute(connection, sql, parameters);
		}

		public void Execute(DB database, string sql, object parameters, CommandType commandType)
		{
			var connection = GetConnection(database);
			Execute(connection, sql, parameters, commandType);
		}

		public System.Int64 ExecuteWithId(DB database, string sql, object parameters, CommandType commandType)
		{
			var connection = GetConnection(database);
			connection.Open();
			var id=	connection.Query<System.Int64>(sql: sql, param: parameters, commandType: commandType).Single();
			
			connection.Close();
			return id;
		}

	}
}