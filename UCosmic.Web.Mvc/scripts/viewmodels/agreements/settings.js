var Agreements;
(function (Agreements) {
    (function (ViewModels) {
        var SelectConstructor = (function () {
            function SelectConstructor(name, id) {
                this.name = name;
                this.id = id;
                this.name = name;
                this.id = id;
            }
            return SelectConstructor;
        })();
        ViewModels.SelectConstructor = SelectConstructor;
        var Settings = (function () {
            function Settings() {
                this.deleteErrorMessage = ko.observable('');
                this.isCustomStatusAllowed = ko.observable();
                this.statusOptions = ko.mapping.fromJS([]);
                this.statusOptionSelected = ko.observable("");
                this.$statusOptions = ko.observable();
                this.isCustomContactTypeAllowed = ko.observable();
                this.contactTypeOptions = ko.mapping.fromJS([]);
                this.contactTypeOptionSelected = ko.observable("");
                this.contactTypeOption = ko.observable("");
                this.$contactTypeOptions = ko.observable();
                this.isCustomTypeAllowed = ko.observable();
                this.typeOptions = ko.mapping.fromJS([]);
                this.typeOption = ko.observable("");
                this.typeOptionSelected = ko.observable("");
                this.$typeOptions = ko.observable();
                this._getSettings();
            }
            Settings.prototype.processSettings = function (result) {
                var self = this;

                this.isCustomTypeAllowed(result.isCustomTypeAllowed);
                this.isCustomStatusAllowed(result.isCustomStatusAllowed);
                this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);

                for (var i = 0, j = result.statusOptions.length; i < j; i++) {
                    this.statusOptions.push(new Agreements.ViewModels.SelectConstructor(result.statusOptions[i], result.statusOptions[i]));
                }
                ;

                for (var i = 0, j = result.contactTypeOptions.length; i < j; i++) {
                    this.contactTypeOptions.push(new Agreements.ViewModels.SelectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
                }
                ;

                for (var i = 0, j = result.typeOptions.length; i < j; i++) {
                    this.typeOptions.push(new Agreements.ViewModels.SelectConstructor(result.typeOptions[i], result.typeOptions[i]));
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

            Settings.prototype.addTypeOption = function (me, e) {
            };

            Settings.prototype.addContactTypeOption = function (me, e) {
            };

            Settings.prototype.updateAgreementSettings = function (me, e) {
            };
            return Settings;
        })();
        ViewModels.Settings = Settings;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
