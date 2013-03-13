/// <reference path="../../ko/knockout-2.2.d.ts" />

module Service.ApiModels {

    export interface IEmployeeActivityType {
        id: number;
        type: string;
    }

    export interface IActivityLocation {
        placeId: number;
        isCountry: bool;
        isBodyOfWater: bool;
        isEarth: bool;
        officialName: string;
    }

    export interface IObservableActivityLocation
    {
        revisionId: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        activityValuesId: KnockoutObservableNumber;
        placeId: KnockoutObservableNumber;
    }

    export interface IObservableActivityType
    {
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        activityValuesId: KnockoutObservableNumber;
        typeId: KnockoutObservableNumber;
    }

    export interface IObservableActivityValues {
        revisionId: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        activityId: KnockoutObservableNumber;
        title: KnockoutObservableString;
        content: KnockoutObservableString;
        wtartsOn: KnockoutObservableDate;
        endsOn: KnockoutObservableDate;
        locations: KnockoutObservableArray;
        types: KnockoutObservableArray;
        modeText: KnockoutObservableString;
    }

    export interface IObservableActivityTag {
        revisionId: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        activityId: KnockoutObservableNumber;
        number: KnockoutObservableNumber;
        text: KnockoutObservableString; 
        domainTypeText: KnockoutObservableString; 
        domainKey: KnockoutObservableNumber;
        modeText: KnockoutObservableString; 
        isInstitution: KnockoutObservableBool;
    }

    export interface IObservableActivity {
        revisionId: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        personId: KnockoutObservableNumber;
        number: KnockoutObservableNumber;
        entityId: KnockoutObservableString;     // guid converted to string
        modeText: KnockoutObservableString;
        values: KnockoutObservableArray;
        tags: KnockoutObservableArray;
    }

    export interface IActivityPage {
        personId: KnockoutObservableNumber;
        orderBy: KnockoutObservableString;
        pageSize: KnockoutObservableNumber;
        pageNumber: KnockoutObservableNumber;
        items: KnockoutObservableArray;
    }

}