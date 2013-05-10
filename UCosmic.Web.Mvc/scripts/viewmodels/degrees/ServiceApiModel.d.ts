/// <reference path="../../ko/knockout-2.2.d.ts" />

module Service.ApiModels.Degree {

    export interface IDegree {
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

    export interface IObservableDegree {
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

    export interface IDegreeCountries {
        id: number;
        officialName: string;
    }

    export interface IDegreeInstitutions {
        id: number;
        officialName: string;
    }

    export interface IDegreePage {
        personId: KnockoutObservableNumber;
        orderBy: KnockoutObservableString;
        pageSize: KnockoutObservableNumber;
        pageNumber: KnockoutObservableNumber;
        items: KnockoutObservableArray;
    }

}
