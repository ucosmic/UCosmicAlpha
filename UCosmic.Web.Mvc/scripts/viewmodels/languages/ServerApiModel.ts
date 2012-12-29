/// <reference path="../../ko/knockout-2.2.d.ts" />

interface KnockoutObservableLanguageModelArray extends KnockoutObservableArrayFunctions {
    (): ViewModels.Languages.IServerApiModel[];
    (value: ViewModels.Languages.IServerApiModel[]): void;

    subscribe(callback: (newValue: ViewModels.Languages.IServerApiModel[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: ViewModels.Languages.IServerApiModel[], topic?: string);
}

module ViewModels.Languages {
    export interface IServerApiModel {
        code: string;
        name: string;
    }

    export class ServerApiModel implements IServerApiModel {
        
        constructor (public code: string, public name: string) {
        }
    }
}