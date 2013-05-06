/// <reference path="../../ko/knockout-2.2.d.ts" />

module Service.ApiModels.FormalEducation {

    export interface IFormalEducation {
        id: number;
        version: string;    // byte[] converted to base64
        entityId: string;   // guid converted to string
        degree: string;
        yearAwarded: number;
        institutionId: number;
        institutionOfficialName: string;
        institutionCountryId: number;
        institutionCountryOfficialName: string;
    }

    export interface IObservableFormalEducation {
        id: KnockoutObservableNumber;
        version: KnockoutObservableString;      // byte[] converted to base64
        entityId: KnockoutObservableString;     // guid converted to string
        degree: KnockoutObservableString;
        yearAwarded: KnockoutObservableNumber;
        institutionId: KnockoutObservableNumber;
        institutionOfficialName: KnockoutObservableString;
        institutionCountryId: KnockoutObservableNumber;
        institutionCountryOfficialName: KnockoutObservableString;
    }

    export interface IFormalEducationCountries {
        id: number;
        officialName: string;
    }

    export interface IFormalEducationInstitutions {
        id: number;
        officialName: string;
    }

    export interface IFormalEducationPage {
        personId: KnockoutObservableNumber;
        orderBy: KnockoutObservableString;
        pageSize: KnockoutObservableNumber;
        pageNumber: KnockoutObservableNumber;
        items: KnockoutObservableArray;
    }

    export class EducationSearchInput
    {
        personId: number;
        orderBy: string;
        pageSize: number;
        pageNumber: number;
    }


}
