declare module Activities.ApiModels {

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