GO
SET ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON;

SET NUMERIC_ROUNDABORT OFF;
GO
--USE [$(DatabaseName)];
--GO



-- RAISE ERRORS

/*
Table [InstitutionalAgreements].[InstitutionalAgreementConfiguration] is being dropped.  Deployment will halt if the table contains data.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementConfiguration])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO

/*
Table [InstitutionalAgreements].[InstitutionalAgreementContact] is being dropped.  Deployment will halt if the table contains data.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementContact])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO

/*
Table [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue] is being dropped.  Deployment will halt if the table contains data.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO

/*
Table [InstitutionalAgreements].[InstitutionalAgreementFile] is being dropped.  Deployment will halt if the table contains data.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementFile])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO

/*
Table [InstitutionalAgreements].[InstitutionalAgreementNode] is being dropped.  Deployment will halt if the table contains data.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementNode])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO

/*
Table [InstitutionalAgreements].[InstitutionalAgreementParticipant] is being dropped.  Deployment will halt if the table contains data.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementParticipant])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO

/*
Table [InstitutionalAgreements].[InstitutionalAgreementStatusValue] is being dropped.  Deployment will halt if the table contains data.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementStatusValue])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO

/*
Table [InstitutionalAgreements].[InstitutionalAgreementTypeValue] is being dropped.  Deployment will halt if the table contains data.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementTypeValue])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO



-- DROP CONSTRAINTS

PRINT N'Dropping FK_People.Affiliation_Establishments.Establishment_EstablishmentId...';
GO
ALTER TABLE [People].[Affiliation] DROP CONSTRAINT [FK_People.Affiliation_Establishments.Establishment_EstablishmentId];
GO
PRINT N'Dropping FK_People.Affiliation_People.Person_PersonId...';
GO
ALTER TABLE [People].[Affiliation] DROP CONSTRAINT [FK_People.Affiliation_People.Person_PersonId];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementContact_InstitutionalAgreements.InstitutionalAgreement_AgreementId...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContact] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementContact_InstitutionalAgreements.InstitutionalAgreement_AgreementId];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementFile_InstitutionalAgreements.InstitutionalAgreement_AgreementId...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementFile] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementFile_InstitutionalAgreements.InstitutionalAgreement_AgreementId];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_AncestorId...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementNode] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_AncestorId];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_OffspringId...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementNode] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_OffspringId];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementParticipant_InstitutionalAgreements.InstitutionalAgreement_AgreementId...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementParticipant_InstitutionalAgreements.InstitutionalAgreement_AgreementId];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementContactTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Co...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementContactTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Co];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementStatusValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configu...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementStatusValue] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementStatusValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configu];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configura...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementTypeValue] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configura];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreement_InstitutionalAgreements.InstitutionalAgreement_UmbrellaId...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreement] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreement_InstitutionalAgreements.InstitutionalAgreement_UmbrellaId];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementConfiguration_Establishments.Establishment_ForEstablishmentId...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementConfiguration] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementConfiguration_Establishments.Establishment_ForEstablishmentId];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementContact_People.Person_PersonId...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContact] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementContact_People.Person_PersonId];
GO
PRINT N'Dropping FK_InstitutionalAgreements.InstitutionalAgreementParticipant_Establishments.Establishment_EstablishmentId...';
GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant] DROP CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementParticipant_Establishments.Establishment_EstablishmentId];
GO



-- DROP TABLES

IF EXISTS (select top 1 1 from [Activities].[ActivityType])
    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
GO
PRINT N'Dropping [Activities].[ActivityType]...';
GO
DROP TABLE [Activities].[ActivityType];
GO
--PRINT N'Dropping [InstitutionalAgreements].[InstitutionalAgreement]...';
--GO
--DROP TABLE [InstitutionalAgreements].[InstitutionalAgreement];
--GO
--PRINT N'Dropping [InstitutionalAgreements].[InstitutionalAgreementConfiguration]...';
--GO
--DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementConfiguration];
--GO
--PRINT N'Dropping [InstitutionalAgreements].[InstitutionalAgreementContact]...';
--GO
--DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementContact];
--GO
--PRINT N'Dropping [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue]...';
--GO
--DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue];
--GO
--PRINT N'Dropping [InstitutionalAgreements].[InstitutionalAgreementFile]...';
--GO
--DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementFile];
--GO
--PRINT N'Dropping [InstitutionalAgreements].[InstitutionalAgreementNode]...';
--GO
--DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementNode];
--GO
--PRINT N'Dropping [InstitutionalAgreements].[InstitutionalAgreementParticipant]...';
--GO
--DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant];
--GO
--PRINT N'Dropping [InstitutionalAgreements].[InstitutionalAgreementStatusValue]...';
--GO
--DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementStatusValue];
--GO
--PRINT N'Dropping [InstitutionalAgreements].[InstitutionalAgreementTypeValue]...';
--GO
--DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementTypeValue];
--GO



-- CREATE SCHEMAS

PRINT N'Creating [Agreements]...';
GO
CREATE SCHEMA [Agreements]
    AUTHORIZATION [dbo];
GO
PRINT N'Creating [External]...';
GO
CREATE SCHEMA [External]
    AUTHORIZATION [dbo];
GO



-- ALTER EmployeeModuleSettings

PRINT N'Altering [Employees].[EmployeeModuleSettings]...';
GO
/*
The column [Employees].[EmployeeModuleSettings].[EstablishmentsExternalSyncDate] is being dropped, data loss could occur.

The column [Employees].[EmployeeModuleSettings].[EstablishmentsLastUpdateAttempt] is being dropped, data loss could occur.

The column [Employees].[EmployeeModuleSettings].[EstablishmentsLastUpdateResult] is being dropped, data loss could occur.

The column [Employees].[EmployeeModuleSettings].[EstablishmentsUpdateFailCount] is being dropped, data loss could occur.
*/
--IF EXISTS (select top 1 1 from [Employees].[EmployeeModuleSettings])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO
ALTER TABLE [Employees].[EmployeeModuleSettings] DROP COLUMN [EstablishmentsExternalSyncDate], COLUMN [EstablishmentsLastUpdateAttempt], COLUMN [EstablishmentsLastUpdateResult], COLUMN [EstablishmentsUpdateFailCount];
GO



-- ALTER Activities.Activity

PRINT N'Altering [Activities].[Activity]...';
GO
/*
The column [Activities].[Activity].[CountryId] is being dropped, data loss could occur.

The column [Activities].[Activity].[DraftedCountryId] is being dropped, data loss could occur.

The column [Activities].[Activity].[DraftedTypeId] is being dropped, data loss could occur.

The column [Activities].[Activity].[TypeId] is being dropped, data loss could occur.
*/
--IF EXISTS (select top 1 1 from [Activities].[Activity])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO
ALTER TABLE [Activities].[Activity] DROP COLUMN [CountryId], COLUMN [DraftedCountryId], COLUMN [DraftedTypeId], COLUMN [TypeId];
GO



-- REBUILD Affiliation

PRINT N'Starting rebuilding table [People].[Affiliation]...';
GO
/*
The column [People].[Affiliation].[CreatedOnUtc] on table [People].[Affiliation] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.

The column [People].[Affiliation].[EntityId] on table [People].[Affiliation] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.

The column [People].[Affiliation].[IsArchived] on table [People].[Affiliation] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.

The column [People].[Affiliation].[IsCurrent] on table [People].[Affiliation] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.

The column [People].[Affiliation].[IsDeleted] on table [People].[Affiliation] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/
--IF EXISTS (select top 1 1 from [People].[Affiliation])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [People].[tmp_ms_xx_Affiliation] (
    [RevisionId]                    INT              IDENTITY (1, 1) NOT NULL,
    [PersonId]                      INT              NOT NULL,
    [EstablishmentId]               INT              NOT NULL,
    [JobTitles]                     NVARCHAR (500)   NULL,
    [IsDefault]                     BIT              NOT NULL,
    [IsPrimary]                     BIT              NOT NULL,
    [IsAcknowledged]                BIT              NOT NULL,
    [IsClaimingStudent]             BIT              NOT NULL,
    [IsClaimingEmployee]            BIT              NOT NULL,
    [IsClaimingInternationalOffice] BIT              NOT NULL,
    [IsClaimingAdministrator]       BIT              NOT NULL,
    [IsClaimingFaculty]             BIT              NOT NULL,
    [IsClaimingStaff]               BIT              NOT NULL,
    [CampusId]                      INT              NULL,
    [CollegeId]                     INT              NULL,
    [DepartmentId]                  INT              NULL,
    [FacultyRankId]                 INT              NULL,
    [EntityId]                      UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]                  DATETIME         NOT NULL,
    [CreatedByPrincipal]            NVARCHAR (256)   NULL,
    [UpdatedOnUtc]                  DATETIME         NULL,
    [UpdatedByPrincipal]            NVARCHAR (256)   NULL,
    [Version]                       ROWVERSION       NOT NULL,
    [IsCurrent]                     BIT              NOT NULL,
    [IsArchived]                    BIT              NOT NULL,
    [IsDeleted]                     BIT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_People.Affiliation] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [People].[Affiliation])
    BEGIN
        
        INSERT INTO [People].[tmp_ms_xx_Affiliation] ([PersonId], [EstablishmentId], [JobTitles], [IsDefault], [IsPrimary], [IsAcknowledged], [IsClaimingStudent], [IsClaimingEmployee], [IsClaimingInternationalOffice], [IsClaimingAdministrator], [IsClaimingFaculty], [IsClaimingStaff], [EntityId], [CreatedOnUtc], [IsCurrent], [IsArchived], [IsDeleted])
        SELECT [PersonId],
               [EstablishmentId],
               [JobTitles],
               [IsDefault],
               [IsPrimary],
               [IsAcknowledged],
               [IsClaimingStudent],
               [IsClaimingEmployee],
               [IsClaimingInternationalOffice],
               [IsClaimingAdministrator],
               [IsClaimingFaculty],
               [IsClaimingStaff],
               NEWID(),
               GETUTCDATE(),
               1,
               0,
               0
        FROM   [People].[Affiliation]
        ORDER BY [PersonId] ASC, [EstablishmentId] ASC;
    END

DROP TABLE [People].[Affiliation];

EXECUTE sp_rename N'[People].[tmp_ms_xx_Affiliation]', N'Affiliation';

EXECUTE sp_rename N'[People].[tmp_ms_xx_constraint_PK_People.Affiliation]', N'PK_People.Affiliation', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [People].[Affiliation].[IX_EstablishmentId]...';
GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentId]
    ON [People].[Affiliation]([EstablishmentId] ASC);
GO
PRINT N'Creating [People].[Affiliation].[IX_PersonId]...';
GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [People].[Affiliation]([PersonId] ASC);
GO



-- REBUILD AgreementSettingsTypeValue

PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementTypeValue]...';
GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Agreements].[AgreementSettingsTypeValue] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [ConfigurationId] INT            NOT NULL,
    [Text]            NVARCHAR (150) NOT NULL,
    CONSTRAINT [PK_Agreements.AgreementSettingsTypeValue] PRIMARY KEY CLUSTERED ([Id] ASC)
);
IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementTypeValue])
    BEGIN
        SET IDENTITY_INSERT [Agreements].[AgreementSettingsTypeValue] ON;
        INSERT INTO [Agreements].[AgreementSettingsTypeValue] ([Id], [ConfigurationId], [Text])
        SELECT   [Id],
                 [ConfigurationId],
                 [Text]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementTypeValue]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [Agreements].[AgreementSettingsTypeValue] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementTypeValue];

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Agreements].[AgreementSettingsTypeValue].[IX_ConfigurationId]...';
GO
CREATE NONCLUSTERED INDEX [IX_ConfigurationId]
    ON [Agreements].[AgreementSettingsTypeValue]([ConfigurationId] ASC);
GO



-- REBUILD AgreementSettingsStatusValue

PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementStatusValue]...';
GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Agreements].[AgreementSettingsStatusValue] (
    [Id]              INT           IDENTITY (1, 1) NOT NULL,
    [ConfigurationId] INT           NOT NULL,
    [Text]            NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_Agreements.AgreementSettingsStatusValue] PRIMARY KEY CLUSTERED ([Id] ASC)
);
IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementStatusValue])
    BEGIN
        SET IDENTITY_INSERT [Agreements].[AgreementSettingsStatusValue] ON;
        INSERT INTO [Agreements].[AgreementSettingsStatusValue] ([Id], [ConfigurationId], [Text])
        SELECT   [Id],
                 [ConfigurationId],
                 [Text]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementStatusValue]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [Agreements].[AgreementSettingsStatusValue] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementStatusValue];

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Agreements].[AgreementSettingsStatusValue].[IX_ConfigurationId]...';
GO
CREATE NONCLUSTERED INDEX [IX_ConfigurationId]
    ON [Agreements].[AgreementSettingsStatusValue]([ConfigurationId] ASC);
GO



-- REBUILD AgreementSettingsContactTypeValue

PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue]...';
GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Agreements].[AgreementSettingsContactTypeValue] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [ConfigurationId] INT            NOT NULL,
    [Text]            NVARCHAR (150) NOT NULL,
    CONSTRAINT [PK_Agreements.AgreementSettingsContactTypeValue] PRIMARY KEY CLUSTERED ([Id] ASC)
);
IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue])
    BEGIN
        SET IDENTITY_INSERT [Agreements].[AgreementSettingsContactTypeValue] ON;
        INSERT INTO [Agreements].[AgreementSettingsContactTypeValue] ([Id], [ConfigurationId], [Text])
        SELECT   [Id],
                 [ConfigurationId],
                 [Text]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [Agreements].[AgreementSettingsContactTypeValue] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue];

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Agreements].[AgreementSettingsContactTypeValue].[IX_ConfigurationId]...';
GO
CREATE NONCLUSTERED INDEX [IX_ConfigurationId]
    ON [Agreements].[AgreementSettingsContactTypeValue]([ConfigurationId] ASC);
GO



-- REBUILD Agreement

PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreement]...';
GO
/*
The column [InstitutionalAgreements].[InstitutionalAgreement].[EntityId] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreement].[IsArchived] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreement].[IsCurrent] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreement].[IsDeleted] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreement].[RevisionId] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreement].[Guid] on table [InstitutionalAgreements].[InstitutionalAgreement] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreement])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Agreements].[Agreement] (
    [Id]                    INT              IDENTITY (1, 1) NOT NULL,
    [Guid]                  UNIQUEIDENTIFIER NOT NULL,
    [UmbrellaId]            INT              NULL,
    [Title]                 NVARCHAR (500)   NOT NULL,
    [IsTitleDerived]        BIT              NOT NULL,
    [Name]                  NVARCHAR (MAX)   NULL,
    [Description]           NVARCHAR (MAX)   NULL,
    [Notes]                 NVARCHAR (MAX)   NULL,
    [Type]                  NVARCHAR (150)   NOT NULL,
    [IsAutoRenew]           BIT              NULL,
    [Status]                NVARCHAR (50)    NOT NULL,
    [StartsOn]              DATETIME         NOT NULL,
    [ExpiresOn]             DATETIME         NOT NULL,
    [IsExpirationEstimated] BIT              NOT NULL,
    [Visibility]            NVARCHAR (20)    NOT NULL,
    [CreatedOnUtc]          DATETIME         NOT NULL,
    [CreatedByPrincipal]    NVARCHAR (256)   NULL,
    [UpdatedOnUtc]          DATETIME         NULL,
    [UpdatedByPrincipal]    NVARCHAR (256)   NULL,
    [Version]               ROWVERSION       NOT NULL,
    CONSTRAINT [PK_Agreements.Agreement] PRIMARY KEY CLUSTERED ([Id] ASC)
);
IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreement])
    BEGIN
        SET IDENTITY_INSERT [Agreements].[Agreement] ON;
        INSERT INTO [Agreements].[Agreement] ([Id], [Guid], [UmbrellaId], [Title], [IsTitleDerived], [Name], [Description], [Type], [IsAutoRenew], [Status], [StartsOn], [ExpiresOn], [IsExpirationEstimated], [Visibility], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal])
        SELECT [RevisionId],
               [EntityId],
               [UmbrellaId],
               [Title],
               [IsTitleDerived],
               CASE WHEN [IsTitleDerived] = 1 THEN NULL ELSE [Title] END AS [Name],
               [Description],
               [Type],
               [IsAutoRenew],
               [Status],
               [StartsOn],
               [ExpiresOn],
               [IsExpirationEstimated],
               [Visibility],
               [CreatedOnUtc],
               [CreatedByPrincipal],
               [UpdatedOnUtc],
               [UpdatedByPrincipal]
        FROM   [InstitutionalAgreements].[InstitutionalAgreement]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Agreements].[Agreement] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreement];

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Agreements].[Agreement].[IX_UmbrellaId]...';
GO
CREATE NONCLUSTERED INDEX [IX_UmbrellaId]
    ON [Agreements].[Agreement]([UmbrellaId] ASC);
GO



-- REBUILD AgreementNode

PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementNode]...';
GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Agreements].[AgreementNode] (
    [AncestorId]  INT NOT NULL,
    [OffspringId] INT NOT NULL,
    [Separation]  INT NOT NULL,
    CONSTRAINT [PK_Agreements.AgreementNode] PRIMARY KEY CLUSTERED ([AncestorId] ASC, [OffspringId] ASC)
);
IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementNode])
    BEGIN
        INSERT INTO [Agreements].[AgreementNode] ([AncestorId], [OffspringId], [Separation])
        SELECT   [AncestorId],
                 [OffspringId],
                 [Separation]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementNode]
        ORDER BY [AncestorId] ASC, [OffspringId] ASC;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementNode];

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Agreements].[AgreementNode].[IX_OffspringId]...';
GO
CREATE NONCLUSTERED INDEX [IX_OffspringId]
    ON [Agreements].[AgreementNode]([OffspringId] ASC);
GO
PRINT N'Creating [Agreements].[AgreementNode].[IX_AncestorId]...';
GO
CREATE NONCLUSTERED INDEX [IX_AncestorId]
    ON [Agreements].[AgreementNode]([AncestorId] ASC);
GO



-- REBUILD AgreementParticipant

PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementParticipant]...';
GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Agreements].[AgreementParticipant] (
    [Id]              INT IDENTITY (1, 1) NOT NULL,
    [IsOwner]         BIT NOT NULL,
    [AgreementId]     INT NOT NULL,
    [EstablishmentId] INT NOT NULL,
    CONSTRAINT [PK_Agreements.AgreementParticipant] PRIMARY KEY CLUSTERED ([Id] ASC)
);
IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementParticipant])
    BEGIN
        SET IDENTITY_INSERT [Agreements].[AgreementParticipant] ON;
        INSERT INTO [Agreements].[AgreementParticipant] ([Id], [IsOwner], [EstablishmentId], [AgreementId])
        SELECT   [Id],
                 [IsOwner],
                 [EstablishmentId],
                 [AgreementId]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementParticipant]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [Agreements].[AgreementParticipant] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant];

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Agreements].[AgreementParticipant].[IX_EstablishmentId]...';
GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentId]
    ON [Agreements].[AgreementParticipant]([EstablishmentId] ASC);
GO
PRINT N'Creating [Agreements].[AgreementParticipant].[IX_AgreementId]...';
GO
CREATE NONCLUSTERED INDEX [IX_AgreementId]
    ON [Agreements].[AgreementParticipant]([AgreementId] ASC);
GO



-- REBUILD AgreementContact

PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementContact]...';
GO
/*
The column [InstitutionalAgreements].[InstitutionalAgreementContact].[EntityId] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementContact].[IsArchived] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementContact].[IsCurrent] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementContact].[IsDeleted] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementContact].[RevisionId] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementContact].[Guid] on table [InstitutionalAgreements].[InstitutionalAgreementContact] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementContact])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

--GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Agreements].[AgreementContact] (
    [Id]                       INT              IDENTITY (1, 1) NOT NULL,
    [Guid]                     UNIQUEIDENTIFIER NOT NULL,
    [AgreementId]              INT              NOT NULL,
    [PersonId]                 INT              NOT NULL,
    [ParticipantAffiliationId] INT              NULL,
    [Type]                     NVARCHAR (150)   NOT NULL,
    [Title]                    NVARCHAR (300)   NULL,
    [CreatedOnUtc]             DATETIME         NOT NULL,
    [CreatedByPrincipal]       NVARCHAR (256)   NULL,
    [UpdatedOnUtc]             DATETIME         NULL,
    [UpdatedByPrincipal]       NVARCHAR (256)   NULL,
    [Version]                  ROWVERSION       NOT NULL,
    CONSTRAINT [PK_Agreements.AgreementContact] PRIMARY KEY CLUSTERED ([Id] ASC)
);
IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementContact])
    BEGIN
        SET IDENTITY_INSERT [Agreements].[AgreementContact] ON;
        INSERT INTO [Agreements].[AgreementContact] ([Id], [Guid], [AgreementId], [Type], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [PersonId])
        SELECT [RevisionId],
               [EntityId],
               [AgreementId],
               [Type],
               [CreatedOnUtc],
               [CreatedByPrincipal],
               [UpdatedOnUtc],
               [UpdatedByPrincipal],
               [PersonId]
        FROM   [InstitutionalAgreements].[InstitutionalAgreementContact]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Agreements].[AgreementContact] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementContact];

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Agreements].[AgreementContact].[IX_PersonId]...';
GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [Agreements].[AgreementContact]([PersonId] ASC);
GO
PRINT N'Creating [Agreements].[AgreementContact].[IX_ParticipantAffiliationId]...';
GO
CREATE NONCLUSTERED INDEX [IX_ParticipantAffiliationId]
    ON [Agreements].[AgreementContact]([ParticipantAffiliationId] ASC);
GO
PRINT N'Creating [Agreements].[AgreementContact].[IX_AgreementId]...';
GO
CREATE NONCLUSTERED INDEX [IX_AgreementId]
    ON [Agreements].[AgreementContact]([AgreementId] ASC);
GO



-- REBUILD AgreementFile

PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementFile]...';
GO
/*
The column [InstitutionalAgreements].[InstitutionalAgreementFile].[Content] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementFile].[EntityId] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementFile].[IsArchived] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementFile].[IsCurrent] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementFile].[IsDeleted] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementFile].[RevisionId] is being dropped, data loss could occur.

The column [InstitutionalAgreements].[InstitutionalAgreementFile].[Guid] on table [InstitutionalAgreements].[InstitutionalAgreementFile] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/
--IF EXISTS (select top 1 1 from [InstitutionalAgreements].[InstitutionalAgreementFile])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT
--GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Agreements].[AgreementFile] (
    [Id]                 INT              IDENTITY (1, 1) NOT NULL,
    [Guid]               UNIQUEIDENTIFIER NOT NULL,
    [AgreementId]        INT              NOT NULL,
    [Length]             INT              NOT NULL,
    [MimeType]           NVARCHAR (MAX)   NULL,
    [Name]               NVARCHAR (MAX)   NULL,
    [Path]               NVARCHAR (MAX)   NULL,
    [FileName]           NVARCHAR (MAX)   NULL,
    [Visibility]		 NVARCHAR (20)   NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    CONSTRAINT [PK_Agreements.AgreementFile] PRIMARY KEY CLUSTERED ([Id] ASC)
);
IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementFile])
    BEGIN
        SET IDENTITY_INSERT [Agreements].[AgreementFile] ON;
        INSERT INTO [Agreements].[AgreementFile] ([Id], [Guid], [AgreementId], [Length], [MimeType], [Name], [Path], [FileName], [Visibility], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal])
        SELECT [RevisionId],
               [EntityId],
               [AgreementId],
               [Length],
               [MimeType],
               [Name],
               [Path],
               [Name],
               'Protected',
               [CreatedOnUtc],
               [CreatedByPrincipal],
               [UpdatedOnUtc],
               [UpdatedByPrincipal]
        FROM   [InstitutionalAgreements].[InstitutionalAgreementFile]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Agreements].[AgreementFile] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementFile];

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Agreements].[AgreementFile].[IX_AgreementId]...';
GO
CREATE NONCLUSTERED INDEX [IX_AgreementId]
    ON [Agreements].[AgreementFile]([AgreementId] ASC);
GO



-- REBUILD AgreementSettings

PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementConfiguration]...';
GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Agreements].[AgreementSettings] (
    [RevisionId]                 INT              IDENTITY (1, 1) NOT NULL,
    [ForEstablishmentId]         INT              NULL,
    [IsCustomTypeAllowed]        BIT              NOT NULL,
    [IsCustomStatusAllowed]      BIT              NOT NULL,
    [IsCustomContactTypeAllowed] BIT              NOT NULL,
    [EntityId]                   UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]               DATETIME         NOT NULL,
    [CreatedByPrincipal]         NVARCHAR (256)   NULL,
    [UpdatedOnUtc]               DATETIME         NULL,
    [UpdatedByPrincipal]         NVARCHAR (256)   NULL,
    [Version]                    ROWVERSION       NOT NULL,
    [IsCurrent]                  BIT              NOT NULL,
    [IsArchived]                 BIT              NOT NULL,
    [IsDeleted]                  BIT              NOT NULL,
    CONSTRAINT [PK_Agreements.AgreementSettings] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);
IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementConfiguration])
    BEGIN
        SET IDENTITY_INSERT [Agreements].[AgreementSettings] ON;
        INSERT INTO [Agreements].[AgreementSettings] ([RevisionId], [ForEstablishmentId], [IsCustomTypeAllowed], [IsCustomStatusAllowed], [IsCustomContactTypeAllowed], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted])
        SELECT   [RevisionId],
                 [ForEstablishmentId],
                 [IsCustomTypeAllowed],
                 [IsCustomStatusAllowed],
                 [IsCustomContactTypeAllowed],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementConfiguration]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Agreements].[AgreementSettings] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementConfiguration];

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO
PRINT N'Creating [Agreements].[AgreementSettings].[IX_ForEstablishmentId]...';
GO
CREATE NONCLUSTERED INDEX [IX_ForEstablishmentId]
    ON [Agreements].[AgreementSettings]([ForEstablishmentId] ASC);
GO



-- CREATE TABLES

PRINT N'Creating [External].[ServiceSync]...';
GO
CREATE TABLE [External].[ServiceSync] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [RowVersion]        ROWVERSION     NOT NULL,
    [Name]              VARCHAR (32)   NULL,
    [ExternalSyncDate]  DATETIME       NULL,
    [LastUpdateAttempt] DATETIME       NULL,
    [UpdateFailCount]   INT            NULL,
    [LastUpdateResult]  VARCHAR (16)   NULL,
    [ServiceUsername]   NVARCHAR (128) NULL,
    [ServicePassword]   NVARCHAR (128) NULL,
    CONSTRAINT [PK_External.ServiceSync] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

PRINT N'Creating [Agreements].[AgreementContactPhone]...';
GO
CREATE TABLE [Agreements].[AgreementContactPhone] (
    [Id]      INT            IDENTITY (1, 1) NOT NULL,
    [OwnerId] INT            NOT NULL,
    [Type]    NVARCHAR (150) NULL,
    [Value]   NVARCHAR (150) NOT NULL,
    CONSTRAINT [PK_Agreements.AgreementContactPhone] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO
PRINT N'Creating [Agreements].[AgreementContactPhone].[IX_OwnerId]...';
GO
CREATE NONCLUSTERED INDEX [IX_OwnerId]
    ON [Agreements].[AgreementContactPhone]([OwnerId] ASC);
GO



-- ADD CONSTRAINTS

PRINT N'Creating FK_People.Affiliation_Establishments.Establishment_EstablishmentId...';
GO
ALTER TABLE [People].[Affiliation] WITH NOCHECK
    ADD CONSTRAINT [FK_People.Affiliation_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_People.Affiliation_People.Person_PersonId...';
GO
ALTER TABLE [People].[Affiliation] WITH NOCHECK
    ADD CONSTRAINT [FK_People.Affiliation_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.AgreementSettingsStatusValue_Agreements.AgreementSettings_ConfigurationId...';
GO
ALTER TABLE [Agreements].[AgreementSettingsStatusValue] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementSettingsStatusValue_Agreements.AgreementSettings_ConfigurationId] FOREIGN KEY ([ConfigurationId]) REFERENCES [Agreements].[AgreementSettings] ([RevisionId]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.AgreementSettingsContactTypeValue_Agreements.AgreementSettings_ConfigurationId...';
GO
ALTER TABLE [Agreements].[AgreementSettingsContactTypeValue] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementSettingsContactTypeValue_Agreements.AgreementSettings_ConfigurationId] FOREIGN KEY ([ConfigurationId]) REFERENCES [Agreements].[AgreementSettings] ([RevisionId]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.Agreement_Agreements.Agreement_UmbrellaId...';
GO
ALTER TABLE [Agreements].[Agreement] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.Agreement_Agreements.Agreement_UmbrellaId] FOREIGN KEY ([UmbrellaId]) REFERENCES [Agreements].[Agreement] ([Id]);
GO
PRINT N'Creating FK_Agreements.AgreementNode_Agreements.Agreement_OffspringId...';
GO
ALTER TABLE [Agreements].[AgreementNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementNode_Agreements.Agreement_OffspringId] FOREIGN KEY ([OffspringId]) REFERENCES [Agreements].[Agreement] ([Id]);
GO
PRINT N'Creating FK_Agreements.AgreementNode_Agreements.Agreement_AncestorId...';
GO
ALTER TABLE [Agreements].[AgreementNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementNode_Agreements.Agreement_AncestorId] FOREIGN KEY ([AncestorId]) REFERENCES [Agreements].[Agreement] ([Id]);
GO
PRINT N'Creating FK_Agreements.AgreementParticipant_Establishments.Establishment_EstablishmentId...';
GO
ALTER TABLE [Agreements].[AgreementParticipant] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementParticipant_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);
GO
PRINT N'Creating FK_Agreements.AgreementParticipant_Agreements.Agreement_AgreementId...';
GO
ALTER TABLE [Agreements].[AgreementParticipant] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementParticipant_Agreements.Agreement_AgreementId] FOREIGN KEY ([AgreementId]) REFERENCES [Agreements].[Agreement] ([Id]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.AgreementContact_People.Person_PersonId...';
GO
ALTER TABLE [Agreements].[AgreementContact] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementContact_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.AgreementContact_Establishments.Establishment_ParticipantAffiliationId...';
GO
ALTER TABLE [Agreements].[AgreementContact] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementContact_Establishments.Establishment_ParticipantAffiliationId] FOREIGN KEY ([ParticipantAffiliationId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.AgreementContact_Agreements.Agreement_AgreementId...';
GO
ALTER TABLE [Agreements].[AgreementContact] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementContact_Agreements.Agreement_AgreementId] FOREIGN KEY ([AgreementId]) REFERENCES [Agreements].[Agreement] ([Id]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.AgreementContactPhone_Agreements.AgreementContact_OwnerId...';
GO
ALTER TABLE [Agreements].[AgreementContactPhone] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementContactPhone_Agreements.AgreementContact_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [Agreements].[AgreementContact] ([Id]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.AgreementFile_Agreements.Agreement_AgreementId...';
GO
ALTER TABLE [Agreements].[AgreementFile] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementFile_Agreements.Agreement_AgreementId] FOREIGN KEY ([AgreementId]) REFERENCES [Agreements].[Agreement] ([Id]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.AgreementSettings_Establishments.Establishment_ForEstablishmentId...';
GO
ALTER TABLE [Agreements].[AgreementSettings] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementSettings_Establishments.Establishment_ForEstablishmentId] FOREIGN KEY ([ForEstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;
GO
PRINT N'Creating FK_Agreements.AgreementSettingsTypeValue_Agreements.AgreementSettings_ConfigurationId...';
GO
ALTER TABLE [Agreements].[AgreementSettingsTypeValue] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementSettingsTypeValue_Agreements.AgreementSettings_ConfigurationId] FOREIGN KEY ([ConfigurationId]) REFERENCES [Agreements].[AgreementSettings] ([RevisionId]) ON DELETE CASCADE;
GO



-- CHECK CONSTRAINTS

PRINT N'Checking existing data against newly created constraints';
GO
--USE [$(DatabaseName)];
--GO
ALTER TABLE [People].[Affiliation] WITH CHECK CHECK CONSTRAINT [FK_People.Affiliation_Establishments.Establishment_EstablishmentId];
ALTER TABLE [People].[Affiliation] WITH CHECK CHECK CONSTRAINT [FK_People.Affiliation_People.Person_PersonId];
ALTER TABLE [Agreements].[AgreementSettingsStatusValue] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementSettingsStatusValue_Agreements.AgreementSettings_ConfigurationId];
ALTER TABLE [Agreements].[AgreementSettingsContactTypeValue] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementSettingsContactTypeValue_Agreements.AgreementSettings_ConfigurationId];
ALTER TABLE [Agreements].[Agreement] WITH CHECK CHECK CONSTRAINT [FK_Agreements.Agreement_Agreements.Agreement_UmbrellaId];
ALTER TABLE [Agreements].[AgreementNode] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementNode_Agreements.Agreement_OffspringId];
ALTER TABLE [Agreements].[AgreementNode] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementNode_Agreements.Agreement_AncestorId];
ALTER TABLE [Agreements].[AgreementParticipant] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementParticipant_Establishments.Establishment_EstablishmentId];
ALTER TABLE [Agreements].[AgreementParticipant] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementParticipant_Agreements.Agreement_AgreementId];
ALTER TABLE [Agreements].[AgreementContact] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementContact_People.Person_PersonId];
ALTER TABLE [Agreements].[AgreementContact] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementContact_Establishments.Establishment_ParticipantAffiliationId];
ALTER TABLE [Agreements].[AgreementContact] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementContact_Agreements.Agreement_AgreementId];
ALTER TABLE [Agreements].[AgreementContactPhone] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementContactPhone_Agreements.AgreementContact_OwnerId];
ALTER TABLE [Agreements].[AgreementFile] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementFile_Agreements.Agreement_AgreementId];
ALTER TABLE [Agreements].[AgreementSettings] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementSettings_Establishments.Establishment_ForEstablishmentId];
ALTER TABLE [Agreements].[AgreementSettingsTypeValue] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementSettingsTypeValue_Agreements.AgreementSettings_ConfigurationId];
GO



-- DROP SCHEMAS

PRINT N'Dropping [InstitutionalAgreements]...';
GO
DROP SCHEMA [InstitutionalAgreements];
GO



PRINT N'Update complete.';


GO
