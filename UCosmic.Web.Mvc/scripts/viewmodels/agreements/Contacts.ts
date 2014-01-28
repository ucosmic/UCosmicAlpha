module Agreements {
    export class SelectConstructor {
        constructor(public name: string, public id: string) {
            this.name = name;
            this.id = id;
        }
    }
    export class Contacts {
        constructor(isCustomContactTypeAllowed, establishmentItemViewModel, agreementIsEdit, agreementId, kendoWindowBug, deferredPopContacts) {

            this.agreementId = agreementId;
            this.phones = new Agreements.Phones(agreementId, establishmentItemViewModel, this.contactId);
            this.isCustomContactTypeAllowed = isCustomContactTypeAllowed;
            this.establishmentItemViewModel = establishmentItemViewModel;
            this.agreementIsEdit = agreementIsEdit;
            this.kendoWindowBug = kendoWindowBug;
            this.deferredPopContacts = deferredPopContacts;
            this._setupValidation = <() => void > this._setupValidation.bind(this);
            this.editAContact = <() => boolean> this.editAContact.bind(this);
            this.removeContact = <() => boolean> this.removeContact.bind(this);
            this.populateContacts = <() => void > this.populateContacts.bind(this);
            this.contactSalutation = ko.mapping.fromJS([
                new SelectConstructor("[None]", ""),
                new SelectConstructor("Dr.", "Dr."),
                new SelectConstructor("Mr.", "Mr."),
                new SelectConstructor("Ms.", "Ms."),
                new SelectConstructor("Mrs.", "Mrs."),
                new SelectConstructor("Prof.", "Prof.")
            ]);
            this.contactSuffix = ko.mapping.fromJS([
                new SelectConstructor("[None]", ""),
                new SelectConstructor("Esq.", "Esq."),
                new SelectConstructor("Jr.", "Jr."),
                new SelectConstructor("PhD", "PhD"),
                new SelectConstructor("Sr.", "Sr.")
            ]);
            this._setupValidation();
        }

        //imported class instances
        phones;

        //imported vars
        isCustomContactTypeAllowed;
        establishmentItemViewModel;
        agreementIsEdit;
        agreementId;
        kendoWindowBug;
        deferredPopContacts;

        //contact vars
        $contactTypeOptions = ko.observable<JQuery>();
        contactTypeOptions = ko.mapping.fromJS([]);
        contactTypeOptionSelected = ko.observable<string>();
        contactsIsEdit = ko.observable(false);
        contactFirstName = ko.observable();
        contactLastName = ko.observable();
        contactId = ko.observable<number>();
        contactSuffix = ko.mapping.fromJS([]);
        contactSuffixSelected = ko.observable();
        $$contactSuffix = ko.observable<JQuery>();
        contactSalutation = ko.mapping.fromJS([]);
        contactSalutationSelected = ko.observable();
        $$contactSalutation = ko.observable<JQuery>();
        contactJobTitle = ko.observable();
        contactPersonId = ko.observable();
        contactUserId = ko.observable();
        contactDisplayName = ko.observable();
        contactIndex = 0;
        contactEmail = ko.observable();
        contactMiddleName = ko.observable();
        $addContactDialog = $("#addContactDialog");
        $contactEmail = $("#contactEmail");
        $contactLastName = $("#contactLastName");
        $contactFirstName = $("#contactFirstName");
        $contactSalutation = $("#contactSalutation");
        $contactSuffix = $("#contactSuffix");
        contacts = ko.mapping.fromJS([]);
        validateContact;


        editAContact(me): void {
            var dropdownlist,
                data;

            this.$addContactDialog.data("kendoWindow").open().title("Edit Contact")
            this.contactsIsEdit(true);
            this.contactEmail(me.emailAddress());
            this.contactDisplayName(me.displayName());
            this.contactPersonId(me.personId());
            this.contactUserId(me.userId());
            this.contactId(me.id());
            this.contactJobTitle(me.title());
            this.contactFirstName(me.firstName());
            this.contactLastName(me.lastName());
            $.each(me.phones(), (i, item) => {
                data = ko.mapping.toJS({
                    id: item.id,
                    contactId: item.contactId,
                    type: item.type,
                    value: item.value
                })
                if (data.type == null) {
                    data.type = '';
                }
                this.phones.contactPhones.push(data);
            })
            this.contactMiddleName(me.middleName());
            this.contactIndex = this.contacts.indexOf(me)
            if (me.userId() != null) {
                this.$contactEmail.prop('disabled', "disabled");
                this.$contactLastName.prop('disabled', "disabled");
                this.$contactFirstName.prop('disabled', "disabled");
                $("#contactMiddleName").prop('disabled', "disabled");
                this.$contactSalutation.data("kendoDropDownList").enable(false);
                this.$contactSuffix.data("kendoDropDownList").enable(false);
            }
            this.contactTypeOptionSelected(me.type());
            if (this.isCustomContactTypeAllowed()) {
                dropdownlist = $("#contactTypeOptions").data("kendoComboBox");
                dropdownlist.select((dataItem) => {
                    return dataItem.name === this.contactTypeOptionSelected();
                });
                if (dropdownlist.selectedIndex === -1) {
                    dropdownlist.dataSource.add({ name: this.contactTypeOptionSelected() });
                    dropdownlist.select(dropdownlist.dataSource.length);
                }
            } else {
                dropdownlist = $("#contactTypeOptions").data("kendoDropDownList");
                dropdownlist.select((dataItem) => {
                    return dataItem.text === this.contactTypeOptionSelected();
                });
            }
            dropdownlist = $("#contactSuffix").data("kendoDropDownList");
            dropdownlist.select(function (dataItem) {
                return dataItem.name === me.suffix();
            })
            dropdownlist = $("#contactSalutation").data("kendoDropDownList");
            dropdownlist.select(function (dataItem) {
                return dataItem.name === me.salutation();
            })
            $("#addAContact").fadeOut(500)
            $("input.phoneTypes").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: ko.mapping.toJS(this.phones.phoneTypes())
                })
            })
            $("input.phoneTypes").each(function (index) {
                dropdownlist = $(this).data("kendoDropDownList");
                dropdownlist.select(function (dataItem) {
                    return dataItem.name === me.phones()[index].type();
                })
            })
        }

        editContact(me): void {
            if (this.validateContact.isValid()) {
                var data;

                this.contactsIsEdit(false);
                this.contacts()[this.contactIndex].emailAddress(this.contactEmail());
                this.contacts()[this.contactIndex].title(this.contactJobTitle());
                if (this.contactUserId() != null) {
                    this.contacts()[this.contactIndex].displayName(this.contactDisplayName());
                } else {
                    this.contacts()[this.contactIndex].displayName(this.contactFirstName() + " " + this.contactLastName());
                }
                this.contacts()[this.contactIndex].personId(this.contactPersonId());
                this.contacts()[this.contactIndex].userId(this.contactUserId());
                this.contacts()[this.contactIndex].firstName(this.contactFirstName());
                this.contacts()[this.contactIndex].lastName(this.contactLastName());
                this.contacts()[this.contactIndex].middleName(this.contactMiddleName());
                this.contacts()[this.contactIndex].phones.removeAll();
                $.each(this.phones.contactPhones(), (i, item) => {
                    data = ko.mapping.toJS({
                        id: item.id,
                        contactId: item.contactId,
                        type: item.type,
                        value: item.value
                    })
                    this.contacts()[this.contactIndex].phones.push(ko.mapping.fromJS(data));
                });
                this.contacts()[this.contactIndex].type(this.contactTypeOptionSelected());
                this.contacts()[this.contactIndex].salutation(this.contactSalutationSelected());
                this.contacts()[this.contactIndex].suffix(this.contactSuffixSelected());
                $("#addAContact").fadeIn(500);
                if (this.agreementIsEdit()) {
                    var data, url;
                    this.contacts()[this.contactIndex].agreementId(this.agreementId)

                    data = {
                        agreementId: this.contacts()[this.contactIndex].agreementId(),
                        //PersonId: this.contacts()[this.contactIndex].personId(),
                        Type: this.contacts()[this.contactIndex].type(),
                        DisplayName: this.contacts()[this.contactIndex].displayName(),
                        FirstName: this.contacts()[this.contactIndex].firstName(),
                        MiddleName: this.contacts()[this.contactIndex].middleName(),
                        LastName: this.contacts()[this.contactIndex].lastName(),
                        Suffix: this.contacts()[this.contactIndex].suffix(),
                        EmailAddress: this.contacts()[this.contactIndex].emailAddress(),
                        PersonId: this.contacts()[this.contactIndex].personId(),
                        Phones: this.contacts()[this.contactIndex].phones(),
                        Title: this.contacts()[this.contactIndex].title()
                    }
                    url = App.Routes.WebApi.Agreements.Contacts.put(this.agreementId, this.contacts()[this.contactIndex].id());
                    $.ajax({
                        type: 'PUT',
                        url: url,
                        data: data,
                        success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                        },
                        error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
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
                        }
                    });
                    $.each(this.phones.deletedPhones, (i, item: number) => {
                        var url = App.Routes.WebApi.Agreements.Contacts.Phones.del(this.agreementId, this.contactId(), item);

                        $.ajax({
                            url: url,
                            type: 'DELETE',
                            success: (): void => {
                                //$("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                            }
                        });
                    });
                }
            } else {
                this.validateContact.errors.showAllMessages(true);
            }
            this.$addContactDialog.data("kendoWindow").close()
        }

        addContact(me, e): void {
            if (this.validateContact.isValid()) {
                var data;

                if (this.contactDisplayName() == undefined || this.contactDisplayName() == "") {
                    this.contactDisplayName(this.contactFirstName() + " " + this.contactLastName());
                }
                data = {
                    agreementId: this.agreementId,
                    title: this.contactJobTitle(),
                    firstName: this.contactFirstName(),
                    lastName: this.contactLastName(),
                    id: this.contactUserId(),
                    personId: this.contactPersonId(),
                    userId: this.contactUserId(),
                    phones: ko.mapping.toJS(this.phones.contactPhones()),
                    emailAddress: this.contactEmail(),
                    type: this.contactTypeOptionSelected(),
                    suffix: this.contactSuffixSelected(),
                    salutation: this.contactSalutationSelected(),
                    displayName: this.contactDisplayName(),
                    middleName: this.contactMiddleName()
                }
                this.$addContactDialog.data("kendoWindow").close();
                $("#addAContact").fadeIn(500);
                //$("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));
                if (this.agreementIsEdit()) {
                    var url = App.Routes.WebApi.Agreements.Contacts.post(this.agreementId);

                    $.post(url, data)
                        .done((response: any, statusText: string, xhr: JQueryXHR): void => {
                            var myUrl = xhr.getResponseHeader('Location');

                            data.id = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                            this.contacts.push(ko.mapping.fromJS(data));
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
                }
                else {
                    this.contacts.push(ko.mapping.fromJS(data));
                }
            } else {
                this.validateContact.errors.showAllMessages(true);
            }
        }

        addAContact(me, e): void {
            this.contactsIsEdit(false);
            this.clearContact()
            this.$addContactDialog.data("kendoWindow").open().title("Add Contact")
            $("#addAContact").fadeOut(500);
        }

        cancelContact(): void {
            this.$addContactDialog.data("kendoWindow").close()
            $("#addAContact").fadeIn(500);
        }

        clearContact(): void {
            var dropdownlist

            this.$contactEmail.prop('disabled', '');
            this.$contactLastName.prop('disabled', '');
            this.$contactFirstName.prop('disabled', '');
            $("#contactMiddleName").prop('disabled', '');
            this.$contactSalutation.data("kendoDropDownList").enable(true);
            this.$contactSuffix.data("kendoDropDownList").enable(true);
            this.validateContact.errors.showAllMessages(false);
            this.validateContact.errors.showAllMessages(false);
            this.contactId(undefined);
            this.contactEmail('');
            this.contactDisplayName('');
            this.contactPersonId('');
            this.contactUserId('');
            this.contactJobTitle('');
            this.contactFirstName('');
            this.contactMiddleName('');
            this.contactLastName('');
            this.phones.contactPhones.removeAll();
            this.contactTypeOptionSelected('');
            if (this.isCustomContactTypeAllowed) {
                dropdownlist = $("#contactTypeOptions").data("kendoComboBox");
            } else {
                dropdownlist = $("#contactTypeOptions").data("kendoDropDownList");
            }
            dropdownlist.select(0);
            dropdownlist = $("#contactSalutation").data("kendoDropDownList");
            dropdownlist.select(0);
            dropdownlist = $("#contactSuffix").data("kendoDropDownList");
            dropdownlist.select(0);
            this.validateContact.errors.showAllMessages(false);
        }

        removeContact(me, e): boolean {
            if (confirm('Are you sure you want to remove "' +
                me.firstName() + " " + me.lastName() +
                '" as a contact from this agreement?')) {
                var url = "";

                if (this.agreementIsEdit()) {
                    url = App.Routes.WebApi.Agreements.Contacts.del(this.agreementId, me.id());

                    $.ajax({
                        url: url,
                        type: 'DELETE',
                        success: (): void => {
                            this.contacts.remove(me);
                            //$("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                        }
                    })
                    }
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        bindJquery(): void {
            var self = this,
                kacSelect;

            this.$addContactDialog.kendoWindow({
                width: 950,
                open: () => {
                    this.kendoWindowBug.val = $("body").scrollTop() - 10;
                    $("html, body").css("overflow", "hidden");
                },
                close: () => {
                    this.kendoWindowBug.val = 0;
                    $("html, body").css("overflow", "");
                    $("#addAContact").fadeIn(500);
                    this.clearContact();
                },
                visible: false,
                draggable: false,
                resizable: false
            });
            this.$addContactDialog.parent().addClass("contactKendoWindow");
            //kendo autocomplete select 
            kacSelect = (me, e) => {
                var dataItem = me.dataItem(e.item.index());

                this.contactDisplayName(dataItem.displayName)
                this.contactFirstName(dataItem.firstName);
                this.contactLastName(dataItem.lastName);
                this.contactEmail(dataItem.defaultEmailAddress);
                this.contactMiddleName(dataItem.middleName);
                this.contactPersonId(dataItem.id);
                this.contactUserId(dataItem.userId);
                this.contactSuffixSelected(dataItem.suffix);
                this.contactSalutationSelected(dataItem.salutation);
                if (dataItem.userId != null) {
                    this.$contactEmail.prop('disabled', 'disabled');
                    this.$contactLastName.prop('disabled', 'disabled');
                    this.$contactFirstName.prop('disabled', 'disabled');
                    $("#contactMiddleName").prop('disabled', 'disabled');
                    this.$contactSalutation.data("kendoDropDownList").enable(false);
                    this.$contactSuffix.data("kendoDropDownList").enable(false);
                }
                this.validateContact.errors.showAllMessages(true);
            }
            this.$contactEmail.kendoAutoComplete({
                dataTextField: "defaultEmailAddress",
                minLength: 3,
                filter: "contains",
                ignoreCase: true,
                dataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: (options: any): void => {
                            $.ajax({
                                url: App.Routes.WebApi.People.get(),
                                data: {
                                    email: $("#contactEmail").val(),
                                    emailMatch: 'startsWith'
                                },
                                success: (results: any): void => {
                                    options.success(results.items);
                                }
                            });
                        }
                    }
                }),
                select: (e: any): void => {
                    kacSelect(this.$contactEmail.data("kendoAutoComplete"), e);
                }
            });
            this.$contactLastName.kendoAutoComplete({
                dataTextField: "lastName",
                template: "#=displayName#",
                minLength: 3,
                filter: "contains",
                ignoreCase: true,
                dataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: (options: any): void => {
                            $.ajax({
                                url: App.Routes.WebApi.People.get(),
                                data: {
                                    lastName: this.contactLastName(),
                                    lastNameMatch: 'startsWith'
                                },
                                success: (results: any): void => {
                                    options.success(results.items);
                                }
                            });
                        }
                    }
                }),
                select: (e: any): void => {
                    kacSelect(this.$contactLastName.data("kendoAutoComplete"), e);
                }
            });
            this.$contactFirstName.kendoAutoComplete({
                dataTextField: "firstName",
                template: "#=displayName#",
                minLength: 3,
                filter: "contains",
                ignoreCase: true,
                dataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: (options: any): void => {
                            $.ajax({
                                url: App.Routes.WebApi.People.get(),
                                data: {
                                    firstName: this.contactFirstName(),
                                    firstNameMatch: 'startsWith'
                                },
                                success: (results: any): void => {
                                    options.success(results.items);
                                }
                            });
                        }
                    }
                }),
                select: (e: any): void => {
                    kacSelect(this.$contactFirstName.data("kendoAutoComplete"), e);
                }
            });

            $("#addContactDialog").on("change", ".phoneTypes", function () {
                var context = ko.dataFor(this);

                //added for weird bug for when adding more than 1 phone number then editing the type.
                if (context.type != $(this).val() && $(this).val() !== "") {
                    context.type = $(this).val()
                }
                if (context.id) {
                    var url = App.Routes.WebApi.Agreements.Contacts.Phones.put(self.agreementId, context.contactId, context.id);

                    $.ajax({
                        type: 'PUT',
                        url: url,
                        data: context,
                        success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                        },
                        error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
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
                        }
                    });
                }
            })
        $("#addContactDialog").on("change", ".phoneNumbers", function () {
                var context = ko.dataFor(this);

                if (self.agreementIsEdit() && context.value == $(this).val()) {
                    //first do a validation for phone
                    if ($(this).val() == '') {
                        $("#phoneNumberValidate" + context.id).css("visibility", "visible");
                    } else {
                        var url = App.Routes.WebApi.Agreements.Contacts.Phones.put(self.agreementId, context.contactId, context.id);

                        $("#phoneNumberValidate" + context.id).css("visibility", "hidden");
                        $.ajax({
                            type: 'PUT',
                            url: url,
                            data: context,
                            success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                            },
                            error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
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
                            }
                        });
                    }
                }
            })
        if (this.isCustomContactTypeAllowed) {
                $("#contactTypeOptions").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.contactTypeOptions()
                    })
                });
            } else {
                $("#contactTypeOptions").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.contactTypeOptions()
                    })
                });
            }
            this.$contactSalutation.kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: ko.mapping.toJS(this.contactSalutation())
                })
            });
            this.$contactSuffix.kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: ko.mapping.toJS(this.contactSuffix())
                })
            });
        }

        private _setupValidation(): void {
            this.validateContact = ko.validatedObservable({
                contactSalutation: this.contactSalutation.extend({
                    maxLength: 50
                }),
                contactFirstName: this.contactFirstName.extend({
                    required: {
                        message: 'First name is required.'
                    },
                    maxLength: 50
                }),
                contactTypeOptionSelected: this.contactTypeOptionSelected.extend({
                    required: {
                        message: 'Contact type is required.'
                    },
                    maxLength: 50
                }),
                contactLastName: this.contactLastName.extend({
                    required: {
                        message: 'Last name is required.'
                    },
                    maxLength: 50
                }),
                contactEmail: this.contactEmail.extend({
                    required: {
                        message: 'Email is required.',
                        maxLength: 100
                    },
                    email: {
                        message: 'Email is in wrong format'
                    }
                }),
                contactSuffix: this.contactSuffix.extend({
                    maxLength: 50
                }),
                contactJobTitle: this.contactJobTitle.extend({
                    maxLength: 50
                })
            })
        }

        populateContacts(): void {
            $.get(App.Routes.WebApi.Agreements.Contacts.get(this.agreementId))
                .done((response: any): void => {
                    ko.mapping.fromJS(response, this.contacts)
                    this.deferredPopContacts.resolve();
                });

        }

        //post files
        postMe(data, url): void {
            //$.post(url, data)
            //    .done((response: any, statusText: string, xhr: JQueryXHR): void => {
            //    })
            //    .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
            //        if (xhr.status === 400) { // validation message will be in xhr response text...
            //            this.establishmentItemViewModel.$genericAlertDialog.find('p.content')
            //                .html(xhr.responseText.replace('\n', '<br /><br />'));
            //            this.establishmentItemViewModel.$genericAlertDialog.dialog({
            //                title: 'Alert Message',
            //                dialogClass: 'jquery-ui',
            //                width: 'auto',
            //                resizable: false,
            //                modal: true,
            //                buttons: {
            //                    'Ok': (): void => { this.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
            //                }
            //            });
            //        }
            //    });

            $.ajax({
                type: 'POST',
                url: url,
                async: false,// need to do this before page redirect.
                data: data,
                error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                    //if (xhr.status === 400) { // validation message will be in xhr response text...
                    //    this.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                    //        .html(xhr.responseText.replace('\n', '<br /><br />'));
                    //    this.establishmentItemViewModel.$genericAlertDialog.dialog({
                    //        title: 'Alert Message',
                    //        dialogClass: 'jquery-ui',
                    //        width: 'auto',
                    //        resizable: false,
                    //        modal: true,
                    //        buttons: {
                    //            'Ok': (): void => { this.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
                    //        }
                    //    });
                    //}
                    App.Failures.message(xhr, xhr.responseText, true);
                }
            });
        }

        //part of save agreement
        agreementPostContacts(response: any, statusText: string, xhr: JQueryXHR, deferred): void {
            var tempUrl = App.Routes.WebApi.Agreements.Contacts.post(this.agreementId),
                data;

            $.each(this.contacts(), (i, item) => {
                data = {
                    agreementId: this.agreementId,
                    title: item.title(),
                    firstName: item.firstName(),
                    lastName: item.lastName(),
                    userId: item.id(),
                    personId: item.personId(),
                    phones: item.phones(),
                    emailAddress: item.emailAddress(),
                    type: item.type(),
                    suffix: item.suffix(),
                    salutation: item.salutation(),
                    displayName: item.displayName(),
                    middleName: item.middleName
                }
            this.postMe(data, tempUrl);
            });
            deferred.resolve();
        }
    }
}