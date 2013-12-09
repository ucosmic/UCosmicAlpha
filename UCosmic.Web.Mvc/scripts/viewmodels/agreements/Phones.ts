/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />

module Agreements {

    export class Phones {
        constructor(agreementId, establishmentItemViewModel, contactId) {
            this.agreementId = agreementId;
            this.contactId = contactId;
            this.establishmentItemViewModel = establishmentItemViewModel;
            this.removePhone = <() => void > this.removePhone.bind(this);
            this.addPhone = <() => void > this.addPhone.bind(this);
            this.phoneTypes = ko.mapping.fromJS([
                new this.selectConstructor("[None]", ""),
                new this.selectConstructor("home", "home"),
                new this.selectConstructor("work", "work"),
                new this.selectConstructor("mobile", "mobile")
            ]);
            this._bindJquery();
        }

        //imported vars
        agreementId;
        contactId;
        establishmentItemViewModel;

        //phone vars
        contactPhoneTextValue = ko.observable("");
        contactPhoneType = ko.observable();
        contactPhones = ko.observableArray();
        phoneTypes = ko.mapping.fromJS([]);
        $phoneTypes = ko.observable<JQuery>();
        deletedPhones = Array();

        selectConstructor = function (name: string, id: string) {
            this.name = name;
            this.id = id;
        }

        removePhone(me, e): void {
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
        }

        addPhone(me, e): void {
            if (this.contactPhoneTextValue().length > 0) {
                this.contactPhones.push({ type: '', contactId: '', value: this.contactPhoneTextValue() })
                this.contactPhoneTextValue("");
                $(".phoneTypes").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: ko.mapping.toJS(this.phoneTypes())
                    })
                });
            }
        }

        private _bindJquery(): void {
            var self = this;

            this.contactPhoneTextValue.subscribe((me: string): void => {
                if (this.contactPhoneTextValue().length > 0) {
                    if (this.contactId()) {
                        var url = App.Routes.WebApi.Agreements.Contacts.Phones.post(this.agreementId, this.contactId()),
                            data = { id: "0", type: '', contactId: this.contactId(), value: this.contactPhoneTextValue() };

                        $.post(url, data)
                            .done((response: any, statusText: string, xhr: JQueryXHR): void => {
                                var myUrl = xhr.getResponseHeader('Location');

                                data.id = myUrl.substring(myUrl.lastIndexOf("/") + 1);
                                this.contactPhones.push(data)
                                this.contactPhoneTextValue("");
                                $(".phoneTypes").kendoDropDownList({
                                    dataTextField: "name",
                                    dataValueField: "id",
                                    dataSource: new kendo.data.DataSource({
                                        data: ko.mapping.toJS(this.phoneTypes())
                                    })
                                });
                            })
                            .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                                if (xhr.status === 400) { // validation message will be in xhr response text...
                                    this.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                                        .html(xhr.responseText.replace('\n', '<br /><br />'));
                                    this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                        title: 'Alert Message',
                                        dialogClass: 'jquery-ui',
                                        width: 'auto',
                                        resizable: false,
                                        modal: true,
                                        buttons: {
                                            'Ok': (): void => { this.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
                                        }
                                    });
                                }
                            });
                    } else {
                        this.contactPhones.push({ id: '', type: '', contactId: '', value: this.contactPhoneTextValue() })
                        this.contactPhoneTextValue("");
                        $(".phoneTypes").kendoDropDownList({
                            dataTextField: "name",
                            dataValueField: "id",
                            dataSource: new kendo.data.DataSource({
                                data: ko.mapping.toJS(this.phoneTypes())
                            })
                        });
                    }
                }
            });
        }
    }
}