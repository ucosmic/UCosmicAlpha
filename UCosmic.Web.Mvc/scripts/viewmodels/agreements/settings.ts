module Agreements.ViewModels {
    export class SelectConstructor {
        constructor(public name: string, public id: string) {
            this.name = name;
            this.id = id;
        }
    }
    export class Settings {

        constructor() {
            this._getSettings();
            this.removeTypeOption = <() => void > this.removeTypeOption.bind(this);
            this.removeContactTypeOption = <() => void > this.removeContactTypeOption.bind(this);
            this.removeStatusOption = <() => void > this.removeStatusOption.bind(this);
            new ScrollBody.Scroll({
                bindTo: "[data-current-module=agreements]",
                section1: "agreement_types",
                section2: "current_statuses",
                section3: "contact_types",
            }).bindJquery();
        }
        deleteErrorMessage = ko.observable('');

        isCustomStatusAllowed = ko.observable();
        statusOption = ko.observable("");
        statusOptions = ko.mapping.fromJS([]);
        statusOptionSelected = ko.observable("");
        $statusOptions = ko.observable<JQuery>();
        $statusOptions2 = ko.observable<JQuery>();

        isCustomContactTypeAllowed = ko.observable();
        contactTypeOptions = ko.mapping.fromJS([]);
        contactTypeOptionSelected = ko.observable("");
        contactTypeOption = ko.observable("");
        $contactTypeOptions = ko.observable<JQuery>();
        $contactTypeOptions2 = ko.observable<JQuery>();

        isCustomTypeAllowed = ko.observable();
        typeOptions = ko.mapping.fromJS([]);
        typeOption = ko.observable("");
        typeOptionSelected = ko.observable("");
        $typeOptions = ko.observable<JQuery>();
        $typeOptions2 = ko.observable<JQuery>();

        kendoBindCustomType(): void {
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
        }
        kendoBindStatus(): void {
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
        }
        kendoBindContactType(): void {
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
        }


        private processSettings(result): void {
            var self = this;

            this.isCustomTypeAllowed(result.isCustomTypeAllowed.toString());
            this.isCustomStatusAllowed(result.isCustomStatusAllowed.toString());
            this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed.toString());
            //this.statusOptions.push(new Agreements.ViewModels.SelectConstructor("", ""));
            for (var i = 0, j = result.statusOptions.length; i < j; i++) {
                this.statusOptions.push(new Agreements.ViewModels.SelectConstructor(result.statusOptions[i], result.statusOptions[i]));
            };
            //this.contactTypeOptions.push(new Agreements.ViewModels.SelectConstructor("", ""));
            for (var i = 0, j = result.contactTypeOptions.length; i < j; i++) {
                this.contactTypeOptions.push(new Agreements.ViewModels.SelectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
            };
            //this.typeOptions.push(new Agreements.ViewModels.SelectConstructor("", ""));
            for (var i = 0, j = result.typeOptions.length; i < j; i++) {
                this.typeOptions.push(new Agreements.ViewModels.SelectConstructor(result.typeOptions[i], result.typeOptions[i]));
            };

            this.kendoBindContactType();
            this.kendoBindStatus();
            this.kendoBindCustomType();

            this.isCustomTypeAllowed.subscribe((): void => {
                this.kendoBindCustomType();
            });
            this.isCustomStatusAllowed.subscribe((): void => {
                this.kendoBindStatus();
            });
            this.isCustomContactTypeAllowed.subscribe((): void => {
                this.kendoBindContactType();
            });
            //$('span:contains("[None]")').css("color", "grey");
        }
        //get settings for agreements.
        private _getSettings(): void {
            var url = 'App.Routes.WebApi.Agreements.Settings.get()',
                agreementSettingsGet;

            $.ajax({
                url: eval(url),
                type: 'GET'
            })
                .done((result) => {
                    this.processSettings(result);
                })
                .fail(function (xhr) {
                    App.Failures.message(xhr, xhr.responseText, true);
                });
        }

        removeTypeOption(me, e): void {
            this.typeOptions.remove(me);
            this.kendoBindCustomType();
            e.preventDefault();
            e.stopPropagation();
        }

        removeStatusOption(me, e): void {
            this.statusOptions.remove(me);
            this.kendoBindStatus();
            e.preventDefault();
            e.stopPropagation();
        }

        removeContactTypeOption(me, e): void {
            this.contactTypeOptions.remove(me);
            this.kendoBindContactType();
            e.preventDefault();
            e.stopPropagation();
        }

        addTypeOption(me, e): void {
            this.typeOptions.push(new Agreements.ViewModels.SelectConstructor(this.typeOption(), this.typeOption()));
            this.kendoBindCustomType();
         }

        addStatusOption(me, e): void {
            this.statusOptions.push(new Agreements.ViewModels.SelectConstructor(this.statusOption(), this.statusOption()));
            this.kendoBindStatus();
         }

        addContactTypeOption(me, e): void {
            this.contactTypeOptions.push(new Agreements.ViewModels.SelectConstructor(this.contactTypeOption(), this.contactTypeOption()));
            this.kendoBindContactType();
         }

        updateAgreementSettings(me, e): void {

        }
    }

}