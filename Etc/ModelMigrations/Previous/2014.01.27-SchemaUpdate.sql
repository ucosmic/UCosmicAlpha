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


/*
The column [Establishments].[Establishment].[IsUnverified] on table [Establishments].[Establishment] must be added, but the column has no default value and does not allow NULL values. If the table contains data, the ALTER script will not work. To avoid this issue you must either: add a default value to the column, mark it as allowing NULL values, or enable the generation of smart-defaults as a deployment option.
*/

--IF EXISTS (select top 1 1 from [Establishments].[Establishment])
--    RAISERROR (N'Rows were detected. The schema update is terminating because data loss might occur.', 16, 127) WITH NOWAIT

--GO
PRINT N'Dropping [ActivitiesV2].[ActivityLocation].[ST_ActivityValuesId_WithIncludes]...';


GO
DROP INDEX [ST_ActivityValuesId_WithIncludes]
    ON [ActivitiesV2].[ActivityLocation];


GO
PRINT N'Dropping [ActivitiesV2].[ActivityType].[ST_ActivityValuesId_WithIncludes]...';


GO
DROP INDEX [ST_ActivityValuesId_WithIncludes]
    ON [ActivitiesV2].[ActivityType];


GO
PRINT N'Dropping FK_People.Affiliation_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [People].[Affiliation] DROP CONSTRAINT [FK_People.Affiliation_Establishments.Establishment_EstablishmentId];


GO
PRINT N'Dropping FK_Representatives.RepModuleSettings_Establishments.Establishment_OwnerId...';


GO
ALTER TABLE [Representatives].[RepModuleSettings] DROP CONSTRAINT [FK_Representatives.RepModuleSettings_Establishments.Establishment_OwnerId];


GO
PRINT N'Dropping FK_Establishments.Establishment_Establishments.Establishment_ParentId...';


GO
ALTER TABLE [Establishments].[Establishment] DROP CONSTRAINT [FK_Establishments.Establishment_Establishments.Establishment_ParentId];


GO
PRINT N'Dropping FK_Establishments.Establishment_Establishments.EstablishmentType_TypeId...';


GO
ALTER TABLE [Establishments].[Establishment] DROP CONSTRAINT [FK_Establishments.Establishment_Establishments.EstablishmentType_TypeId];


GO
PRINT N'Dropping FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Employees].[EmployeeModuleSettings] DROP CONSTRAINT [FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId];


GO
PRINT N'Dropping FK_Agreements.AgreementContact_Establishments.Establishment_ParticipantAffiliationId...';


GO
ALTER TABLE [Agreements].[AgreementContact] DROP CONSTRAINT [FK_Agreements.AgreementContact_Establishments.Establishment_ParticipantAffiliationId];


GO
PRINT N'Dropping FK_Agreements.AgreementParticipant_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Agreements].[AgreementParticipant] DROP CONSTRAINT [FK_Agreements.AgreementParticipant_Establishments.Establishment_EstablishmentId];


GO
PRINT N'Dropping FK_Agreements.AgreementSettings_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Agreements].[AgreementSettings] DROP CONSTRAINT [FK_Agreements.AgreementSettings_Establishments.Establishment_ForEstablishmentId];


GO
PRINT N'Dropping FK_Employees.Degree_Establishments.Establishment_InstitutionId...';


GO
ALTER TABLE [Employees].[Degree] DROP CONSTRAINT [FK_Employees.Degree_Establishments.Establishment_InstitutionId];


GO
PRINT N'Dropping FK_Establishments.EmailTemplate_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Establishments].[EmailTemplate] DROP CONSTRAINT [FK_Establishments.EmailTemplate_Establishments.Establishment_EstablishmentId];


GO
PRINT N'Dropping FK_Establishments.EstablishmentLocation_Establishments.Establishment_RevisionId...';


GO
ALTER TABLE [Establishments].[EstablishmentLocation] DROP CONSTRAINT [FK_Establishments.EstablishmentLocation_Establishments.Establishment_RevisionId];


GO
PRINT N'Dropping FK_Establishments.EstablishmentCustomId_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentCustomId] DROP CONSTRAINT [FK_Establishments.EstablishmentCustomId_Establishments.Establishment_EstablishmentId];


GO
PRINT N'Dropping FK_Establishments.EstablishmentEmailDomain_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentEmailDomain] DROP CONSTRAINT [FK_Establishments.EstablishmentEmailDomain_Establishments.Establishment_EstablishmentId];


GO
PRINT N'Dropping FK_Establishments.EstablishmentName_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentName] DROP CONSTRAINT [FK_Establishments.EstablishmentName_Establishments.Establishment_ForEstablishmentId];


GO
PRINT N'Dropping FK_Establishments.EstablishmentNode_Establishments.Establishment_AncestorId...';


GO
ALTER TABLE [Establishments].[EstablishmentNode] DROP CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_AncestorId];


GO
PRINT N'Dropping FK_Establishments.EstablishmentNode_Establishments.Establishment_OffspringId...';


GO
ALTER TABLE [Establishments].[EstablishmentNode] DROP CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_OffspringId];


GO
PRINT N'Dropping FK_Establishments.EstablishmentSamlSignOn_Establishments.Establishment_Id...';


GO
ALTER TABLE [Establishments].[EstablishmentSamlSignOn] DROP CONSTRAINT [FK_Establishments.EstablishmentSamlSignOn_Establishments.Establishment_Id];


GO
PRINT N'Dropping FK_Establishments.EstablishmentUrl_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentUrl] DROP CONSTRAINT [FK_Establishments.EstablishmentUrl_Establishments.Establishment_ForEstablishmentId];


GO
PRINT N'Dropping FK_External.ServiceManifest_Establishments.Establishment_TenantId...';


GO
ALTER TABLE [External].[ServiceManifest] DROP CONSTRAINT [FK_External.ServiceManifest_Establishments.Establishment_TenantId];


GO
PRINT N'Dropping FK_Identity.User_Establishments.Establishment_TenantId...';


GO
ALTER TABLE [Identity].[User] DROP CONSTRAINT [FK_Identity.User_Establishments.Establishment_TenantId];


GO
PRINT N'Dropping FK_Identity.RoleGrant_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Identity].[RoleGrant] DROP CONSTRAINT [FK_Identity.RoleGrant_Establishments.Establishment_ForEstablishmentId];


GO
PRINT N'Starting rebuilding table [Establishments].[Establishment]...';


GO
BEGIN TRANSACTION;

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SET XACT_ABORT ON;

CREATE TABLE [Establishments].[tmp_ms_xx_Establishment] (
    [RevisionId]                      INT              IDENTITY (1, 1) NOT NULL,
    [OfficialName]                    NVARCHAR (400)   NOT NULL,
    [VerticalRank]                    INT              NULL,
    [IsUnverified]                    BIT              NOT NULL,
    [WebsiteUrl]                      NVARCHAR (200)   NULL,
    [IsMember]                        BIT              NOT NULL,
    [TypeId]                          INT              NOT NULL,
    [CollegeBoardDesignatedIndicator] CHAR (6)         NULL,
    [UCosmicCode]                     CHAR (6)         NULL,
    [PublicPhone]                     NVARCHAR (50)    NULL,
    [PublicFax]                       NVARCHAR (50)    NULL,
    [PublicEmail]                     NVARCHAR (256)   NULL,
    [PartnerPhone]                    NVARCHAR (50)    NULL,
    [PartnerFax]                      NVARCHAR (50)    NULL,
    [PartnerEmail]                    NVARCHAR (256)   NULL,
    [ExternalId]                      NVARCHAR (32)    NULL,
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
    CONSTRAINT [tmp_ms_xx_constraint_PK_Establishments.Establishment] PRIMARY KEY CLUSTERED ([RevisionId] ASC)
);

IF EXISTS (SELECT TOP 1 1 
           FROM   [Establishments].[Establishment])
    BEGIN
        SET IDENTITY_INSERT [Establishments].[tmp_ms_xx_Establishment] ON;
        INSERT INTO [Establishments].[tmp_ms_xx_Establishment] ([RevisionId], [OfficialName], [VerticalRank], [IsUnverified], [WebsiteUrl], [IsMember], [TypeId], [CollegeBoardDesignatedIndicator], [UCosmicCode], [PublicPhone], [PublicFax], [PublicEmail], [PartnerPhone], [PartnerFax], [PartnerEmail], [ExternalId], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [IsCurrent], [IsArchived], [IsDeleted], [ParentId])
        SELECT   [RevisionId],
                 [OfficialName],
                 [VerticalRank],
				 0,
                 [WebsiteUrl],
                 [IsMember],
                 [TypeId],
                 [CollegeBoardDesignatedIndicator],
                 [UCosmicCode],
                 [PublicPhone],
                 [PublicFax],
                 [PublicEmail],
                 [PartnerPhone],
                 [PartnerFax],
                 [PartnerEmail],
                 [ExternalId],
                 [EntityId],
                 [CreatedOnUtc],
                 [CreatedByPrincipal],
                 [UpdatedOnUtc],
                 [UpdatedByPrincipal],
                 [IsCurrent],
                 [IsArchived],
                 [IsDeleted],
                 [ParentId]
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
PRINT N'Creating [ActivitiesV2].[ActivityLocation].[IX_ActivityValuesId_WithIncludes]...';


GO
CREATE NONCLUSTERED INDEX [IX_ActivityValuesId_WithIncludes]
    ON [ActivitiesV2].[ActivityLocation]([ActivityValuesId] ASC)
    INCLUDE([RevisionId], [PlaceId], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [Version], [IsCurrent], [IsArchived], [IsDeleted]);


GO
PRINT N'Creating [ActivitiesV2].[ActivityType].[IX_ActivityValuesId_WithIncludes]...';


GO
CREATE NONCLUSTERED INDEX [IX_ActivityValuesId_WithIncludes]
    ON [ActivitiesV2].[ActivityType]([ActivityValuesId] ASC)
    INCLUDE([RevisionId], [TypeId], [EntityId], [CreatedOnUtc], [CreatedByPrincipal], [UpdatedOnUtc], [UpdatedByPrincipal], [Version], [IsCurrent], [IsArchived], [IsDeleted]);


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
PRINT N'Creating FK_People.Affiliation_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [People].[Affiliation] WITH NOCHECK
    ADD CONSTRAINT [FK_People.Affiliation_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Representatives.RepModuleSettings_Establishments.Establishment_OwnerId...';


GO
ALTER TABLE [Representatives].[RepModuleSettings] WITH NOCHECK
    ADD CONSTRAINT [FK_Representatives.RepModuleSettings_Establishments.Establishment_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


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
PRINT N'Creating FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Employees].[EmployeeModuleSettings] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Agreements.AgreementContact_Establishments.Establishment_ParticipantAffiliationId...';


GO
ALTER TABLE [Agreements].[AgreementContact] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementContact_Establishments.Establishment_ParticipantAffiliationId] FOREIGN KEY ([ParticipantAffiliationId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Agreements.AgreementParticipant_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Agreements].[AgreementParticipant] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementParticipant_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Agreements.AgreementSettings_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Agreements].[AgreementSettings] WITH NOCHECK
    ADD CONSTRAINT [FK_Agreements.AgreementSettings_Establishments.Establishment_ForEstablishmentId] FOREIGN KEY ([ForEstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Employees.Degree_Establishments.Establishment_InstitutionId...';


GO
ALTER TABLE [Employees].[Degree] WITH NOCHECK
    ADD CONSTRAINT [FK_Employees.Degree_Establishments.Establishment_InstitutionId] FOREIGN KEY ([InstitutionId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Establishments.EmailTemplate_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Establishments].[EmailTemplate] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EmailTemplate_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentLocation_Establishments.Establishment_RevisionId...';


GO
ALTER TABLE [Establishments].[EstablishmentLocation] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentLocation_Establishments.Establishment_RevisionId] FOREIGN KEY ([RevisionId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentCustomId_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentCustomId] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentCustomId_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentEmailDomain_Establishments.Establishment_EstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentEmailDomain] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentEmailDomain_Establishments.Establishment_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentName_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentName] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentName_Establishments.Establishment_ForEstablishmentId] FOREIGN KEY ([ForEstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_Establishments.EstablishmentNode_Establishments.Establishment_AncestorId...';


GO
ALTER TABLE [Establishments].[EstablishmentNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_AncestorId] FOREIGN KEY ([AncestorId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Establishments.EstablishmentNode_Establishments.Establishment_OffspringId...';


GO
ALTER TABLE [Establishments].[EstablishmentNode] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_OffspringId] FOREIGN KEY ([OffspringId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Establishments.EstablishmentSamlSignOn_Establishments.Establishment_Id...';


GO
ALTER TABLE [Establishments].[EstablishmentSamlSignOn] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentSamlSignOn_Establishments.Establishment_Id] FOREIGN KEY ([Id]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Establishments.EstablishmentUrl_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Establishments].[EstablishmentUrl] WITH NOCHECK
    ADD CONSTRAINT [FK_Establishments.EstablishmentUrl_Establishments.Establishment_ForEstablishmentId] FOREIGN KEY ([ForEstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Creating FK_External.ServiceManifest_Establishments.Establishment_TenantId...';


GO
ALTER TABLE [External].[ServiceManifest] WITH NOCHECK
    ADD CONSTRAINT [FK_External.ServiceManifest_Establishments.Establishment_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Identity.User_Establishments.Establishment_TenantId...';


GO
ALTER TABLE [Identity].[User] WITH NOCHECK
    ADD CONSTRAINT [FK_Identity.User_Establishments.Establishment_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Establishments].[Establishment] ([RevisionId]);


GO
PRINT N'Creating FK_Identity.RoleGrant_Establishments.Establishment_ForEstablishmentId...';


GO
ALTER TABLE [Identity].[RoleGrant] WITH NOCHECK
    ADD CONSTRAINT [FK_Identity.RoleGrant_Establishments.Establishment_ForEstablishmentId] FOREIGN KEY ([ForEstablishmentId]) REFERENCES [Establishments].[Establishment] ([RevisionId]) ON DELETE CASCADE;


GO
PRINT N'Checking existing data against newly created constraints';


GO

ALTER TABLE [People].[Affiliation] WITH CHECK CHECK CONSTRAINT [FK_People.Affiliation_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Representatives].[RepModuleSettings] WITH CHECK CHECK CONSTRAINT [FK_Representatives.RepModuleSettings_Establishments.Establishment_OwnerId];

ALTER TABLE [Establishments].[Establishment] WITH CHECK CHECK CONSTRAINT [FK_Establishments.Establishment_Establishments.Establishment_ParentId];

ALTER TABLE [Establishments].[Establishment] WITH CHECK CHECK CONSTRAINT [FK_Establishments.Establishment_Establishments.EstablishmentType_TypeId];

ALTER TABLE [Employees].[EmployeeModuleSettings] WITH CHECK CHECK CONSTRAINT [FK_Employees.EmployeeModuleSettings_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Agreements].[AgreementContact] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementContact_Establishments.Establishment_ParticipantAffiliationId];

ALTER TABLE [Agreements].[AgreementParticipant] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementParticipant_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Agreements].[AgreementSettings] WITH CHECK CHECK CONSTRAINT [FK_Agreements.AgreementSettings_Establishments.Establishment_ForEstablishmentId];

ALTER TABLE [Employees].[Degree] WITH CHECK CHECK CONSTRAINT [FK_Employees.Degree_Establishments.Establishment_InstitutionId];

ALTER TABLE [Establishments].[EmailTemplate] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EmailTemplate_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Establishments].[EstablishmentLocation] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentLocation_Establishments.Establishment_RevisionId];

ALTER TABLE [Establishments].[EstablishmentCustomId] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentCustomId_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Establishments].[EstablishmentEmailDomain] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentEmailDomain_Establishments.Establishment_EstablishmentId];

ALTER TABLE [Establishments].[EstablishmentName] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentName_Establishments.Establishment_ForEstablishmentId];

ALTER TABLE [Establishments].[EstablishmentNode] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_AncestorId];

ALTER TABLE [Establishments].[EstablishmentNode] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentNode_Establishments.Establishment_OffspringId];

ALTER TABLE [Establishments].[EstablishmentSamlSignOn] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentSamlSignOn_Establishments.Establishment_Id];

ALTER TABLE [Establishments].[EstablishmentUrl] WITH CHECK CHECK CONSTRAINT [FK_Establishments.EstablishmentUrl_Establishments.Establishment_ForEstablishmentId];

ALTER TABLE [External].[ServiceManifest] WITH CHECK CHECK CONSTRAINT [FK_External.ServiceManifest_Establishments.Establishment_TenantId];

ALTER TABLE [Identity].[User] WITH CHECK CHECK CONSTRAINT [FK_Identity.User_Establishments.Establishment_TenantId];

ALTER TABLE [Identity].[RoleGrant] WITH CHECK CHECK CONSTRAINT [FK_Identity.RoleGrant_Establishments.Establishment_ForEstablishmentId];


GO
PRINT N'Update complete.';


GO
