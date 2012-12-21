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

    export interface IServerNameApiModel {
        id: number;
        ownerId: number;
        text: string;
        isOfficialName: bool;
        isFormerName: bool;
        languageName: string;
        languageCode: string;
    }
}