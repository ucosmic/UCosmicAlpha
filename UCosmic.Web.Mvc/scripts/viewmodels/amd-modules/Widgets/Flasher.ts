/// <reference path="../../../ko/knockout-2.2.d.ts" />
/// <reference path="../../../jquery/jquery-1.8.d.ts" />


    // private properties
    var ticks: number;
    var tickInterval: number;

    //private methods
    function init(flasher: IFlasher): void {
        // executes once each time the flasher text changes
        if (flasher.text()) { // when there is flasher text
            window.clearInterval(tickInterval); // clear the tick interval
            ticks = 9; // reset ticks to top value
            flasher.tickCount(ticks); // update the viewmodel tick count
            tickInterval = window.setInterval(() => { // set up new tick interval
                tick(flasher); // tick once each second
            }, 1000);
            flasher.isDismissing(false);
            flasher.isDismissed(false);
            flasher.$element.hide().removeClass('hide').fadeIn('fast'); // fade in element
        }
        else { // when there is no flasher text
            flasher.isDismissed(true);
            flasher.isDismissing(false);
            if (tickInterval) // clear the tick interval
                window.clearInterval(tickInterval);
            if (flasher.$element) // hide the flasher element
                flasher.$element.addClass('hide');
        }
    }

    function tick(flasher: IFlasher): void {
        // executes once each second until tick interval is cleared
        if (ticks <= 0) { // if ticks is zero or lower,
            ticks = 0; // reset ticks to zero
            window.clearInterval(tickInterval); // clear the tick interval
            flasher.dismiss(); // dismiss the flasher (fade out & hide)
        }
        else { // when ticks is greater than zero
            --ticks; // decrement the ticks (one second has passed)
        }
        flasher.tickCount(ticks); // update the viewmodel tick count
    }

    export interface IFlasher {
        text: KnockoutObservableString;
        tickCount: KnockoutObservableNumber;
        isDismissing: KnockoutObservableBool;
        isDismissed: KnockoutObservableBool;
        $element: JQuery;
        flash(text: string): void;
        dismiss(): void;
    }

    // keep class private but implement exported interface
    export class Flasher implements IFlasher {

        constructor () {
            // register init as a computed so that it will execute
            // whenever an observable changes
            ko.computed(() => { init(this); });
        }

        // text to be displayed in the flasher
        text: KnockoutObservableString = ko.observable();

        // number of seconds to display the flashed text
        tickCount: KnockoutObservableNumber = ko.observable(9);

        isDismissing: KnockoutObservableBool = ko.observable();
        isDismissed: KnockoutObservableBool = ko.observable();

        // DOM element that wraps the flasher markup
        $element: JQuery = undefined;

        // set the text to be displayed in the flasher
        flash(text: string): void {
            this.text(undefined);
            if (text) this.text(text);
        }

        // fade out and then hide the flasher DOM element
        dismiss(): void {
            this.isDismissing(true);
            this.$element.fadeOut('slow', () => { // lambda captures outer 'this'
                this.text('');
                this.$element.addClass('hide');
            });
        }
    }

    export var flasher: IFlasher = new Flasher(); // implement flasher as singleton instance

    // proxy to display flasher info on other page sections
    export class FlasherProxy {

        text: KnockoutComputed;
        isVisible: KnockoutComputed;

        constructor() {
            this.text = ko.computed((): string => {
                return flasher.text();
            });
            this.isVisible = ko.computed((): bool => {
                if (flasher.isDismissing() || flasher.isDismissed()) {
                    return false;
                }
                return this.text();
            });
        }

        dismiss(): void {
            flasher.dismiss();
        }
    }
