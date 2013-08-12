/// <reference path="../../../typings/knockout/knockout.d.ts" />


    export interface ISpinnerOptions {
        delay?: number;
        isVisible?: boolean;
    }

    export class SpinnerOptions implements ISpinnerOptions {
        delay: number;
        isVisible: boolean;

        constructor (delay: number = 0, isVisible: boolean = false) {
            this.delay = delay;
            this.isVisible = isVisible;
        }
    }

    export class Spinner {

        private delay: number;

        // this offers a way to short circuit the spinner when its activity time is 
        // greater than zero but less than the delay
        private isActivated: KnockoutObservable<boolean> = ko.observable(true);

        //private inTransition: KnockoutObservable<boolean> = ko.observable(false);
        isVisible: KnockoutObservable<boolean> = ko.observable(false);

        start(): void {
            this.isActivated(true); // we are entering an ajax call
            if (this.delay < 1)
                this.isVisible(true);
            else
                setTimeout((): void => {
                    // only show spinner when load is still being processed
                    //if (this.isSpinning() && !this.inTransition())
                    if (this.isActivated())
                        this.isVisible(true);
                }, this.delay);
        }
        stop(): void {
            //this.inTransition(false);
            this.isVisible(false);
            this.isActivated(false);
        }

        constructor (options?: ISpinnerOptions) {
            if (!options) options = new SpinnerOptions();
            this.delay = options.delay;
            this.isVisible(options.isVisible);
        }

    }
