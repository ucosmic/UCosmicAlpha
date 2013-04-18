/// <reference path="../../ko/knockout-2.2.d.ts" />

module Service.ApiModels {

    export interface IEmployeeActivityType {
        id: number;
        type: string;
        rank: number;
    }

    export interface IActivityLocation {
        id: number;
        isCountry: bool;
        isBodyOfWater: bool;
        isEarth: bool;
        officialName: string;
    }

    export interface IInstitution {
        id: number;
        officialName: string;
    }

    export interface IObservableValuesActivityLocation {
        id: KnockoutObservableNumber;
        placeId: KnockoutObservableNumber;
    }

    export interface IObservableInstitution {
        id: KnockoutObservableNumber;
        officialName: KnockoutObservableString;
    }

    export interface IObservableActivityType {
        id: KnockoutObservableNumber;
        type: KnockoutObservableString;
        checked: KnockoutComputed;
    }

    export interface IObservableValuesActivityType {
        id: KnockoutObservableNumber;
        typeId: KnockoutObservableNumber;
    }

    export interface IObservableActivityTag {
        id: KnockoutObservableNumber;
        number: KnockoutObservableNumber;
        text: KnockoutObservableString; 
        domainTypeText: KnockoutObservableString; 
        domainKey: KnockoutObservableNumber;
        modeText: KnockoutObservableString; 
        isInstitution: KnockoutObservableBool;
    }

    export interface IObservableActivityDocument
    {
        id: KnockoutObservableNumber;
        fileId: KnockoutObservableNumber;
        imageId: KnockoutObservableNumber;
        proxyWidth: KnockoutObservableNumber;
        proxyHeight: KnockoutObservableNumber;
        title: KnockoutObservableString;
        visible: KnockoutObservableBool;
        fileExt: KnockoutObservableString;
        size: KnockoutObservableString;
    }

    export interface IObservableActivityValues {
        id: KnockoutObservableNumber;
        title: KnockoutObservableString;
        content: KnockoutObservableString;
        startsOn: KnockoutObservableDate;
        endsOn: KnockoutObservableDate;
        wasExternallyFunded: KnockoutObservableBool;
        wasinternallyFunded: KnockoutObservableBool;
        locations: KnockoutObservableArray;
        types: KnockoutObservableArray;         // IObservableValuesActivityType
        modeText: KnockoutObservableString;
        tags: KnockoutObservableArray;
        documents: KnockoutObservableArray;
    }

    export interface IObservableActivity {
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        personId: KnockoutObservableNumber;
        number: KnockoutObservableNumber;
        entityId: KnockoutObservableString;     // guid converted to string
        modeText: KnockoutObservableString;
        //values: KnockoutObservableAny;      // only values for modeText
        values: IObservableActivityValues;
    }

    export interface IActivityPage {
        personId: KnockoutObservableNumber;
        orderBy: KnockoutObservableString;
        pageSize: KnockoutObservableNumber;
        pageNumber: KnockoutObservableNumber;
        items: KnockoutObservableArray;
    }

}