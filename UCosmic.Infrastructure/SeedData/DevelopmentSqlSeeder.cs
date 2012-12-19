using System.Collections.Generic;
using System.Linq;

namespace UCosmic.SeedData
{
    public class DevelopmentSqlSeeder : CoreSqlSeeder
    {
        public DevelopmentSqlSeeder(IQueryEntities entities)
            : base(entities)
        {
        }

        protected override IEnumerable<string> Files
        {
            get
            {
                var baseScripts = base.Files.ToList();
                baseScripts.Add("DevelopmentData.sql");
                return baseScripts.ToArray();
            }
        }
    }
}
