﻿/*
Deployment script for UCosmicTest

This code was generated by a tool.
Changes to this file may cause incorrect behavior and will be lost if
the code is regenerated.
*/

GO
SET ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON;

SET NUMERIC_ROUNDABORT OFF;


GO
PRINT N'Creating [People].[ExternalUrl]...';


GO
CREATE TABLE [People].[ExternalUrl] (
    [Id]          INT             IDENTITY (1, 1) NOT NULL,
    [PersonId]    INT             NOT NULL,
    [Description] NVARCHAR (50)   NULL,
    [Value]       NVARCHAR (2048) NULL,
    CONSTRAINT [PK_People.ExternalUrl] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [People].[ExternalUrl].[IX_PersonId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [People].[ExternalUrl]([PersonId] ASC);


GO
PRINT N'Creating FK_People.ExternalUrl_People.Person_PersonId...';


GO
ALTER TABLE [People].[ExternalUrl] WITH NOCHECK
    ADD CONSTRAINT [FK_People.ExternalUrl_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Checking existing data against newly created constraints';


GO
ALTER TABLE [People].[ExternalUrl] WITH CHECK CHECK CONSTRAINT [FK_People.ExternalUrl_People.Person_PersonId];


GO
PRINT N'Update complete.';


GO
