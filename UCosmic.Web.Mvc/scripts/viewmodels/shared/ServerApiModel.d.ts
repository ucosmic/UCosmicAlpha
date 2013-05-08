/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../places/ServerApiModel.ts" />
/// <reference path="Name.ts" />
/// <reference path="Url.ts" />
 
//interface KnockoutObservableEstablishmentNameModelArray extends KnockoutObservableArrayFunctions {
//    (): ViewModels.Shared.IServerNameApiModel[];
//    (value: ViewModels.Shared.IServerNameApiModel[]): void;

//    subscribe(callback: (newValue: ViewModels.Shared.IServerNameApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
//    notifySubscribers(valueToWrite: ViewModels.Shared.IServerNameApiModel[], topic?: string);
//}

//interface KnockoutObservableEstablishmentNameViewModelArray extends KnockoutObservableArrayFunctions {
//    (): ViewModels.Shared.Name[];
//    (value: ViewModels.Shared.Name[]): void;

//    subscribe(callback: (newValue: ViewModels.Shared.Name[]) => void, target?:any, topic?: string): KnockoutSubscription;
//    notifySubscribers(valueToWrite: ViewModels.Shared.Name[], topic?: string);
//}

//interface KnockoutObservableEstablishmentUrlModelArray extends KnockoutObservableArrayFunctions {
//    (): ViewModels.Shared.IServerUrlApiModel[];
//    (value: ViewModels.Shared.IServerUrlApiModel[]): void;

//    subscribe(callback: (newValue: ViewModels.Shared.IServerUrlApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
//    notifySubscribers(valueToWrite: ViewModels.Shared.IServerUrlApiModel[], topic?: string);
//}

//interface KnockoutObservableEstablishmentUrlViewModelArray extends KnockoutObservableArrayFunctions {
//    (): ViewModels.Shared.Url[];
//    (value: ViewModels.Shared.Url[]): void;

//    subscribe(callback: (newValue: ViewModels.Shared.Url[]) => void, target?:any, topic?: string): KnockoutSubscription;
//    notifySubscribers(valueToWrite: ViewModels.Shared.Url[], topic?: string);
//}

module ViewModels.Shared {

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