declare module Establishments.ApiModels {

    export interface FlatEstablishment {
        id: number;
        officialName: string;
        translatedName: string;
        officialUrl: string;
        countryName: string;
        countryCode: string;
        uCosmicCode: string;
        ceebCode: string;
    }

    export interface ScalarEstablishment {
        id: number;
        parentId?: number;
        rank?: number;
        typeId: number;
        officialName: string;
        contextName?: string;
        uCosmicCode: string;
        ceebCode: string;
        isUnverified: boolean;
    }

    export interface NameInput {
        id: number;
        ownerId: number;
        text: string;
        isOfficialName: boolean;
        isFormerName: boolean;
        languageCode: string;
    }

    export interface Name extends NameInput {
        languageName: string;
    }

    export interface Url {
        id: number;
        ownerId: number;
        value: string;
        isOfficialUrl: boolean;
        isFormerUrl: boolean;
    }

    export interface Location {
        center: Places.ApiModels.Point;
        box: Places.ApiModels.Box;
        googleMapZoomLevel?: number;
        places: Places.ApiModels.Place[];
    }

    export interface PutLocation {
        center?: Places.ApiModels.Point;
        box?: Places.ApiModels.Box;
        googleMapZoomLevel?: number;
        placeId?: number;
    }
}