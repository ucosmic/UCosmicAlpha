/// <reference path="../../../require.d.ts" />
/// <reference path="../../../ko/knockout-2.2.d.ts" />
/// <reference path="../../../google/google.maps.d.ts" />

export interface KnockoutObservableCountryModelArray extends KnockoutObservableArrayFunctions {
    (): IServerCountryApiModel[];
    (value: IServerCountryApiModel[]): void;

    subscribe(callback: (newValue: IServerCountryApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: IServerCountryApiModel[], topic?: string);
}

export interface KnockoutObservablePlaceModelArray extends KnockoutObservableArrayFunctions {
    (): IServerApiModel[];
    (value: IServerApiModel[]): void;

    subscribe(callback: (newValue: IServerApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: IServerApiModel[], topic?: string);
}


    export interface IServerPointModel {
        latitude: number;
        longitude: number;
        hasValue?: bool;
    }

    export interface IServerBoxModel {
        northEast: IServerPointModel;
        southWest: IServerPointModel;
        hasValue?: bool;
    }

    export interface IServerApiModel {
        id: number;
        parentId?: number;
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

        export function getPlaceById(places: IServerApiModel[], id: number): IServerApiModel {
            if (places && places.length > 0) {
                for (var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if (place.id == id) return place;
                }
            }
            return null;
        }

        export function getContinent(places: IServerApiModel[]): IServerApiModel {
            if (places && places.length > 0) {
                for (var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if (place.isContinent) return place;
                }
            }
            return null;
        }

        export function getCountry(places: IServerApiModel[]): IServerApiModel {
            if (places && places.length > 0) {
                for (var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if (place.isCountry) return place;
                }
            }
            return null;
        }

        export function getAdmin1(places: IServerApiModel[]): IServerApiModel {
            if (places && places.length > 0) {
                for (var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if (place.isAdmin1) return place;
                }
            }
            return null;
        }

        export function getAdmin2(places: IServerApiModel[]): IServerApiModel {
            if (places && places.length > 0) {
                for (var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if (place.isAdmin2) return place;
                }
            }
            return null;
        }

        export function getAdmin3(places: IServerApiModel[]): IServerApiModel {
            if (places && places.length > 0) {
                for (var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if (place.isAdmin3) return place;
                }
            }
            return null;
        }

        export function getSubAdmins(places: IServerApiModel[]): IServerApiModel[] {
            var subAdmins: IServerApiModel[] = [];
            if (places && places.length > 0) {
                for (var i = 0; i < places.length; i++) {
                    var place = places[i];
                    if (!place.isEarth && !place.isContinent && !place.isCountry &&
                        !place.isAdmin1 && !place.isAdmin2 && !place.isAdmin3)
                        subAdmins[subAdmins.length] = place;
                }
            }
            return subAdmins;
        }

        export function convertToLatLng(point: IServerPointModel): gm.LatLng {
            return new gm.LatLng(point.latitude, point.longitude);
        }

        export function convertToLatLngBounds(box: IServerBoxModel): gm.LatLngBounds {
            return new gm.LatLngBounds(convertToLatLng(box.southWest),
                convertToLatLng(box.northEast));
        }
    }
