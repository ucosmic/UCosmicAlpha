GO
SET ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON;

SET NUMERIC_ROUNDABORT OFF;


GO
--USE [$(DatabaseName)];
--GO
PRINT N'Creating [Employees].[InternationalAffiliation]...';
GO
CREATE TABLE [Employees].[InternationalAffiliation] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [PersonId]           INT              NOT NULL,
    [From]               DATETIME         NOT NULL,
    [To]                 DATETIME         NULL,
    [OnGoing]            BIT              NOT NULL,
    [Institution]        NVARCHAR (200)   NULL,
    [Position]           NVARCHAR (100)   NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    CONSTRAINT [PK_Employees.InternationalAffiliation] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);
GO
PRINT N'Creating [Employees].[InternationalAffiliation].[IX_PersonId]...';
GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [Employees].[InternationalAffiliation]([PersonId] ASC);
GO
PRINT N'Creating [Employees].[InternationalAffiliationLocation]...';
GO
CREATE TABLE [Employees].[InternationalAffiliationLocation] (
    [RevisionId]                 INT              IDENTITY (1, 1) NOT NULL,
    [InternationalAffiliationId] INT              NOT NULL,
    [PlaceId]                    INT              NOT NULL,
    [EntityId]                   UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]               DATETIME         NOT NULL,
    [CreatedByPrincipal]         NVARCHAR (256)   NULL,
    [UpdatedOnUtc]               DATETIME         NULL,
    [UpdatedByPrincipal]         NVARCHAR (256)   NULL,
    [Version]                    ROWVERSION       NOT NULL,
    [IsCurrent]                  BIT              NOT NULL,
    [IsArchived]                 BIT              NOT NULL,
    [IsDeleted]                  BIT              NOT NULL,
    CONSTRAINT [PK_Employees.InternationalAffiliationLocation] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);
GO
PRINT N'Creating [Employees].[InternationalAffiliationLocation].[IX_PlaceId]...';
GO
CREATE NONCLUSTERED INDEX [IX_PlaceId]
    ON [Employees].[InternationalAffiliationLocation]([PlaceId] ASC);
GO
PRINT N'Creating [Employees].[InternationalAffiliationLocation].[IX_InternationalAffiliationId]...';
GO
CREATE NONCLUSTERED INDEX [IX_InternationalAffiliationId]
    ON [Employees].[InternationalAffiliationLocation]([InternationalAffiliationId] ASC);
GO
PRINT N'Creating FK_Employees.InternationalAffiliation_People.Person_PersonId...';
GO
ALTER TABLE [Employees].[InternationalAffiliation] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.InternationalAffiliation_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]);
GO
PRINT N'Creating FK_Employees.InternationalAffiliationLocation_Places.Place_PlaceId...';
GO
ALTER TABLE [Employees].[InternationalAffiliationLocation] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.InternationalAffiliationLocation_Places.Place_PlaceId] FOREIGN KEY ([PlaceId]) REFERENCES [Places].[Place] ([RevisionId]);
GO
PRINT N'Creating FK_Employees.InternationalAffiliationLocation_Employees.InternationalAffiliation_InternationalAffiliationId...';
GO
ALTER TABLE [Employees].[InternationalAffiliationLocation] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.InternationalAffiliationLocation_Employees.InternationalAffiliation_InternationalAffiliationId] FOREIGN KEY ([InternationalAffiliationId]) REFERENCES [Employees].[InternationalAffiliation] ([RevisionId]) ON DELETE CASCADE;
GO
PRINT N'Checking existing data against newly created constraints';
GO
ALTER TABLE [Employees].[InternationalAffiliation] WITH CHECK CHECK CONSTRAINT [FK_Employees.InternationalAffiliation_People.Person_PersonId];
ALTER TABLE [Employees].[InternationalAffiliationLocation] WITH CHECK CHECK CONSTRAINT [FK_Employees.InternationalAffiliationLocation_Places.Place_PlaceId];
ALTER TABLE [Employees].[InternationalAffiliationLocation] WITH CHECK CHECK CONSTRAINT [FK_Employees.InternationalAffiliationLocation_Employees.InternationalAffiliation_InternationalAffiliationId];
GO
PRINT N'Update complete.';
GO
