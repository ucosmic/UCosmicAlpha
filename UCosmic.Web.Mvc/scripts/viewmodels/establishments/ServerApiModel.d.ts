/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../places/ServerApiModel.ts" />
/// <reference path="Name.ts" />
/// <reference path="Url.ts" />

declare module ViewModels.Establishments {

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
        isOfficialName: boolean;
        isFormerName: boolean;
        languageCode: string;
    }

    export interface IServerNameApiModel extends IServerNameInputModel {
        languageName: string;
    }

    export interface IServerUrlApiModel {
        id: number;
        ownerId: number;
        value: string;
        isOfficialUrl: boolean;
        isFormerUrl: boolean;
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