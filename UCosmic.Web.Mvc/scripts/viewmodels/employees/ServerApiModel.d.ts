/// <reference path="../../ko/knockout.d.ts" />

interface KnockoutObservableFacultyRankModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Employees.IServerFacultyRankApiModel[]; (value: ViewModels.Employees.IServerFacultyRankApiModel[]): void;
}

module ViewModels.Employees {
    export interface IServerFacultyRankApiModel
    { id: number; rank: string; }
}