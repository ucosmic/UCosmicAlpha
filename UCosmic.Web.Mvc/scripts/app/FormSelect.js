var App;
(function (App) {
    var FormSelect = (function () {
        function FormSelect(settings) {
            var _this = this;
            this.settings = settings;
            this.defaultSettings = {
                loadingText: '[Loading...]',
                options: [],
                textColor: '#000',
                captionTextColor: '#666',
            };
            this.settings = $.extend({}, this.defaultSettings, this.settings);
            this._initKendoOptions();
            var initialOptions = this._getInitialOptions();
            this.options = ko.observableArray(initialOptions);
            this.value = ko.observable(this.settings.value);
            this.caption = ko.observable(this.settings.optionsCaption);
            this.options.subscribe(function (newValue) {
                _this._onOptionsChanged(newValue);
            });
            this.value.subscribe(function (newValue) {
                _this._onValueChanged(newValue);
            });
        }
        FormSelect.prototype._getInitialOptions = function () {
            var options = this.settings.options || [];
            var value = this.settings.value;
            if (!options.length && this.settings.loadingText) {
                var loadingOption = {
                    text: this.settings.loadingText,
                    value: value,
                };
                options.push(loadingOption);
            }
            return options;
        };
        FormSelect.prototype._onValueChanged = function (value) {
            var options = this.options().slice(0);
            if (options && options.length && options[0].text == this.settings.loadingText && options[0].value != value) {
                options = options.slice(1);
                options.unshift({ text: this.settings.loadingText, value: value });
                this.options(options);
            }
            this._ensureKendoTextColor();
            this._ensureKendoSelection();
        };
        FormSelect.prototype._onOptionsChanged = function (options) {
            var caption = this.caption();
            options = options || [];
            if (caption) {
                var option = options.length ? options[0] : undefined;
                if (!option || typeof option.value !== 'undefined') {
                    options.unshift({
                        text: caption,
                        value: undefined,
                    });
                }
            }
            else {
                var option = options.length ? options[0] : undefined;
                if (option && typeof option.value === 'undefined') {
                    options.shift();
                }
            }
        };
        FormSelect.prototype.applyKendo = function () {
            var $select = this.$select;
            if (!$select || !this.settings.kendoOptions)
                return;
            $select.kendoDropDownList(this.settings.kendoOptions);
            this._ensureKendoTextColor();
        };
        FormSelect.prototype._initKendoOptions = function () {
            var _this = this;
            if (this.settings.kendoOptions) {
                this.settings.kendoOptions = $.extend({}, FormSelect.defaultKendoOptions, this.settings.kendoOptions);
                var customOpenHandler = this.settings.kendoOptions.open;
                this.settings.kendoOptions.open = function (e) {
                    _this._maximizeKendoPopup(e);
                    if (customOpenHandler)
                        customOpenHandler(e);
                };
            }
        };
        FormSelect.prototype._getKendoDropDownList = function () {
            return this.$select ? this.$select.data('kendoDropDownList') : undefined;
        };
        FormSelect.prototype._ensureKendoTextColor = function () {
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
        };
        FormSelect.prototype._ensureKendoSelection = function () {
            var value = this.value();
            var kendoDropDown = this._getKendoDropDownList();
            if (kendoDropDown) {
                kendoDropDown.select(function (item) {
                    return item.value == value;
                });
            }
        };
        FormSelect.prototype._maximizeKendoPopup = function (e) {
            setTimeout(function () {
                var $ul = e.sender.ul;
                var ulHeight = $ul.outerHeight(true);
                var ulTop = $ul.offset().top;
                var inputTop = e.sender.wrapper.offset().top;
                var windowHeight = $(window).outerHeight();
                var scrollTop = $(window).scrollTop();
                var targetHeight = (ulTop < inputTop) ? inputTop - scrollTop - 20 : windowHeight - ulTop + scrollTop - 20;
                if (ulHeight != targetHeight) {
                    e.sender.options.height = targetHeight;
                    e.sender.refresh();
                }
            }, 0);
        };
        FormSelect.defaultKendoOptions = {
            animation: false,
        };
        return FormSelect;
    })();
    App.FormSelect = FormSelect;
})(App || (App = {}));
