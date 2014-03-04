var Agreements;
(function (Agreements) {
    (function (ViewModels) {
        var Settings = (function () {
            function Settings() {
                this.isCustomTypeAllowed = ko.observable();
                this.isCustomStatusAllowed = ko.observable();
                this.isCustomContactTypeAllowed = ko.observable();
                this.statusOptions = ko.mapping.fromJS([]);
                this.contactTypeOptions = ko.mapping.fromJS([]);
                this.typeOptions = ko.mapping.fromJS([]);
            }
            Settings.prototype.processSettings = function (result) {
                var self = this;

                this.isCustomTypeAllowed(result.isCustomTypeAllowed);
                this.isCustomStatusAllowed(result.isCustomStatusAllowed);
                this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
                this.statusOptions.push(new Agreements.SelectConstructor("", ""));
                for (var i = 0, j = result.statusOptions.length; i < j; i++) {
                    this.statusOptions.push(new Agreements.SelectConstructor(result.statusOptions[i], result.statusOptions[i]));
                }
                ;
                this.contactTypeOptions.push(new Agreements.SelectConstructor("", undefined));
                for (var i = 0, j = result.contactTypeOptions.length; i < j; i++) {
                    this.contactTypeOptions.push(new Agreements.SelectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
                }
                ;
                this.typeOptions.push(new Agreements.SelectConstructor("", ""));
                for (var i = 0, j = result.typeOptions.length; i < j; i++) {
                    this.typeOptions.push(new Agreements.SelectConstructor(result.typeOptions[i], result.typeOptions[i]));
                }
                ;
            };

            Settings.prototype._getSettings = function () {
                var _this = this;
                var url = 'App.Routes.WebApi.Agreements.Settings.get()', agreementSettingsGet;

                $.ajax({
                    url: eval(url),
                    type: 'GET'
                }).done(function (result) {
                    _this.processSettings(result);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, xhr.responseText, true);
                });
            };

            Settings.prototype.removeTypeOption = function (me, e) {
                this.typeOptions.remove(me);
                e.preventDefault();
                e.stopPropagation();
            };
            return Settings;
        })();
        ViewModels.Settings = Settings;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
