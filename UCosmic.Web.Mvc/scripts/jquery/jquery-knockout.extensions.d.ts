/// <reference path="jquery-1.8.d.ts" />
/// <reference path="../ko/knockout-2.2.d.ts" />

interface KnockoutObservableJQuery extends KnockoutObservableBase {
    (): JQuery;
    (value: JQuery): void;

    subscribe(callback: (newValue: JQuery) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: JQuery, topic?: string);
}
