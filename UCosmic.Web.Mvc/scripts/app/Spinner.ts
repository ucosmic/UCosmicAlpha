/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

module App {

    //export interface ISpinnerxOptions {
    //    delay?: number;
    //    isVisible?: boolean;
    //}

    //export class SpinnerxOptions implements ISpinnerxOptions {
    //    delay: number;
    //    isVisible: boolean;

    //    constructor (delay: number = 0, isVisible: boolean = false) {
    //        this.delay = delay;
    //        this.isVisible = isVisible;
    //    }
    //}

    export interface SpinnerSettings {
        delay?: number;
        runImmediately?: boolean;
    }

    export class Spinner {

        static defaultSettings: SpinnerSettings = {
            delay: 0,
            runImmediately: false,
        };

        //private _delay: number;

        // this offers a way to short circuit the spinner when its activity time is 
        // greater than zero but less than the delay
        //private _isActivated: KnockoutObservable<boolean> = ko.observable(true);
        isRunning: KnockoutObservable<boolean> = ko.observable(true);

        //private inTransition: KnockoutObservable<boolean> = ko.observable(false);
        isVisible: KnockoutObservable<boolean> = ko.observable(false);

        //constructor(options?: ISpinnerxOptions) {
        //    if (!options) options = new SpinnerxOptions();
        //    this._delay = options.delay;
        //    this.isVisible(options.isVisible);
        //    this.isRunning(options.isVisible);
        //}

        constructor(public settings: SpinnerSettings = {}) {
            this.settings = $.extend({}, Spinner.defaultSettings, this.settings);

            //if (!options) options = new SpinnerxOptions();
            //this._delay = options.delay;
            this.isRunning(this.settings.runImmediately);
            this.isVisible(this.settings.runImmediately);
        }

        start(immediately: boolean = false): void {
            //this._isActivated(true); // we are entering an ajax call
            this.isRunning(true);
            if (this.settings.delay < 1 || immediately)
                this.isVisible(true);
            else
                setTimeout((): void => {
                    // only show spinner when load is still being processed
                    //if (this.isSpinning() && !this.inTransition())
                    //if (this._isActivated())
                    if (this.isRunning())
                        this.isVisible(true);
                }, this.settings.delay);
        }
        stop(): void {
            //this.inTransition(false);
            this.isVisible(false);
            this.isRunning(false);
            //this._isActivated(false);
        }
    }
}