/// <reference path="../../typings/knockout/knockout.d.ts" />

declare module Employees.ApiModels {

    export interface EmployeesPlaceApiModel {
        placeId: number;
        placeName: string;
        isCountry: boolean;
        countryCode: string;
        activityIds: number[];
        activityPersonIds: number[];
    }

    //export interface EmployeesPivotPlaceApiModel {
    //    placeId: number;
    //    placeName: string;
    //    isCountry: boolean;
    //    countryCode: string;
    //}

    //export interface ActivitiesPlaceApiModel extends EmployeesPivotPlaceApiModel {
    //    activityIds: number[];
    //}

    //export interface ActivitiesPlacesInputModel {
    //    countries?: boolean;
    //    placeIds?: number[];
    //}

    //export interface PeoplePlaceApiModel extends EmployeesPivotPlaceApiModel {
    //    personIds: number[];
    //}

    //export interface PeoplePlacesInputModel {
    //    countries?: boolean;
    //    placeIds?: number[];
    //}

    export interface EmployeesPlacesInputModel {
        countries?: boolean;
        placeIds?: number[];
    }

    export interface ActivitiesSummary {
        personCount: number;
        activityCount: number;
        locationCount: number;
    }
}

declare module Employees.KoModels {

    export interface ActivitiesSummary {
        personCount: KnockoutObservable<string>;
        activityCount: KnockoutObservable<string>;
        locationCount: KnockoutObservable<string>;
    }

}

