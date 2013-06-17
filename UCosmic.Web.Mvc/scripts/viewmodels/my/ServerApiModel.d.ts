/// <reference path="../../ko/knockout-2.2.d.ts" />

//interface KnockoutObservableSomethingArray extends KnockoutObservableArrayFunctions {
//    (): ViewModels.My.IServerSomethingApiModel[];
//    (value: ViewModels.My.IServerSomethingApiModel[]): void;
//}

module ViewModels.My {
    export interface IServerProfileApiModel {
        hasPhoto: bool;
        isActive: bool;
        isDisplayNameDerived: bool;
        personId: number;
        displayName: string;
        firstName: string;
        middleName: string;
        lastName: string;
        salutation: string;
        suffix: string;
        gender: string;
        facultyRankId: string;
        preferredTitle: string;
        affiliations: any[];
    }
}