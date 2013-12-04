/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
var Agreements;
(function (Agreements) {
    var Phones = (function () {
        function Phones(agreementId, establishmentItemViewModel, contactId) {
            //phone vars
            this.contactPhoneTextValue = ko.observable("");
            this.contactPhoneType = ko.observable();
            this.contactPhones = ko.observableArray();
            this.phoneTypes = ko.mapping.fromJS([]);
            this.$phoneTypes = ko.observable();
            this.deletedPhones = Array();
            this.selectConstructor = function (name, id) {
                this.name = name;
                this.id = id;
            };
            this.agreementId = agreementId;
            this.contactId = contactId;
            this.establishmentItemViewModel = establishmentItemViewModel;
            this.removePhone = this.removePhone.bind(this);
            this.addPhone = this.addPhone.bind(this);
            this.phoneTypes = ko.mapping.fromJS([
                new this.selectConstructor("[None]", ""),
                new this.selectConstructor("home", "home"),
                new this.selectConstructor("work", "work"),
                new this.selectConstructor("mobile", "mobile")
            ]);
            this._bindJquery();
        }
        Phones.prototype.removePhone = function (me, e) {
            if (this.agreementId !== 0) {
                this.deletedPhones.push(me.id);
                //var url = App.Routes.WebApi.Agreements.Contacts.Phones.del(this.agreementId, me.contactId, me.id);
                //$.ajax({
                //    url: url,
                //    type: 'DELETE',
                //    success: (): void => {
                //        this.contactPhones.remove(me);
                //        $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                //    }
                //});
            }
            this.contactPhones.remove(me);
            e.preventDefault();
            e.stopPropagation();
        };

        Phones.prototype.addPhone = function (me, e) {
            if (this.contactPhoneTextValue().length > 0) {
                this.contactPhones.push({ type: '', contactId: '', value: this.contactPhoneTextValue() });
                this.contactPhoneTextValue("");
                $(".phoneTypes").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: ko.mapping.toJS(this.phoneTypes())
                    })
                });
            }
        };

        Phones.prototype._bindJquery = function () {
            var _this = this;
            var self = this;

            this.contactPhoneTextValue.subscribe(function (me) {
                if (_this.contactPhoneTextValue().length > 0) {
                    if (_this.contactId()) {
                        var url = App.Routes.WebApi.Agreements.Contacts.Phones.post(_this.agreementId, _this.contactId()), data = { id: "0", type: '', contactId: _this.contactId(), value: _this.contactPhoneTextValue() };

                        $.post(url, data).done(function (response, statusText, xhr) {
                            var myUrl = xhr.getResponseHeader('Location');

                            data.id = myUrl.substring(myUrl.lastIndexOf("/") + 1);
                            _this.contactPhones.push(data);
                            _this.contactPhoneTextValue("");
                            $(".phoneTypes").kendoDropDownList({
                                dataTextField: "name",
                                dataValueField: "id",
                                dataSource: new kendo.data.DataSource({
                                    data: ko.mapping.toJS(_this.phoneTypes())
                                })
                            });
                        }).fail(function (xhr, statusText, errorThrown) {
                            if (xhr.status === 400) {
                                _this.establishmentItemViewModel.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                                _this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                    title: 'Alert Message',
                                    dialogClass: 'jquery-ui',
                                    width: 'auto',
                                    resizable: false,
                                    modal: true,
                                    buttons: {
                                        'Ok': function () {
                                            _this.establishmentItemViewModel.$genericAlertDialog.dialog('close');
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        _this.contactPhones.push({ id: '', type: '', contactId: '', value: _this.contactPhoneTextValue() });
                        _this.contactPhoneTextValue("");
                        $(".phoneTypes").kendoDropDownList({
                            dataTextField: "name",
                            dataValueField: "id",
                            dataSource: new kendo.data.DataSource({
                                data: ko.mapping.toJS(_this.phoneTypes())
                            })
                        });
                    }
                }
            });
        };
        return Phones;
    })();
    Agreements.Phones = Phones;
})(Agreements || (Agreements = {}));
//# sourceMappingURL=Phones.js.map
