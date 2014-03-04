 module Agreements.ViewModels {
     export class Settings {
         
         constructor() {
             
         }

         isCustomTypeAllowed = ko.observable();
         isCustomStatusAllowed = ko.observable();
         isCustomContactTypeAllowed = ko.observable();
         statusOptions = ko.mapping.fromJS([]);
         contactTypeOptions = ko.mapping.fromJS([]);
         typeOptions = ko.mapping.fromJS([]);

         private processSettings(result): void {
             var self = this;

             this.isCustomTypeAllowed(result.isCustomTypeAllowed);
             this.isCustomStatusAllowed(result.isCustomStatusAllowed);
             this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
             this.statusOptions.push(new Agreements.SelectConstructor("", ""));
             for (var i = 0, j = result.statusOptions.length; i < j; i++) {
                 this.statusOptions.push(new Agreements.SelectConstructor(result.statusOptions[i], result.statusOptions[i]));
             };
             this.contactTypeOptions.push(new Agreements.SelectConstructor("", undefined));
             for (var i = 0, j = result.contactTypeOptions.length; i < j; i++) {
                 this.contactTypeOptions.push(new Agreements.SelectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
             };
             this.typeOptions.push(new Agreements.SelectConstructor("", ""));
             for (var i = 0, j = result.typeOptions.length; i < j; i++) {
                 this.typeOptions.push(new Agreements.SelectConstructor(result.typeOptions[i], result.typeOptions[i]));
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
     }

 }