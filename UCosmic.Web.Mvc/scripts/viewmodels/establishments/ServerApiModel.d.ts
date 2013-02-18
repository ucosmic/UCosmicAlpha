/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../places/ServerApiModel.ts" />
/// <reference path="Name.ts" />
/// <reference path="Url.ts" />

interface KnockoutObservableEstablishmentNameModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Establishments.IServerNameApiModel[];
    (value: ViewModels.Establishments.IServerNameApiModel[]): void;

    subscribe(callback: (newValue: ViewModels.Establishments.IServerNameApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: ViewModels.Establishments.IServerNameApiModel[], topic?: string);
}

interface KnockoutObservableEstablishmentNameViewModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Establishments.Name[];
    (value: ViewModels.Establishments.Name[]): void;

    subscribe(callback: (newValue: ViewModels.Establishments.Name[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: ViewModels.Establishments.Name[], topic?: string);
}

interface KnockoutObservableEstablishmentUrlModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Establishments.IServerUrlApiModel[];
    (value: ViewModels.Establishments.IServerUrlApiModel[]): void;

    subscribe(callback: (newValue: ViewModels.Establishments.IServerUrlApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: ViewModels.Establishments.IServerUrlApiModel[], topic?: string);
}

interface KnockoutObservableEstablishmentUrlViewModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Establishments.Url[];
    (value: ViewModels.Establishments.Url[]): void;

    subscribe(callback: (newValue: ViewModels.Establishments.Url[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: ViewModels.Establishments.Url[], topic?: string);
}

module ViewModels.Establishments {

    export interface IServerApiFlatModel {
        id: number;
        officialName: string;
        translatedName: string;
        officialUrl: string;
        countryName: string;
        countryCode: string;
        uCosmicCode: string;
        ceebCode: string;
    }

    export interface IServerApiScalarModel {
        id: number;
        typeId: number;
        uCosmicCode: string;
        ceebCode: string;
    }

    export interface IServerNameInputModel {
        id: number;
        ownerId: number;
        text: string;
        isOfficialName: bool;
        isFormerName: bool;
        languageCode: string;
    }

    export interface IServerNameApiModel extends IServerNameInputModel {
        languageName: string;
    }

    export interface IServerUrlApiModel {
        id: number;
        ownerId: number;
        value: string;
        isOfficialUrl: bool;
        isFormerUrl: bool;
    }

    export interface IServerLocationApiModel {
        center: Places.IServerPointModel;
        box: Places.IServerBoxModel;
        googleMapZoomLevel?: number;
        places: Places.IServerApiModel[];
    }

    export interface IServerLocationPutModel {
        center?: Places.IServerPointModel;
        box?: Places.IServerBoxModel;
        googleMapZoomLevel?: number;
        placeId?: number;
    }
}