using System.Data.Entity;

namespace UCosmic.Cqrs
{
    public class ServicesDbInitializer : IDatabaseInitializer<UCosmicServices>
    {
        public void InitializeDatabase(UCosmicServices dbContext)
        {
#if DEBUG
            dbContext.Database.ExecuteSqlCommand(
@"
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[JsonView]') AND type in (N'U'))
    CREATE TABLE [dbo].[JsonView](
	    [Id] [int] IDENTITY(1,1) NOT NULL,
	    [Key] [nvarchar](4000) NOT NULL,
	    [Value] [ntext] NULL,
	    [UpdatedOnUtc] [datetime] NOT NULL,
     CONSTRAINT [PK_dbo.JsonView] PRIMARY KEY CLUSTERED 
    (
	    [Id] ASC
    ))
");
#endif
        }
    }
}