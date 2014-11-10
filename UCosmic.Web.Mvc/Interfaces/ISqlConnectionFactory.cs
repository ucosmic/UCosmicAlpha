using System.Collections.Generic;
using System.Data;
using Dapper;
using System.Linq;

namespace UCosmic.Interfaces
{
	
		public enum DB
		{
			UCosmic
		}

		public interface ISqlConnectionFactory
		{
            IDbConnection GetConnection(DB database);
            IList<x> SelectList<x>(IDbConnection connection, string sql, object arguments);
            IList<x> SelectList<x>(DB database, string sql, object arguments);
            IList<x> SelectList<x>(DB database, string sql);
			IList<x> SelectList<x>(IDbConnection connection, string sql, object parameters, CommandType commandtype);
			void Execute(IDbConnection connection, string sql, object parameters);
			void Execute(IDbConnection connection, string sql, object parameters, CommandType commandType);
			void Execute(DB database, string sql, object parameters);
			void Execute(DB database, string sql, object parameters, CommandType commandType);

		}
}