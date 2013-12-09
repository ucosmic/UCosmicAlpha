module App {
    export class ImageSwapper {

        hoverSrc: KnockoutObservable<string> = ko.observable('');
        noHoverSrc: KnockoutObservable<string> = ko.observable('');

        constructor(noHoverSrc?: string, hoverSrc?: string) {
            this.noHoverSrc(noHoverSrc || '');
            this.hoverSrc(hoverSrc || '');
        }

        private _state: KnockoutObservable<string> = ko.observable('none');

        isNoHover = ko.computed((): boolean => {
            return this._state() == 'none';
        });

        isHover = ko.computed((): boolean => {
            return this._state() == 'hover';
        });

        src = ko.computed((): string => {
            return this.isHover() ? this.hoverSrc() : this.noHoverSrc();
        });

        onMouseEnter(self: ImageSwapper, e: JQueryEventObject): void {
            this._state('hover');
        }

        onMouseLeave(self: ImageSwapper, e: JQueryEventObject): void {
            this._state('none');
        }
    }
}