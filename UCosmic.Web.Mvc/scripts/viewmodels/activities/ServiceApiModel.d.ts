/// <reference path="../../typings/knockout/knockout.d.ts" />

declare module Service.ApiModels {

    export interface IEmployeeActivityType {
        id: number;
        type: string;
        rank: number;
        iconName: string;
    }

    export interface IActivityLocation {
        id: number;
        isCountry: boolean;
        isBodyOfWater: boolean;
        isEarth: boolean;
        officialName: string;
    }

    export interface IInstitution {
        id: number;
        officialName: string;
    }

    export interface IObservableValuesActivityLocation {
        id: KnockoutObservable<number>;
        placeId: KnockoutObservable<number>;
    }

    export interface IObservableInstitution {
        id: KnockoutObservable<number>;
        officialName: KnockoutObservable<string>;
    }

    export interface IObservableActivityType {
        id: KnockoutObservable<number>;
        type: KnockoutObservable<string>;
        checked: KnockoutComputed<boolean>;
    }

    export interface IObservableValuesActivityType {
        id: KnockoutObservable<number>;
        typeId: KnockoutObservable<number>;
    }

    export interface IObservableActivityTag {
        id: KnockoutObservable<number>;
        number: KnockoutObservable<number>;
        text: KnockoutObservable<string>; 
        domainTypeText: KnockoutObservable<string>; 
        domainKey: KnockoutObservable<number>;
        modeText: KnockoutObservable<string>; 
        isInstitution: KnockoutObservable<boolean>;
    }

    export interface IObservableActivityDocument
    {
        id: KnockoutObservable<number>;
        activityId: KnockoutObservable<number>;
        title: KnockoutObservable<string>;
        fileExt: KnockoutObservable<string>;
        length: KnockoutObservable<number>;
        size: KnockoutObservable<string>;
    }

    export interface IObservableActivityValues {
        id: KnockoutObservable<number>;
        title: KnockoutObservable<string>;
        content: KnockoutObservable<string>;
        startsOn?: KnockoutObservable<Date>;
        endsOn?: KnockoutObservable<Date>;
        onGoing?: KnockoutObservable<boolean>;
        dateFormat: KnockoutObservable<string>;
        wasExternallyFunded: KnockoutObservable<boolean>;
        wasInternallyFunded: KnockoutObservable<boolean>;
        locations: KnockoutObservableArray<any>;
        types: KnockoutObservableArray<any>;         // IObservableValuesActivityType
        modeText: KnockoutObservable<string>;
        tags: KnockoutObservableArray<any>;
        documents: KnockoutObservableArray<any>;

        /* Knockout-Validation */
        errors: KnockoutValidationErrors;
        isValid: () => boolean;
        isAnyMessageShown: () => boolean;
    }

    export interface IObservableActivity {
        id: KnockoutObservable<number>;
        version: KnockoutObservable<string>;      // byte[] converted to base64
        personId: KnockoutObservable<number>;
        number: KnockoutObservable<number>;
        entityId: KnockoutObservable<string>;     // guid converted to string
        modeText: KnockoutObservable<string>;
        values: IObservableActivityValues;
    }

    export interface IActivityPage {
        personId: KnockoutObservable<number>;
        orderBy: KnockoutObservable<string>;
        pageSize: KnockoutObservable<number>;
        pageNumber: KnockoutObservable<number>;
        items: KnockoutObservableArray<any>;
    }

}