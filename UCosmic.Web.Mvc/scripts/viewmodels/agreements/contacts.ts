module agreements {

    export class contacts {
        constructor(isCustomContactTypeAllowed, establishmentItemViewModel, agreementIsEdit, agreementId, kendoWindowBug, dfdPopContacts) {
            this.isCustomContactTypeAllowed = isCustomContactTypeAllowed;
            this.establishmentItemViewModel = establishmentItemViewModel;
            this.agreementIsEdit = agreementIsEdit;
            this.agreementId = agreementId;
            this.kendoWindowBug = kendoWindowBug;
            this.dfdPopContacts = dfdPopContacts;

            this._setupValidation = <() => void > this._setupValidation.bind(this);
            this.editAContact = <() => boolean> this.editAContact.bind(this);
            this.removeContact = <() => boolean> this.removeContact.bind(this);
            this.removePhone = <() => void > this.removePhone.bind(this);
            this.addPhone = <() => void > this.addPhone.bind(this);
            this.populateContacts = <() => void > this.populateContacts.bind(this);

            this.contactSalutation = ko.mapping.fromJS([
                new this.selectConstructor("[None]", ""),
                new this.selectConstructor("Dr.", "Dr."),
                new this.selectConstructor("Mr.", "Mr."),
                new this.selectConstructor("Ms.", "Ms."),
                new this.selectConstructor("Mrs.", "Mrs."),
                new this.selectConstructor("Prof.", "Prof.")
            ]);

            this.contactSuffix = ko.mapping.fromJS([
                new this.selectConstructor("[None]", ""),
                new this.selectConstructor("Esq.", "Esq."),
                new this.selectConstructor("Jr.", "Jr."),
                new this.selectConstructor("PhD", "PhD"),
                new this.selectConstructor("Sr.", "Sr.")
            ]);

            this.phoneTypes = ko.mapping.fromJS([
                new this.selectConstructor("[None]", ""),
                new this.selectConstructor("home", "home"),
                new this.selectConstructor("work", "work"),
                new this.selectConstructor("mobile", "mobile")
            ]);
            this._setupValidation();
        }

        selectConstructor = function (name: string, id: string) {
            this.name = name;
            this.id = id;
        }

        //imported vars
        isCustomContactTypeAllowed;
        establishmentItemViewModel;
        agreementIsEdit;
        agreementId;
        kendoWindowBug;
        dfdPopContacts;

        //contact vars
        $contactTypeOptions: KnockoutObservable<JQuery> = ko.observable();
        contactTypeOptions = ko.mapping.fromJS([]);
        contactTypeOptionSelected: KnockoutObservable<string> = ko.observable();
        contactsIsEdit = ko.observable(false);
        contactFirstName = ko.observable();
        contactLastName = ko.observable();
        contactId = ko.observable();
        contactSuffix = ko.mapping.fromJS([]);
        contactSuffixSelected = ko.observable();
        $$contactSuffix: KnockoutObservable<JQuery> = ko.observable();
        contactSalutation = ko.mapping.fromJS([]);
        contactSalutationSelected = ko.observable();
        $$contactSalutation: KnockoutObservable<JQuery> = ko.observable();
        contactJobTitle = ko.observable();
        contactPersonId = ko.observable();
        contactUserId = ko.observable();
        contactDisplayName = ko.observable();
        contactIndex = 0;
        contactEmail = ko.observable();
        contactMiddleName = ko.observable();
        contactPhoneTextValue = ko.observable("");
        contactPhoneType = ko.observable();
        $addContactDialog = $("#addContactDialog");
        $contactEmail = $("#contactEmail");
        $contactLastName = $("#contactLastName");
        $contactFirstName = $("#contactFirstName");
        $contactSalutation = $("#contactSalutation");
        $contactSuffix = $("#contactSuffix");
        contacts = ko.mapping.fromJS([]);
        contactPhones = ko.observableArray();
        phoneTypes = ko.mapping.fromJS([]);
        $phoneTypes: KnockoutObservable<JQuery> = ko.observable();
        validateContact;

        editAContact(me): void {
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
                var data = ko.mapping.toJS({
                    id: item.id,
                    contactId: item.contactId,
                    type: item.type,
                    value: item.value
                })
                if (data.type == null) {
                    data.type = '';
                }
                this.contactPhones.push(data);
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

            if (this.isCustomContactTypeAllowed) {
                var dropdownlist = $("#contactTypeOptions").data("kendoComboBox");
            } else {
                var dropdownlist = $("#contactTypeOptions").data("kendoDropDownList");
            }
            dropdownlist.select(function (dataItem) {
                return dataItem.name === me.type();
            })

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
                    data: ko.mapping.toJS(this.phoneTypes())
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
                $.each(this.contactPhones(), (i, item) => {
                    var data = ko.mapping.toJS({
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
                    this.contacts()[this.contactIndex].agreementId(this.agreementId.val)

                    var data = {
                        agreementId: this.contacts()[this.contactIndex].agreementId(),
                        PersonId: this.contacts()[this.contactIndex].personId(),
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
                    var url = App.Routes.WebApi.Agreements.Contacts.put(this.agreementId.val, this.contacts()[this.contactIndex].id());
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
                }
            } else {
                this.validateContact.errors.showAllMessages(true);
            }
            this.$addContactDialog.data("kendoWindow").close()
        }

        addContact(me, e): void {
            if (this.validateContact.isValid()) {
                if (this.contactDisplayName() == undefined || this.contactDisplayName() == "") {
                    this.contactDisplayName(this.contactFirstName() + " " + this.contactLastName());
                }
                var data = {
                    agreementId: this.agreementId.val,
                    title: this.contactJobTitle(),
                    firstName: this.contactFirstName(),
                    lastName: this.contactLastName(),
                    id: this.contactUserId(),
                    personId: this.contactPersonId(),
                    userId: this.contactUserId(),
                    phones: ko.mapping.toJS(this.contactPhones()),
                    emailAddress: this.contactEmail(),
                    type: this.contactTypeOptionSelected(),
                    suffix: this.contactSuffixSelected(),
                    salutation: this.contactSalutationSelected(),
                    displayName: this.contactDisplayName(),
                    middleName: this.contactMiddleName()
                }

                this.$addContactDialog.data("kendoWindow").close();

                $("#addAContact").fadeIn(500);
                $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));

                if (this.agreementIsEdit()) {

                    var url = App.Routes.WebApi.Agreements.Contacts.post(this.agreementId.val);
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
            this.contactPhones.removeAll();
            this.contactTypeOptionSelected('');

            if (this.isCustomContactTypeAllowed) {
                var dropdownlist = $("#contactTypeOptions").data("kendoComboBox");
            } else {
                var dropdownlist = $("#contactTypeOptions").data("kendoDropDownList");
            }
            dropdownlist.select(0);
            var dropdownlist = $("#contactSalutation").data("kendoDropDownList");
            dropdownlist.select(0);
            var dropdownlist = $("#contactSuffix").data("kendoDropDownList");
            dropdownlist.select(0);
            this.validateContact.errors.showAllMessages(false);
        }

        removeContact(me, e): boolean {
            if (confirm('Are you sure you want to remove "' +
                me.firstName() + " " + me.lastName() +
                '" as a contact from this agreement?')) {
                var url = "";
                if (this.agreementIsEdit()) {
                    url = App.Routes.WebApi.Agreements.Contacts.del(this.agreementId.val, me.id());

                    $.ajax({
                        url: url,
                        type: 'DELETE',
                        success: (): void => {
                            this.contacts.remove(me);
                            $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                        }
                    })
                    }
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        removePhone(me, e): void {
            var url = App.Routes.WebApi.Agreements.Contacts.Phones.del(this.agreementId.val, me.contactId, me.id);
            $.ajax({
                url: url,
                type: 'DELETE',
                success: (): void => {
                    //this.files.remove(me);
                    this.contactPhones.remove(me);
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                }
            });
            this.contactPhones.remove(me);
            e.preventDefault();
            e.stopPropagation();
        }

        addPhone(me, e): void {
            if (this.contactPhoneTextValue().length > 0) {
                //var context = ko.contextFor($("#contactPhoneTextValue")[0])
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

        bindJquery(): void {
            var self = this;

            this.contactPhoneTextValue.subscribe((me: string): void => {
                if (this.contactPhoneTextValue().length > 0) {
                    if (this.contactId()) {
                        var url = App.Routes.WebApi.Agreements.Contacts.Phones.post(this.agreementId.val, this.contactId());
                        var data = { id: "0", type: '', contactId: this.contactId(), value: this.contactPhoneTextValue() };
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
            var kacSelect = (me, e) => {
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
                                    email: this.contactEmail(),
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
                if (context.type != $(this).val() && $(this).val() !== "") {
                    context.type = $(this).val()
                //added for weird bug for when adding more than 1 phone number then editing the type.
            }
                if (context.id) {
                    var url = App.Routes.WebApi.Agreements.Contacts.Phones.put(self.agreementId.val, context.contactId, context.id);
                    $.ajax({
                        type: 'PUT',
                        url: url,
                        data: context,
                        success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                        },
                        error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {                            if (xhr.status === 400) { // validation message will be in xhr response text...
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
                        $("#phoneNumberValidate" + context.id).css("visibility", "hidden");
                        var url = App.Routes.WebApi.Agreements.Contacts.Phones.put(self.agreementId.val, context.contactId, context.id);
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
            $.get(App.Routes.WebApi.Agreements.Contacts.get(this.agreementId.val), { useTestData: false })
                .done((response: any): void => {
                    ko.mapping.fromJS(response, this.contacts)
                    this.dfdPopContacts.resolve();
                });

        }
    }
}