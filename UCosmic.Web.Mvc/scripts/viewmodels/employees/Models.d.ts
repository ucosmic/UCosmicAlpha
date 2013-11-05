/// <reference path="../../typings/knockout/knockout.d.ts" />

declare module Employees.ApiModels {

    export interface EmployeesPlacesInputModel {
        countries?: boolean;
        placeIds?: number[];
        placeAgnostic?: boolean;
    }

    export interface EmployeesPlaceApiModel { // TODO: refactor name, should not have Model at end
        establishmentId: number;
        placeId?: number;
        placeName: string;
        isCountry: boolean;
        countryCode: string;
        activityIds: number[];
        activityPersonIds: number[];
        activityTypes?: EmployeeActivityTypeCount[];
    }

    export interface EmployeeActivityTypeCount {
        activityTypeId: number;
        text?: string;
        rank?: number;
        hasIcon: boolean;
        iconSrc?: string;
        activityIds: number[];
        activityPersonIds: number[];
    }

    export interface EmployeeActivityCounts {
        personCount: number;
        activityCount: number;
        locationCount: number;
    }
}

declare module Employees.KoModels {

    export interface EmployeeActivityCounts {
        personCount: KnockoutObservable<string>;
        activityCount: KnockoutObservable<string>;
        locationCount: KnockoutObservable<string>;
    }

}

