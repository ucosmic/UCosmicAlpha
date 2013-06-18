using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Reflection;

namespace UCosmic.SeedData
{
    public abstract class SqlSeeder : ISeedData
    {
        private readonly DbContext _dbContext;

        protected SqlSeeder(DbContext dbContext)
        {
            _dbContext = dbContext;
        }

        protected abstract IEnumerable<string> Files { get; }

        public virtual void Seed()
        {
            // get location of consuming application
            var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase);
            if (string.IsNullOrWhiteSpace(path))
                throw new InvalidOperationException("UCosmic cannot determine bin path.");
            path = path.Replace("file:\\", string.Empty);

            // this assembly is in bin folder, so go up 1 level
            var mvcDirectory = Directory.GetParent(path);
            var startupDirectory = mvcDirectory.EnumerateDirectories().Single(d => d.Name == "startup");
            var sqlDirectory = startupDirectory.EnumerateDirectories().Single(d => d.Name == "sql");
            var files = sqlDirectory.EnumerateFiles().ToList();
            ((IObjectContextAdapter)_dbContext).ObjectContext.CommandTimeout = 300;

            // temporarily preserve old Activities schema to allow preview project to run on same database
            _dbContext.Database.ExecuteSqlCommand("CREATE SCHEMA [Activities] AUTHORIZATION [dbo]");
            _dbContext.Database.ExecuteSqlCommand(@"CREATE TABLE [Activities].[Activity](
	[PersonId] [int] NOT NULL,
	[Number] [int] NOT NULL,
	[EntityId] [uniqueidentifier] NOT NULL,
	[Mode] [nvarchar](20) NOT NULL,
	[Title] [nvarchar](200) NULL,
	[Content] [ntext] NULL,
	[StartsOn] [datetime] NULL,
	[EndsOn] [datetime] NULL,
	[DraftedTitle] [nvarchar](200) NULL,
	[DraftedContent] [ntext] NULL,
	[DraftedStartsOn] [datetime] NULL,
	[DraftedEndsOn] [datetime] NULL,
	[CreatedOn] [datetime] NOT NULL,
	[UpdatedOn] [datetime] NOT NULL,
	[UpdatedByPersonId] [int] NOT NULL,
PRIMARY KEY CLUSTERED
(
	[PersonId] ASC,
	[Number] ASC
)
)
CREATE TABLE [Activities].[DraftedTag](
	[ActivityPersonId] [int] NOT NULL,
	[ActivityNumber] [int] NOT NULL,
	[Number] [int] NOT NULL,
	[Text] [nvarchar](500) NOT NULL,
	[DomainType] [nvarchar](20) NOT NULL,
	[DomainKey] [int] NULL,
PRIMARY KEY CLUSTERED
(
	[ActivityPersonId] ASC,
	[ActivityNumber] ASC,
	[Number] ASC
)
)
CREATE TABLE [Activities].[ActivityTag](
	[ActivityPersonId] [int] NOT NULL,
	[ActivityNumber] [int] NOT NULL,
	[Number] [int] NOT NULL,
	[Text] [nvarchar](500) NOT NULL,
	[DomainType] [nvarchar](20) NOT NULL,
	[DomainKey] [int] NULL,
PRIMARY KEY CLUSTERED
(
	[ActivityPersonId] ASC,
	[ActivityNumber] ASC,
	[Number] ASC
)
)
ALTER TABLE [Activities].[Activity]  WITH CHECK ADD  CONSTRAINT [Activity_Person] FOREIGN KEY([PersonId])
REFERENCES [People].[Person] ([RevisionId])
ON DELETE CASCADE
ALTER TABLE [Activities].[Activity] CHECK CONSTRAINT [Activity_Person]
ALTER TABLE [Activities].[ActivityTag]  WITH CHECK ADD  CONSTRAINT [ActivityTag_Activity] FOREIGN KEY([ActivityPersonId], [ActivityNumber])
REFERENCES [Activities].[Activity] ([PersonId], [Number])
ON DELETE CASCADE
ALTER TABLE [Activities].[ActivityTag] CHECK CONSTRAINT [ActivityTag_Activity]
ALTER TABLE [Activities].[DraftedTag]  WITH CHECK ADD  CONSTRAINT [DraftedTag_Activity] FOREIGN KEY([ActivityPersonId], [ActivityNumber])
REFERENCES [Activities].[Activity] ([PersonId], [Number])
ON DELETE CASCADE
ALTER TABLE [Activities].[DraftedTag] CHECK CONSTRAINT [DraftedTag_Activity]");

            foreach (var sqlScript in Files)
            {
                var file = files.SingleOrDefault(f => f.Name == sqlScript);
                if (file == null)
                    throw new InvalidOperationException(string.Format("Unable to locate file '{0}' in startup folder.", sqlScript));
                var sql = file.OpenText().ReadToEnd();
                _dbContext.Database.ExecuteSqlCommand(sql);
            }
        }
    }
}
