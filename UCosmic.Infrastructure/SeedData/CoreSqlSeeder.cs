using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using UCosmic.Domain.Languages;

namespace UCosmic.SeedData
{
    public class CoreSqlSeeder : SqlSeeder
    {
        private readonly IQueryEntities _entities;
        private readonly DbContext _dbContext;

        public CoreSqlSeeder(IQueryEntities entities)
            : base(entities as DbContext)
        {
            _entities = entities;
            _dbContext = (DbContext)entities;
        }

        protected override IEnumerable<string> Files
        {
            get
            {
                return new[]
                {
                    "CoreData.sql",
                };
            }
        }

        public override void Seed()
        {
            if (!_entities.Query<Language>().Any())
            {
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



                base.Seed();
            }
        }
    }
}
