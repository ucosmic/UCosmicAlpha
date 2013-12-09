module Agreements {

    export class BasicInfo {
        constructor(agreementId, deferredUAgreements) {
            this.agreementId = agreementId;
            this.deferredUAgreements = deferredUAgreements;
            this._setupValidation = <() => void > this._setupValidation.bind(this);
            this._setupValidation();
        }
        //imported vars
        agreementId;
        deferredUAgreements;

        //basic info vars
        $uAgreements = ko.observable<JQuery>();
        uAgreements = ko.mapping.fromJS([]);
        uAgreementSelected = ko.observable("");
        nickname = ko.observable();
        content = ko.observable();
        privateNotes = ko.observable();
        $typeOptions = ko.observable<JQuery>();
        typeOptions = ko.mapping.fromJS([]);
        typeOptionSelected = ko.observable<string>();
        agreementContent = ko.observable();
        isCustomTypeAllowed = ko.observable();
        isCustomStatusAllowed = ko.observable();
        isCustomContactTypeAllowed = ko.observable();
        validateBasicInfo;

        populateUmbrella(): void {
            $.get(App.Routes.WebApi.Agreements.UmbrellaOptions.get(this.agreementId))
                .done((response: any): void => {
                    this.uAgreements(response);
                    $("#umbrella_agreements").kendoDropDownList({
                        dataTextField: "text",
                        dataValueField: "value",
                        optionLabel: "[None - this is a top-level or standalone agreement]",
                        dataSource: new kendo.data.DataSource({
                            data: this.uAgreements()
                        })
                    });
                    this.deferredUAgreements.resolve();
                });
        }

        private _setupValidation(): void {
            this.validateBasicInfo = ko.validatedObservable({
                agreementType: this.typeOptionSelected.extend({
                    required: {
                        message: "Agreement type is required."
                    },
                    maxLength: 50
                }),
                nickname: this.nickname.extend({
                    maxLength: 100
                }),
                content: this.content.extend({
                    maxLength: 5000
                }),
                privateNotes: this.privateNotes.extend({
                    maxLength: 250
                })
            });
        }

        bindJquery(): void {
            if (this.isCustomTypeAllowed) {
                $("#type_options").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.typeOptions()
                    })
                });
            } else {
                $("#type_options").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.typeOptions()
                    })
                });
            }
        }

    }
}