module Agreements {

    export class DatesStatus {
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
        $statusOptions = ko.observable<JQuery>();
        statusOptions = ko.mapping.fromJS([]);
        statusOptionSelected = ko.observable<string>();
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
            if (this.isCustomStatusAllowed()) {
                $("#status_options").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.statusOptions()
                    })
                });
            } else {
                $("#status_options").kendoDropDownList({
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