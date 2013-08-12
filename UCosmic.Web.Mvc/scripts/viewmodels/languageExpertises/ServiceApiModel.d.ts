/// <reference path="../../typings/knockout/knockout.d.ts" />

declare module Service.ApiModels.LanguageExpertise {

    export interface IObservableLanguageExpertise {
        id: KnockoutObservable<number>;
        version: KnockoutObservable<string>;      // byte[] converted to base64
        entityId: KnockoutObservable<string>;     // guid converted to string
    }
}
