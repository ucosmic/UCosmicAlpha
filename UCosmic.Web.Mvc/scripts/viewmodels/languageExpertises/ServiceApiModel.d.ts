/// <reference path="../../ko/knockout-2.2.d.ts" />

module Service.ApiModels.LanguageExpertise {

    export interface IObservableLanguageExpertise {
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        entityId: KnockoutObservableString;     // guid converted to string
    }
}
