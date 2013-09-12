/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/globalize/globalize.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
module agreements {

    export class datesStatus {
        constructor(isCustomStatusAllowed) {
            this.isCustomStatusAllowed = isCustomStatusAllowed
            this._setupValidation();
        }

        //imported vars
        isCustomStatusAllowed;

        //dates vars
        startDate = ko.observable();
        expDate = ko.observable();
        isEstimated = ko.observable();
        autoRenew = ko.observable(2);
        $statusOptions: KnockoutObservable<JQuery> = ko.observable();
        statusOptions = ko.mapping.fromJS([]);
        statusOptionSelected: KnockoutObservable<string> = ko.observable();
        validateEffectiveDatesCurrentStatus;

        private _setupValidation(): void {
            ko.validation.rules['greaterThan'] = {
                validator: function (val, otherVal) {
                    if (otherVal() == undefined) {
                        return true;
                    } else {
                    return Globalize.parseDate(val) > Globalize.parseDate(otherVal())
                }
                },
                message: 'The field must be greater than start date'
            }
            ko.validation.rules.date.validator = function (value, validate) {
                    return !value.length || (validate && Globalize.parseDate(value) != null);
                }
            ko.validation.registerExtenders();
            this.validateEffectiveDatesCurrentStatus = ko.validatedObservable({
                startDate: this.startDate.extend({
                    required: {
                        message: "Start date is required."
                    },
                    date: { message: "Start date must valid." },
                    maxLength: 50
                }),
                expDate: this.expDate.extend({
                    required: {
                        message: "Expiration date is required."
                    },
                    date: { message: "Expiration date must valid." },
                    maxLength: 50,
                    greaterThan: this.startDate
                }),
                autoRenew: this.autoRenew.extend({
                    required: {
                        message: "Auto renew is required."
                    }
                }),
                statusOptionSelected: this.statusOptionSelected.extend({
                    required: {
                        message: "Current Status is required."
                    }
                })
            })
        }
        
        bindJquery(): void {
            if (this.isCustomStatusAllowed) {
                $("#statusOptions").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.statusOptions()
                    })
                });
            } else {
                $("#statusOptions").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.statusOptions()
                    })
                });
            }
        }
    }
}