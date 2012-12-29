/// <reference path="knockout-2.2.d.ts" />
/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="../google/google.maps.d.ts" />

interface KnockoutObservableStringArray extends KnockoutObservableArrayFunctions {
    (): string[];
    (value: string[]): void;

    subscribe(callback: (newValue: string[]) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: string[], topic?: string);
}

interface KnockoutObservableGoogleMapsLatLng extends KnockoutObservableBase {
    (): google.maps.LatLng;
    (value: google.maps.LatLng): void;

    subscribe(callback: (newValue: google.maps.LatLng) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: google.maps.LatLng, topic?: string);
}

interface KnockoutObservableJQuery extends KnockoutObservableBase {
    (): JQuery;
    (value: JQuery): void;

    subscribe(callback: (newValue: JQuery) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: JQuery, topic?: string);
}
