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
                this.statusOption = ko.observable();
                this.statusOptions = ko.mapping.fromJS([]);
                this.statusOptionSelected = ko.observable("");
                this.$statusOptions = ko.observable();
                this.$statusOptions2 = ko.observable();
                this.isCustomContactTypeAllowed = ko.observable();
                this.contactTypeOptions = ko.mapping.fromJS([]);
                this.contactTypeOptionSelected = ko.observable("");
                this.contactTypeOption = ko.observable("");
                this.$contactTypeOptions = ko.observable();
                this.$contactTypeOptions2 = ko.observable();
                this.isCustomTypeAllowed = ko.observable();
                this.typeOptions = ko.mapping.fromJS([]);
                this.typeOption = ko.observable("");
                this.typeOptionSelected = ko.observable("");
                this.$typeOptions = ko.observable();
                this.$typeOptions2 = ko.observable();
                this._getSettings();
                this.removeTypeOption = this.removeTypeOption.bind(this);
                this.removeContactTypeOption = this.removeContactTypeOption.bind(this);
                this.removeStatusOption = this.removeStatusOption.bind(this);
            }
            Settings.prototype.kendoBindCustomType = function () {
                $("#type_options").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.typeOptions()
                    })
                });
                $("#type_options2").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.typeOptions()
                    }),
                    optionLabel: "[None]"
                });
            };
            Settings.prototype.kendoBindStatus = function () {
                $("#status_options").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.statusOptions()
                    })
                });
                $("#status_options2").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.statusOptions()
                    }),
                    optionLabel: "[None]"
                });
            };
            Settings.prototype.kendoBindContactType = function () {
                $("#contactTypeOptions").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.contactTypeOptions()
                    })
                });
                $("#contactTypeOptions2").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.contactTypeOptions()
                    }),
                    optionLabel: "[None]"
                });
            };

            Settings.prototype.processSettings = function (result) {
                var _this = this;
                var self = this;

                this.isCustomTypeAllowed(result.isCustomTypeAllowed.toString());
                this.isCustomStatusAllowed(result.isCustomStatusAllowed.toString());
                this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed.toString());

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

                this.kendoBindContactType();
                this.kendoBindStatus();
                this.kendoBindCustomType();

                this.isCustomTypeAllowed.subscribe(function (me) {
                    _this.kendoBindCustomType();
                });
                this.isCustomStatusAllowed.subscribe(function (me) {
                    _this.kendoBindStatus();
                });
                this.isCustomContactTypeAllowed.subscribe(function (me) {
                    _this.kendoBindContactType();
                });
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
                this.kendoBindCustomType();
                e.preventDefault();
                e.stopPropagation();
            };

            Settings.prototype.removeStatusOption = function (me, e) {
                this.statusOptions.remove(me);
                this.kendoBindStatus();
                e.preventDefault();
                e.stopPropagation();
            };

            Settings.prototype.removeContactTypeOption = function (me, e) {
                this.contactTypeOptions.remove(me);
                this.kendoBindContactType();
                e.preventDefault();
                e.stopPropagation();
            };

            Settings.prototype.addTypeOption = function (me, e) {
                this.typeOptions.push(new Agreements.ViewModels.SelectConstructor(this.typeOption(), this.typeOption()));
            };

            Settings.prototype.addStatusOption = function (me, e) {
                this.statusOptions.push(new Agreements.ViewModels.SelectConstructor(this.statusOption(), this.statusOption()));
            };

            Settings.prototype.addContactTypeOption = function (me, e) {
                this.contactTypeOptions.push(new Agreements.ViewModels.SelectConstructor(this.contactTypeOption(), this.contactTypeOption()));
            };

            Settings.prototype.updateAgreementSettings = function (me, e) {
            };
            return Settings;
        })();
        ViewModels.Settings = Settings;
    })(Agreements.ViewModels || (Agreements.ViewModels = {}));
    var ViewModels = Agreements.ViewModels;
})(Agreements || (Agreements = {}));
