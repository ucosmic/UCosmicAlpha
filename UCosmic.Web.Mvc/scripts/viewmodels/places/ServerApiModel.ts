/// <reference path="../../ko/knockout-2.2.d.ts" />

interface KnockoutObservableCountryModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Places.IServerCountryApiModel[];
    (value: ViewModels.Places.IServerCountryApiModel[]): void;

    subscribe(callback: (newValue: ViewModels.Places.IServerCountryApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: ViewModels.Places.IServerCountryApiModel[], topic?: string);
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

    export interface IServerCountryApiModel {
        code: string;
        name: string;
        box?: IServerBoxModel;
    }

    export class ServerCountryApiModel implements IServerCountryApiModel {

        constructor (public code: string, public name: string) {
        }
    }
}