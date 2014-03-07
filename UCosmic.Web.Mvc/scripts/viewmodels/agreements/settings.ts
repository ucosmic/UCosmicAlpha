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
         }
         deleteErrorMessage = ko.observable('');

         isCustomStatusAllowed = ko.observable();
         statusOptions = ko.mapping.fromJS([]);
         statusOptionSelected = ko.observable("");
         $statusOptions = ko.observable<JQuery>();

         isCustomContactTypeAllowed = ko.observable();
         contactTypeOptions = ko.mapping.fromJS([]);
         contactTypeOptionSelected = ko.observable("");
         contactTypeOption = ko.observable("");
         $contactTypeOptions = ko.observable<JQuery>();

         isCustomTypeAllowed = ko.observable();
         typeOptions = ko.mapping.fromJS([]);
         typeOption = ko.observable("");
         typeOptionSelected = ko.observable("");
         $typeOptions = ko.observable<JQuery>();

         private processSettings(result): void {
             var self = this;

             this.isCustomTypeAllowed(result.isCustomTypeAllowed);
             this.isCustomStatusAllowed(result.isCustomStatusAllowed);
             this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
             //this.statusOptions.push(new Agreements.ViewModels.SelectConstructor("", ""));
             for (var i = 0, j = result.statusOptions.length; i < j; i++) {
                 this.statusOptions.push(new Agreements.ViewModels.SelectConstructor(result.statusOptions[i], result.statusOptions[i]));
             };
             //this.contactTypeOptions.push(new Agreements.ViewModels.SelectConstructor("", undefined));
             for (var i = 0, j = result.contactTypeOptions.length; i < j; i++) {
                 this.contactTypeOptions.push(new Agreements.ViewModels.SelectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
             };
             //this.typeOptions.push(new Agreements.ViewModels.SelectConstructor("", ""));
             for (var i = 0, j = result.typeOptions.length; i < j; i++) {
                 this.typeOptions.push(new Agreements.ViewModels.SelectConstructor(result.typeOptions[i], result.typeOptions[i]));
             };
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
             //if (this.agreementId !== 0) {
             //    this.deletedPhones.push(me.id);
             //    //var url = App.Routes.WebApi.Agreements.Contacts.Phones.del(this.agreementId, me.contactId, me.id);

             //    //$.ajax({
             //    //    url: url,
             //    //    type: 'DELETE',
             //    //    success: (): void => {
             //    //        this.contactPhones.remove(me);
             //    //        $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
             //    //    }
             //    //});
             //}
             this.typeOptions.remove(me);
             e.preventDefault();
             e.stopPropagation();
         }

         addTypeOption(me, e): void {
             //if (this.contactPhoneTextValue().length > 0) {
             //    this.contactPhones.push({ type: '', contactId: '', value: this.contactPhoneTextValue() })
             //   this.contactPhoneTextValue("");
             //    $(".phoneTypes").kendoDropDownList({
             //        dataTextField: "name",
             //        dataValueField: "id",
             //        dataSource: new kendo.data.DataSource({
             //            data: ko.mapping.toJS(this.phoneTypes())
             //        })
             //    });
             //}
         }

         addContactTypeOption(me, e): void {
         }

         updateAgreementSettings(me, e): void {
             
         }
     }

 }