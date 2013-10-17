/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../app/Routes.ts" />

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
        $uAgreements: KnockoutObservable<JQuery> = ko.observable();
        uAgreements = ko.mapping.fromJS([]);
        uAgreementSelected = ko.observable("");
        nickname = ko.observable();
        content = ko.observable();
        privateNotes = ko.observable();
        $typeOptions: KnockoutObservable<JQuery> = ko.observable();
        typeOptions = ko.mapping.fromJS([]);
        typeOptionSelected: KnockoutObservable<string> = ko.observable();
        agreementContent = ko.observable();
        isCustomTypeAllowed = ko.observable();
        isCustomStatusAllowed = ko.observable();
        isCustomContactTypeAllowed = ko.observable();
        validateBasicInfo;

        populateUmbrella(): void {
            $.get(App.Routes.WebApi.Agreements.UmbrellaOptions.get(this.agreementId))
                .done((response: any): void => {
                    this.uAgreements(response);
                    $("#uAgreements").kendoDropDownList({
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
                    maxLength: 50
                }),
                content: this.content.extend({
                    maxLength: 5000
                }),
                privateNotes: this.privateNotes.extend({
                    maxLength: 250
                })
            });
        }
    
        bindJquery(): void{
            if (this.isCustomTypeAllowed) {
                $("#typeOptions").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.typeOptions()
                    })
                });
            } else {
                $("#typeOptions").kendoDropDownList({
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