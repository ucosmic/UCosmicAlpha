module App {

    export interface FormSelectSettings<T> {
        loadingText?: string;
        optionsCaption?: string;
        options?: App.ApiModels.SelectOption<T>[];
        value?: T;
        kendoOptions?: kendo.ui.DropDownListOptions;
        textColor?: string;
        captionTextColor?: string;
    }

    export class FormSelect<T> {
        //#region Static Defaults

        static defaultSettings: FormSelectSettings<T> = {
            loadingText: '[Loading...]',
            options: [],
            textColor: '#000',
            captionTextColor: '#666',
        };

        static defaultKendoOptions: kendo.ui.DropDownListOptions = {
            animation: false,
        };

        //#endregion
        //#region Properties & Construction

        caption: KnockoutObservable<string>;
        options: KnockoutObservableArray<App.ApiModels.SelectOption<T>>;
        value: KnockoutObservable<T>;

        $select: JQuery;

        constructor(public settings?: FormSelectSettings<T>) {
            // merge settings with defaults
            this.settings = $.extend({}, FormSelect.defaultSettings, this.settings);
            this._initKendoOptions();
            var initialOptions = this._getInitialOptions();

            // properties are undefined, set up observables here
            this.options = ko.observableArray(initialOptions);
            this.value = ko.observable(this.settings.value);
            this.caption = ko.observable(this.settings.optionsCaption);

            // subscribe to options & value changes
            this.options.subscribe((newValue: App.ApiModels.SelectOption<T>[]): void => {
                this._onOptionsChanged(newValue);
            });
            this.value.subscribe((newValue: T): void => {
                this._onValueChanged(newValue);
            });
        }

        private _getInitialOptions(): App.ApiModels.SelectOption<T>[] {
            // when this is first bound, the options may not be present.
            // if value is set, it will be cleared unless the options
            // contains an item matching the value.
            var options: App.ApiModels.SelectOption<T>[] = this.settings.options || [];
            var value: T = this.settings.value;
            if (!options.length && this.settings.loadingText) { // when the options are empty, start off with a loading option
                var loadingOption: App.ApiModels.SelectOption<T> = {
                    text: this.settings.loadingText,
                    value: value,
                };
                options.push(loadingOption);
            }
            return options;
        }

        //#endregion
        //#region Change Subscriptions

        private _onValueChanged(value: T): void {

            // need to make sure the value is in the options array
            var options = this.options().slice(0);
            if (options && options.length && options[0].text == this.settings.loadingText && options[0].value != value) {
                options = options.slice(1);
                options.unshift({ text: this.settings.loadingText, value: value });
                this.options(options);
            }

            this._ensureKendoTextColor();
            this._ensureKendoSelection();
        }

        private _onOptionsChanged(options: App.ApiModels.SelectOption<T>[]): void {
            var caption = this.caption();
            options = options || [];
            if (caption) {
                // need to make sure first option is the caption
                var option = options.length ? options[0] : undefined;
                if (!option || typeof option.value !== 'undefined') {
                    options.unshift({
                        text: caption,
                        value: undefined,
                    });
                }
            }
            else {
                // need to make sure first option is not the caption
                var option = options.length ? options[0] : undefined;
                if (option && typeof option.value === 'undefined') {
                    options.shift();
                }
            }
        }

        //#endregion
        //#region Kendo DropDownList

        applyKendo(): void {
            // don't do anything unless there is a select element and kendo options
            var $select = this.$select;
            if (!$select || !this.settings.kendoOptions) return;

            $select.kendoDropDownList(this.settings.kendoOptions);
            this._ensureKendoTextColor();
        }

        private _initKendoOptions(): void {
            if (this.settings.kendoOptions) {
                this.settings.kendoOptions = $.extend({}, FormSelect.defaultKendoOptions, this.settings.kendoOptions);
                var customOpenHandler = this.settings.kendoOptions.open;
                this.settings.kendoOptions.open = (e: kendo.ui.DropDownListEvent): void => {
                    this._maximizeKendoPopup(e);
                    if (customOpenHandler) customOpenHandler(e);
                };
            }
        }

        private _getKendoDropDownList(): kendo.ui.DropDownList {
            return this.$select ? this.$select.data('kendoDropDownList') : undefined;
        }

        private _ensureKendoTextColor(): void {
            // change color when caption is selected
            var value = this.value();
            var $select = this.$select;
            var kendoDropDown = this._getKendoDropDownList();
            if ($select && $select.length && this.settings.textColor && this.settings.captionTextColor) {
                if (kendoDropDown) {
                    var color = value ? this.settings.textColor : this.settings.captionTextColor;
                    kendoDropDown.span.css({
                        color: color,
                    });
                }
            }
        }

        private _ensureKendoSelection(): void {
            // select item in kendo widget (this does not happen by default)
            var value = this.value();
            var kendoDropDown = this._getKendoDropDownList();
            if (kendoDropDown) {
                kendoDropDown.select(function (item: App.ApiModels.SelectOption<T>): boolean {
                    return item.value == value;
                });
            }
        }

        private _maximizeKendoPopup(e: kendo.ui.DropDownListEvent): void {
            // adjust height to maximize available viewport
            setTimeout((): void => {
                var $ul = e.sender.ul;
                var ulHeight = $ul.outerHeight(true);
                var ulTop = $ul.offset().top;
                var inputTop = e.sender.wrapper.offset().top;
                var windowHeight = $(window).outerHeight();
                var scrollTop = $(window).scrollTop();
                var targetHeight = (ulTop < inputTop)
                    ? inputTop - scrollTop - 20
                    : windowHeight - ulTop + scrollTop - 20;
                if (ulHeight != targetHeight) {
                    e.sender.options.height = targetHeight;
                    e.sender.refresh();
                }
            }, 0);
        }

        //#endregion
    }
}