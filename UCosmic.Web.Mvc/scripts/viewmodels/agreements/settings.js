var Agreements;
(function (Agreements) {
    var ViewModels;
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
                this.id = 0;
                this.isLoading = ko.observable(true);
                this.isUpdating = ko.observable(false);
                this.isCustomStatusAllowed = ko.observable();
                this.statusOption = ko.observable("");
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
                this.updateAgreementSettings = this.updateAgreementSettings.bind(this);
                new ScrollBody.Scroll({
                    bindTo: "[data-current-module=agreements]",
                    section1: "agreement_types",
                    section2: "current_statuses",
                    section3: "contact_types",
                }).bindJquery();
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
                this.id = result.id;
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
                this.isCustomTypeAllowed.subscribe(function () {
                    _this.kendoBindCustomType();
                });
                this.isCustomStatusAllowed.subscribe(function () {
                    _this.kendoBindStatus();
                });
                this.isCustomContactTypeAllowed.subscribe(function () {
                    _this.kendoBindContactType();
                });
                this.isLoading(false);
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
                this.kendoBindCustomType();
            };
            Settings.prototype.addStatusOption = function (me, e) {
                this.statusOptions.push(new Agreements.ViewModels.SelectConstructor(this.statusOption(), this.statusOption()));
                this.kendoBindStatus();
            };
            Settings.prototype.addContactTypeOption = function (me, e) {
                this.contactTypeOptions.push(new Agreements.ViewModels.SelectConstructor(this.contactTypeOption(), this.contactTypeOption()));
                this.kendoBindContactType();
            };
            Settings.prototype.updateAgreementSettings = function (me, e) {
                var _this = this;
                if (this.isUpdating()) {
                    return;
                }
                this.isUpdating(true);
                var url = App.Routes.WebApi.Agreements.Settings.put(this.id);
                var typeOptionsExport = [], statusOptionsExport = [], contactTypeOptionsExport = [];
                $.each(this.typeOptions(), function (i, item) {
                    typeOptionsExport[i] = item.name;
                });
                $.each(this.statusOptions(), function (i, item) {
                    statusOptionsExport[i] = item.name;
                });
                $.each(this.contactTypeOptions(), function (i, item) {
                    contactTypeOptionsExport[i] = item.name;
                });
                var data = {
                    IsCustomTypeAllowed: this.isCustomTypeAllowed(),
                    IsCustomStatusAllowed: this.isCustomStatusAllowed(),
                    IsCustomContactTypeAllowed: this.isCustomContactTypeAllowed(),
                    TypeOptions: typeOptionsExport,
                    StatusOptions: statusOptionsExport,
                    ContactTypeOptions: contactTypeOptionsExport
                };
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: function (response, statusText, xhr) {
                        $(window).scrollTop(0);
                        App.flasher.flash("Agreement settings updated");
                        _this.isUpdating(false);
                    },
                    error: function (xhr) {
                        App.Failures.message(xhr, xhr.responseText, true);
                        _this.isUpdating(false);
                    }
                });
            };
            return Settings;
        })();
        ViewModels.Settings = Settings;
    })(ViewModels = Agreements.ViewModels || (Agreements.ViewModels = {}));
})(Agreements || (Agreements = {}));
