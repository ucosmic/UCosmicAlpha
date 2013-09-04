/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../app/Routes.ts" />
var agreements;
(function (agreements) {
    var basicInfo = (function () {
        function basicInfo(agreementId, dfdUAgreements) {
            //basic info vars
            this.$uAgreements = ko.observable();
            this.uAgreements = ko.mapping.fromJS([]);
            this.uAgreementSelected = ko.observable("");
            this.nickname = ko.observable();
            this.content = ko.observable();
            this.privateNotes = ko.observable();
            this.$typeOptions = ko.observable();
            this.typeOptions = ko.mapping.fromJS([]);
            this.typeOptionSelected = ko.observable();
            this.agreementContent = ko.observable();
            this.isCustomTypeAllowed = ko.observable();
            this.isCustomStatusAllowed = ko.observable();
            this.isCustomContactTypeAllowed = ko.observable();
            this.agreementId = agreementId;
            this.dfdUAgreements = dfdUAgreements;
            this._setupValidation = this._setupValidation.bind(this);

            this._setupValidation();
        }
        basicInfo.prototype.populateUmbrella = function () {
            var _this = this;
            $.get(App.Routes.WebApi.Agreements.UmbrellaOptions.get(this.agreementId.val)).done(function (response) {
                _this.uAgreements(response);
                $("#uAgreements").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    optionLabel: "[None - this is a top-level or standalone agreement]",
                    dataSource: new kendo.data.DataSource({
                        data: _this.uAgreements()
                    })
                });
                _this.dfdUAgreements.resolve();
            });
        };

        basicInfo.prototype._setupValidation = function () {
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
        };

        basicInfo.prototype.bindJquery = function () {
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
        };
        return basicInfo;
    })();
    agreements.basicInfo = basicInfo;
})(agreements || (agreements = {}));
