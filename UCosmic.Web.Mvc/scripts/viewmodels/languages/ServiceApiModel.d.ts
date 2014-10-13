/// <reference path="../../typings/knockout/knockout.d.ts" />
declare module Service.ApiModels.Language {

    export interface ILanguage {
        id: number;
        version: string;    // byte[] converted to base64
        entityId: string;   // guid converted to string
        language: string;
        yearAwarded: number;
        institutionId: number;
        institutionOfficialName: string;
        institutionLanguageId: number;
        institutionLanguageOfficialName: string;
    }

    export interface IObservableLanguage {
        id: KnockoutObservable<number>;
        version: KnockoutObservable<string>;      // byte[] converted to base64
        personId: KnockoutObservable<number>;
        whenLastUpdated: KnockoutObservable<string>;
        whoLastUpdated: KnockoutObservable<string>;
        title: KnockoutObservable<string>;
        yearAwarded: KnockoutObservable<any>;
        institutionId: KnockoutObservable<any>;
        institutionOfficialName: KnockoutObservable<string>;
        institutionLanguageOfficialName: KnockoutObservable<string>;
    }

    export interface ILanguageLanguages {
        id: number;
        officialName: string;
    }

    //export interface ILanguageInstitutions {
    //    id: number;
    //    officialName: string;
    //}

    export interface ILanguagePage {
        personId: KnockoutObservable<number>;
        orderBy: KnockoutObservable<string>;
        pageSize: KnockoutObservable<number>;
        pageNumber: KnockoutObservable<number>;
        items: KnockoutObservableArray<any>;
    }

}

declare module Languages.ApiModels {

    export interface SearchInput extends App.ApiModels.SearchInput {
        keyword?: string;
        orderBy?: string;
        languageCode?: string;
        ancestorId?: number;
    }
    
    export interface SearchResult {
        languageExpertiseId: number;
        SpeakingProficiency: string;
        ListeningProficiency: string;
        WritingProficiency: string;
        ReadingProficiency: string;
        Name: string;
        Dialect: string;
        Other: string;
    }
}