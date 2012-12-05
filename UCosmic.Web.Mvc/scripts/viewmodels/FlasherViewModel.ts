/// <reference path="../ko/knockout-2.2.d.ts" />
/// <reference path="../jquery/jquery-1.8.d.ts" />

declare var app: any;

class FlasherViewModel {

    constructor () {
        ko.computed(() => { this.init(); });
    }

    private init(): void {
        if (this.text()) {
            window.clearInterval(this._tickInterval);
            this._ticks = 9;
            this.tickCount(this._ticks);
            this._tickInterval = window.setInterval(() => {
                this.tick();
            }, 1000);
            this.$element().hide().removeClass('hide').fadeIn('fast');
        }
        else {
            if (this._tickInterval)
                window.clearInterval(this._tickInterval);
            if (this.element)
                this.$element().addClass('hide');
        }
    }

    // tick once for each second the flasher is visible
    private tick(): void {
        if (this._ticks <= 0) { // flasher ticking is complete
            this._ticks = 0;
            window.clearInterval(this._tickInterval);
            this.dismiss();
        }
        else { // reduce ticks by one
            --this._ticks;
        }
        this.tickCount(this._ticks);
    }

    // text to be displayed in the flasher
    text: KnockoutObservableString = ko.observable();

    // number of seconds to display the flashed text
    tickCount: KnockoutObservableNumber = ko.observable(9);
    private _ticks: number = 0;
    private _tickInterval: any = undefined;

    // DOM element that wraps the flasher markup
    element: Element = undefined;
    private $element(): JQuery {
        return $(this.element);
    }

    // set the text to be displayed in the flasher
    flash(text: string): void {
        this.text(undefined);
        if (text) this.text(text);
    }

    // fade out and then hide the flasher DOM element
    dismiss(): void {
        this.$element().fadeOut('slow', () => { // lambda captures outer 'this'
            this.text('');
            this.$element().addClass('hide');
        });
    }
}

app.flasher = new FlasherViewModel();
ko.applyBindings(app.flasher, $('.flasher')[0]);
