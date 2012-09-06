using System.Data.Entity;

namespace UCosmic.EntityFramework
{
    public class BrownfieldDatabaseInitializer<T> : IDatabaseInitializer<T> where T : DbContext
    {
        public void InitializeDatabase(T context)
        {
            // do nothing to initialize the database.
        }
    }
}