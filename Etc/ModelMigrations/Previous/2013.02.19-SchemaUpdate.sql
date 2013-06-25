USE [UCosmicPreview]
GO
SET ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON;

SET NUMERIC_ROUNDABORT OFF;


GO
PRINT N'Dropping Activity_Person...';


GO
ALTER TABLE [Activities].[Activity] DROP CONSTRAINT [Activity_Person];


GO
PRINT N'Dropping ActivityTag_Activity...';


GO
ALTER TABLE [Activities].[ActivityTag] DROP CONSTRAINT [ActivityTag_Activity];


GO
PRINT N'Dropping DraftedTag_Activity...';


GO
ALTER TABLE [Activities].[DraftedTag] DROP CONSTRAINT [DraftedTag_Activity];


GO
PRINT N'Dropping Establishment_Affiliates...';


GO
ALTER TABLE [People].[Affiliation] DROP CONSTRAINT [Establishment_Affiliates];


GO
PRINT N'Dropping Person_Affiliations...';


GO
ALTER TABLE [People].[Affiliation] DROP CONSTRAINT [Person_Affiliations];


GO
PRINT N'Dropping Person_Emails...';


GO
ALTER TABLE [People].[EmailAddress] DROP CONSTRAINT [Person_Emails];


GO
PRINT N'Dropping Person_Messages...';


GO
ALTER TABLE [People].[EmailMessage] DROP CONSTRAINT [Person_Messages];


GO
PRINT N'Dropping Person_User...';


GO
ALTER TABLE [Identity].[User] DROP CONSTRAINT [Person_User];


GO
PRINT N'Dropping InstitutionalAgreementContact_Person...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContact] DROP CONSTRAINT [InstitutionalAgreementContact_Person];


GO
PRINT N'Dropping EmailTemplate_Establishment...';


GO
ALTER TABLE [Establishments].[EmailTemplate] DROP CONSTRAINT [EmailTemplate_Establishment];


GO
PRINT N'Dropping Establishment_Parent...';


GO
ALTER TABLE [Establishments].[Establishment] DROP CONSTRAINT [Establishment_Parent];


GO
PRINT N'Dropping Establishment_Type...';


GO
ALTER TABLE [Establishments].[Establishment] DROP CONSTRAINT [Establishment_Type];


GO
PRINT N'Dropping EstablishmentAddress_TranslationToLanguage...';


GO
ALTER TABLE [Establishments].[EstablishmentAddress] DROP CONSTRAINT [EstablishmentAddress_TranslationToLanguage];


GO
PRINT N'Dropping EstablishmentLocation_Addresses...';


GO
ALTER TABLE [Establishments].[EstablishmentAddress] DROP CONSTRAINT [EstablishmentLocation_Addresses];


GO
PRINT N'Dropping Establishment_EmailDomains...';


GO
ALTER TABLE [Establishments].[EstablishmentEmailDomain] DROP CONSTRAINT [Establishment_EmailDomains];


GO
PRINT N'Dropping Establishment_Location...';


GO
ALTER TABLE [Establishments].[EstablishmentLocation] DROP CONSTRAINT [Establishment_Location];


GO
PRINT N'Dropping EstablishmentLocation_Places_Source...';


GO
ALTER TABLE [Establishments].[EstablishmentLocationInPlace] DROP CONSTRAINT [EstablishmentLocation_Places_Source];


GO
PRINT N'Dropping EstablishmentLocation_Places_Target...';


GO
ALTER TABLE [Establishments].[EstablishmentLocationInPlace] DROP CONSTRAINT [EstablishmentLocation_Places_Target];


GO
PRINT N'Dropping Establishment_Names...';


GO
ALTER TABLE [Establishments].[EstablishmentName] DROP CONSTRAINT [Establishment_Names];


GO
PRINT N'Dropping EstablishmentName_TranslationToLanguage...';


GO
ALTER TABLE [Establishments].[EstablishmentName] DROP CONSTRAINT [EstablishmentName_TranslationToLanguage];


GO
PRINT N'Dropping Establishment_Ancestors...';


GO
ALTER TABLE [Establishments].[EstablishmentNode] DROP CONSTRAINT [Establishment_Ancestors];


GO
PRINT N'Dropping Establishment_Offspring...';


GO
ALTER TABLE [Establishments].[EstablishmentNode] DROP CONSTRAINT [Establishment_Offspring];


GO
PRINT N'Dropping Establishment_SamlSignOn...';


GO
ALTER TABLE [Establishments].[EstablishmentSamlSignOn] DROP CONSTRAINT [Establishment_SamlSignOn];


GO
PRINT N'Dropping EstablishmentType_Category...';


GO
ALTER TABLE [Establishments].[EstablishmentType] DROP CONSTRAINT [EstablishmentType_Category];


GO
PRINT N'Dropping Establishment_Urls...';


GO
ALTER TABLE [Establishments].[EstablishmentUrl] DROP CONSTRAINT [Establishment_Urls];


GO
PRINT N'Dropping EduPersonScopedAffiliation_User...';


GO
ALTER TABLE [Identity].[EduPersonScopedAffiliation] DROP CONSTRAINT [EduPersonScopedAffiliation_User];


GO
PRINT N'Dropping Preference_User...';


GO
ALTER TABLE [Identity].[Preference] DROP CONSTRAINT [Preference_User];


GO
PRINT N'Dropping RoleGrant_ForEstablishment...';


GO
ALTER TABLE [Identity].[RoleGrant] DROP CONSTRAINT [RoleGrant_ForEstablishment];


GO
PRINT N'Dropping RoleGrant_Role...';


GO
ALTER TABLE [Identity].[RoleGrant] DROP CONSTRAINT [RoleGrant_Role];


GO
PRINT N'Dropping RoleGrant_User...';


GO
ALTER TABLE [Identity].[RoleGrant] DROP CONSTRAINT [RoleGrant_User];


GO
PRINT N'Dropping SubjectNameIdentifier_User...';


GO
ALTER TABLE [Identity].[SubjectNameIdentifier] DROP CONSTRAINT [SubjectNameIdentifier_User];


GO
PRINT N'Dropping InstitutionalAgreement_Umbrella...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreement] DROP CONSTRAINT [InstitutionalAgreement_Umbrella];


GO
PRINT N'Dropping InstitutionalAgreementConfiguration_ForEstablishment...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementConfiguration] DROP CONSTRAINT [InstitutionalAgreementConfiguration_ForEstablishment];


GO
PRINT N'Dropping InstitutionalAgreement_Contacts...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContact] DROP CONSTRAINT [InstitutionalAgreement_Contacts];


GO
PRINT N'Dropping InstitutionalAgreementContactTypeValue_Configuration...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue] DROP CONSTRAINT [InstitutionalAgreementContactTypeValue_Configuration];


GO
PRINT N'Dropping InstitutionalAgreement_Files...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementFile] DROP CONSTRAINT [InstitutionalAgreement_Files];


GO
PRINT N'Dropping InstitutionalAgreement_Ancestors...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementNode] DROP CONSTRAINT [InstitutionalAgreement_Ancestors];


GO
PRINT N'Dropping InstitutionalAgreement_Offspring...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementNode] DROP CONSTRAINT [InstitutionalAgreement_Offspring];


GO
PRINT N'Dropping InstitutionalAgreement_Participants...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant] DROP CONSTRAINT [InstitutionalAgreement_Participants];


GO
PRINT N'Dropping InstitutionalAgreementParticipant_Establishment...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant] DROP CONSTRAINT [InstitutionalAgreementParticipant_Establishment];


GO
PRINT N'Dropping InstitutionalAgreementStatusValue_Configuration...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementStatusValue] DROP CONSTRAINT [InstitutionalAgreementStatusValue_Configuration];


GO
PRINT N'Dropping InstitutionalAgreementTypeValue_Configuration...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementTypeValue] DROP CONSTRAINT [InstitutionalAgreementTypeValue_Configuration];


GO
PRINT N'Dropping Language_Names...';


GO
ALTER TABLE [Languages].[LanguageName] DROP CONSTRAINT [Language_Names];


GO
PRINT N'Dropping LanguageName_TranslationToLanguage...';


GO
ALTER TABLE [Languages].[LanguageName] DROP CONSTRAINT [LanguageName_TranslationToLanguage];


GO
PRINT N'Dropping EmailAddress_Confirmations...';


GO
ALTER TABLE [People].[EmailConfirmation] DROP CONSTRAINT [EmailAddress_Confirmations];


GO
PRINT N'Dropping GeoNamesAlternateName_Toponym...';


GO
ALTER TABLE [Places].[GeoNamesAlternateName] DROP CONSTRAINT [GeoNamesAlternateName_Toponym];


GO
PRINT N'Dropping GeoNamesCountry_AsToponym...';


GO
ALTER TABLE [Places].[GeoNamesCountry] DROP CONSTRAINT [GeoNamesCountry_AsToponym];


GO
PRINT N'Dropping GeoNamesFeature_Class...';


GO
ALTER TABLE [Places].[GeoNamesFeature] DROP CONSTRAINT [GeoNamesFeature_Class];


GO
PRINT N'Dropping GeoNamesToponym_Feature...';


GO
ALTER TABLE [Places].[GeoNamesToponym] DROP CONSTRAINT [GeoNamesToponym_Feature];


GO
PRINT N'Dropping GeoNamesToponym_Parent...';


GO
ALTER TABLE [Places].[GeoNamesToponym] DROP CONSTRAINT [GeoNamesToponym_Parent];


GO
PRINT N'Dropping GeoNamesToponym_Place...';


GO
ALTER TABLE [Places].[GeoNamesToponym] DROP CONSTRAINT [GeoNamesToponym_Place];


GO
PRINT N'Dropping GeoNamesToponym_TimeZone...';


GO
ALTER TABLE [Places].[GeoNamesToponym] DROP CONSTRAINT [GeoNamesToponym_TimeZone];


GO
PRINT N'Dropping GeoNamesToponymNode_Ancestor...';


GO
ALTER TABLE [Places].[GeoNamesToponymNode] DROP CONSTRAINT [GeoNamesToponymNode_Ancestor];


GO
PRINT N'Dropping GeoNamesToponymNode_Offspring...';


GO
ALTER TABLE [Places].[GeoNamesToponymNode] DROP CONSTRAINT [GeoNamesToponymNode_Offspring];


GO
PRINT N'Dropping GeoPlanetPlace_Parent...';


GO
ALTER TABLE [Places].[GeoPlanetPlace] DROP CONSTRAINT [GeoPlanetPlace_Parent];


GO
PRINT N'Dropping GeoPlanetPlace_Place...';


GO
ALTER TABLE [Places].[GeoPlanetPlace] DROP CONSTRAINT [GeoPlanetPlace_Place];


GO
PRINT N'Dropping GeoPlanetPlace_Type...';


GO
ALTER TABLE [Places].[GeoPlanetPlace] DROP CONSTRAINT [GeoPlanetPlace_Type];


GO
PRINT N'Dropping GeoPlanetPlaceBelongTo_BelongsTo...';


GO
ALTER TABLE [Places].[GeoPlanetPlaceBelongTo] DROP CONSTRAINT [GeoPlanetPlaceBelongTo_BelongsTo];


GO
PRINT N'Dropping GeoPlanetPlaceBelongTo_GeoPlanetPlace...';


GO
ALTER TABLE [Places].[GeoPlanetPlaceBelongTo] DROP CONSTRAINT [GeoPlanetPlaceBelongTo_GeoPlanetPlace];


GO
PRINT N'Dropping GeoPlanetPlaceNode_Ancestor...';


GO
ALTER TABLE [Places].[GeoPlanetPlaceNode] DROP CONSTRAINT [GeoPlanetPlaceNode_Ancestor];


GO
PRINT N'Dropping GeoPlanetPlaceNode_Offspring...';


GO
ALTER TABLE [Places].[GeoPlanetPlaceNode] DROP CONSTRAINT [GeoPlanetPlaceNode_Offspring];


GO
PRINT N'Dropping Place_Parent...';


GO
ALTER TABLE [Places].[Place] DROP CONSTRAINT [Place_Parent];


GO
PRINT N'Dropping PlaceName_NameFor...';


GO
ALTER TABLE [Places].[PlaceName] DROP CONSTRAINT [PlaceName_NameFor];


GO
PRINT N'Dropping PlaceName_TranslationToLanguage...';


GO
ALTER TABLE [Places].[PlaceName] DROP CONSTRAINT [PlaceName_TranslationToLanguage];


GO
PRINT N'Dropping PlaceNode_Ancestor...';


GO
ALTER TABLE [Places].[PlaceNode] DROP CONSTRAINT [PlaceNode_Ancestor];


GO
PRINT N'Dropping PlaceNode_Offspring...';


GO
ALTER TABLE [Places].[PlaceNode] DROP CONSTRAINT [PlaceNode_Offspring];


GO
PRINT N'Creating [Employees]...';


GO
CREATE SCHEMA [Employees]
    AUTHORIZATION [dbo];


GO
/*
The column [Activities].[Activity].[UpdatedByPersonId] on table [Activities].[Activity] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/

--IF EXISTS (select top 1 1 from [Activities].[Activity])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

--GO
PRINT N'Starting rebuilding table [Activities].[Activity]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Activities].[tmp_ms_xx_Activity] (
    [PersonId]          INT              NOT NULL,
    [Number]            INT              NOT NULL,
    [EntityId]          UNIQUEIDENTIFIER NOT NULL,
    [Mode]              NVARCHAR (20)    NOT NULL,
    [Title]             NVARCHAR (200)   NULL,
    [Content]           NTEXT            NULL,
    [StartsOn]          DATETIME         NULL,
    [EndsOn]            DATETIME         NULL,
    [CountryId]         INT              NULL,
    [TypeId]            INT              NULL,
    [DraftedTitle]      NVARCHAR (200)   NULL,
    [DraftedContent]    NTEXT            NULL,
    [DraftedStartsOn]   DATETIME         NULL,
    [DraftedEndsOn]     DATETIME         NULL,
    [DraftedCountryId]  INT              NULL,
    [DraftedTypeId]     INT              NULL,
    [CreatedOn]         DATETIME         NOT NULL,
    [UpdatedOn]         DATETIME         NOT NULL,
    [UpdatedByPersonId] INT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Activities.Activity] PRIMARY KEY CLUSTERED ([PersonId] ASC, [Number] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Activities].[Activity])
    BEGIN
        
        INSERT INTO [Activities].[tmp_ms_xx_Activity] ([PersonId], [Number], [EntityId], [Mode], [Title], [Content], [StartsOn], [EndsOn], [DraftedTitle], [DraftedContent], [DraftedStartsOn], [DraftedEndsOn], [CreatedOn], [UpdatedOn], [UpdatedByPersonId])
        SELECT   [PersonId],
                 [Number],
                 [EntityId],
                 [Mode],
                 [Title],
                 [Content],
                 [StartsOn],
                 [EndsOn],
                 [DraftedTitle],
                 [DraftedContent],
                 [DraftedStartsOn],
                 [DraftedEndsOn],
                 [CreatedOn],
                 [UpdatedOn],
				 [PersonId]
        FROM     [Activities].[Activity]
        ORDER BY [Activities].[Activity].[PersonId] ASC, [Number] ASC;
        
    END

DROP TABLE [Activities].[Activity];

EXECUTE sp_rename N'[Activities].[tmp_ms_xx_Activity]', N'Activity';

EXECUTE sp_rename N'[Activities].[tmp_ms_xx_constraint_PK_Activities.Activity]', N'PK_Activities.Activity', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Activities].[Activity].[IX_PersonId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [Activities].[Activity]([PersonId] ASC);


GO
PRINT N'Creating [Activities].[Activity].[IX_UpdatedByPersonId]...';


GO
CREATE NONCLUSTERED INDEX [IX_UpdatedByPersonId]
    ON [Activities].[Activity]([UpdatedByPersonId] ASC);


GO
/*
The column [People].[Affiliation].[IsPrimary] on table [People].[Affiliation] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/

--IF EXISTS (select top 1 1 from [People].[Affiliation])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

--GO
PRINT N'Starting rebuilding table [People].[Affiliation]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [People].[tmp_ms_xx_Affiliation] (
    [PersonId]                      INT            NOT NULL,
    [EstablishmentId]               INT            NOT NULL,
    [JobTitles]                     NVARCHAR (500) NULL,
    [IsDefault]                     BIT            NOT NULL,
    [IsPrimary]                     BIT            NOT NULL,
    [IsAcknowledged]                BIT            NOT NULL,
    [IsClaimingStudent]             BIT            NOT NULL,
    [IsClaimingEmployee]            BIT            NOT NULL,
    [IsClaimingInternationalOffice] BIT            NOT NULL,
    [IsClaimingAdministrator]       BIT            NOT NULL,
    [IsClaimingFaculty]             BIT            NOT NULL,
    [IsClaimingStaff]               BIT            NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_People.Affiliation] PRIMARY KEY CLUSTERED ([PersonId] ASC, [EstablishmentId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [People].[Affiliation])
    BEGIN
        
        INSERT INTO [People].[tmp_ms_xx_Affiliation] ([PersonId], [EstablishmentId], [JobTitles], [IsDefault], [IsPrimary], [IsAcknowledged], [IsClaimingStudent], [IsClaimingEmployee], [IsClaimingInternationalOffice], [IsClaimingAdministrator], [IsClaimingFaculty], [IsClaimingStaff])
        SELECT   [PersonId],
                 [EstablishmentId],
                 [JobTitles],
                 [IsDefault],
                 [IsDefault],
                 [IsAcknowledged],
                 [IsClaimingStudent],
                 [IsClaimingEmployee],
                 [IsClaimingInternationalOffice],
                 [IsClaimingAdministrator],
                 [IsClaimingFaculty],
                 [IsClaimingStaff]
        FROM     [People].[Affiliation]
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
/*
The column [People].[Person].[IsActive] on table [People].[Person] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/

--IF EXISTS (select top 1 1 from [People].[Person])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

--GO
PRINT N'Starting rebuilding table [People].[Person]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [People].[tmp_ms_xx_Person] (
    [RevisionId]           INT              IDENTITY (1, 1) NOT NULL,
    [IsActive]             BIT              NOT NULL,
    [IsDisplayNameDerived] BIT              NOT NULL,
    [DisplayName]          NVARCHAR (200)   NOT NULL,
    [Salutation]           NVARCHAR (50)    NULL,
    [FirstName]            NVARCHAR (100)   NULL,
    [MiddleName]           NVARCHAR (100)   NULL,
    [LastName]             NVARCHAR (100)   NULL,
    [Suffix]               NVARCHAR (50)    NULL,
    [Gender]               CHAR (1)         NULL,
    [EntityId]             UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]         DATETIME         NOT NULL,
    [CreatedByPrincipal]   NVARCHAR (256)   NULL,
    [UpdatedOnUtc]         DATETIME         NULL,
    [UpdatedByPrincipal]   NVARCHAR (256)   NULL,
    [Version]              ROWVERSION       NOT NULL,
    [IsCurrent]            BIT              NOT NULL,
    [IsArchived]           BIT              NOT NULL,
    [IsDeleted]            BIT              NOT NULL,
    [PhotoId]              INT              NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_People.Person] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [People].[Person])
    BEGIN
        SET IDENTITY_INSERT [People].[tmp_ms_xx_Person] ON;
        INSERT INTO [People].[tmp_ms_xx_Person] ([RevisionId], [IsActive], [IsDisplayNameDerived], [DisplayName], [Salutation], [FirstName], [MiddleName], [LastName], [Suffix], [Gender], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted])
        SELECT   [RevisionId],
				 1,
                 [IsDisplayNameDerived],
                 [DisplayName],
                 [Salutation],
                 [FirstName],
                 [MiddleName],
                 [LastName],
                 [Suffix],
				 NULL,
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted]
        FROM     [People].[Person]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [People].[tmp_ms_xx_Person] OFF;
    END

DROP TABLE [People].[Person];

EXECUTE sp_rename N'[People].[tmp_ms_xx_Person]', N'Person';

EXECUTE sp_rename N'[People].[tmp_ms_xx_constraint_PK_People.Person]', N'PK_People.Person', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [People].[Person].[IX_PhotoId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PhotoId]
    ON [People].[Person]([PhotoId] ASC);


GO
PRINT N'Starting rebuilding table [Activities].[ActivityTag]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Activities].[tmp_ms_xx_ActivityTag] (
    [ActivityPersonId] INT            NOT NULL,
    [ActivityNumber]   INT            NOT NULL,
    [Number]           INT            NOT NULL,
    [Text]             NVARCHAR (500) NOT NULL,
    [DomainType]       NVARCHAR (20)  NOT NULL,
    [DomainKey]        INT            NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Activities.ActivityTag] PRIMARY KEY CLUSTERED ([ActivityPersonId] ASC, [ActivityNumber] ASC, [Number] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Activities].[ActivityTag])
    BEGIN
        
        INSERT INTO [Activities].[tmp_ms_xx_ActivityTag] ([ActivityPersonId], [ActivityNumber], [Number], [Text], [DomainType], [DomainKey])
        SELECT   [ActivityPersonId],
                 [ActivityNumber],
                 [Number],
                 [Text],
                 [DomainType],
                 [DomainKey]
        FROM     [Activities].[ActivityTag]
        ORDER BY [ActivityPersonId] ASC, [ActivityNumber] ASC, [Number] ASC;
        
    END

DROP TABLE [Activities].[ActivityTag];

EXECUTE sp_rename N'[Activities].[tmp_ms_xx_ActivityTag]', N'ActivityTag';

EXECUTE sp_rename N'[Activities].[tmp_ms_xx_constraint_PK_Activities.ActivityTag]', N'PK_Activities.ActivityTag', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Activities].[ActivityTag].[IX_ActivityPersonId_ActivityNumber]...';


GO
CREATE NONCLUSTERED INDEX [IX_ActivityPersonId_ActivityNumber]
    ON [Activities].[ActivityTag]([ActivityPersonId] ASC, [ActivityNumber] ASC);


GO
PRINT N'Starting rebuilding table [Activities].[DraftedTag]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Activities].[tmp_ms_xx_DraftedTag] (
    [ActivityPersonId] INT            NOT NULL,
    [ActivityNumber]   INT            NOT NULL,
    [Number]           INT            NOT NULL,
    [Text]             NVARCHAR (500) NOT NULL,
    [DomainType]       NVARCHAR (20)  NOT NULL,
    [DomainKey]        INT            NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Activities.DraftedTag] PRIMARY KEY CLUSTERED ([ActivityPersonId] ASC, [ActivityNumber] ASC, [Number] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Activities].[DraftedTag])
    BEGIN
        
        INSERT INTO [Activities].[tmp_ms_xx_DraftedTag] ([ActivityPersonId], [ActivityNumber], [Number], [Text], [DomainType], [DomainKey])
        SELECT   [ActivityPersonId],
                 [ActivityNumber],
                 [Number],
                 [Text],
                 [DomainType],
                 [DomainKey]
        FROM     [Activities].[DraftedTag]
        ORDER BY [ActivityPersonId] ASC, [ActivityNumber] ASC, [Number] ASC;
        
    END

DROP TABLE [Activities].[DraftedTag];

EXECUTE sp_rename N'[Activities].[tmp_ms_xx_DraftedTag]', N'DraftedTag';

EXECUTE sp_rename N'[Activities].[tmp_ms_xx_constraint_PK_Activities.DraftedTag]', N'PK_Activities.DraftedTag', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Activities].[DraftedTag].[IX_ActivityPersonId_ActivityNumber]...';


GO
CREATE NONCLUSTERED INDEX [IX_ActivityPersonId_ActivityNumber]
    ON [Activities].[DraftedTag]([ActivityPersonId] ASC, [ActivityNumber] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[EmailTemplate]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EmailTemplate] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [EstablishmentId]    INT              NULL,
    [Name]               NVARCHAR (150)   NOT NULL,
    [SubjectFormat]      NVARCHAR (250)   NOT NULL,
    [BodyFormat]         NTEXT            NOT NULL,
    [Instructions]       NTEXT            NULL,
    [FromAddress]        NVARCHAR (256)   NULL,
    [FromDisplayName]    NVARCHAR (150)   NULL,
    [ReplyToAddress]     NVARCHAR (256)   NULL,
    [ReplyToDisplayName] NVARCHAR (150)   NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EmailTemplate] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EmailTemplate])
    BEGIN
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EmailTemplate] ON;
        INSERT INTO [Establishments].[tmp_ms_xx_EmailTemplate] ([RevisionId], [EstablishmentId], [Name], [SubjectFormat], [BodyFormat], [Instructions], [FromAddress], [FromDisplayName], [ReplyToAddress], [ReplyToDisplayName], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted])
        SELECT   [RevisionId],
                 [EstablishmentId],
                 [Name],
                 [SubjectFormat],
                 [BodyFormat],
                 [Instructions],
                 [FromAddress],
                 [FromDisplayName],
                 [ReplyToAddress],
                 [ReplyToDisplayName],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted]
        FROM     [Establishments].[EmailTemplate]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EmailTemplate] OFF;
    END

DROP TABLE [Establishments].[EmailTemplate];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EmailTemplate]', N'EmailTemplate';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EmailTemplate]', N'PK_Establishments.EmailTemplate', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EmailTemplate].[IX_EstablishmentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentId]
    ON [Establishments].[EmailTemplate]([EstablishmentId] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[Establishment]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_Establishment] (
    [RevisionId]                      INT              IDENTITY (1, 1) NOT NULL,
    [OfficialName]                    NVARCHAR (400)   NOT NULL,
    [WebsiteUrl]                      NVARCHAR (200)   NULL,
    [IsMember]                        BIT              NOT NULL,
    [CollegeBoardDesignatedIndicator] CHAR (6)         NULL,
    [UCosmicCode]                     CHAR (6)         NULL,
    [PublicPhone]                     NVARCHAR (50)    NULL,
    [PublicFax]                       NVARCHAR (50)    NULL,
    [PublicEmail]                     NVARCHAR (256)   NULL,
    [PartnerPhone]                    NVARCHAR (50)    NULL,
    [PartnerFax]                      NVARCHAR (50)    NULL,
    [PartnerEmail]                    NVARCHAR (256)   NULL,
    [EntityId]                        UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]                    DATETIME         NOT NULL,
    [CreatedByPrincipal]              NVARCHAR (256)   NULL,
    [UpdatedOnUtc]                    DATETIME         NULL,
    [UpdatedByPrincipal]              NVARCHAR (256)   NULL,
    [Version]                         ROWVERSION       NOT NULL,
    [IsCurrent]                       BIT              NOT NULL,
    [IsArchived]                      BIT              NOT NULL,
    [IsDeleted]                       BIT              NOT NULL,
    [ParentId]                        INT              NULL,
    [TypeId]                          INT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.Establishment] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[Establishment])
    BEGIN
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_Establishment] ON;
        INSERT INTO [Establishments].[tmp_ms_xx_Establishment] ([RevisionId], [OfficialName], [WebsiteUrl], [IsMember], [CollegeBoardDesignatedIndicator], [UCosmicCode], [PublicPhone], [PublicFax], [PublicEmail], [PartnerPhone], [PartnerFax], [PartnerEmail], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [ParentId], [TypeId])
        SELECT   [RevisionId],
                 [OfficialName],
                 [WebsiteUrl],
                 [IsMember],
                 [CollegeBoardDesignatedIndicator],
                 [UCosmicCode],
                 [PublicPhone],
                 [PublicFax],
                 [PublicEmail],
                 [PartnerPhone],
                 [PartnerFax],
                 [PartnerEmail],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [ParentId],
                 [TypeId]
        FROM     [Establishments].[Establishment]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_Establishment] OFF;
    END

DROP TABLE [Establishments].[Establishment];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_Establishment]', N'Establishment';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.Establishment]', N'PK_Establishments.Establishment', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[Establishment].[IX_ParentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ParentId]
    ON [Establishments].[Establishment]([ParentId] ASC);


GO
PRINT N'Creating [Establishments].[Establishment].[IX_TypeId]...';


GO
CREATE NONCLUSTERED INDEX [IX_TypeId]
    ON [Establishments].[Establishment]([TypeId] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentAddress]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentAddress] (
    [RevisionId]              INT              IDENTITY (1, 1) NOT NULL,
    [Text]                    NVARCHAR (500)   NOT NULL,
    [EntityId]                UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]            DATETIME         NOT NULL,
    [CreatedByPrincipal]      NVARCHAR (256)   NULL,
    [UpdatedOnUtc]            DATETIME         NULL,
    [UpdatedByPrincipal]      NVARCHAR (256)   NULL,
    [Version]                 ROWVERSION       NOT NULL,
    [IsCurrent]               BIT              NOT NULL,
    [IsArchived]              BIT              NOT NULL,
    [IsDeleted]               BIT              NOT NULL,
    [TranslationToLanguageId] INT              NOT NULL,
    [EstablishmentLocationId] INT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentAddress] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentAddress])
    BEGIN
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentAddress] ON;
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentAddress] ([RevisionId], [Text], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [TranslationToLanguageId], [EstablishmentLocationId])
        SELECT   [RevisionId],
                 [Text],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [TranslationToLanguageId],
                 [EstablishmentLocationId]
        FROM     [Establishments].[EstablishmentAddress]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentAddress] OFF;
    END

DROP TABLE [Establishments].[EstablishmentAddress];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentAddress]', N'EstablishmentAddress';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentAddress]', N'PK_Establishments.EstablishmentAddress', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EstablishmentAddress].[IX_TranslationToLanguageId]...';


GO
CREATE NONCLUSTERED INDEX [IX_TranslationToLanguageId]
    ON [Establishments].[EstablishmentAddress]([TranslationToLanguageId] ASC);


GO
PRINT N'Creating [Establishments].[EstablishmentAddress].[IX_EstablishmentLocationId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentLocationId]
    ON [Establishments].[EstablishmentAddress]([EstablishmentLocationId] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentCategory]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentCategory] (
    [Code]              CHAR (4)       NOT NULL,
    [EnglishName]       NVARCHAR (150) NOT NULL,
    [EnglishPluralName] NVARCHAR (150) NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentCategory] PRIMARY KEY CLUSTERED ([Code] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentCategory])
    BEGIN
        
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentCategory] ([Code], [EnglishName], [EnglishPluralName])
        SELECT   [Code],
                 [EnglishName],
                 [EnglishPluralName]
        FROM     [Establishments].[EstablishmentCategory]
        ORDER BY [Code] ASC;
        
    END

DROP TABLE [Establishments].[EstablishmentCategory];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentCategory]', N'EstablishmentCategory';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentCategory]', N'PK_Establishments.EstablishmentCategory', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentEmailDomain]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentEmailDomain] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [Value]              NVARCHAR (256)   NOT NULL,
    [EstablishmentId]    INT              NOT NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentEmailDomain] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentEmailDomain])
    BEGIN
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentEmailDomain] ON;
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentEmailDomain] ([RevisionId], [Value], [EstablishmentId], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted])
        SELECT   [RevisionId],
                 [Value],
                 [EstablishmentId],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted]
        FROM     [Establishments].[EstablishmentEmailDomain]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentEmailDomain] OFF;
    END

DROP TABLE [Establishments].[EstablishmentEmailDomain];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentEmailDomain]', N'EstablishmentEmailDomain';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentEmailDomain]', N'PK_Establishments.EstablishmentEmailDomain', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EstablishmentEmailDomain].[IX_EstablishmentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentId]
    ON [Establishments].[EstablishmentEmailDomain]([EstablishmentId] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentLocation]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentLocation] (
    [RevisionId]               INT              NOT NULL,
    [CenterLatitude]           FLOAT (53)       NULL,
    [CenterLongitude]          FLOAT (53)       NULL,
    [BoundingBoxNorthLatitude] FLOAT (53)       NULL,
    [BoundingBoxEastLongitude] FLOAT (53)       NULL,
    [BoundingBoxSouthLatitude] FLOAT (53)       NULL,
    [BoundingBoxWestLongitude] FLOAT (53)       NULL,
    [GoogleMapZoomLevel]       INT              NULL,
    [EntityId]                 UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]             DATETIME         NOT NULL,
    [CreatedByPrincipal]       NVARCHAR (256)   NULL,
    [UpdatedOnUtc]             DATETIME         NULL,
    [UpdatedByPrincipal]       NVARCHAR (256)   NULL,
    [Version]                  ROWVERSION       NOT NULL,
    [IsCurrent]                BIT              NOT NULL,
    [IsArchived]               BIT              NOT NULL,
    [IsDeleted]                BIT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentLocation] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentLocation])
    BEGIN
        
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentLocation] ([RevisionId], [CenterLatitude], [CenterLongitude], [BoundingBoxNorthLatitude], [BoundingBoxEastLongitude], [BoundingBoxSouthLatitude], [BoundingBoxWestLongitude], [GoogleMapZoomLevel], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted])
        SELECT   [RevisionId],
                 [CenterLatitude],
                 [CenterLongitude],
                 [BoundingBoxNorthLatitude],
                 [BoundingBoxEastLongitude],
                 [BoundingBoxSouthLatitude],
                 [BoundingBoxWestLongitude],
                 [GoogleMapZoomLevel],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted]
        FROM     [Establishments].[EstablishmentLocation]
        ORDER BY [RevisionId] ASC;
        
    END

DROP TABLE [Establishments].[EstablishmentLocation];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentLocation]', N'EstablishmentLocation';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentLocation]', N'PK_Establishments.EstablishmentLocation', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EstablishmentLocation].[IX_RevisionId]...';


GO
CREATE NONCLUSTERED INDEX [IX_RevisionId]
    ON [Establishments].[EstablishmentLocation]([RevisionId] ASC);


GO
PRINT N'Creating [Establishments].[EstablishmentLocation].[IX_EstablishmentLocation_RevisionId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentLocation_RevisionId]
    ON [Establishments].[EstablishmentLocation]([RevisionId] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentLocationInPlace]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentLocationInPlace] (
    [EstablishmentLocationId] INT NOT NULL,
    [PlaceId]                 INT NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentLocationInPlace] PRIMARY KEY CLUSTERED ([EstablishmentLocationId] ASC, [PlaceId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentLocationInPlace])
    BEGIN
        
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentLocationInPlace] ([EstablishmentLocationId], [PlaceId])
        SELECT   [EstablishmentLocationId],
                 [PlaceId]
        FROM     [Establishments].[EstablishmentLocationInPlace]
        ORDER BY [EstablishmentLocationId] ASC, [PlaceId] ASC;
        
    END

DROP TABLE [Establishments].[EstablishmentLocationInPlace];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentLocationInPlace]', N'EstablishmentLocationInPlace';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentLocationInPlace]', N'PK_Establishments.EstablishmentLocationInPlace', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EstablishmentLocationInPlace].[IX_EstablishmentLocationId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentLocationId]
    ON [Establishments].[EstablishmentLocationInPlace]([EstablishmentLocationId] ASC);


GO
PRINT N'Creating [Establishments].[EstablishmentLocationInPlace].[IX_PlaceId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PlaceId]
    ON [Establishments].[EstablishmentLocationInPlace]([PlaceId] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentName]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentName] (
    [RevisionId]              INT              IDENTITY (1, 1) NOT NULL,
    [IsFormerName]            BIT              NOT NULL,
    [IsOfficialName]          BIT              NOT NULL,
    [Text]                    NVARCHAR (400)   NOT NULL,
    [AsciiEquivalent]         NVARCHAR (400)   NULL,
    [EntityId]                UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]            DATETIME         NOT NULL,
    [CreatedByPrincipal]      NVARCHAR (256)   NULL,
    [UpdatedOnUtc]            DATETIME         NULL,
    [UpdatedByPrincipal]      NVARCHAR (256)   NULL,
    [Version]                 ROWVERSION       NOT NULL,
    [IsCurrent]               BIT              NOT NULL,
    [IsArchived]              BIT              NOT NULL,
    [IsDeleted]               BIT              NOT NULL,
    [TranslationToLanguageId] INT              NULL,
    [ForEstablishmentId]      INT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentName] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentName])
    BEGIN
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentName] ON;
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentName] ([RevisionId], [IsFormerName], [IsOfficialName], [Text], [AsciiEquivalent], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [TranslationToLanguageId], [ForEstablishmentId])
        SELECT   [RevisionId],
                 [IsFormerName],
                 [IsOfficialName],
                 [Text],
                 [AsciiEquivalent],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [TranslationToLanguageId],
                 [ForEstablishmentId]
        FROM     [Establishments].[EstablishmentName]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentName] OFF;
    END

DROP TABLE [Establishments].[EstablishmentName];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentName]', N'EstablishmentName';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentName]', N'PK_Establishments.EstablishmentName', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EstablishmentName].[IX_TranslationToLanguageId]...';


GO
CREATE NONCLUSTERED INDEX [IX_TranslationToLanguageId]
    ON [Establishments].[EstablishmentName]([TranslationToLanguageId] ASC);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[IX_ForEstablishmentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ForEstablishmentId]
    ON [Establishments].[EstablishmentName]([ForEstablishmentId] ASC);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[IX_EstablishmentName_ForEstablishmentId_IsOfficialName]...';


GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentName_ForEstablishmentId_IsOfficialName]
    ON [Establishments].[EstablishmentName]([ForEstablishmentId] ASC, [IsOfficialName] ASC)
    INCLUDE([Text], [AsciiEquivalent], [TranslationToLanguageId]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[IX_EstablishmentName_ForEstablishmentId_IsOfficialName_Text_TranslationToLanguageId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentName_ForEstablishmentId_IsOfficialName_Text_TranslationToLanguageId]
    ON [Establishments].[EstablishmentName]([ForEstablishmentId] ASC, [IsOfficialName] ASC, [Text] ASC, [TranslationToLanguageId] ASC)
    INCLUDE([RevisionId], [IsFormerName], [AsciiEquivalent], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [Version], [IsCurrent], [IsArchived], [IsDeleted]);


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentNode]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentNode] (
    [AncestorId]  INT NOT NULL,
    [OffspringId] INT NOT NULL,
    [Separation]  INT NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentNode] PRIMARY KEY CLUSTERED ([AncestorId] ASC, [OffspringId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentNode])
    BEGIN
        
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentNode] ([AncestorId], [OffspringId], [Separation])
        SELECT   [AncestorId],
                 [OffspringId],
                 [Separation]
        FROM     [Establishments].[EstablishmentNode]
        ORDER BY [AncestorId] ASC, [OffspringId] ASC;
        
    END

DROP TABLE [Establishments].[EstablishmentNode];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentNode]', N'EstablishmentNode';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentNode]', N'PK_Establishments.EstablishmentNode', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EstablishmentNode].[IX_OffspringId]...';


GO
CREATE NONCLUSTERED INDEX [IX_OffspringId]
    ON [Establishments].[EstablishmentNode]([OffspringId] ASC);


GO
PRINT N'Creating [Establishments].[EstablishmentNode].[IX_AncestorId]...';


GO
CREATE NONCLUSTERED INDEX [IX_AncestorId]
    ON [Establishments].[EstablishmentNode]([AncestorId] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentSamlSignOn]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentSamlSignOn] (
    [Id]           INT             NOT NULL,
    [EntityId]     NVARCHAR (2048) NOT NULL,
    [MetadataUrl]  NVARCHAR (2048) NOT NULL,
    [MetadataXml]  NTEXT           NULL,
    [SsoLocation]  NVARCHAR (2048) NULL,
    [SsoBinding]   NVARCHAR (50)   NULL,
    [CreatedOnUtc] DATETIME        NULL,
    [UpdatedOnUtc] DATETIME        NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentSamlSignOn] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentSamlSignOn])
    BEGIN
        
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentSamlSignOn] ([Id], [EntityId], [MetadataUrl], [MetadataXml], [SsoLocation], [SsoBinding], [CreatedOnUtc], [UpdatedOnUtc])
        SELECT   [Id],
                 [EntityId],
                 [MetadataUrl],
                 [MetadataXml],
                 [SsoLocation],
                 [SsoBinding],
                 [CreatedOnUtc],
                 [UpdatedOnUtc]
        FROM     [Establishments].[EstablishmentSamlSignOn]
        ORDER BY [Id] ASC;
        
    END

DROP TABLE [Establishments].[EstablishmentSamlSignOn];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentSamlSignOn]', N'EstablishmentSamlSignOn';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentSamlSignOn]', N'PK_Establishments.EstablishmentSamlSignOn', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EstablishmentSamlSignOn].[IX_Id]...';


GO
CREATE NONCLUSTERED INDEX [IX_Id]
    ON [Establishments].[EstablishmentSamlSignOn]([Id] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentType]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentType] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [CategoryCode]       CHAR (4)         NOT NULL,
    [EnglishName]        NVARCHAR (150)   NOT NULL,
    [EnglishPluralName]  NVARCHAR (150)   NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentType] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentType])
    BEGIN
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentType] ON;
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentType] ([RevisionId], [CategoryCode], [EnglishName], [EnglishPluralName], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted])
        SELECT   [RevisionId],
                 [CategoryCode],
                 [EnglishName],
                 [EnglishPluralName],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted]
        FROM     [Establishments].[EstablishmentType]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentType] OFF;
    END

DROP TABLE [Establishments].[EstablishmentType];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentType]', N'EstablishmentType';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentType]', N'PK_Establishments.EstablishmentType', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EstablishmentType].[IX_CategoryCode]...';


GO
CREATE NONCLUSTERED INDEX [IX_CategoryCode]
    ON [Establishments].[EstablishmentType]([CategoryCode] ASC);


GO
PRINT N'Starting rebuilding table [Establishments].[EstablishmentUrl]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_EstablishmentUrl] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [Value]              NVARCHAR (200)   NOT NULL,
    [IsOfficialUrl]      BIT              NOT NULL,
    [IsFormerUrl]        BIT              NOT NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    [ForEstablishmentId] INT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.EstablishmentUrl] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[EstablishmentUrl])
    BEGIN
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentUrl] ON;
        INSERT INTO [Establishments].[tmp_ms_xx_EstablishmentUrl] ([RevisionId], [Value], [IsOfficialUrl], [IsFormerUrl], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [ForEstablishmentId])
        SELECT   [RevisionId],
                 [Value],
                 [IsOfficialUrl],
                 [IsFormerUrl],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [ForEstablishmentId]
        FROM     [Establishments].[EstablishmentUrl]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_EstablishmentUrl] OFF;
    END

DROP TABLE [Establishments].[EstablishmentUrl];

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_EstablishmentUrl]', N'EstablishmentUrl';

EXECUTE sp_rename N'[Establishments].[tmp_ms_xx_constraint_PK_Establishments.EstablishmentUrl]', N'PK_Establishments.EstablishmentUrl', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Establishments].[EstablishmentUrl].[IX_ForEstablishmentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ForEstablishmentId]
    ON [Establishments].[EstablishmentUrl]([ForEstablishmentId] ASC);


GO
PRINT N'Starting rebuilding table [Files].[LooseFile]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Files].[tmp_ms_xx_LooseFile] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [Content]            VARBINARY (MAX)  NULL,
    [Length]             INT              NOT NULL,
    [MimeType]           NVARCHAR (MAX)   NULL,
    [Name]               NVARCHAR (MAX)   NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Files.LooseFile] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Files].[LooseFile])
    BEGIN
        SET IDENTITY_INSERT [Files].[tmp_ms_xx_LooseFile] ON;
        INSERT INTO [Files].[tmp_ms_xx_LooseFile] ([RevisionId], [Content], [Length], [MimeType], [Name], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted])
        SELECT   [RevisionId],
                 [Content],
                 [Length],
                 [MimeType],
                 [Name],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted]
        FROM     [Files].[LooseFile]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Files].[tmp_ms_xx_LooseFile] OFF;
    END

DROP TABLE [Files].[LooseFile];

EXECUTE sp_rename N'[Files].[tmp_ms_xx_LooseFile]', N'LooseFile';

EXECUTE sp_rename N'[Files].[tmp_ms_xx_constraint_PK_Files.LooseFile]', N'PK_Files.LooseFile', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Starting rebuilding table [Identity].[EduPersonScopedAffiliation]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Identity].[tmp_ms_xx_EduPersonScopedAffiliation] (
    [UserId]       INT            NOT NULL,
    [Number]       INT            NOT NULL,
    [Value]        NVARCHAR (256) NOT NULL,
    [CreatedOnUtc] DATETIME       NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Identity.EduPersonScopedAffiliation] PRIMARY KEY CLUSTERED ([UserId] ASC, [Number] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Identity].[EduPersonScopedAffiliation])
    BEGIN
        
        INSERT INTO [Identity].[tmp_ms_xx_EduPersonScopedAffiliation] ([UserId], [Number], [Value], [CreatedOnUtc])
        SELECT   [UserId],
                 [Number],
                 [Value],
                 [CreatedOnUtc]
        FROM     [Identity].[EduPersonScopedAffiliation]
        ORDER BY [UserId] ASC, [Number] ASC;
        
    END

DROP TABLE [Identity].[EduPersonScopedAffiliation];

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_EduPersonScopedAffiliation]', N'EduPersonScopedAffiliation';

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_constraint_PK_Identity.EduPersonScopedAffiliation]', N'PK_Identity.EduPersonScopedAffiliation', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Identity].[EduPersonScopedAffiliation].[IX_UserId]...';


GO
CREATE NONCLUSTERED INDEX [IX_UserId]
    ON [Identity].[EduPersonScopedAffiliation]([UserId] ASC);


GO
PRINT N'Starting rebuilding table [Identity].[Preference]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Identity].[tmp_ms_xx_Preference] (
    [Owner]       NVARCHAR (100) NOT NULL,
    [Category]    NVARCHAR (100) NOT NULL,
    [Key]         NVARCHAR (100) NOT NULL,
    [AnonymousId] NVARCHAR (100) NULL,
    [UserId]      INT            NULL,
    [Value]       NVARCHAR (MAX) NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Identity.Preference] PRIMARY KEY CLUSTERED ([Owner] ASC, [Category] ASC, [Key] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Identity].[Preference])
    BEGIN
        
        INSERT INTO [Identity].[tmp_ms_xx_Preference] ([Owner], [Category], [Key], [AnonymousId], [UserId], [Value])
        SELECT   [Owner],
                 [Category],
                 [Key],
                 [AnonymousId],
                 [UserId],
                 [Value]
        FROM     [Identity].[Preference]
        ORDER BY [Owner] ASC, [Category] ASC, [Key] ASC;
        
    END

DROP TABLE [Identity].[Preference];

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_Preference]', N'Preference';

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_constraint_PK_Identity.Preference]', N'PK_Identity.Preference', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Identity].[Preference].[IX_UserId]...';


GO
CREATE NONCLUSTERED INDEX [IX_UserId]
    ON [Identity].[Preference]([UserId] ASC);


GO
PRINT N'Starting rebuilding table [Identity].[Role]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Identity].[tmp_ms_xx_Role] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [Name]               NVARCHAR (200)   NOT NULL,
    [Description]        NVARCHAR (MAX)   NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Identity.Role] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Identity].[Role])
    BEGIN
        SET IDENTITY_INSERT [Identity].[tmp_ms_xx_Role] ON;
        INSERT INTO [Identity].[tmp_ms_xx_Role] ([RevisionId], [Name], [Description], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted])
        SELECT   [RevisionId],
                 [Name],
                 [Description],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted]
        FROM     [Identity].[Role]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Identity].[tmp_ms_xx_Role] OFF;
    END

DROP TABLE [Identity].[Role];

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_Role]', N'Role';

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_constraint_PK_Identity.Role]', N'PK_Identity.Role', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Starting rebuilding table [Identity].[RoleGrant]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Identity].[tmp_ms_xx_RoleGrant] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    [UserId]             INT              NOT NULL,
    [RoleId]             INT              NOT NULL,
    [ForEstablishmentId] INT              NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Identity.RoleGrant] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Identity].[RoleGrant])
    BEGIN
        SET IDENTITY_INSERT [Identity].[tmp_ms_xx_RoleGrant] ON;
        INSERT INTO [Identity].[tmp_ms_xx_RoleGrant] ([RevisionId], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [UserId], [RoleId], [ForEstablishmentId])
        SELECT   [RevisionId],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [UserId],
                 [RoleId],
                 [ForEstablishmentId]
        FROM     [Identity].[RoleGrant]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Identity].[tmp_ms_xx_RoleGrant] OFF;
    END

DROP TABLE [Identity].[RoleGrant];

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_RoleGrant]', N'RoleGrant';

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_constraint_PK_Identity.RoleGrant]', N'PK_Identity.RoleGrant', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Identity].[RoleGrant].[IX_UserId]...';


GO
CREATE NONCLUSTERED INDEX [IX_UserId]
    ON [Identity].[RoleGrant]([UserId] ASC);


GO
PRINT N'Creating [Identity].[RoleGrant].[IX_RoleId]...';


GO
CREATE NONCLUSTERED INDEX [IX_RoleId]
    ON [Identity].[RoleGrant]([RoleId] ASC);


GO
PRINT N'Creating [Identity].[RoleGrant].[IX_ForEstablishmentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ForEstablishmentId]
    ON [Identity].[RoleGrant]([ForEstablishmentId] ASC);


GO
PRINT N'Starting rebuilding table [Identity].[SubjectNameIdentifier]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Identity].[tmp_ms_xx_SubjectNameIdentifier] (
    [UserId]       INT            NOT NULL,
    [Number]       INT            NOT NULL,
    [Value]        NVARCHAR (256) NOT NULL,
    [CreatedOnUtc] DATETIME       NOT NULL,
    [UpdatedOnUtc] DATETIME       NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Identity.SubjectNameIdentifier] PRIMARY KEY CLUSTERED ([UserId] ASC, [Number] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Identity].[SubjectNameIdentifier])
    BEGIN
        
        INSERT INTO [Identity].[tmp_ms_xx_SubjectNameIdentifier] ([UserId], [Number], [Value], [CreatedOnUtc], [UpdatedOnUtc])
        SELECT   [UserId],
                 [Number],
                 [Value],
                 [CreatedOnUtc],
                 [UpdatedOnUtc]
        FROM     [Identity].[SubjectNameIdentifier]
        ORDER BY [UserId] ASC, [Number] ASC;
        
    END

DROP TABLE [Identity].[SubjectNameIdentifier];

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_SubjectNameIdentifier]', N'SubjectNameIdentifier';

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_constraint_PK_Identity.SubjectNameIdentifier]', N'PK_Identity.SubjectNameIdentifier', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Identity].[SubjectNameIdentifier].[IX_UserId]...';


GO
CREATE NONCLUSTERED INDEX [IX_UserId]
    ON [Identity].[SubjectNameIdentifier]([UserId] ASC);


GO
PRINT N'Starting rebuilding table [Identity].[User]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Identity].[tmp_ms_xx_User] (
    [RevisionId]          INT              IDENTITY (1, 1) NOT NULL,
    [Name]                NVARCHAR (256)   NOT NULL,
    [IsRegistered]        BIT              NOT NULL,
    [EduPersonTargetedId] NVARCHAR (MAX)   NULL,
    [EntityId]            UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]        DATETIME         NOT NULL,
    [CreatedByPrincipal]  NVARCHAR (256)   NULL,
    [UpdatedOnUtc]        DATETIME         NULL,
    [UpdatedByPrincipal]  NVARCHAR (256)   NULL,
    [Version]             ROWVERSION       NOT NULL,
    [IsCurrent]           BIT              NOT NULL,
    [IsArchived]          BIT              NOT NULL,
    [IsDeleted]           BIT              NOT NULL,
    [PersonId]            INT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Identity.User] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Identity].[User])
    BEGIN
        SET IDENTITY_INSERT [Identity].[tmp_ms_xx_User] ON;
        INSERT INTO [Identity].[tmp_ms_xx_User] ([RevisionId], [Name], [IsRegistered], [EduPersonTargetedId], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [PersonId])
        SELECT   [RevisionId],
                 [Name],
                 [IsRegistered],
                 [EduPersonTargetedId],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [PersonId]
        FROM     [Identity].[User]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Identity].[tmp_ms_xx_User] OFF;
    END

DROP TABLE [Identity].[User];

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_User]', N'User';

EXECUTE sp_rename N'[Identity].[tmp_ms_xx_constraint_PK_Identity.User]', N'PK_Identity.User', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Identity].[User].[IX_PersonId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [Identity].[User]([PersonId] ASC);


GO
PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreement]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreement] (
    [RevisionId]            INT              IDENTITY (1, 1) NOT NULL,
    [Title]                 NVARCHAR (500)   NOT NULL,
    [IsTitleDerived]        BIT              NOT NULL,
    [Description]           NVARCHAR (MAX)   NULL,
    [Type]                  NVARCHAR (150)   NOT NULL,
    [IsAutoRenew]           BIT              NULL,
    [Status]                NVARCHAR (50)    NOT NULL,
    [StartsOn]              DATETIME         NOT NULL,
    [ExpiresOn]             DATETIME         NOT NULL,
    [IsExpirationEstimated] BIT              NOT NULL,
    [Visibility]            NVARCHAR (20)    NOT NULL,
    [EntityId]              UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]          DATETIME         NOT NULL,
    [CreatedByPrincipal]    NVARCHAR (256)   NULL,
    [UpdatedOnUtc]          DATETIME         NULL,
    [UpdatedByPrincipal]    NVARCHAR (256)   NULL,
    [Version]               ROWVERSION       NOT NULL,
    [IsCurrent]             BIT              NOT NULL,
    [IsArchived]            BIT              NOT NULL,
    [IsDeleted]             BIT              NOT NULL,
    [UmbrellaId]            INT              NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreement] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreement])
    BEGIN
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreement] ON;
        INSERT INTO [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreement] ([RevisionId], [Title], [IsTitleDerived], [Description], [Type], [IsAutoRenew], [Status], [StartsOn], [ExpiresOn], [IsExpirationEstimated], [Visibility], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [UmbrellaId])
        SELECT   [RevisionId],
                 [Title],
                 [IsTitleDerived],
                 [Description],
                 [Type],
                 [IsAutoRenew],
                 [Status],
                 [StartsOn],
                 [ExpiresOn],
                 [IsExpirationEstimated],
                 [Visibility],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [UmbrellaId]
        FROM     [InstitutionalAgreements].[InstitutionalAgreement]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreement] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreement];

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreement]', N'InstitutionalAgreement';

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreement]', N'PK_InstitutionalAgreements.InstitutionalAgreement', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreement].[IX_UmbrellaId]...';


GO
CREATE NONCLUSTERED INDEX [IX_UmbrellaId]
    ON [InstitutionalAgreements].[InstitutionalAgreement]([UmbrellaId] ASC);


GO
PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementConfiguration]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementConfiguration] (
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
    CONSTRAINT [tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementConfiguration] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementConfiguration])
    BEGIN
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementConfiguration] ON;
        INSERT INTO [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementConfiguration] ([RevisionId], [ForEstablishmentId], [IsCustomTypeAllowed], [IsCustomStatusAllowed], [IsCustomContactTypeAllowed], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted])
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
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementConfiguration] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementConfiguration];

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementConfiguration]', N'InstitutionalAgreementConfiguration';

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementConfiguration]', N'PK_InstitutionalAgreements.InstitutionalAgreementConfiguration', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementConfiguration].[IX_ForEstablishmentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ForEstablishmentId]
    ON [InstitutionalAgreements].[InstitutionalAgreementConfiguration]([ForEstablishmentId] ASC);


GO
PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementContact]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContact] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [Type]               NVARCHAR (150)   NOT NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    [PersonId]           INT              NOT NULL,
    [AgreementId]        INT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementContact] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementContact])
    BEGIN
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContact] ON;
        INSERT INTO [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContact] ([RevisionId], [Type], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [PersonId], [AgreementId])
        SELECT   [RevisionId],
                 [Type],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [PersonId],
                 [AgreementId]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementContact]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContact] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementContact];

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContact]', N'InstitutionalAgreementContact';

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementContact]', N'PK_InstitutionalAgreements.InstitutionalAgreementContact', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementContact].[IX_PersonId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [InstitutionalAgreements].[InstitutionalAgreementContact]([PersonId] ASC);


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementContact].[IX_AgreementId]...';


GO
CREATE NONCLUSTERED INDEX [IX_AgreementId]
    ON [InstitutionalAgreements].[InstitutionalAgreementContact]([AgreementId] ASC);


GO
PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContactTypeValue] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [ConfigurationId] INT            NOT NULL,
    [Text]            NVARCHAR (150) NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementContactTypeValue] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue])
    BEGIN
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContactTypeValue] ON;
        INSERT INTO [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContactTypeValue] ([Id], [ConfigurationId], [Text])
        SELECT   [Id],
                 [ConfigurationId],
                 [Text]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContactTypeValue] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue];

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementContactTypeValue]', N'InstitutionalAgreementContactTypeValue';

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementContactTypeValue]', N'PK_InstitutionalAgreements.InstitutionalAgreementContactTypeValue', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue].[IX_ConfigurationId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ConfigurationId]
    ON [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue]([ConfigurationId] ASC);


GO
PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementFile]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementFile] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [Content]            VARBINARY (MAX)  NULL,
    [Length]             INT              NOT NULL,
    [MimeType]           NVARCHAR (MAX)   NULL,
    [Name]               NVARCHAR (MAX)   NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    [AgreementId]        INT              NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementFile] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementFile])
    BEGIN
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementFile] ON;
        INSERT INTO [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementFile] ([RevisionId], [Content], [Length], [MimeType], [Name], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [AgreementId])
        SELECT   [RevisionId],
                 [Content],
                 [Length],
                 [MimeType],
                 [Name],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [AgreementId]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementFile]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementFile] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementFile];

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementFile]', N'InstitutionalAgreementFile';

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementFile]', N'PK_InstitutionalAgreements.InstitutionalAgreementFile', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementFile].[IX_AgreementId]...';


GO
CREATE NONCLUSTERED INDEX [IX_AgreementId]
    ON [InstitutionalAgreements].[InstitutionalAgreementFile]([AgreementId] ASC);


GO
PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementNode]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementNode] (
    [AncestorId]  INT NOT NULL,
    [OffspringId] INT NOT NULL,
    [Separation]  INT NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementNode] PRIMARY KEY CLUSTERED ([AncestorId] ASC, [OffspringId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementNode])
    BEGIN
        
        INSERT INTO [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementNode] ([AncestorId], [OffspringId], [Separation])
        SELECT   [AncestorId],
                 [OffspringId],
                 [Separation]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementNode]
        ORDER BY [AncestorId] ASC, [OffspringId] ASC;
        
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementNode];

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementNode]', N'InstitutionalAgreementNode';

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementNode]', N'PK_InstitutionalAgreements.InstitutionalAgreementNode', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementNode].[IX_OffspringId]...';


GO
CREATE NONCLUSTERED INDEX [IX_OffspringId]
    ON [InstitutionalAgreements].[InstitutionalAgreementNode]([OffspringId] ASC);


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementNode].[IX_AncestorId]...';


GO
CREATE NONCLUSTERED INDEX [IX_AncestorId]
    ON [InstitutionalAgreements].[InstitutionalAgreementNode]([AncestorId] ASC);


GO
PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementParticipant]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementParticipant] (
    [Id]              INT IDENTITY (1, 1) NOT NULL,
    [IsOwner]         BIT NOT NULL,
    [EstablishmentId] INT NOT NULL,
    [AgreementId]     INT NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementParticipant] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementParticipant])
    BEGIN
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementParticipant] ON;
        INSERT INTO [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementParticipant] ([Id], [IsOwner], [EstablishmentId], [AgreementId])
        SELECT   [Id],
                 [IsOwner],
                 [EstablishmentId],
                 [AgreementId]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementParticipant]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementParticipant] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant];

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementParticipant]', N'InstitutionalAgreementParticipant';

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementParticipant]', N'PK_InstitutionalAgreements.InstitutionalAgreementParticipant', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementParticipant].[IX_EstablishmentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentId]
    ON [InstitutionalAgreements].[InstitutionalAgreementParticipant]([EstablishmentId] ASC);


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementParticipant].[IX_AgreementId]...';


GO
CREATE NONCLUSTERED INDEX [IX_AgreementId]
    ON [InstitutionalAgreements].[InstitutionalAgreementParticipant]([AgreementId] ASC);


GO
PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementStatusValue]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementStatusValue] (
    [Id]              INT           IDENTITY (1, 1) NOT NULL,
    [ConfigurationId] INT           NOT NULL,
    [Text]            NVARCHAR (50) NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementStatusValue] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementStatusValue])
    BEGIN
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementStatusValue] ON;
        INSERT INTO [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementStatusValue] ([Id], [ConfigurationId], [Text])
        SELECT   [Id],
                 [ConfigurationId],
                 [Text]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementStatusValue]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementStatusValue] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementStatusValue];

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementStatusValue]', N'InstitutionalAgreementStatusValue';

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementStatusValue]', N'PK_InstitutionalAgreements.InstitutionalAgreementStatusValue', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementStatusValue].[IX_ConfigurationId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ConfigurationId]
    ON [InstitutionalAgreements].[InstitutionalAgreementStatusValue]([ConfigurationId] ASC);


GO
PRINT N'Starting rebuilding table [InstitutionalAgreements].[InstitutionalAgreementTypeValue]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementTypeValue] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [ConfigurationId] INT            NOT NULL,
    [Text]            NVARCHAR (150) NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementTypeValue] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [InstitutionalAgreements].[InstitutionalAgreementTypeValue])
    BEGIN
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementTypeValue] ON;
        INSERT INTO [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementTypeValue] ([Id], [ConfigurationId], [Text])
        SELECT   [Id],
                 [ConfigurationId],
                 [Text]
        FROM     [InstitutionalAgreements].[InstitutionalAgreementTypeValue]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementTypeValue] OFF;
    END

DROP TABLE [InstitutionalAgreements].[InstitutionalAgreementTypeValue];

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_InstitutionalAgreementTypeValue]', N'InstitutionalAgreementTypeValue';

EXECUTE sp_rename N'[InstitutionalAgreements].[tmp_ms_xx_constraint_PK_InstitutionalAgreements.InstitutionalAgreementTypeValue]', N'PK_InstitutionalAgreements.InstitutionalAgreementTypeValue', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [InstitutionalAgreements].[InstitutionalAgreementTypeValue].[IX_ConfigurationId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ConfigurationId]
    ON [InstitutionalAgreements].[InstitutionalAgreementTypeValue]([ConfigurationId] ASC);


GO
PRINT N'Starting rebuilding table [Languages].[Language]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Languages].[tmp_ms_xx_Language] (
    [Id]                              INT      IDENTITY (1, 1) NOT NULL,
    [TwoLetterIsoCode]                CHAR (2) NOT NULL,
    [ThreeLetterIsoCode]              CHAR (3) NOT NULL,
    [ThreeLetterIsoBibliographicCode] CHAR (3) NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Languages.Language] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Languages].[Language])
    BEGIN
        SET IDENTITY_INSERT [Languages].[tmp_ms_xx_Language] ON;
        INSERT INTO [Languages].[tmp_ms_xx_Language] ([Id], [TwoLetterIsoCode], [ThreeLetterIsoCode], [ThreeLetterIsoBibliographicCode])
        SELECT   [Id],
                 [TwoLetterIsoCode],
                 [ThreeLetterIsoCode],
                 [ThreeLetterIsoBibliographicCode]
        FROM     [Languages].[Language]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [Languages].[tmp_ms_xx_Language] OFF;
    END

DROP TABLE [Languages].[Language];

EXECUTE sp_rename N'[Languages].[tmp_ms_xx_Language]', N'Language';

EXECUTE sp_rename N'[Languages].[tmp_ms_xx_constraint_PK_Languages.Language]', N'PK_Languages.Language', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Starting rebuilding table [Languages].[LanguageName]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Languages].[tmp_ms_xx_LanguageName] (
    [LanguageId]              INT            NOT NULL,
    [Number]                  INT            NOT NULL,
    [TranslationToLanguageId] INT            NOT NULL,
    [Text]                    NVARCHAR (150) NOT NULL,
    [AsciiEquivalent]         VARCHAR (150)  NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Languages.LanguageName] PRIMARY KEY CLUSTERED ([LanguageId] ASC, [Number] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Languages].[LanguageName])
    BEGIN
        
        INSERT INTO [Languages].[tmp_ms_xx_LanguageName] ([LanguageId], [Number], [TranslationToLanguageId], [Text], [AsciiEquivalent])
        SELECT   [LanguageId],
                 [Number],
                 [TranslationToLanguageId],
                 [Text],
                 [AsciiEquivalent]
        FROM     [Languages].[LanguageName]
        ORDER BY [LanguageId] ASC, [Number] ASC;
        
    END

DROP TABLE [Languages].[LanguageName];

EXECUTE sp_rename N'[Languages].[tmp_ms_xx_LanguageName]', N'LanguageName';

EXECUTE sp_rename N'[Languages].[tmp_ms_xx_constraint_PK_Languages.LanguageName]', N'PK_Languages.LanguageName', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Languages].[LanguageName].[IX_TranslationToLanguageId]...';


GO
CREATE NONCLUSTERED INDEX [IX_TranslationToLanguageId]
    ON [Languages].[LanguageName]([TranslationToLanguageId] ASC);


GO
PRINT N'Creating [Languages].[LanguageName].[IX_LanguageId]...';


GO
CREATE NONCLUSTERED INDEX [IX_LanguageId]
    ON [Languages].[LanguageName]([LanguageId] ASC);


GO
PRINT N'Starting rebuilding table [People].[EmailAddress]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [People].[tmp_ms_xx_EmailAddress] (
    [PersonId]    INT            NOT NULL,
    [Number]      INT            NOT NULL,
    [Value]       NVARCHAR (256) NOT NULL,
    [IsDefault]   BIT            NOT NULL,
    [IsFromSaml]  BIT            NOT NULL,
    [IsConfirmed] BIT            NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_People.EmailAddress] PRIMARY KEY CLUSTERED ([PersonId] ASC, [Number] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [People].[EmailAddress])
    BEGIN
        
        INSERT INTO [People].[tmp_ms_xx_EmailAddress] ([PersonId], [Number], [Value], [IsDefault], [IsFromSaml], [IsConfirmed])
        SELECT   [PersonId],
                 [Number],
                 [Value],
                 [IsDefault],
                 [IsFromSaml],
                 [IsConfirmed]
        FROM     [People].[EmailAddress]
        ORDER BY [PersonId] ASC, [Number] ASC;
        
    END

DROP TABLE [People].[EmailAddress];

EXECUTE sp_rename N'[People].[tmp_ms_xx_EmailAddress]', N'EmailAddress';

EXECUTE sp_rename N'[People].[tmp_ms_xx_constraint_PK_People.EmailAddress]', N'PK_People.EmailAddress', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [People].[EmailAddress].[IX_PersonId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [People].[EmailAddress]([PersonId] ASC);


GO
PRINT N'Starting rebuilding table [People].[EmailConfirmation]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [People].[tmp_ms_xx_EmailConfirmation] (
    [Id]                 INT              IDENTITY (1, 1) NOT NULL,
    [PersonId]           INT              NOT NULL,
    [EmailAddressNumber] INT              NOT NULL,
    [Token]              UNIQUEIDENTIFIER NOT NULL,
    [SecretCode]         NVARCHAR (15)    NULL,
    [Ticket]             NVARCHAR (256)   NULL,
    [Intent]             NVARCHAR (20)    NOT NULL,
    [IssuedOnUtc]        DATETIME         NOT NULL,
    [ExpiresOnUtc]       DATETIME         NOT NULL,
    [RedeemedOnUtc]      DATETIME         NULL,
    [RetiredOnUtc]       DATETIME         NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_People.EmailConfirmation] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [People].[EmailConfirmation])
    BEGIN
        SET IDENTITY_INSERT [People].[tmp_ms_xx_EmailConfirmation] ON;
        INSERT INTO [People].[tmp_ms_xx_EmailConfirmation] ([Id], [PersonId], [EmailAddressNumber], [Token], [SecretCode], [Ticket], [Intent], [IssuedOnUtc], [ExpiresOnUtc], [RedeemedOnUtc], [RetiredOnUtc])
        SELECT   [Id],
                 [PersonId],
                 [EmailAddressNumber],
                 [Token],
                 [SecretCode],
                 [Ticket],
                 [Intent],
                 [IssuedOnUtc],
                 [ExpiresOnUtc],
                 [RedeemedOnUtc],
                 [RetiredOnUtc]
        FROM     [People].[EmailConfirmation]
        ORDER BY [Id] ASC;
        SET IDENTITY_INSERT [People].[tmp_ms_xx_EmailConfirmation] OFF;
    END

DROP TABLE [People].[EmailConfirmation];

EXECUTE sp_rename N'[People].[tmp_ms_xx_EmailConfirmation]', N'EmailConfirmation';

EXECUTE sp_rename N'[People].[tmp_ms_xx_constraint_PK_People.EmailConfirmation]', N'PK_People.EmailConfirmation', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [People].[EmailConfirmation].[IX_PersonId_EmailAddressNumber]...';


GO
CREATE NONCLUSTERED INDEX [IX_PersonId_EmailAddressNumber]
    ON [People].[EmailConfirmation]([PersonId] ASC, [EmailAddressNumber] ASC);


GO
PRINT N'Starting rebuilding table [People].[EmailMessage]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [People].[tmp_ms_xx_EmailMessage] (
    [ToPersonId]          INT            NOT NULL,
    [Number]              INT            NOT NULL,
    [ToAddress]           NVARCHAR (256) NOT NULL,
    [FromEmailTemplate]   NVARCHAR (150) NULL,
    [Subject]             NVARCHAR (250) NOT NULL,
    [Body]                NTEXT          NOT NULL,
    [FromAddress]         NVARCHAR (256) NOT NULL,
    [FromDisplayName]     NVARCHAR (150) NULL,
    [ReplyToAddress]      NVARCHAR (256) NULL,
    [ReplyToDisplayName]  NVARCHAR (150) NULL,
    [ComposedByPrincipal] NVARCHAR (256) NULL,
    [ComposedOnUtc]       DATETIME       NOT NULL,
    [SentOnUtc]           DATETIME       NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_People.EmailMessage] PRIMARY KEY CLUSTERED ([ToPersonId] ASC, [Number] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [People].[EmailMessage])
    BEGIN
        
        INSERT INTO [People].[tmp_ms_xx_EmailMessage] ([ToPersonId], [Number], [ToAddress], [FromEmailTemplate], [Subject], [Body], [FromAddress], [FromDisplayName], [ReplyToAddress], [ReplyToDisplayName], [ComposedByPrincipal], [ComposedOnUtc], [SentOnUtc])
        SELECT   [ToPersonId],
                 [Number],
                 [ToAddress],
                 [FromEmailTemplate],
                 [Subject],
                 [Body],
                 [FromAddress],
                 [FromDisplayName],
                 [ReplyToAddress],
                 [ReplyToDisplayName],
                 [ComposedByPrincipal],
                 [ComposedOnUtc],
                 [SentOnUtc]
        FROM     [People].[EmailMessage]
        ORDER BY [ToPersonId] ASC, [Number] ASC;
        
    END

DROP TABLE [People].[EmailMessage];

EXECUTE sp_rename N'[People].[tmp_ms_xx_EmailMessage]', N'EmailMessage';

EXECUTE sp_rename N'[People].[tmp_ms_xx_constraint_PK_People.EmailMessage]', N'PK_People.EmailMessage', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [People].[EmailMessage].[IX_ToPersonId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ToPersonId]
    ON [People].[EmailMessage]([ToPersonId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[GeoNamesAlternateName]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoNamesAlternateName] (
    [AlternateNameId] BIGINT         IDENTITY (1, 1) NOT NULL,
    [GeoNameId]       INT            NOT NULL,
    [Language]        NVARCHAR (10)  NULL,
    [Name]            NVARCHAR (200) NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoNamesAlternateName] PRIMARY KEY CLUSTERED ([AlternateNameId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoNamesAlternateName])
    BEGIN
        SET IDENTITY_INSERT [Places].[tmp_ms_xx_GeoNamesAlternateName] ON;
        INSERT INTO [Places].[tmp_ms_xx_GeoNamesAlternateName] ([AlternateNameId], [GeoNameId], [Language], [Name])
        SELECT   [AlternateNameId],
                 [GeoNameId],
                 [Language],
                 [Name]
        FROM     [Places].[GeoNamesAlternateName]
        ORDER BY [AlternateNameId] ASC;
        SET IDENTITY_INSERT [Places].[tmp_ms_xx_GeoNamesAlternateName] OFF;
    END

DROP TABLE [Places].[GeoNamesAlternateName];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoNamesAlternateName]', N'GeoNamesAlternateName';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoNamesAlternateName]', N'PK_Places.GeoNamesAlternateName', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[GeoNamesAlternateName].[IX_GeoNameId]...';


GO
CREATE NONCLUSTERED INDEX [IX_GeoNameId]
    ON [Places].[GeoNamesAlternateName]([GeoNameId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[GeoNamesCountry]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoNamesCountry] (
    [GeoNameId]       INT            NOT NULL,
    [NorthLatitude]   FLOAT (53)     NULL,
    [EastLongitude]   FLOAT (53)     NULL,
    [SouthLatitude]   FLOAT (53)     NULL,
    [WestLongitude]   FLOAT (53)     NULL,
    [Code]            CHAR (2)       NOT NULL,
    [Name]            NVARCHAR (200) NOT NULL,
    [ContinentCode]   CHAR (2)       NOT NULL,
    [ContinentName]   NVARCHAR (200) NOT NULL,
    [IsoNumericCode]  INT            NOT NULL,
    [IsoAlpha3Code]   CHAR (3)       NOT NULL,
    [FipsCode]        CHAR (2)       NULL,
    [CapitalCityName] NVARCHAR (200) NULL,
    [AreaInSqKm]      VARCHAR (15)   NULL,
    [CurrencyCode]    CHAR (3)       NULL,
    [Languages]       NVARCHAR (150) NULL,
    [Population]      BIGINT         NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoNamesCountry] PRIMARY KEY CLUSTERED ([GeoNameId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoNamesCountry])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoNamesCountry] ([GeoNameId], [NorthLatitude], [EastLongitude], [SouthLatitude], [WestLongitude], [Code], [Name], [ContinentCode], [ContinentName], [IsoNumericCode], [IsoAlpha3Code], [FipsCode], [CapitalCityName], [AreaInSqKm], [CurrencyCode], [Languages], [Population])
        SELECT   [GeoNameId],
                 [NorthLatitude],
                 [EastLongitude],
                 [SouthLatitude],
                 [WestLongitude],
                 [Code],
                 [Name],
                 [ContinentCode],
                 [ContinentName],
                 [IsoNumericCode],
                 [IsoAlpha3Code],
                 [FipsCode],
                 [CapitalCityName],
                 [AreaInSqKm],
                 [CurrencyCode],
                 [Languages],
                 [Population]
        FROM     [Places].[GeoNamesCountry]
        ORDER BY [GeoNameId] ASC;
        
    END

DROP TABLE [Places].[GeoNamesCountry];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoNamesCountry]', N'GeoNamesCountry';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoNamesCountry]', N'PK_Places.GeoNamesCountry', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[GeoNamesCountry].[IX_GeoNameId]...';


GO
CREATE NONCLUSTERED INDEX [IX_GeoNameId]
    ON [Places].[GeoNamesCountry]([GeoNameId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[GeoNamesFeature]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoNamesFeature] (
    [Code]      VARCHAR (5)    NOT NULL,
    [ClassCode] CHAR (1)       NOT NULL,
    [Name]      NVARCHAR (200) NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoNamesFeature] PRIMARY KEY CLUSTERED ([Code] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoNamesFeature])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoNamesFeature] ([Code], [ClassCode], [Name])
        SELECT   [Code],
                 [ClassCode],
                 [Name]
        FROM     [Places].[GeoNamesFeature]
        ORDER BY [Code] ASC;
        
    END

DROP TABLE [Places].[GeoNamesFeature];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoNamesFeature]', N'GeoNamesFeature';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoNamesFeature]', N'PK_Places.GeoNamesFeature', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[GeoNamesFeature].[IX_ClassCode]...';


GO
CREATE NONCLUSTERED INDEX [IX_ClassCode]
    ON [Places].[GeoNamesFeature]([ClassCode] ASC);


GO
PRINT N'Starting rebuilding table [Places].[GeoNamesFeatureClass]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoNamesFeatureClass] (
    [Code] CHAR (1)       NOT NULL,
    [Name] NVARCHAR (200) NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoNamesFeatureClass] PRIMARY KEY CLUSTERED ([Code] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoNamesFeatureClass])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoNamesFeatureClass] ([Code], [Name])
        SELECT   [Code],
                 [Name]
        FROM     [Places].[GeoNamesFeatureClass]
        ORDER BY [Code] ASC;
        
    END

DROP TABLE [Places].[GeoNamesFeatureClass];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoNamesFeatureClass]', N'GeoNamesFeatureClass';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoNamesFeatureClass]', N'PK_Places.GeoNamesFeatureClass', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Starting rebuilding table [Places].[GeoNamesTimeZone]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoNamesTimeZone] (
    [Id]        VARCHAR (50) NOT NULL,
    [DstOffset] FLOAT (53)   NOT NULL,
    [GmtOffset] FLOAT (53)   NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoNamesTimeZone] PRIMARY KEY CLUSTERED ([Id] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoNamesTimeZone])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoNamesTimeZone] ([Id], [DstOffset], [GmtOffset])
        SELECT   [Id],
                 [DstOffset],
                 [GmtOffset]
        FROM     [Places].[GeoNamesTimeZone]
        ORDER BY [Id] ASC;
        
    END

DROP TABLE [Places].[GeoNamesTimeZone];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoNamesTimeZone]', N'GeoNamesTimeZone';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoNamesTimeZone]', N'PK_Places.GeoNamesTimeZone', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Starting rebuilding table [Places].[GeoNamesToponym]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoNamesToponym] (
    [GeoNameId]       INT            NOT NULL,
    [FeatureCode]     VARCHAR (5)    NOT NULL,
    [TimeZoneId]      VARCHAR (50)   NULL,
    [Latitude]        FLOAT (53)     NULL,
    [Longitude]       FLOAT (53)     NULL,
    [Name]            NVARCHAR (200) NOT NULL,
    [ToponymName]     NVARCHAR (200) NOT NULL,
    [ContinentCode]   CHAR (2)       NULL,
    [CountryCode]     CHAR (2)       NULL,
    [CountryName]     NVARCHAR (200) NULL,
    [Admin1Code]      VARCHAR (15)   NULL,
    [Admin1Name]      NVARCHAR (200) NULL,
    [Admin2Code]      VARCHAR (15)   NULL,
    [Admin2Name]      NVARCHAR (200) NULL,
    [Admin3Code]      VARCHAR (15)   NULL,
    [Admin3Name]      NVARCHAR (200) NULL,
    [Admin4Code]      VARCHAR (15)   NULL,
    [Admin4Name]      NVARCHAR (200) NULL,
    [Population]      BIGINT         NULL,
    [Elevation]       INT            NULL,
    [PlaceId]         INT            NULL,
    [ParentGeoNameId] INT            NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoNamesToponym] PRIMARY KEY CLUSTERED ([GeoNameId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoNamesToponym])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoNamesToponym] ([GeoNameId], [FeatureCode], [TimeZoneId], [Latitude], [Longitude], [Name], [ToponymName], [ContinentCode], [CountryCode], [CountryName], [Admin1Code], [Admin1Name], [Admin2Code], [Admin2Name], [Admin3Code], [Admin3Name], [Admin4Code], [Admin4Name], [Population], [Elevation], [PlaceId], [ParentGeoNameId])
        SELECT   [GeoNameId],
                 [FeatureCode],
                 [TimeZoneId],
                 [Latitude],
                 [Longitude],
                 [Name],
                 [ToponymName],
                 [ContinentCode],
                 [CountryCode],
                 [CountryName],
                 [Admin1Code],
                 [Admin1Name],
                 [Admin2Code],
                 [Admin2Name],
                 [Admin3Code],
                 [Admin3Name],
                 [Admin4Code],
                 [Admin4Name],
                 [Population],
                 [Elevation],
                 [PlaceId],
                 [ParentGeoNameId]
        FROM     [Places].[GeoNamesToponym]
        ORDER BY [GeoNameId] ASC;
        
    END

DROP TABLE [Places].[GeoNamesToponym];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoNamesToponym]', N'GeoNamesToponym';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoNamesToponym]', N'PK_Places.GeoNamesToponym', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[GeoNamesToponym].[IX_FeatureCode]...';


GO
CREATE NONCLUSTERED INDEX [IX_FeatureCode]
    ON [Places].[GeoNamesToponym]([FeatureCode] ASC);


GO
PRINT N'Creating [Places].[GeoNamesToponym].[IX_TimeZoneId]...';


GO
CREATE NONCLUSTERED INDEX [IX_TimeZoneId]
    ON [Places].[GeoNamesToponym]([TimeZoneId] ASC);


GO
PRINT N'Creating [Places].[GeoNamesToponym].[IX_PlaceId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PlaceId]
    ON [Places].[GeoNamesToponym]([PlaceId] ASC);


GO
PRINT N'Creating [Places].[GeoNamesToponym].[IX_ParentGeoNameId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ParentGeoNameId]
    ON [Places].[GeoNamesToponym]([ParentGeoNameId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[GeoNamesToponymNode]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoNamesToponymNode] (
    [AncestorId]  INT NOT NULL,
    [OffspringId] INT NOT NULL,
    [Separation]  INT NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoNamesToponymNode] PRIMARY KEY CLUSTERED ([AncestorId] ASC, [OffspringId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoNamesToponymNode])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoNamesToponymNode] ([AncestorId], [OffspringId], [Separation])
        SELECT   [AncestorId],
                 [OffspringId],
                 [Separation]
        FROM     [Places].[GeoNamesToponymNode]
        ORDER BY [AncestorId] ASC, [OffspringId] ASC;
        
    END

DROP TABLE [Places].[GeoNamesToponymNode];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoNamesToponymNode]', N'GeoNamesToponymNode';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoNamesToponymNode]', N'PK_Places.GeoNamesToponymNode', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[GeoNamesToponymNode].[IX_AncestorId]...';


GO
CREATE NONCLUSTERED INDEX [IX_AncestorId]
    ON [Places].[GeoNamesToponymNode]([AncestorId] ASC);


GO
PRINT N'Creating [Places].[GeoNamesToponymNode].[IX_OffspringId]...';


GO
CREATE NONCLUSTERED INDEX [IX_OffspringId]
    ON [Places].[GeoNamesToponymNode]([OffspringId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[GeoPlanetPlace]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoPlanetPlace] (
    [WoeId]          INT            NOT NULL,
    [EnglishName]    NVARCHAR (200) NOT NULL,
    [Uri]            VARCHAR (200)  NOT NULL,
    [Latitude]       FLOAT (53)     NULL,
    [Longitude]      FLOAT (53)     NULL,
    [NorthLatitude]  FLOAT (53)     NULL,
    [EastLongitude]  FLOAT (53)     NULL,
    [SouthLatitude]  FLOAT (53)     NULL,
    [WestLongitude]  FLOAT (53)     NULL,
    [AreaRank]       INT            NOT NULL,
    [PopulationRank] INT            NOT NULL,
    [Postal]         NVARCHAR (50)  NULL,
    [CountryCode]    NVARCHAR (10)  NULL,
    [CountryType]    NVARCHAR (50)  NULL,
    [CountryName]    NVARCHAR (200) NULL,
    [Admin1Code]     NVARCHAR (10)  NULL,
    [Admin1Type]     NVARCHAR (50)  NULL,
    [Admin1Name]     NVARCHAR (200) NULL,
    [Admin2Code]     NVARCHAR (10)  NULL,
    [Admin2Type]     NVARCHAR (50)  NULL,
    [Admin2Name]     NVARCHAR (200) NULL,
    [Admin3Code]     NVARCHAR (10)  NULL,
    [Admin3Type]     NVARCHAR (50)  NULL,
    [Admin3Name]     NVARCHAR (200) NULL,
    [Locality1Type]  NVARCHAR (50)  NULL,
    [Locality1Name]  NVARCHAR (200) NULL,
    [Locality2Type]  NVARCHAR (50)  NULL,
    [Locality2Name]  NVARCHAR (200) NULL,
    [ParentWoeId]    INT            NULL,
    [TypeCode]       INT            NOT NULL,
    [PlaceId]        INT            NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoPlanetPlace] PRIMARY KEY CLUSTERED ([WoeId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoPlanetPlace])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoPlanetPlace] ([WoeId], [EnglishName], [Uri], [Latitude], [Longitude], [NorthLatitude], [EastLongitude], [SouthLatitude], [WestLongitude], [AreaRank], [PopulationRank], [Postal], [CountryCode], [CountryType], [CountryName], [Admin1Code], [Admin1Type], [Admin1Name], [Admin2Code], [Admin2Type], [Admin2Name], [Admin3Code], [Admin3Type], [Admin3Name], [Locality1Type], [Locality1Name], [Locality2Type], [Locality2Name], [ParentWoeId], [TypeCode], [PlaceId])
        SELECT   [WoeId],
                 [EnglishName],
                 [Uri],
                 [Latitude],
                 [Longitude],
                 [NorthLatitude],
                 [EastLongitude],
                 [SouthLatitude],
                 [WestLongitude],
                 [AreaRank],
                 [PopulationRank],
                 [Postal],
                 [CountryCode],
                 [CountryType],
                 [CountryName],
                 [Admin1Code],
                 [Admin1Type],
                 [Admin1Name],
                 [Admin2Code],
                 [Admin2Type],
                 [Admin2Name],
                 [Admin3Code],
                 [Admin3Type],
                 [Admin3Name],
                 [Locality1Type],
                 [Locality1Name],
                 [Locality2Type],
                 [Locality2Name],
                 [ParentWoeId],
                 [TypeCode],
                 [PlaceId]
        FROM     [Places].[GeoPlanetPlace]
        ORDER BY [WoeId] ASC;
        
    END

DROP TABLE [Places].[GeoPlanetPlace];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoPlanetPlace]', N'GeoPlanetPlace';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoPlanetPlace]', N'PK_Places.GeoPlanetPlace', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[GeoPlanetPlace].[IX_ParentWoeId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ParentWoeId]
    ON [Places].[GeoPlanetPlace]([ParentWoeId] ASC);


GO
PRINT N'Creating [Places].[GeoPlanetPlace].[IX_TypeCode]...';


GO
CREATE NONCLUSTERED INDEX [IX_TypeCode]
    ON [Places].[GeoPlanetPlace]([TypeCode] ASC);


GO
PRINT N'Creating [Places].[GeoPlanetPlace].[IX_PlaceId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PlaceId]
    ON [Places].[GeoPlanetPlace]([PlaceId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[GeoPlanetPlaceBelongTo]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoPlanetPlaceBelongTo] (
    [PlaceWoeId]    INT NOT NULL,
    [Rank]          INT NOT NULL,
    [BelongToWoeId] INT NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoPlanetPlaceBelongTo] PRIMARY KEY CLUSTERED ([PlaceWoeId] ASC, [Rank] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoPlanetPlaceBelongTo])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoPlanetPlaceBelongTo] ([PlaceWoeId], [Rank], [BelongToWoeId])
        SELECT   [PlaceWoeId],
                 [Rank],
                 [BelongToWoeId]
        FROM     [Places].[GeoPlanetPlaceBelongTo]
        ORDER BY [PlaceWoeId] ASC, [Rank] ASC;
        
    END

DROP TABLE [Places].[GeoPlanetPlaceBelongTo];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoPlanetPlaceBelongTo]', N'GeoPlanetPlaceBelongTo';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoPlanetPlaceBelongTo]', N'PK_Places.GeoPlanetPlaceBelongTo', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[GeoPlanetPlaceBelongTo].[IX_PlaceWoeId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PlaceWoeId]
    ON [Places].[GeoPlanetPlaceBelongTo]([PlaceWoeId] ASC);


GO
PRINT N'Creating [Places].[GeoPlanetPlaceBelongTo].[IX_BelongToWoeId]...';


GO
CREATE NONCLUSTERED INDEX [IX_BelongToWoeId]
    ON [Places].[GeoPlanetPlaceBelongTo]([BelongToWoeId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[GeoPlanetPlaceNode]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoPlanetPlaceNode] (
    [AncestorId]  INT NOT NULL,
    [OffspringId] INT NOT NULL,
    [Separation]  INT NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoPlanetPlaceNode] PRIMARY KEY CLUSTERED ([AncestorId] ASC, [OffspringId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoPlanetPlaceNode])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoPlanetPlaceNode] ([AncestorId], [OffspringId], [Separation])
        SELECT   [AncestorId],
                 [OffspringId],
                 [Separation]
        FROM     [Places].[GeoPlanetPlaceNode]
        ORDER BY [AncestorId] ASC, [OffspringId] ASC;
        
    END

DROP TABLE [Places].[GeoPlanetPlaceNode];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoPlanetPlaceNode]', N'GeoPlanetPlaceNode';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoPlanetPlaceNode]', N'PK_Places.GeoPlanetPlaceNode', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[GeoPlanetPlaceNode].[IX_AncestorId]...';


GO
CREATE NONCLUSTERED INDEX [IX_AncestorId]
    ON [Places].[GeoPlanetPlaceNode]([AncestorId] ASC);


GO
PRINT N'Creating [Places].[GeoPlanetPlaceNode].[IX_OffspringId]...';


GO
CREATE NONCLUSTERED INDEX [IX_OffspringId]
    ON [Places].[GeoPlanetPlaceNode]([OffspringId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[GeoPlanetPlaceType]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_GeoPlanetPlaceType] (
    [Code]               INT            NOT NULL,
    [Uri]                VARCHAR (200)  NOT NULL,
    [EnglishName]        NVARCHAR (100) NOT NULL,
    [EnglishDescription] NVARCHAR (500) NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.GeoPlanetPlaceType] PRIMARY KEY CLUSTERED ([Code] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[GeoPlanetPlaceType])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_GeoPlanetPlaceType] ([Code], [Uri], [EnglishName], [EnglishDescription])
        SELECT   [Code],
                 [Uri],
                 [EnglishName],
                 [EnglishDescription]
        FROM     [Places].[GeoPlanetPlaceType]
        ORDER BY [Code] ASC;
        
    END

DROP TABLE [Places].[GeoPlanetPlaceType];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_GeoPlanetPlaceType]', N'GeoPlanetPlaceType';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.GeoPlanetPlaceType]', N'PK_Places.GeoPlanetPlaceType', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Starting rebuilding table [Places].[Place]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_Place] (
    [RevisionId]         INT              IDENTITY (1, 1) NOT NULL,
    [Latitude]           FLOAT (53)       NULL,
    [Longitude]          FLOAT (53)       NULL,
    [NorthLatitude]      FLOAT (53)       NULL,
    [EastLongitude]      FLOAT (53)       NULL,
    [SouthLatitude]      FLOAT (53)       NULL,
    [WestLongitude]      FLOAT (53)       NULL,
    [OfficialName]       NVARCHAR (200)   NOT NULL,
    [IsEarth]            BIT              NOT NULL,
    [IsContinent]        BIT              NOT NULL,
    [IsCountry]          BIT              NOT NULL,
    [IsAdmin1]           BIT              NOT NULL,
    [IsAdmin2]           BIT              NOT NULL,
    [IsAdmin3]           BIT              NOT NULL,
    [EntityId]           UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]       DATETIME         NOT NULL,
    [CreatedByPrincipal] NVARCHAR (256)   NULL,
    [UpdatedOnUtc]       DATETIME         NULL,
    [UpdatedByPrincipal] NVARCHAR (256)   NULL,
    [Version]            ROWVERSION       NOT NULL,
    [IsCurrent]          BIT              NOT NULL,
    [IsArchived]         BIT              NOT NULL,
    [IsDeleted]          BIT              NOT NULL,
    [ParentId]           INT              NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.Place] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[Place])
    BEGIN
        SET IDENTITY_INSERT [Places].[tmp_ms_xx_Place] ON;
        INSERT INTO [Places].[tmp_ms_xx_Place] ([RevisionId], [Latitude], [Longitude], [NorthLatitude], [EastLongitude], [SouthLatitude], [WestLongitude], [OfficialName], [IsEarth], [IsContinent], [IsCountry], [IsAdmin1], [IsAdmin2], [IsAdmin3], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [ParentId])
        SELECT   [RevisionId],
                 [Latitude],
                 [Longitude],
                 [NorthLatitude],
                 [EastLongitude],
                 [SouthLatitude],
                 [WestLongitude],
                 [OfficialName],
                 [IsEarth],
                 [IsContinent],
                 [IsCountry],
                 [IsAdmin1],
                 [IsAdmin2],
                 [IsAdmin3],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [ParentId]
        FROM     [Places].[Place]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Places].[tmp_ms_xx_Place] OFF;
    END

DROP TABLE [Places].[Place];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_Place]', N'Place';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.Place]', N'PK_Places.Place', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[Place].[IX_ParentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_ParentId]
    ON [Places].[Place]([ParentId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[PlaceName]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_PlaceName] (
    [RevisionId]              INT              IDENTITY (1, 1) NOT NULL,
    [TranslationToHint]       VARCHAR (10)     NULL,
    [IsPreferredTranslation]  BIT              NOT NULL,
    [Text]                    NVARCHAR (250)   NOT NULL,
    [AsciiEquivalent]         VARCHAR (250)    NULL,
    [EntityId]                UNIQUEIDENTIFIER NOT NULL,
    [CreatedOnUtc]            DATETIME         NOT NULL,
    [CreatedByPrincipal]      NVARCHAR (256)   NULL,
    [UpdatedOnUtc]            DATETIME         NULL,
    [UpdatedByPrincipal]      NVARCHAR (256)   NULL,
    [Version]                 ROWVERSION       NOT NULL,
    [IsCurrent]               BIT              NOT NULL,
    [IsArchived]              BIT              NOT NULL,
    [IsDeleted]               BIT              NOT NULL,
    [NameForPlaceId]          INT              NOT NULL,
    [TranslationToLanguageId] INT              NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.PlaceName] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[PlaceName])
    BEGIN
        SET IDENTITY_INSERT [Places].[tmp_ms_xx_PlaceName] ON;
        INSERT INTO [Places].[tmp_ms_xx_PlaceName] ([RevisionId], [TranslationToHint], [IsPreferredTranslation], [Text], [AsciiEquivalent], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [NameForPlaceId], [TranslationToLanguageId])
        SELECT   [RevisionId],
                 [TranslationToHint],
                 [IsPreferredTranslation],
                 [Text],
                 [AsciiEquivalent],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [NameForPlaceId],
                 [TranslationToLanguageId]
        FROM     [Places].[PlaceName]
        ORDER BY [RevisionId] ASC;
        SET IDENTITY_INSERT [Places].[tmp_ms_xx_PlaceName] OFF;
    END

DROP TABLE [Places].[PlaceName];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_PlaceName]', N'PlaceName';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.PlaceName]', N'PK_Places.PlaceName', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[PlaceName].[IX_NameForPlaceId]...';


GO
CREATE NONCLUSTERED INDEX [IX_NameForPlaceId]
    ON [Places].[PlaceName]([NameForPlaceId] ASC);


GO
PRINT N'Creating [Places].[PlaceName].[IX_TranslationToLanguageId]...';


GO
CREATE NONCLUSTERED INDEX [IX_TranslationToLanguageId]
    ON [Places].[PlaceName]([TranslationToLanguageId] ASC);


GO
PRINT N'Starting rebuilding table [Places].[PlaceNode]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Places].[tmp_ms_xx_PlaceNode] (
    [AncestorId]  INT NOT NULL,
    [OffspringId] INT NOT NULL,
    [Separation]  INT NOT NULL,
    CONSTRAINT [tmp_ms_xx_constraint_PK_Places.PlaceNode] PRIMARY KEY CLUSTERED ([AncestorId] ASC, [OffspringId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Places].[PlaceNode])
    BEGIN
        
        INSERT INTO [Places].[tmp_ms_xx_PlaceNode] ([AncestorId], [OffspringId], [Separation])
        SELECT   [AncestorId],
                 [OffspringId],
                 [Separation]
        FROM     [Places].[PlaceNode]
        ORDER BY [AncestorId] ASC, [OffspringId] ASC;
        
    END

DROP TABLE [Places].[PlaceNode];

EXECUTE sp_rename N'[Places].[tmp_ms_xx_PlaceNode]', N'PlaceNode';

EXECUTE sp_rename N'[Places].[tmp_ms_xx_constraint_PK_Places.PlaceNode]', N'PK_Places.PlaceNode', N'OBJECT';

COMMIT TRANSACTION;

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;


GO
PRINT N'Creating [Places].[PlaceNode].[IX_AncestorId]...';


GO
CREATE NONCLUSTERED INDEX [IX_AncestorId]
    ON [Places].[PlaceNode]([AncestorId] ASC);


GO
PRINT N'Creating [Places].[PlaceNode].[IX_OffspringId]...';


GO
CREATE NONCLUSTERED INDEX [IX_OffspringId]
    ON [Places].[PlaceNode]([OffspringId] ASC);


GO
PRINT N'Creating [Employees].[EmployeeModuleSettings]...';


GO
CREATE TABLE [Employees].[EmployeeModuleSettings] (
    [Id]                     INT           IDENTITY (1, 1) NOT NULL,
    [NotifyAdminOnUpdate]    BIT           NOT NULL,
    [PersonalInfoAnchorText] NVARCHAR (64) NULL,
    [OfferCountry]           BIT           NOT NULL,
    [OfferActivityType]      BIT           NOT NULL,
    [EstablishmentId]        INT           NOT NULL,
    CONSTRAINT [PK_Employees.EmployeeModuleSettings] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [Employees].[EmployeeModuleSettings].[IX_EstablishmentId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EstablishmentId]
    ON [Employees].[EmployeeModuleSettings]([EstablishmentId] ASC);


GO
PRINT N'Creating [Employees].[EmployeeFacultyRank]...';


GO
CREATE TABLE [Employees].[EmployeeFacultyRank] (
    [Id]                       INT            IDENTITY (1, 1) NOT NULL,
    [Rank]                     NVARCHAR (128) NOT NULL,
    [EmployeeModuleSettingsId] INT            NULL,
    CONSTRAINT [PK_Employees.EmployeeFacultyRank] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [Employees].[EmployeeFacultyRank].[IX_EmployeeModuleSettingsId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EmployeeModuleSettingsId]
    ON [Employees].[EmployeeFacultyRank]([EmployeeModuleSettingsId] ASC);


GO
PRINT N'Creating [Employees].[Employee]...';


GO
CREATE TABLE [Employees].[Employee] (
    [Id]                         INT            IDENTITY (1, 1) NOT NULL,
    [AdministrativeAppointments] NVARCHAR (500) NULL,
    [JobTitles]                  NVARCHAR (500) NULL,
    [PersonId]                   INT            NOT NULL,
    [FacultyRankId]              INT            NULL,
    CONSTRAINT [PK_Employees.Employee] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [Employees].[Employee].[IX_PersonId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [Employees].[Employee]([PersonId] ASC);


GO
PRINT N'Creating [Employees].[Employee].[IX_FacultyRankId]...';


GO
CREATE NONCLUSTERED INDEX [IX_FacultyRankId]
    ON [Employees].[Employee]([FacultyRankId] ASC);


GO
PRINT N'Creating [Employees].[EmployeeModuleSettingsNotifyingAdmins]...';


GO
CREATE TABLE [Employees].[EmployeeModuleSettingsNotifyingAdmins] (
    [EmployeeModuleSettingsId] INT NOT NULL,
    [PersonId]                 INT NOT NULL,
    CONSTRAINT [PK_Employees.EmployeeModuleSettingsNotifyingAdmins] PRIMARY KEY CLUSTERED ([EmployeeModuleSettingsId] ASC, [PersonId] ASC)
);


GO
PRINT N'Creating [Employees].[EmployeeModuleSettingsNotifyingAdmins].[IX_EmployeeModuleSettingsId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EmployeeModuleSettingsId]
    ON [Employees].[EmployeeModuleSettingsNotifyingAdmins]([EmployeeModuleSettingsId] ASC);


GO
PRINT N'Creating [Employees].[EmployeeModuleSettingsNotifyingAdmins].[IX_PersonId]...';


GO
CREATE NONCLUSTERED INDEX [IX_PersonId]
    ON [Employees].[EmployeeModuleSettingsNotifyingAdmins]([PersonId] ASC);


GO
PRINT N'Creating [Activities].[ActivityType]...';


GO
CREATE TABLE [Activities].[ActivityType] (
    [Id]                       INT            IDENTITY (1, 1) NOT NULL,
    [Type]                     NVARCHAR (128) NOT NULL,
    [EmployeeModuleSettingsId] INT            NULL,
    CONSTRAINT [PK_Activities.ActivityType] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [Activities].[ActivityType].[IX_EmployeeModuleSettingsId]...';


GO
CREATE NONCLUSTERED INDEX [IX_EmployeeModuleSettingsId]
    ON [Activities].[ActivityType]([EmployeeModuleSettingsId] ASC);


GO
PRINT N'Creating [Files].[LoadableFile]...';


GO
CREATE TABLE [Files].[LoadableFile] (
    [Id]       INT            IDENTITY (1, 1) NOT NULL,
    [Length]   INT            NOT NULL,
    [MimeType] NVARCHAR (MAX) NULL,
    [Name]     NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Files.LoadableFile] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [Files].[LoadableFileBinary]...';


GO
CREATE TABLE [Files].[LoadableFileBinary] (
    [Id]      INT             NOT NULL,
    [Content] VARBINARY (MAX) NULL,
    CONSTRAINT [PK_Files.LoadableFileBinary] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
PRINT N'Creating [Files].[LoadableFileBinary].[IX_Id]...';


GO
CREATE NONCLUSTERED INDEX [IX_Id]
    ON [Files].[LoadableFileBinary]([Id] ASC);


GO
PRINT N'Creating [Establishments].[Establishment].[ST_Establishment_RevisionId_OfficialName]...';


GO
CREATE STATISTICS [ST_Establishment_RevisionId_OfficialName]
    ON [Establishments].[Establishment]([RevisionId], [OfficialName]);


GO
PRINT N'Creating [Establishments].[Establishment].[ST_Establishment_RevisionId_TypeId_OfficialName]...';


GO
CREATE STATISTICS [ST_Establishment_RevisionId_TypeId_OfficialName]
    ON [Establishments].[Establishment]([RevisionId], [TypeId], [OfficialName]);


GO
PRINT N'Creating [Establishments].[EstablishmentLocation].[ST_EstablishmentLocation_RevisionId_LatLng_Boxing_Zoom_Etc_1]...';


GO
CREATE STATISTICS [ST_EstablishmentLocation_RevisionId_LatLng_Boxing_Zoom_Etc_1]
    ON [Establishments].[EstablishmentLocation]([RevisionId], [CenterLatitude], [CenterLongitude], [BoundingBoxNorthLatitude], [BoundingBoxEastLongitude], [BoundingBoxSouthLatitude], [BoundingBoxWestLongitude], [GoogleMapZoomLevel], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[ST_EstablishmentName_AsciiEquivalent_ForEstablishmentId_TranslationToLanguageId]...';


GO
CREATE STATISTICS [ST_EstablishmentName_AsciiEquivalent_ForEstablishmentId_TranslationToLanguageId]
    ON [Establishments].[EstablishmentName]([AsciiEquivalent], [ForEstablishmentId], [TranslationToLanguageId]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[ST_EstablishmentName_AsciiEquivalent_TranslationToLanguageID]...';


GO
CREATE STATISTICS [ST_EstablishmentName_AsciiEquivalent_TranslationToLanguageID]
    ON [Establishments].[EstablishmentName]([AsciiEquivalent], [TranslationToLanguageId]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[ST_EstablishmentName_ForEstablishmentId_IsOfficialName_Text_TranslationToLanguageId]...';


GO
CREATE STATISTICS [ST_EstablishmentName_ForEstablishmentId_IsOfficialName_Text_TranslationToLanguageId]
    ON [Establishments].[EstablishmentName]([ForEstablishmentId], [IsOfficialName], [Text], [TranslationToLanguageId]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[ST_EstablishmentName_IsOfficialName_Text]...';


GO
CREATE STATISTICS [ST_EstablishmentName_IsOfficialName_Text]
    ON [Establishments].[EstablishmentName]([IsOfficialName], [Text]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[ST_EstablishmentName_RevisionId_TranslationToLanguageId_Text]...';


GO
CREATE STATISTICS [ST_EstablishmentName_RevisionId_TranslationToLanguageId_Text]
    ON [Establishments].[EstablishmentName]([RevisionId], [TranslationToLanguageId], [Text]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[ST_EstablishmentName_Text_TranslationToLanguageId]...';


GO
CREATE STATISTICS [ST_EstablishmentName_Text_TranslationToLanguageId]
    ON [Establishments].[EstablishmentName]([Text], [TranslationToLanguageId]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[ST_EstablishmentName_TranslationToLanguageId_ForEstablishmentId_RevisionId_Text]...';


GO
CREATE STATISTICS [ST_EstablishmentName_TranslationToLanguageId_ForEstablishmentId_RevisionId_Text]
    ON [Establishments].[EstablishmentName]([TranslationToLanguageId], [ForEstablishmentId], [RevisionId], [Text]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[ST_EstablishmentName_TranslationToLanguageId_ForEstablishmentId_Text]...';


GO
CREATE STATISTICS [ST_EstablishmentName_TranslationToLanguageId_ForEstablishmentId_Text]
    ON [Establishments].[EstablishmentName]([TranslationToLanguageId], [ForEstablishmentId], [Text]);


GO
PRINT N'Creating [Establishments].[EstablishmentName].[ST_EstablishmentName_TranslationToLanguageId_IsOfficialName_Text]...';


GO
CREATE STATISTICS [ST_EstablishmentName_TranslationToLanguageId_IsOfficialName_Text]
    ON [Establishments].[EstablishmentName]([TranslationToLanguageId], [IsOfficialName], [Text]);


GO
PRINT N'Creating FK_Activities.Activity_People.Person_PersonId...';


GO
ALTER TABLE [Activities].[Activity] WITH NOCHECK
    ADD CONSTRAINT [FK_Activities.Activity_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Activities.Activity_People.Person_UpdatedByPersonId...';


GO
ALTER TABLE [Activities].[Activity] WITH NOCHECK
    ADD CONSTRAINT [FK_Activities.Activity_People.Person_UpdatedByPersonId] FOREIGN KEY ([UpdatedByPersonId]) REFERENCES [People].[Person] ([RevisionId]);


GO
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
PRINT N'Creating FK_People.Person_Files.LoadableFile_PhotoId...';


GO
ALTER TABLE [People].[Person] WITH NOCHECK
    ADD CONSTRAINT [FK_People.Person_Files.LoadableFile_PhotoId] FOREIGN KEY ([PhotoId]) REFERENCES [Files].[LoadableFile] ([Id]);


GO
PRINT N'Creating FK_Activities.ActivityTag_Activities.Activity_ActivityPersonId_ActivityNumber...';


GO
ALTER TABLE [Activities].[ActivityTag] WITH NOCHECK
    ADD CONSTRAINT [FK_Activities.ActivityTag_Activities.Activity_ActivityPersonId_ActivityNumber] FOREIGN KEY ([ActivityPersonId], [ActivityNumber]) REFERENCES [Activities].[Activity] ([PersonId], [Number]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Activities.DraftedTag_Activities.Activity_ActivityPersonId_ActivityNumber...';


GO
ALTER TABLE [Activities].[DraftedTag] WITH NOCHECK
    ADD CONSTRAINT [FK_Activities.DraftedTag_Activities.Activity_ActivityPersonId_ActivityNumber] FOREIGN KEY ([ActivityPersonId], [ActivityNumber]) REFERENCES [Activities].[Activity] ([PersonId], [Number]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EmailTemplate_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Establishments].[EmailTemplate] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EmailTemplate_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.Establishment_Establishments.Establishment_ParentId...';


GO
ALTER TABLE [Establishments].[Establishment] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.Establishment_Establishments.Establishment_ParentId] FOREIGN KEY ([ParentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Establishments.Establishment_Establishments.EstablishmentType_TypeId...';


GO
ALTER TABLE [Establishments].[Establishment] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.Establishment_Establishments.EstablishmentType_TypeId] FOREIGN KEY ([TypeId]) REFERENCES [Establishments].[EstablishmentType] ([RevisionId]);


GO
PRINT N'Creating FK_Establishments.EstablishmentAddress_Languages.Language_TranslationToLanguageId...';


GO
ALTER TABLE [Establishments].[EstablishmentAddress] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentAddress_Languages.Language_TranslationToLanguageId] FOREIGN KEY ([TranslationToLanguageId]) REFERENCES [Languages].[Language] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentAddress_Establishments.EstablishmentLocation_EstablishmentLocationId...';


GO
ALTER TABLE [Establishments].[EstablishmentAddress] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentAddress_Establishments.EstablishmentLocation_EstablishmentLocationId] FOREIGN KEY ([EstablishmentLocationId]) REFERENCES [Establishments].[EstablishmentLocation] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentEmailDomain_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentEmailDomain] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentEmailDomain_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentLocation_Establishments.Establishment_RevisionId...';


GO
ALTER TABLE [Establishments].[EstablishmentLocation] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentLocation_Establishments.Establishment_RevisionId] FOREIGN KEY ([RevisionId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentLocationInPlace_Establishments.EstablishmentLocation_EstablishmentLocationId...';


GO
ALTER TABLE [Establishments].[EstablishmentLocationInPlace] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentLocationInPlace_Establishments.EstablishmentLocation_EstablishmentLocationId] FOREIGN KEY ([EstablishmentLocationId]) REFERENCES [Establishments].[EstablishmentLocation] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentLocationInPlace_Places.Place_PlaceId...';


GO
ALTER TABLE [Establishments].[EstablishmentLocationInPlace] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentLocationInPlace_Places.Place_PlaceId] FOREIGN KEY ([PlaceId]) REFERENCES [Places].[Place] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentName_Languages.Language_TranslationToLanguageId...';


GO
ALTER TABLE [Establishments].[EstablishmentName] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentName_Languages.Language_TranslationToLanguageId] FOREIGN KEY ([TranslationToLanguageId]) REFERENCES [Languages].[Language] ([Id]);


GO
PRINT N'Creating FK_Establishments.EstablishmentName_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentName] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentName_Establishments.Establishment_ForEstablishmentId] FOREIGN KEY ([ForEstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentNode_Establishments.Establishment_OffspringId...';


GO
ALTER TABLE [Establishments].[EstablishmentNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_OffspringId] FOREIGN KEY ([OffspringId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Establishments.EstablishmentNode_Establishments.Establishment_AncestorId...';


GO
ALTER TABLE [Establishments].[EstablishmentNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_AncestorId] FOREIGN KEY ([AncestorId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Establishments.EstablishmentSamlSignOn_Establishments.Establishment_Id...';


GO
ALTER TABLE [Establishments].[EstablishmentSamlSignOn] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentSamlSignOn_Establishments.Establishment_Id] FOREIGN KEY ([Id]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Establishments.EstablishmentType_Establishments.EstablishmentCategory_CategoryCode...';


GO
ALTER TABLE [Establishments].[EstablishmentType] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentType_Establishments.EstablishmentCategory_CategoryCode] FOREIGN KEY ([CategoryCode]) REFERENCES [Establishments].[EstablishmentCategory] ([Code]);


GO
PRINT N'Creating FK_Establishments.EstablishmentUrl_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentUrl] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentUrl_Establishments.Establishment_ForEstablishmentId] FOREIGN KEY ([ForEstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Identity.EduPersonScopedAffiliation_Identity.User_UserId...';


GO
ALTER TABLE [Identity].[EduPersonScopedAffiliation] WITH NOCHECK
    ADD CONSTRAINT [FK_Identity.EduPersonScopedAffiliation_Identity.User_UserId] FOREIGN KEY ([UserId]) REFERENCES [Identity].[User] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Identity.Preference_Identity.User_UserId...';


GO
ALTER TABLE [Identity].[Preference] WITH NOCHECK
    ADD CONSTRAINT [FK_Identity.Preference_Identity.User_UserId] FOREIGN KEY ([UserId]) REFERENCES [Identity].[User] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Identity.RoleGrant_Identity.User_UserId...';


GO
ALTER TABLE [Identity].[RoleGrant] WITH NOCHECK
    ADD CONSTRAINT [FK_Identity.RoleGrant_Identity.User_UserId] FOREIGN KEY ([UserId]) REFERENCES [Identity].[User] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Identity.RoleGrant_Identity.Role_RoleId...';


GO
ALTER TABLE [Identity].[RoleGrant] WITH NOCHECK
    ADD CONSTRAINT [FK_Identity.RoleGrant_Identity.Role_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Identity].[Role] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Identity.RoleGrant_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Identity].[RoleGrant] WITH NOCHECK
    ADD CONSTRAINT [FK_Identity.RoleGrant_Establishments.Establishment_ForEstablishmentId] FOREIGN KEY ([ForEstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Identity.SubjectNameIdentifier_Identity.User_UserId...';


GO
ALTER TABLE [Identity].[SubjectNameIdentifier] WITH NOCHECK
    ADD CONSTRAINT [FK_Identity.SubjectNameIdentifier_Identity.User_UserId] FOREIGN KEY ([UserId]) REFERENCES [Identity].[User] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Identity.User_People.Person_PersonId...';


GO
ALTER TABLE [Identity].[User] WITH NOCHECK
    ADD CONSTRAINT [FK_Identity.User_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]);


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreement_InstitutionalAgreements.InstitutionalAgreement_UmbrellaId...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreement] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreement_InstitutionalAgreements.InstitutionalAgreement_UmbrellaId] FOREIGN KEY ([UmbrellaId]) REFERENCES [InstitutionalAgreements].[InstitutionalAgreement] ([RevisionId]);


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementConfiguration_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementConfiguration] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementConfiguration_Establishments.Establishment_ForEstablishmentId] FOREIGN KEY ([ForEstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementContact_People.Person_PersonId...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContact] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementContact_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementContact_InstitutionalAgreements.InstitutionalAgreement_AgreementId...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContact] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementContact_InstitutionalAgreements.InstitutionalAgreement_AgreementId] FOREIGN KEY ([AgreementId]) REFERENCES [InstitutionalAgreements].[InstitutionalAgreement] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementContactTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Co...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementContactTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Co] FOREIGN KEY ([ConfigurationId]) REFERENCES [InstitutionalAgreements].[InstitutionalAgreementConfiguration] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementFile_InstitutionalAgreements.InstitutionalAgreement_AgreementId...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementFile] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementFile_InstitutionalAgreements.InstitutionalAgreement_AgreementId] FOREIGN KEY ([AgreementId]) REFERENCES [InstitutionalAgreements].[InstitutionalAgreement] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_OffspringId...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementNode] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_OffspringId] FOREIGN KEY ([OffspringId]) REFERENCES [InstitutionalAgreements].[InstitutionalAgreement] ([RevisionId]);


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_AncestorId...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementNode] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_AncestorId] FOREIGN KEY ([AncestorId]) REFERENCES [InstitutionalAgreements].[InstitutionalAgreement] ([RevisionId]);


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementParticipant_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementParticipant_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementParticipant_InstitutionalAgreements.InstitutionalAgreement_AgreementId...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementParticipant_InstitutionalAgreements.InstitutionalAgreement_AgreementId] FOREIGN KEY ([AgreementId]) REFERENCES [InstitutionalAgreements].[InstitutionalAgreement] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementStatusValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configu...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementStatusValue] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementStatusValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configu] FOREIGN KEY ([ConfigurationId]) REFERENCES [InstitutionalAgreements].[InstitutionalAgreementConfiguration] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_InstitutionalAgreements.InstitutionalAgreementTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configura...';


GO
ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementTypeValue] WITH NOCHECK
    ADD CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configura] FOREIGN KEY ([ConfigurationId]) REFERENCES [InstitutionalAgreements].[InstitutionalAgreementConfiguration] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Languages.LanguageName_Languages.Language_TranslationToLanguageId...';


GO
ALTER TABLE [Languages].[LanguageName] WITH NOCHECK
    ADD CONSTRAINT [FK_Languages.LanguageName_Languages.Language_TranslationToLanguageId] FOREIGN KEY ([TranslationToLanguageId]) REFERENCES [Languages].[Language] ([Id]);


GO
PRINT N'Creating FK_Languages.LanguageName_Languages.Language_LanguageId...';


GO
ALTER TABLE [Languages].[LanguageName] WITH NOCHECK
    ADD CONSTRAINT [FK_Languages.LanguageName_Languages.Language_LanguageId] FOREIGN KEY ([LanguageId]) REFERENCES [Languages].[Language] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_People.EmailAddress_People.Person_PersonId...';


GO
ALTER TABLE [People].[EmailAddress] WITH NOCHECK
    ADD CONSTRAINT [FK_People.EmailAddress_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_People.EmailConfirmation_People.EmailAddress_PersonId_EmailAddressNumber...';


GO
ALTER TABLE [People].[EmailConfirmation] WITH NOCHECK
    ADD CONSTRAINT [FK_People.EmailConfirmation_People.EmailAddress_PersonId_EmailAddressNumber] FOREIGN KEY ([PersonId], [EmailAddressNumber]) REFERENCES [People].[EmailAddress] ([PersonId], [Number]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_People.EmailMessage_People.Person_ToPersonId...';


GO
ALTER TABLE [People].[EmailMessage] WITH NOCHECK
    ADD CONSTRAINT [FK_People.EmailMessage_People.Person_ToPersonId] FOREIGN KEY ([ToPersonId]) REFERENCES [People].[Person] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Places.GeoNamesAlternateName_Places.GeoNamesToponym_GeoNameId...';


GO
ALTER TABLE [Places].[GeoNamesAlternateName] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoNamesAlternateName_Places.GeoNamesToponym_GeoNameId] FOREIGN KEY ([GeoNameId]) REFERENCES [Places].[GeoNamesToponym] ([GeoNameId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Places.GeoNamesCountry_Places.GeoNamesToponym_GeoNameId...';


GO
ALTER TABLE [Places].[GeoNamesCountry] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoNamesCountry_Places.GeoNamesToponym_GeoNameId] FOREIGN KEY ([GeoNameId]) REFERENCES [Places].[GeoNamesToponym] ([GeoNameId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Places.GeoNamesFeature_Places.GeoNamesFeatureClass_ClassCode...';


GO
ALTER TABLE [Places].[GeoNamesFeature] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoNamesFeature_Places.GeoNamesFeatureClass_ClassCode] FOREIGN KEY ([ClassCode]) REFERENCES [Places].[GeoNamesFeatureClass] ([Code]);


GO
PRINT N'Creating FK_Places.GeoNamesToponym_Places.GeoNamesFeature_FeatureCode...';


GO
ALTER TABLE [Places].[GeoNamesToponym] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoNamesToponym_Places.GeoNamesFeature_FeatureCode] FOREIGN KEY ([FeatureCode]) REFERENCES [Places].[GeoNamesFeature] ([Code]);


GO
PRINT N'Creating FK_Places.GeoNamesToponym_Places.GeoNamesTimeZone_TimeZoneId...';


GO
ALTER TABLE [Places].[GeoNamesToponym] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoNamesToponym_Places.GeoNamesTimeZone_TimeZoneId] FOREIGN KEY ([TimeZoneId]) REFERENCES [Places].[GeoNamesTimeZone] ([Id]);


GO
PRINT N'Creating FK_Places.GeoNamesToponym_Places.Place_PlaceId...';


GO
ALTER TABLE [Places].[GeoNamesToponym] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoNamesToponym_Places.Place_PlaceId] FOREIGN KEY ([PlaceId]) REFERENCES [Places].[Place] ([RevisionId]);


GO
PRINT N'Creating FK_Places.GeoNamesToponym_Places.GeoNamesToponym_ParentGeoNameId...';


GO
ALTER TABLE [Places].[GeoNamesToponym] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoNamesToponym_Places.GeoNamesToponym_ParentGeoNameId] FOREIGN KEY ([ParentGeoNameId]) REFERENCES [Places].[GeoNamesToponym] ([GeoNameId]);


GO
PRINT N'Creating FK_Places.GeoNamesToponymNode_Places.GeoNamesToponym_AncestorId...';


GO
ALTER TABLE [Places].[GeoNamesToponymNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoNamesToponymNode_Places.GeoNamesToponym_AncestorId] FOREIGN KEY ([AncestorId]) REFERENCES [Places].[GeoNamesToponym] ([GeoNameId]);


GO
PRINT N'Creating FK_Places.GeoNamesToponymNode_Places.GeoNamesToponym_OffspringId...';


GO
ALTER TABLE [Places].[GeoNamesToponymNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoNamesToponymNode_Places.GeoNamesToponym_OffspringId] FOREIGN KEY ([OffspringId]) REFERENCES [Places].[GeoNamesToponym] ([GeoNameId]);


GO
PRINT N'Creating FK_Places.GeoPlanetPlace_Places.GeoPlanetPlace_ParentWoeId...';


GO
ALTER TABLE [Places].[GeoPlanetPlace] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoPlanetPlace_Places.GeoPlanetPlace_ParentWoeId] FOREIGN KEY ([ParentWoeId]) REFERENCES [Places].[GeoPlanetPlace] ([WoeId]);


GO
PRINT N'Creating FK_Places.GeoPlanetPlace_Places.GeoPlanetPlaceType_TypeCode...';


GO
ALTER TABLE [Places].[GeoPlanetPlace] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoPlanetPlace_Places.GeoPlanetPlaceType_TypeCode] FOREIGN KEY ([TypeCode]) REFERENCES [Places].[GeoPlanetPlaceType] ([Code]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Places.GeoPlanetPlace_Places.Place_PlaceId...';


GO
ALTER TABLE [Places].[GeoPlanetPlace] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoPlanetPlace_Places.Place_PlaceId] FOREIGN KEY ([PlaceId]) REFERENCES [Places].[Place] ([RevisionId]);


GO
PRINT N'Creating FK_Places.GeoPlanetPlaceBelongTo_Places.GeoPlanetPlace_PlaceWoeId...';


GO
ALTER TABLE [Places].[GeoPlanetPlaceBelongTo] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoPlanetPlaceBelongTo_Places.GeoPlanetPlace_PlaceWoeId] FOREIGN KEY ([PlaceWoeId]) REFERENCES [Places].[GeoPlanetPlace] ([WoeId]);


GO
PRINT N'Creating FK_Places.GeoPlanetPlaceBelongTo_Places.GeoPlanetPlace_BelongToWoeId...';


GO
ALTER TABLE [Places].[GeoPlanetPlaceBelongTo] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoPlanetPlaceBelongTo_Places.GeoPlanetPlace_BelongToWoeId] FOREIGN KEY ([BelongToWoeId]) REFERENCES [Places].[GeoPlanetPlace] ([WoeId]);


GO
PRINT N'Creating FK_Places.GeoPlanetPlaceNode_Places.GeoPlanetPlace_AncestorId...';


GO
ALTER TABLE [Places].[GeoPlanetPlaceNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoPlanetPlaceNode_Places.GeoPlanetPlace_AncestorId] FOREIGN KEY ([AncestorId]) REFERENCES [Places].[GeoPlanetPlace] ([WoeId]);


GO
PRINT N'Creating FK_Places.GeoPlanetPlaceNode_Places.GeoPlanetPlace_OffspringId...';


GO
ALTER TABLE [Places].[GeoPlanetPlaceNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.GeoPlanetPlaceNode_Places.GeoPlanetPlace_OffspringId] FOREIGN KEY ([OffspringId]) REFERENCES [Places].[GeoPlanetPlace] ([WoeId]);


GO
PRINT N'Creating FK_Places.Place_Places.Place_ParentId...';


GO
ALTER TABLE [Places].[Place] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.Place_Places.Place_ParentId] FOREIGN KEY ([ParentId]) REFERENCES [Places].[Place] ([RevisionId]);


GO
PRINT N'Creating FK_Places.PlaceName_Places.Place_NameForPlaceId...';


GO
ALTER TABLE [Places].[PlaceName] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.PlaceName_Places.Place_NameForPlaceId] FOREIGN KEY ([NameForPlaceId]) REFERENCES [Places].[Place] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Places.PlaceName_Languages.Language_TranslationToLanguageId...';


GO
ALTER TABLE [Places].[PlaceName] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.PlaceName_Languages.Language_TranslationToLanguageId] FOREIGN KEY ([TranslationToLanguageId]) REFERENCES [Languages].[Language] ([Id]);


GO
PRINT N'Creating FK_Places.PlaceNode_Places.Place_AncestorId...';


GO
ALTER TABLE [Places].[PlaceNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.PlaceNode_Places.Place_AncestorId] FOREIGN KEY ([AncestorId]) REFERENCES [Places].[Place] ([RevisionId]);


GO
PRINT N'Creating FK_Places.PlaceNode_Places.Place_OffspringId...';


GO
ALTER TABLE [Places].[PlaceNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Places.PlaceNode_Places.Place_OffspringId] FOREIGN KEY ([OffspringId]) REFERENCES [Places].[Place] ([RevisionId]);


GO
PRINT N'Creating FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Employees].[EmployeeModuleSettings] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Employees.EmployeeFacultyRank_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId...';


GO
ALTER TABLE [Employees].[EmployeeFacultyRank] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.EmployeeFacultyRank_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId] FOREIGN KEY ([EmployeeModuleSettingsId]) REFERENCES [Employees].[EmployeeModuleSettings] ([Id]);


GO
PRINT N'Creating FK_Employees.Employee_People.Person_PersonId...';


GO
ALTER TABLE [Employees].[Employee] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.Employee_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Employees.Employee_Employees.EmployeeFacultyRank_FacultyRankId...';


GO
ALTER TABLE [Employees].[Employee] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.Employee_Employees.EmployeeFacultyRank_FacultyRankId] FOREIGN KEY ([FacultyRankId]) REFERENCES [Employees].[EmployeeFacultyRank] ([Id]);


GO
PRINT N'Creating FK_Employees.EmployeeModuleSettingsNotifyingAdmins_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId...';


GO
ALTER TABLE [Employees].[EmployeeModuleSettingsNotifyingAdmins] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.EmployeeModuleSettingsNotifyingAdmins_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId] FOREIGN KEY ([EmployeeModuleSettingsId]) REFERENCES [Employees].[EmployeeModuleSettings] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Employees.EmployeeModuleSettingsNotifyingAdmins_People.Person_PersonId...';


GO
ALTER TABLE [Employees].[EmployeeModuleSettingsNotifyingAdmins] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.EmployeeModuleSettingsNotifyingAdmins_People.Person_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [People].[Person] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Activities.ActivityType_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId...';


GO
ALTER TABLE [Activities].[ActivityType] WITH NOCHECK
    ADD CONSTRAINT [FK_Activities.ActivityType_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId] FOREIGN KEY ([EmployeeModuleSettingsId]) REFERENCES [Employees].[EmployeeModuleSettings] ([Id]);


GO
PRINT N'Creating FK_Files.LoadableFileBinary_Files.LoadableFile_Id...';


GO
ALTER TABLE [Files].[LoadableFileBinary] WITH NOCHECK
    ADD CONSTRAINT [FK_Files.LoadableFileBinary_Files.LoadableFile_Id] FOREIGN KEY ([Id]) REFERENCES [Files].[LoadableFile] ([Id]) ON DELETE CASCADE;


GO
PRINT N'Checking existing data against newly created constraints';


GO

ALTER TABLE [Activities].[Activity] WITH CHECK CHECK CONSTRAINT [FK_Activities.Activity_People.Person_PersonId];

ALTER TABLE [Activities].[Activity] WITH CHECK CHECK CONSTRAINT [FK_Activities.Activity_People.Person_UpdatedByPersonId];

ALTER TABLE [People].[Affiliation] WITH CHECK CHECK CONSTRAINT [FK_People.Affiliation_Establishments.Establishment_EstablishmentId];

ALTER TABLE [People].[Affiliation] WITH CHECK CHECK CONSTRAINT [FK_People.Affiliation_People.Person_PersonId];

ALTER TABLE [People].[Person] WITH CHECK CHECK CONSTRAINT [FK_People.Person_Files.LoadableFile_PhotoId];

ALTER TABLE [Activities].[ActivityTag] WITH CHECK CHECK CONSTRAINT [FK_Activities.ActivityTag_Activities.Activity_ActivityPersonId_ActivityNumber];

ALTER TABLE [Activities].[DraftedTag] WITH CHECK CHECK CONSTRAINT [FK_Activities.DraftedTag_Activities.Activity_ActivityPersonId_ActivityNumber];

ALTER TABLE [Establishments].[EmailTemplate] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EmailTemplate_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Establishments].[Establishment] WITH CHECK CHECK CONSTRAINT [FK_Establishments.Establishment_Establishments.Establishment_ParentId];

ALTER TABLE [Establishments].[Establishment] WITH CHECK CHECK CONSTRAINT [FK_Establishments.Establishment_Establishments.EstablishmentType_TypeId];

ALTER TABLE [Establishments].[EstablishmentAddress] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentAddress_Languages.Language_TranslationToLanguageId];

ALTER TABLE [Establishments].[EstablishmentAddress] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentAddress_Establishments.EstablishmentLocation_EstablishmentLocationId];

ALTER TABLE [Establishments].[EstablishmentEmailDomain] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentEmailDomain_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Establishments].[EstablishmentLocation] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentLocation_Establishments.Establishment_RevisionId];

ALTER TABLE [Establishments].[EstablishmentLocationInPlace] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentLocationInPlace_Establishments.EstablishmentLocation_EstablishmentLocationId];

ALTER TABLE [Establishments].[EstablishmentLocationInPlace] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentLocationInPlace_Places.Place_PlaceId];

ALTER TABLE [Establishments].[EstablishmentName] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentName_Languages.Language_TranslationToLanguageId];

ALTER TABLE [Establishments].[EstablishmentName] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentName_Establishments.Establishment_ForEstablishmentId];

ALTER TABLE [Establishments].[EstablishmentNode] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_OffspringId];

ALTER TABLE [Establishments].[EstablishmentNode] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_AncestorId];

ALTER TABLE [Establishments].[EstablishmentSamlSignOn] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentSamlSignOn_Establishments.Establishment_Id];

ALTER TABLE [Establishments].[EstablishmentType] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentType_Establishments.EstablishmentCategory_CategoryCode];

ALTER TABLE [Establishments].[EstablishmentUrl] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentUrl_Establishments.Establishment_ForEstablishmentId];

ALTER TABLE [Identity].[EduPersonScopedAffiliation] WITH CHECK CHECK CONSTRAINT [FK_Identity.EduPersonScopedAffiliation_Identity.User_UserId];

ALTER TABLE [Identity].[Preference] WITH CHECK CHECK CONSTRAINT [FK_Identity.Preference_Identity.User_UserId];

ALTER TABLE [Identity].[RoleGrant] WITH CHECK CHECK CONSTRAINT [FK_Identity.RoleGrant_Identity.User_UserId];

ALTER TABLE [Identity].[RoleGrant] WITH CHECK CHECK CONSTRAINT [FK_Identity.RoleGrant_Identity.Role_RoleId];

ALTER TABLE [Identity].[RoleGrant] WITH CHECK CHECK CONSTRAINT [FK_Identity.RoleGrant_Establishments.Establishment_ForEstablishmentId];

ALTER TABLE [Identity].[SubjectNameIdentifier] WITH CHECK CHECK CONSTRAINT [FK_Identity.SubjectNameIdentifier_Identity.User_UserId];

ALTER TABLE [Identity].[User] WITH CHECK CHECK CONSTRAINT [FK_Identity.User_People.Person_PersonId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreement] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreement_InstitutionalAgreements.InstitutionalAgreement_UmbrellaId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementConfiguration] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementConfiguration_Establishments.Establishment_ForEstablishmentId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContact] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementContact_People.Person_PersonId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContact] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementContact_InstitutionalAgreements.InstitutionalAgreement_AgreementId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementContactTypeValue] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementContactTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Co];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementFile] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementFile_InstitutionalAgreements.InstitutionalAgreement_AgreementId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementNode] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_OffspringId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementNode] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementNode_InstitutionalAgreements.InstitutionalAgreement_AncestorId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementParticipant_Establishments.Establishment_EstablishmentId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementParticipant] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementParticipant_InstitutionalAgreements.InstitutionalAgreement_AgreementId];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementStatusValue] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementStatusValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configu];

ALTER TABLE [InstitutionalAgreements].[InstitutionalAgreementTypeValue] WITH CHECK CHECK CONSTRAINT [FK_InstitutionalAgreements.InstitutionalAgreementTypeValue_InstitutionalAgreements.InstitutionalAgreementConfiguration_Configura];

ALTER TABLE [Languages].[LanguageName] WITH CHECK CHECK CONSTRAINT [FK_Languages.LanguageName_Languages.Language_TranslationToLanguageId];

ALTER TABLE [Languages].[LanguageName] WITH CHECK CHECK CONSTRAINT [FK_Languages.LanguageName_Languages.Language_LanguageId];

ALTER TABLE [People].[EmailAddress] WITH CHECK CHECK CONSTRAINT [FK_People.EmailAddress_People.Person_PersonId];

ALTER TABLE [People].[EmailConfirmation] WITH CHECK CHECK CONSTRAINT [FK_People.EmailConfirmation_People.EmailAddress_PersonId_EmailAddressNumber];

ALTER TABLE [People].[EmailMessage] WITH CHECK CHECK CONSTRAINT [FK_People.EmailMessage_People.Person_ToPersonId];

ALTER TABLE [Places].[GeoNamesAlternateName] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoNamesAlternateName_Places.GeoNamesToponym_GeoNameId];

ALTER TABLE [Places].[GeoNamesCountry] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoNamesCountry_Places.GeoNamesToponym_GeoNameId];

ALTER TABLE [Places].[GeoNamesFeature] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoNamesFeature_Places.GeoNamesFeatureClass_ClassCode];

ALTER TABLE [Places].[GeoNamesToponym] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoNamesToponym_Places.GeoNamesFeature_FeatureCode];

ALTER TABLE [Places].[GeoNamesToponym] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoNamesToponym_Places.GeoNamesTimeZone_TimeZoneId];

ALTER TABLE [Places].[GeoNamesToponym] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoNamesToponym_Places.Place_PlaceId];

ALTER TABLE [Places].[GeoNamesToponym] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoNamesToponym_Places.GeoNamesToponym_ParentGeoNameId];

ALTER TABLE [Places].[GeoNamesToponymNode] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoNamesToponymNode_Places.GeoNamesToponym_AncestorId];

ALTER TABLE [Places].[GeoNamesToponymNode] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoNamesToponymNode_Places.GeoNamesToponym_OffspringId];

ALTER TABLE [Places].[GeoPlanetPlace] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoPlanetPlace_Places.GeoPlanetPlace_ParentWoeId];

ALTER TABLE [Places].[GeoPlanetPlace] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoPlanetPlace_Places.GeoPlanetPlaceType_TypeCode];

ALTER TABLE [Places].[GeoPlanetPlace] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoPlanetPlace_Places.Place_PlaceId];

ALTER TABLE [Places].[GeoPlanetPlaceBelongTo] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoPlanetPlaceBelongTo_Places.GeoPlanetPlace_PlaceWoeId];

ALTER TABLE [Places].[GeoPlanetPlaceBelongTo] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoPlanetPlaceBelongTo_Places.GeoPlanetPlace_BelongToWoeId];

ALTER TABLE [Places].[GeoPlanetPlaceNode] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoPlanetPlaceNode_Places.GeoPlanetPlace_AncestorId];

ALTER TABLE [Places].[GeoPlanetPlaceNode] WITH CHECK CHECK CONSTRAINT [FK_Places.GeoPlanetPlaceNode_Places.GeoPlanetPlace_OffspringId];

ALTER TABLE [Places].[Place] WITH CHECK CHECK CONSTRAINT [FK_Places.Place_Places.Place_ParentId];

ALTER TABLE [Places].[PlaceName] WITH CHECK CHECK CONSTRAINT [FK_Places.PlaceName_Places.Place_NameForPlaceId];

ALTER TABLE [Places].[PlaceName] WITH CHECK CHECK CONSTRAINT [FK_Places.PlaceName_Languages.Language_TranslationToLanguageId];

ALTER TABLE [Places].[PlaceNode] WITH CHECK CHECK CONSTRAINT [FK_Places.PlaceNode_Places.Place_AncestorId];

ALTER TABLE [Places].[PlaceNode] WITH CHECK CHECK CONSTRAINT [FK_Places.PlaceNode_Places.Place_OffspringId];

ALTER TABLE [Employees].[EmployeeModuleSettings] WITH CHECK CHECK CONSTRAINT [FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Employees].[EmployeeFacultyRank] WITH CHECK CHECK CONSTRAINT [FK_Employees.EmployeeFacultyRank_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId];

ALTER TABLE [Employees].[Employee] WITH CHECK CHECK CONSTRAINT [FK_Employees.Employee_People.Person_PersonId];

ALTER TABLE [Employees].[Employee] WITH CHECK CHECK CONSTRAINT [FK_Employees.Employee_Employees.EmployeeFacultyRank_FacultyRankId];

ALTER TABLE [Employees].[EmployeeModuleSettingsNotifyingAdmins] WITH CHECK CHECK CONSTRAINT [FK_Employees.EmployeeModuleSettingsNotifyingAdmins_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId];

ALTER TABLE [Employees].[EmployeeModuleSettingsNotifyingAdmins] WITH CHECK CHECK CONSTRAINT [FK_Employees.EmployeeModuleSettingsNotifyingAdmins_People.Person_PersonId];

ALTER TABLE [Activities].[ActivityType] WITH CHECK CHECK CONSTRAINT [FK_Activities.ActivityType_Employees.EmployeeModuleSettings_EmployeeModuleSettingsId];

ALTER TABLE [Files].[LoadableFileBinary] WITH CHECK CHECK CONSTRAINT [FK_Files.LoadableFileBinary_Files.LoadableFile_Id];


GO
PRINT N'Update complete.';


GO
