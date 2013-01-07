/// <reference path="../ko/knockout-2.2.d.ts" />
/// <reference path="../jquery/jquery-1.8.d.ts" />

module App {

    // private properties
    var ticks: number;
    var tickInterval: number;

    //private methods
    function init(flasher: FlasherViewModel): void {
        // executes once each time the flasher text changes
        if (flasher.text()) { // when there is flasher text
            window.clearInterval(tickInterval); // clear the tick interval
            ticks = 9; // reset ticks to top value
            flasher.tickCount(ticks); // update the viewmodel tick count
            tickInterval = window.setInterval(() => { // set up new tick interval
                tick(flasher); // tick once each second
            }, 1000);
            flasher.$element.hide().removeClass('hide').fadeIn('fast'); // fade in element
        }
        else { // when there is no flasher text
            if (tickInterval) // clear the tick interval
                window.clearInterval(tickInterval);
            if (flasher.$element) // hide the flasher element
                flasher.$element.addClass('hide');
        }
    }

    function tick(flasher: FlasherViewModel): void {
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

    export class FlasherViewModel {

        constructor () {
            ko.computed(() => { init(this); });
        }

        // text to be displayed in the flasher
        text: KnockoutObservableString = ko.observable();

        // number of seconds to display the flashed text
        tickCount: KnockoutObservableNumber = ko.observable(9);

        // DOM element that wraps the flasher markup
        $element: JQuery = undefined;

        // set the text to be displayed in the flasher
        flash(text: string): void {
            this.text(undefined);
            if (text) this.text(text);
        }

        // fade out and then hide the flasher DOM element
        dismiss(): void {
            this.$element.fadeOut('slow', () => { // lambda captures outer 'this'
                this.text('');
                this.$element.addClass('hide');
            });
        }
    }

    export var flasher = new FlasherViewModel(); // implement flasher as singleton instance
}
