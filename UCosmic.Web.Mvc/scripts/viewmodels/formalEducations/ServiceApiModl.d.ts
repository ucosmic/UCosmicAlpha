/// <reference path="../../ko/knockout-2.2.d.ts" />

module Service.ApiModels.FormalEducation {

    export interface IFormalEducation {
    }

    export interface IFormalEducationPage {
        personId: KnockoutObservableNumber;
        orderBy: KnockoutObservableString;
        pageSize: KnockoutObservableNumber;
        pageNumber: KnockoutObservableNumber;
        items: KnockoutObservableArray;
    }

    export interface IObservableFormalEducation {
    }

    export class EducationSearchInput
    {
        personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
    }

}
