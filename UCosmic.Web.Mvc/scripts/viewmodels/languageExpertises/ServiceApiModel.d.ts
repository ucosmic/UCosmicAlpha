/// <reference path="../../ko/knockout.d.ts" />

module Service.ApiModels.LanguageExpertise {

    export interface IObservableLanguageExpertise {
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        entityId: KnockoutObservableString;     // guid converted to string
    }
}
