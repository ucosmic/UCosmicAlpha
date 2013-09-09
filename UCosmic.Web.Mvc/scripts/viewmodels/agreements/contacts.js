/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="./phones.ts" />
var agreements;
(function (agreements) {
    var contacts = (function () {
        function contacts(isCustomContactTypeAllowed, establishmentItemViewModel, agreementIsEdit, agreementId, kendoWindowBug, dfdPopContacts) {
            this.selectConstructor = function (name, id) {
                this.name = name;
                this.id = id;
            };
            //contact vars
            this.$contactTypeOptions = ko.observable();
            this.contactTypeOptions = ko.mapping.fromJS([]);
            this.contactTypeOptionSelected = ko.observable();
            this.contactsIsEdit = ko.observable(false);
            this.contactFirstName = ko.observable();
            this.contactLastName = ko.observable();
            this.contactId = ko.observable();
            this.contactSuffix = ko.mapping.fromJS([]);
            this.contactSuffixSelected = ko.observable();
            this.$$contactSuffix = ko.observable();
            this.contactSalutation = ko.mapping.fromJS([]);
            this.contactSalutationSelected = ko.observable();
            this.$$contactSalutation = ko.observable();
            this.contactJobTitle = ko.observable();
            this.contactPersonId = ko.observable();
            this.contactUserId = ko.observable();
            this.contactDisplayName = ko.observable();
            this.contactIndex = 0;
            this.contactEmail = ko.observable();
            this.contactMiddleName = ko.observable();
            this.$addContactDialog = $("#addContactDialog");
            this.$contactEmail = $("#contactEmail");
            this.$contactLastName = $("#contactLastName");
            this.$contactFirstName = $("#contactFirstName");
            this.$contactSalutation = $("#contactSalutation");
            this.$contactSuffix = $("#contactSuffix");
            this.contacts = ko.mapping.fromJS([]);
            this.phonesClass = new agreements.phones(this.agreementId, establishmentItemViewModel, this.contactId);

            //ko.applyBindings(this.phonesClass, $('#phones')[0]);
            this.isCustomContactTypeAllowed = isCustomContactTypeAllowed;
            this.establishmentItemViewModel = establishmentItemViewModel;
            this.agreementIsEdit = agreementIsEdit;
            this.agreementId = agreementId;
            this.kendoWindowBug = kendoWindowBug;
            this.dfdPopContacts = dfdPopContacts;

            this._setupValidation = this._setupValidation.bind(this);
            this.editAContact = this.editAContact.bind(this);
            this.removeContact = this.removeContact.bind(this);
            this.populateContacts = this.populateContacts.bind(this);

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

            this._setupValidation();
        }
        contacts.prototype.editAContact = function (me) {
            var _this = this;
            this.$addContactDialog.data("kendoWindow").open().title("Edit Contact");
            this.contactsIsEdit(true);
            this.contactEmail(me.emailAddress());
            this.contactDisplayName(me.displayName());
            this.contactPersonId(me.personId());
            this.contactUserId(me.userId());
            this.contactId(me.id());
            this.contactJobTitle(me.title());
            this.contactFirstName(me.firstName());
            this.contactLastName(me.lastName());
            $.each(me.phones(), function (i, item) {
                var data = ko.mapping.toJS({
                    id: item.id,
                    contactId: item.contactId,
                    type: item.type,
                    value: item.value
                });
                if (data.type == null) {
                    data.type = '';
                }
                _this.phonesClass.contactPhones.push(data);
            });

            this.contactMiddleName(me.middleName());
            this.contactIndex = this.contacts.indexOf(me);
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
            });

            dropdownlist = $("#contactSuffix").data("kendoDropDownList");
            dropdownlist.select(function (dataItem) {
                return dataItem.name === me.suffix();
            });

            dropdownlist = $("#contactSalutation").data("kendoDropDownList");
            dropdownlist.select(function (dataItem) {
                return dataItem.name === me.salutation();
            });

            $("#addAContact").fadeOut(500);

            $("input.phoneTypes").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: ko.mapping.toJS(this.phonesClass.phoneTypes())
                })
            });

            $("input.phoneTypes").each(function (index) {
                dropdownlist = $(this).data("kendoDropDownList");
                dropdownlist.select(function (dataItem) {
                    return dataItem.name === me.phones()[index].type();
                });
            });
        };

        contacts.prototype.editContact = function (me) {
            var _this = this;
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
                $.each(this.phonesClass.contactPhones(), function (i, item) {
                    var data = ko.mapping.toJS({
                        id: item.id,
                        contactId: item.contactId,
                        type: item.type,
                        value: item.value
                    });
                    _this.contacts()[_this.contactIndex].phones.push(ko.mapping.fromJS(data));
                });
                this.contacts()[this.contactIndex].type(this.contactTypeOptionSelected());
                this.contacts()[this.contactIndex].salutation(this.contactSalutationSelected());
                this.contacts()[this.contactIndex].suffix(this.contactSuffixSelected());

                $("#addAContact").fadeIn(500);

                if (this.agreementIsEdit()) {
                    this.contacts()[this.contactIndex].agreementId(this.agreementId.val);

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
                    };
                    var url = App.Routes.WebApi.Agreements.Contacts.put(this.agreementId.val, this.contacts()[this.contactIndex].id());
                    $.ajax({
                        type: 'PUT',
                        url: url,
                        data: data,
                        success: function (response, statusText, xhr) {
                        },
                        error: function (xhr, statusText, errorThrown) {
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
                        }
                    });
                }
            } else {
                this.validateContact.errors.showAllMessages(true);
            }
            this.$addContactDialog.data("kendoWindow").close();
        };

        contacts.prototype.addContact = function (me, e) {
            var _this = this;
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
                    phones: ko.mapping.toJS(this.phonesClass.contactPhones()),
                    emailAddress: this.contactEmail(),
                    type: this.contactTypeOptionSelected(),
                    suffix: this.contactSuffixSelected(),
                    salutation: this.contactSalutationSelected(),
                    displayName: this.contactDisplayName(),
                    middleName: this.contactMiddleName()
                };

                this.$addContactDialog.data("kendoWindow").close();

                $("#addAContact").fadeIn(500);
                $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));

                if (this.agreementIsEdit()) {
                    var url = App.Routes.WebApi.Agreements.Contacts.post(this.agreementId.val);
                    $.post(url, data).done(function (response, statusText, xhr) {
                        var myUrl = xhr.getResponseHeader('Location');
                        data.id = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                        _this.contacts.push(ko.mapping.fromJS(data));
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
                    this.contacts.push(ko.mapping.fromJS(data));
                }
            } else {
                this.validateContact.errors.showAllMessages(true);
            }
        };

        contacts.prototype.addAContact = function (me, e) {
            this.contactsIsEdit(false);
            this.clearContact();
            this.$addContactDialog.data("kendoWindow").open().title("Add Contact");
            $("#addAContact").fadeOut(500);
        };

        contacts.prototype.cancelContact = function () {
            this.$addContactDialog.data("kendoWindow").close();
            $("#addAContact").fadeIn(500);
        };

        contacts.prototype.clearContact = function () {
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
            this.phonesClass.contactPhones.removeAll();
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
        };

        contacts.prototype.removeContact = function (me, e) {
            var _this = this;
            if (confirm('Are you sure you want to remove "' + me.firstName() + " " + me.lastName() + '" as a contact from this agreement?')) {
                var url = "";
                if (this.agreementIsEdit()) {
                    url = App.Routes.WebApi.Agreements.Contacts.del(this.agreementId.val, me.id());

                    $.ajax({
                        url: url,
                        type: 'DELETE',
                        success: function () {
                            _this.contacts.remove(me);
                            $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                        }
                    });
                }
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        contacts.prototype.bindJquery = function () {
            var _this = this;
            var self = this;

            this.$addContactDialog.kendoWindow({
                width: 950,
                open: function () {
                    _this.kendoWindowBug.val = $("body").scrollTop() - 10;
                    $("html, body").css("overflow", "hidden");
                },
                close: function () {
                    _this.kendoWindowBug.val = 0;
                    $("html, body").css("overflow", "");
                    $("#addAContact").fadeIn(500);
                    _this.clearContact();
                },
                visible: false,
                draggable: false,
                resizable: false
            });
            this.$addContactDialog.parent().addClass("contactKendoWindow");

            //kendo autocomplete select
            var kacSelect = function (me, e) {
                var dataItem = me.dataItem(e.item.index());
                _this.contactDisplayName(dataItem.displayName);
                _this.contactFirstName(dataItem.firstName);
                _this.contactLastName(dataItem.lastName);
                _this.contactEmail(dataItem.defaultEmailAddress);
                _this.contactMiddleName(dataItem.middleName);
                _this.contactPersonId(dataItem.id);
                _this.contactUserId(dataItem.userId);
                _this.contactSuffixSelected(dataItem.suffix);
                _this.contactSalutationSelected(dataItem.salutation);
                if (dataItem.userId != null) {
                    _this.$contactEmail.prop('disabled', 'disabled');
                    _this.$contactLastName.prop('disabled', 'disabled');
                    _this.$contactFirstName.prop('disabled', 'disabled');
                    $("#contactMiddleName").prop('disabled', 'disabled');
                    _this.$contactSalutation.data("kendoDropDownList").enable(false);
                    _this.$contactSuffix.data("kendoDropDownList").enable(false);
                }
                _this.validateContact.errors.showAllMessages(true);
            };

            this.$contactEmail.kendoAutoComplete({
                dataTextField: "defaultEmailAddress",
                minLength: 3,
                filter: "contains",
                ignoreCase: true,
                dataSource: new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: App.Routes.WebApi.People.get(),
                                data: {
                                    email: $("#contactEmail").val(),
                                    emailMatch: 'startsWith'
                                },
                                success: function (results) {
                                    options.success(results.items);
                                }
                            });
                        }
                    }
                }),
                select: function (e) {
                    kacSelect(_this.$contactEmail.data("kendoAutoComplete"), e);
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
                        read: function (options) {
                            $.ajax({
                                url: App.Routes.WebApi.People.get(),
                                data: {
                                    lastName: _this.contactLastName(),
                                    lastNameMatch: 'startsWith'
                                },
                                success: function (results) {
                                    options.success(results.items);
                                }
                            });
                        }
                    }
                }),
                select: function (e) {
                    kacSelect(_this.$contactLastName.data("kendoAutoComplete"), e);
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
                        read: function (options) {
                            $.ajax({
                                url: App.Routes.WebApi.People.get(),
                                data: {
                                    firstName: _this.contactFirstName(),
                                    firstNameMatch: 'startsWith'
                                },
                                success: function (results) {
                                    options.success(results.items);
                                }
                            });
                        }
                    }
                }),
                select: function (e) {
                    kacSelect(_this.$contactFirstName.data("kendoAutoComplete"), e);
                }
            });

            $("#addContactDialog").on("change", ".phoneTypes", function () {
                var _this = this;
                var context = ko.dataFor(this);
                if (context.type != $(this).val() && $(this).val() !== "") {
                    context.type = $(this).val();
                    //added for weird bug for when adding more than 1 phone number then editing the type.
                }
                if (context.id) {
                    var url = App.Routes.WebApi.Agreements.Contacts.Phones.put(self.agreementId.val, context.contactId, context.id);
                    $.ajax({
                        type: 'PUT',
                        url: url,
                        data: context,
                        success: function (response, statusText, xhr) {
                        },
                        error: function (xhr, statusText, errorThrown) {
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
                        }
                    });
                }
            });
            $("#addContactDialog").on("change", ".phoneNumbers", function () {
                var _this = this;
                var context = ko.dataFor(this);
                if (self.agreementIsEdit() && context.value == $(this).val()) {
                    if ($(this).val() == '') {
                        $("#phoneNumberValidate" + context.id).css("visibility", "visible");
                    } else {
                        $("#phoneNumberValidate" + context.id).css("visibility", "hidden");
                        var url = App.Routes.WebApi.Agreements.Contacts.Phones.put(self.agreementId.val, context.contactId, context.id);
                        $.ajax({
                            type: 'PUT',
                            url: url,
                            data: context,
                            success: function (response, statusText, xhr) {
                            },
                            error: function (xhr, statusText, errorThrown) {
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
                            }
                        });
                    }
                }
            });
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
        };

        contacts.prototype._setupValidation = function () {
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
            });
        };

        contacts.prototype.populateContacts = function () {
            var _this = this;
            $.get(App.Routes.WebApi.Agreements.Contacts.get(this.agreementId.val), { useTestData: false }).done(function (response) {
                ko.mapping.fromJS(response, _this.contacts);
                _this.dfdPopContacts.resolve();
            });
        };

        //post files
        contacts.prototype.postMe = function (data, url) {
            var _this = this;
            $.post(url, data).done(function (response, statusText, xhr) {
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
        };

        //part of save agreement
        contacts.prototype.agreementPostContacts = function (response, statusText, xhr) {
            var _this = this;
            var tempUrl = App.Routes.WebApi.Agreements.Contacts.post(this.agreementId.val);

            $.each(this.contacts(), function (i, item) {
                var data = {
                    agreementId: _this.agreementId.val,
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
                };
                _this.postMe(data, tempUrl);
            });
        };
        return contacts;
    })();
    agreements.contacts = contacts;
})(agreements || (agreements = {}));
