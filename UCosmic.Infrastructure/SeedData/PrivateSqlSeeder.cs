using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using UCosmic.Domain.External;

namespace UCosmic.SeedData
{
    public class PrivateSqlSeeder : SqlSeeder
    {
        private readonly IQueryEntities _entities;

        public PrivateSqlSeeder(IQueryEntities entities)
            : base(entities as DbContext)
        {
            _entities = entities;
        }

        protected override IEnumerable<string> Files
        {
            get
            {
                var hasIntegrations = _entities.Query<ServiceIntegration>().Any();

                var baseScripts = new List<string>();
                var basePath = string.Format("{0}{1}", AppDomain.CurrentDomain.BaseDirectory, @"startup\sql\");
                const string fileName = "PrivateData.sql";

                if (File.Exists(basePath + fileName) && !hasIntegrations)
                {
                    baseScripts.Add(fileName);
                }

                return baseScripts.ToArray();
            }
        }
    }
}
