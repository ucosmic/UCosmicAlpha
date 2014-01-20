var Agreements;
(function (Agreements) {
    var BasicInfo = (function () {
        function BasicInfo(agreementId, deferredUAgreements) {
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
            this.deferredUAgreements = deferredUAgreements;
            this._setupValidation = this._setupValidation.bind(this);
            this._setupValidation();
        }
        BasicInfo.prototype.populateUmbrella = function () {
            var _this = this;
            $.get(App.Routes.WebApi.Agreements.UmbrellaOptions.get(this.agreementId)).done(function (response) {
                _this.uAgreements(response);
                $("#umbrella_agreements").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    optionLabel: "[None - this is a top-level or standalone agreement]",
                    dataSource: new kendo.data.DataSource({
                        data: _this.uAgreements()
                    })
                });
                _this.deferredUAgreements.resolve();
            });
        };

        BasicInfo.prototype._setupValidation = function () {
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
        };

        BasicInfo.prototype.bindJquery = function () {
            if (this.isCustomTypeAllowed()) {
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
        };
        return BasicInfo;
    })();
    Agreements.BasicInfo = BasicInfo;
})(Agreements || (Agreements = {}));
