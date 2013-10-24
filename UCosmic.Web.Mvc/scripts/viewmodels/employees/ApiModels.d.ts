declare module Employees.ApiModels {
    export interface ActivityPlaceApiModel{
        placeId: number;
        placeName: string;
        isCountry: boolean;
        countryCode: string;
        activityIds: number[];
    }
    export interface ActivityPlacesInputModel {
        countries?: boolean;
        placeIds?: number[];
    }
}