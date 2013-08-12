/// <reference path="../../typings/knockout/knockout.d.ts" />

declare module Service.ApiModels.Degree {

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
        id: KnockoutObservable<number>;
        version: KnockoutObservable<string>;      // byte[] converted to base64
        personId: KnockoutObservable<number>;
        whenLastUpdated: KnockoutObservable<string>;
        whoLastUpdated: KnockoutObservable<string>;
        title: KnockoutObservable<string>;
        yearAwarded: KnockoutObservable<any>;
        institutionId: KnockoutObservable<any>;
        institutionOfficialName: KnockoutObservable<string>;
        institutionCountryOfficialName: KnockoutObservable<string>;

        /* Knockout-Validation */
        errors: KnockoutValidationErrors;
        isValid: () => boolean;
        isAnyMessageShown: () => boolean;
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
        personId: KnockoutObservable<number>;
        orderBy: KnockoutObservable<string>;
        pageSize: KnockoutObservable<number>;
        pageNumber: KnockoutObservable<number>;
        items: KnockoutObservableArray<any>;
    }

}
