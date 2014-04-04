declare module Activities.ApiModels {

    export interface SearchInput extends App.ApiModels.SearchInput {
        pivot?: number;
        keyword?: string;
        placeIds?: number[];
        ancestorIds?: number;
        placeNames?: string[];
        activityTypeIds: number[];
        since?: string;
        until?: string;
        includeUndated?: string;
        orderBy?: string;
        ancestorId?: number;
    }

    export interface ScalarEstablishment {
        id: number;
        parentId?: number;
        rank?: number;
        typeId: number;
        officialName: string;
        contextName?: string;
        uCosmicCode: string;
        ceebCode: string;
    }

    export interface SearchResult {
        activityId: number;
        title: string;
        startsOn: string;
        endsOn: string;
        startsFormat: string;
        endsFormat: string;
        onGoing: boolean;
    }

    export interface Activity {
        activityMode: string;
        activityId: number;
        title: string;
        content: string;
        startsOn: string;
        endsOn: string;
        startsFormat: string;
        endsFormat: string;
        onGoing: boolean;
        isExternallyFunded: boolean;
        isInternallyFunded: boolean;
        updatedByPrincipal: string;
        updatedOnUtc: string;
        types: ActivityType[];
        places: ActivityPlace[]
        tags: ActivityTag[]
        documents: ActivityDocument[];
    }

    export interface ActivityType {
        activityId: number;
        typeId: number;
        text: string;
        rank: number;
    }

    export interface ActivityTypeSearchFilter {
        activityTypeId: number;
        text: string;
        rank: number;
    }

    export interface ActivityPlace {
        activityId: number;
        placeId: number;
        placeName: string;
    }

    export interface ActivityTag {
        activityId: number;
        text: string;
        domainType: ViewModels.ActivityTagDomainType;
        domainKey: number;
    }

    export interface ActivityDocument {
        activityId: number;
        documentId: number;
        title: string;
        fileName: string;
        byteCount: number;
        size: string;
        extension: string;
    }
}

declare module Activities.KoModels {

    export interface ActivityType {
        activityId: KnockoutObservable<number>;
        typeId: KnockoutObservable<number>;
        text: KnockoutObservable<string>;
    }

    export interface ActivityDocument {
        activityId: KnockoutObservable<number>;
        documentId: KnockoutObservable<number>;
        title: KnockoutObservable<string>;
        fileName: KnockoutObservable<string>;
        byteCount: KnockoutObservable<number>;
        size: KnockoutObservable<string>;
        extension: KnockoutObservable<string>;
    }

    export interface ActivityTag {
        activityId: KnockoutObservable<number>;
        text: KnockoutObservable<string>;
        domainType: KnockoutObservable<string>;
        domainKey: KnockoutObservable<number>;
    }

    export interface ActivityFormBindings {
        activityId: number;
        workCopyId: number;
        target: Element;
        dataUrlFormat: string;
        placeOptionsUrlFormat: string;
        typeOptionsUrlFormat: string;
    }
}

declare module Service.ApiModels {

    export interface IEmployeeActivityType {
        id: number;
        type: string;
        rank: number;
        iconName: string;
    }
}