CREATE STATISTICS [ST_PlaceId_RevisionId] ON [ActivitiesV2].[ActivityLocation]([PlaceId], [RevisionId])

CREATE STATISTICS [ST_ActivityValuesId_RevisionId_PlaceId] ON [ActivitiesV2].[ActivityLocation]([ActivityValuesId], [RevisionId], [PlaceId])

CREATE NONCLUSTERED INDEX [ST_ActivityValuesId_WithIncludes] ON [ActivitiesV2].[ActivityLocation] 
(
	[ActivityValuesId] ASC
)
INCLUDE ( [RevisionId],
[PlaceId],
[EntityId],
[CreatedOnUtc],
[CreatedByPrincipal],
[UpdatedOnUtc],
[UpdatedByPrincipal],
[Version],
[IsCurrent],
[IsArchived],
[IsDeleted])

CREATE STATISTICS [ST_TypeId_RevisionId] ON [ActivitiesV2].[ActivityType]([TypeId], [RevisionId])

CREATE STATISTICS [ST_RevisionId_TypeId] ON [ActivitiesV2].[ActivityType]([ActivityValuesId], [RevisionId], [TypeId])

CREATE NONCLUSTERED INDEX [ST_ActivityValuesId_WithIncludes] ON [ActivitiesV2].[ActivityType] 
(
	[ActivityValuesId] ASC
)
INCLUDE ( [RevisionId],
[TypeId],
[EntityId],
[CreatedOnUtc],
[CreatedByPrincipal],
[UpdatedOnUtc],
[UpdatedByPrincipal],
[Version],
[IsCurrent],
[IsArchived],
[IsDeleted]) 

CREATE STATISTICS [ST_OnGoing] ON [ActivitiesV2].[ActivityValues]([OnGoing])

CREATE STATISTICS [ST_RevisionId_OnGoing] ON [ActivitiesV2].[ActivityValues]([RevisionId], [OnGoing])
