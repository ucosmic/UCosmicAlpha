using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;

namespace UCosmic.SeedData
{
    public class SensativeSqlSeeder : SqlSeeder
    {
        public SensativeSqlSeeder(IQueryEntities entities)
            : base(entities as DbContext)
        {
        }

        protected override IEnumerable<string> Files
        {
            get
            {
                var baseScripts = new List<string>();
                string basePath = string.Format("{0}{1}", AppDomain.CurrentDomain.BaseDirectory, @"startup\sql\");
                const string fileName = "SensativeData.sql";

                if (File.Exists(basePath + fileName))
                {
                    baseScripts.Add(fileName);
                }

                return baseScripts.ToArray();
            }
        }
    }
}
