/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../google/google.maps.d.ts" />

interface KnockoutObservableCountryModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Places.IServerCountryApiModel[];
    (value: ViewModels.Places.IServerCountryApiModel[]): void;

    subscribe(callback: (newValue: ViewModels.Places.IServerCountryApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: ViewModels.Places.IServerCountryApiModel[], topic?: string);
}

interface KnockoutObservablePlaceModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Places.IServerApiModel[];
    (value: ViewModels.Places.IServerApiModel[]): void;

    subscribe(callback: (newValue: ViewModels.Places.IServerApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: ViewModels.Places.IServerApiModel[], topic?: string);
}

module ViewModels.Places {

    export interface IServerPointModel {
        latitude: number;
        longitude: number;
        hasValue: bool;
    }

    export interface IServerBoxModel {
        northEast: IServerPointModel;
        southWest: IServerPointModel;
        hasValue: bool;
    }

    export interface IServerApiModel {
        id: number;
        officialName: string;
        center: IServerPointModel;
        box: IServerBoxModel;
        isEarth: bool;
        isContinent: bool;
        isCountry: bool;
        isAdmin1: bool;
        isAdmin2: bool;
        isAdmin3: bool;
        countryCode: string;
        placeTypeEnglishName: string;
    }

    export interface IServerCountryApiModel {
        code: string;
        name: string;
        box?: IServerBoxModel;
    }

    export class ServerCountryApiModel implements IServerCountryApiModel {

        constructor (public code: string, public name: string) {
        }
    }

    export module Utils {

        import gm = google.maps

        export function getCountry(places: IServerApiModel[]): IServerApiModel {
            if (places && places.length > 0) {
                for (var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if (place.isCountry) return place;
                }
            }
            return null;
        }

        export function convertToLatLng(point: IServerPointModel): gm.LatLng {
            return new gm.LatLng(point.latitude, point.longitude);
        }

        export function convertToLatLngBounds(box: IServerBoxModel): gm.LatLngBounds {
            return new gm.LatLngBounds(convertToLatLng(box.southWest),
                convertToLatLng(box.northEast));
        }
    }
}