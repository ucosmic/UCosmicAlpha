/// <reference path="../../ko/knockout-2.2.d.ts" />

interface KnockoutObservableFacultyRankModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Employees.IServerFacultyRankApiModel[];
    (value: ViewModels.Employees.IServerFacultyRankApiModel[]): void;
}

module ViewModels.Employees {

    export interface IServerFacultyRankApiModel {
        id: number;
        rank: string;
    }

}