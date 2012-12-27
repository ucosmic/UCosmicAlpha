/// <reference path="../places/ServerApiModel.d.ts" />

module ViewModels.Establishments {

    export interface IServerApiModel {
        id: number;
        officialName: string;
        translatedName: string;
        officialUrl: string;
        countryName: string;
        countryCode: string;
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
    }
}