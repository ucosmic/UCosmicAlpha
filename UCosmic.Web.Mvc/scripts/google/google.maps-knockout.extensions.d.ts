/// <reference path="../ko/knockout-2.2.d.ts" />
/// <reference path="google.maps.d.ts" />
/// <reference path="ToolsOverlay.ts" />

interface KnockoutObservableGoogleMapsLatLng extends KnockoutObservableBase {
    (): google.maps.LatLng;
    (value: google.maps.LatLng): void;

    subscribe(callback: (newValue: google.maps.LatLng) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: google.maps.LatLng, topic?: string);
}

interface KnockoutObservableGoogleMapsToolsOverlay extends KnockoutObservableBase {
    (): App.GoogleMaps.ToolsOverlay;
    (value: App.GoogleMaps.ToolsOverlay): void;

    subscribe(callback: (newValue: App.GoogleMaps.ToolsOverlay) => void, target?:any, topic?: string): KnockoutSubscription;
    notifySubscribers(valueToWrite: App.GoogleMaps.ToolsOverlay, topic?: string);
}
