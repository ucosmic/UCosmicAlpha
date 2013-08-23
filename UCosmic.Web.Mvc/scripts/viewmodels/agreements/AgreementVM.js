/// <reference path="../../app/Spinner.ts" />
/// <reference path="../establishments/Url.ts" />
/// <reference path="../establishments/SearchResult.ts" />
/// <reference path="../establishments/Search.ts" />
/// <reference path="../establishments/Name.ts" />
/// <reference path="../establishments/Item.ts" />
/// <reference path="../../typings/globalize/globalize.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../app/SideSwiper.ts" />
/// <reference path="../../app/Spinner.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../establishments/ApiModels.d.ts" />
//import SearchResultModule = require('../amd-modules/Establishments/SearchResult');
//import SearchModule = require('../amd-modules/Establishments/Search');
//import ItemModule = require('../amd-modules/Establishments/Item');
//import Spinner = require('../amd-modules/Widgets/Spinner');
//import Name = require('../amd-modules/Establishments/Name')
//import Url = require('../amd-modules/Establishments/Url')
//var Item = ItemModule.Item;
//var SearchResult = SearchResultModule.SearchResult;
var InstitutionalAgreementParticipantModel = (function () {
    function InstitutionalAgreementParticipantModel(isOwner, establishmentId, establishmentOfficialName, establishmentTranslatedName) {
        this.isOwner = ko.observable(isOwner);
        this.establishmentId = ko.observable(establishmentId);
        this.establishmentOfficialName = ko.observable(establishmentOfficialName);
        this.establishmentTranslatedName = ko.observable(establishmentTranslatedName);
    }
    return InstitutionalAgreementParticipantModel;
})();
;

var InstitutionalAgreementEditModel = (function () {
    function InstitutionalAgreementEditModel(initDefaultPageRoute) {
        if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
        var _this = this;
        this.initDefaultPageRoute = initDefaultPageRoute;
        this.selectConstructor = function (name, id) {
            this.name = name;
            this.id = id;
        };
        this.percentOffBodyHeight = .6;
        this.dfdUAgreements = $.Deferred();
        this.dfdPopParticipants = $.Deferred();
        this.dfdPopContacts = $.Deferred();
        this.dfdPopFiles = $.Deferred();
        this.dfdPageFadeIn = $.Deferred();
        this.$genericAlertDialog = undefined;
        this.agreementIsEdit = ko.observable();
        this.agreementId = 0;
        this.visibility = ko.observable();
        this.trail = ko.observableArray([]);
        this.nextForceDisabled = ko.observable(false);
        this.prevForceDisabled = ko.observable(false);
        this.pageNumber = ko.observable();
        this.$typeOptions = ko.observable();
        this.typeOptions = ko.mapping.fromJS([]);
        this.typeOptionSelected = ko.observable();
        this.$statusOptions = ko.observable();
        this.statusOptions = ko.mapping.fromJS([]);
        this.statusOptionSelected = ko.observable();
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
        this.contactPhoneTextValue = ko.observable("");
        this.contactPhoneType = ko.observable();
        this.$addContactDialog = $("#addContactDialog");
        this.$contactEmail = $("#contactEmail");
        this.$contactLastName = $("#contactLastName");
        this.$contactFirstName = $("#contactFirstName");
        this.$contactSalutation = $("#contactSalutation");
        this.$contactSuffix = $("#contactSuffix");
        this.$uAgreements = ko.observable();
        this.uAgreements = ko.mapping.fromJS([]);
        this.uAgreementSelected = ko.observable("");
        this.nickname = ko.observable();
        this.content = ko.observable();
        this.startDate = ko.observable();
        this.expDate = ko.observable();
        this.isEstimated = ko.observable();
        this.autoRenew = ko.observable(2);
        this.privateNotes = ko.observable();
        this.agreementContent = ko.observable();
        this.isCustomTypeAllowed = ko.observable();
        this.isCustomStatusAllowed = ko.observable();
        this.isCustomContactTypeAllowed = ko.observable();
        this.phoneTypes = ko.mapping.fromJS([]);
        this.$phoneTypes = ko.observable();
        //phoneTypeSelected = ko.observable();
        this.$file = ko.observable();
        this.hasFile = ko.observable();
        this.isFileExtensionInvalid = ko.observable(false);
        this.isFileTooManyBytes = ko.observable(false);
        this.isFileFailureUnexpected = ko.observable(false);
        this.isFileInvalid = ko.observable(false);
        this.fileError = ko.observable();
        this.fileFileExtension = ko.observable();
        this.fileFileName = ko.observable();
        this.fileSrc = ko.observable();
        this.fileUploadSpinner = new App.Spinner(new App.SpinnerOptions(400));
        this.fileDeleteSpinner = new App.Spinner(new App.SpinnerOptions(400));
        this.tempFileId = 0;
        this.files = ko.mapping.fromJS([]);
        this.participantsExport = ko.mapping.fromJS([]);
        this.participants = ko.mapping.fromJS([]);
        this.participantsErrorMsg = ko.observable();
        this.contacts = ko.mapping.fromJS([]);
        this.contactPhones = ko.observableArray();
        this.officialNameDoesNotMatchTranslation = ko.computed(function () {
            return !(this.participants.establishmentOfficialName === this.participants.establishmentTranslatedName);
        });
        this.isBound = ko.observable();
        this.back = function () {
            history.back();
        };
        this.sideSwiper = new App.SideSwiper({
            speed: '',
            frameWidth: 970,
            root: '[data-current-module=agreements]'
        });
        this.spinner = new App.Spinner(new App.SpinnerOptions(400, true));
        this.establishmentSearchViewModel = new Establishments.ViewModels.Search();
        this.hasBoundSearch = false;
        this.hasBoundItem = false;
        var culture = $("meta[name='accept-language']").attr("content");
        if (window.location.href.toLowerCase().indexOf("agreements/new") > 0) {
            //require(["../../jquery/jquery.globalize/cultures/globalize.culture." + culture + ""], function (html) {
            //Globalize.culture("fr-FR")
            Globalize.culture(culture);

            //});
            //;
            //this.dfdPopParticipants.resolve();
            this.editOrNewUrl = "new/";
            this.agreementIsEdit(false);
            this.visibility("Public");
            $("#LoadingPage").hide();
            this.populateParticipants();
            $.when(this.dfdPageFadeIn, this.dfdPopParticipants).done(function () {
                _this.updateKendoDialog($(window).width());
                $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * _this.percentOffBodyHeight)));
            });
        } else {
            this.editOrNewUrl = window.location.href.toLowerCase().substring(window.location.href.toLowerCase().indexOf("agreements/") + 11);
            this.editOrNewUrl = this.editOrNewUrl.substring(0, this.editOrNewUrl.indexOf("/edit") + 5) + "/";
            this.agreementIsEdit(true);
            this.agreementId = this.editOrNewUrl.substring(0, this.editOrNewUrl.indexOf("/"));
            this.populateParticipants();
            this.populateFiles();
            this.populateContacts();

            //require(["../../jquery/jquery.globalize/cultures/globalize.culture." + culture + ""], (html) => {
            Globalize.culture(culture);
            this.populateAgreementData();

            //});
            //Globalize.culture($("meta[name='accept-language']").attr("content"));
            $("#LoadingPage").hide();
            $.when(this.dfdPopContacts, this.dfdPopFiles, this.dfdPopParticipants, this.dfdPageFadeIn).done(function () {
                _this.updateKendoDialog($(window).width());
                $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * _this.percentOffBodyHeight)));
            });
        }
        this.populateUmbrella();

        $(window).resize(function () {
            _this.updateKendoDialog($(window).width());
        });

        this.isBound(true);
        this.removeParticipant = this.removeParticipant.bind(this);
        this.editAContact = this.editAContact.bind(this);
        this.removeContact = this.removeContact.bind(this);
        this.removePhone = this.removePhone.bind(this);
        this.viewAFile = this.viewAFile.bind(this);
        this.downloadAFile = this.downloadAFile.bind(this);
        this.addPhone = this.addPhone.bind(this);
        this.closeEditAFile = this.closeEditAFile.bind(this);
        this.fileVisibilityClicked = this.fileVisibilityClicked.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this._setupValidation = this._setupValidation.bind(this);
        this.participantsShowErrorMsg = ko.computed(function () {
            var validateParticipantsHasOwner = false;

            //var validateParticipantsHasParticipant = false;
            $.each(_this.participants(), function (i, item) {
                if (item.isOwner() == true) {
                    validateParticipantsHasOwner = true;
                }
                //if (item.isOwner() == false) {
                //    validateParticipantsHasParticipant = true;
                //}
            });

            if (validateParticipantsHasOwner == false) {
                _this.participantsErrorMsg("Home participant is required.");
                return true;
            } else {
                return false;
            }
        });

        this.hideOtherGroups();
        this.bindSearch();
        this.getSettings();

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
    InstitutionalAgreementEditModel.prototype.receiveResults = function (js) {
        if (!js) {
            ko.mapping.fromJS({
                items: [],
                itemTotal: 0
            }, this.participants);
        } else {
            ko.mapping.fromJS(js, this.participants);
        }
    };

    InstitutionalAgreementEditModel.prototype.populateParticipants = function () {
        var _this = this;
        $.get(App.Routes.WebApi.Agreements.Participants.get(this.agreementId)).done(function (response) {
            _this.receiveResults(response);
            _this.dfdPopParticipants.resolve();
        });
    };

    InstitutionalAgreementEditModel.prototype.populateAgreementData = function () {
        var _this = this;
        $.when(this.dfdUAgreements).done(function () {
            $.get(App.Routes.WebApi.Agreements.get(_this.agreementId)).done(function (response) {
                var dropdownlist;

                var editor = $("#agreementContent").data("kendoEditor");
                editor.value(response.content);
                _this.content(response.content);
                _this.expDate(Globalize.format(new Date(response.expiresOn.substring(0, response.expiresOn.lastIndexOf("T"))), 'd'));
                _this.startDate(Globalize.format(new Date(response.startsOn.substring(0, response.startsOn.lastIndexOf("T"))), 'd'));
                if (response.isAutoRenew == null) {
                    _this.autoRenew(2);
                } else {
                    _this.autoRenew(response.isAutoRenew);
                }
                ;

                _this.nickname(response.name);
                _this.privateNotes(response.notes);
                _this.statusOptionSelected(response.status);
                _this.visibility(response.visibility);
                _this.isEstimated(response.isExpirationEstimated);
                ko.mapping.fromJS(response.participants, _this.participants);
                _this.dfdPopParticipants.resolve();
                _this.uAgreementSelected(response.umbrellaId);
                dropdownlist = $("#uAgreements").data("kendoDropDownList");
                dropdownlist.select(function (dataItem) {
                    return dataItem.value == _this.uAgreementSelected();
                });

                if (_this.isCustomStatusAllowed()) {
                    dropdownlist = $("#statusOptions").data("kendoComboBox");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.name === _this.statusOptionSelected();
                    });
                } else {
                    dropdownlist = $("#statusOptions").data("kendoDropDownList");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.text === _this.statusOptionSelected();
                    });
                }

                _this.typeOptionSelected(response.type);
                if (_this.isCustomTypeAllowed()) {
                    dropdownlist = $("#typeOptions").data("kendoComboBox");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.name === _this.typeOptionSelected();
                    });
                } else {
                    dropdownlist = $("#typeOptions").data("kendoDropDownList");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.text === _this.typeOptionSelected();
                    });
                }
            });
        });
    };

    InstitutionalAgreementEditModel.prototype.populateFiles = function () {
        var _this = this;
        $.get(App.Routes.WebApi.Agreements.Files.get(this.agreementId), { useTestData: true }).done(function (response) {
            $.each(response, function (i, item) {
                _this.files.push(ko.mapping.fromJS({
                    id: item.id,
                    originalName: item.originalName,
                    customName: item.customName,
                    visibility: item.visibility,
                    isEdit: false,
                    customNameFile: item.customName.substring(0, item.customName.lastIndexOf(".")),
                    customNameExt: item.customName.substring(item.customName.lastIndexOf("."), item.customName.length)
                }));
            });
            _this.dfdPopFiles.resolve();
        });
    };

    InstitutionalAgreementEditModel.prototype.populateContacts = function () {
        var _this = this;
        $.get(App.Routes.WebApi.Agreements.Contacts.get(this.agreementId), { useTestData: false }).done(function (response) {
            ko.mapping.fromJS(response, _this.contacts);
            _this.dfdPopContacts.resolve();
        });
    };

    InstitutionalAgreementEditModel.prototype.populateUmbrella = function () {
        var _this = this;
        $.get(App.Routes.WebApi.Agreements.UmbrellaOptions.get(this.agreementId)).done(function (response) {
            //ko.mapping.fromJS(response, this.uAgreements)
            _this.uAgreements(response);

            //this.uAgreements.unshift({ 'text': '[None - this is a top-level or standalone agreement]', 'value': '-1' });
            //this.uAgreements.push(new this.selectConstructor("", ""));
            //for (var i = 0; i < response.length; i++) {
            //    this.uAgreements.push(new this.selectConstructor(response[i].text, response[i].value));
            //};
            $("#uAgreements").kendoDropDownList({
                dataTextField: "text",
                dataValueField: "value",
                optionLabel: "[None - this is a top-level or standalone agreement]",
                dataSource: new kendo.data.DataSource({
                    data: _this.uAgreements()
                })
            });
            _this.dfdUAgreements.resolve();
            //var dropdownlist = $("#uAgreements").data("kendoComboBox");
            //dropdownlist.select(0);
        });
    };

    InstitutionalAgreementEditModel.prototype.$bindKendoFile = function () {
        var _this = this;
        var saveUrl = "";
        if (this.agreementIsEdit()) {
            saveUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId);
        } else {
            saveUrl = App.Routes.WebApi.Uploads.post();
        }
        $("#fileUpload").kendoUpload({
            multiple: true,
            showFileList: false,
            localization: {
                select: 'Choose a file to upload...'
            },
            select: function (e) {
                var data = ko.mapping.toJS({
                    Name: e.files[0].name,
                    Length: e.files[0].rawFile.size
                });
                var url = App.Routes.WebApi.Agreements.Files.Validate.post();
                $.ajax({
                    type: 'POST',
                    url: url,
                    async: false,
                    data: data,
                    success: function (response, statusText, xhr) {
                        _this.isFileInvalid(false);
                    },
                    error: function (xhr, statusText, errorThrown) {
                        if (xhr.status !== 200) {
                            e.preventDefault();
                            _this.isFileInvalid(true);
                            _this.fileError(xhr.responseText);
                        }
                    }
                });
            },
            async: {
                saveUrl: saveUrl
            },
            upload: function (e) {
                if (_this.agreementIsEdit()) {
                    e.data = {
                        originalName: e.files[0].name,
                        visibility: 'Private',
                        customName: e.files[0].name,
                        agreementId: _this.agreementId
                    };
                }
                if (!e.isDefaultPrevented()) {
                    _this.fileUploadSpinner.start();
                }
            },
            complete: function () {
                _this.fileUploadSpinner.stop();
            },
            success: function (e) {
                if (e.operation == 'upload') {
                    if (e.response && e.response.message) {
                        App.flasher.flash(e.response.message);
                    }
                    var myId;
                    if (_this.agreementIsEdit()) {
                        var myUrl;
                        if (e.XMLHttpRequest != undefined) {
                            myUrl = e.XMLHttpRequest.getResponseHeader('Location');
                        } else {
                            myUrl = e.response.location;
                        }
                        myId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                    } else {
                        myId = _this.tempFileId + .01;
                    }
                    _this.files.push(ko.mapping.fromJS({
                        id: myId,
                        originalName: e.files[0].name,
                        customName: e.files[0].name,
                        visibility: "Public",
                        guid: e.response.guid,
                        isEdit: false,
                        customNameFile: e.files[0].name.substring(0, e.files[0].name.indexOf(e.files[0].extension)),
                        customNameExt: e.files[0].extension
                    }));
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));
                }
            },
            error: function (e) {
                // kendo response is as json string, not js object
                var fileName, fileExtension;

                if (e.files && e.files.length > 0) {
                    fileName = e.files[0].name;
                    fileExtension = e.files[0].extension;
                }
                if (fileName)
                    _this.fileFileName(fileName);
                if (fileExtension)
                    _this.fileFileExtension(fileExtension);

                if (e.XMLHttpRequest.status === 415)
                    _this.isFileExtensionInvalid(true);
else if (e.XMLHttpRequest.status === 413)
                    _this.isFileTooManyBytes(true);
else
                    _this.isFileFailureUnexpected(true);
            }
        });
    };

    InstitutionalAgreementEditModel.prototype.removeFile = function (me, e) {
        var _this = this;
        if (confirm('Are you sure you want to remove this file from this agreement?')) {
            // all files will have a guid in create, none will have a guid in edit agreement
            // so do a check for agreementId - if it is undefined(for now 0)
            var url = "";
            if (this.agreementIsEdit()) {
                url = App.Routes.WebApi.Agreements.Files.del(this.agreementId, me.id());
            } else {
                url = App.Routes.WebApi.Uploads.del(me.guid());
            }
            $.ajax({
                url: url,
                type: 'DELETE',
                success: function () {
                    _this.files.remove(me);
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                }
            });
        }
        e.preventDefault();
        e.stopPropagation();
    };

    InstitutionalAgreementEditModel.prototype.editAFile = function (me, e) {
        me.isEdit(true);
    };

    InstitutionalAgreementEditModel.prototype.cancelEditAFile = function (me, e) {
        me.customNameFile(me.customName().substring(0, me.customName().lastIndexOf(".")));
        me.isEdit(false);
        e.stopImmediatePropagation();
        return false;
    };

    InstitutionalAgreementEditModel.prototype.closeEditAFile = function (me, e) {
        var _this = this;
        me.customName(me.customNameFile() + me.customNameExt());
        me.isEdit(false);
        if (this.agreementIsEdit()) {
            var data = ko.mapping.toJS({
                agreementId: me.agreementId,
                uploadGuid: me.guid,
                originalName: me.guid,
                extension: me.extension,
                customName: me.customName,
                visibility: me.visibility
            });
            var url = App.Routes.WebApi.Agreements.Files.put(this.agreementId, me.id());
            $.ajax({
                type: 'PUT',
                url: url,
                data: data,
                success: function (response, statusText, xhr) {
                },
                error: function (xhr, statusText, errorThrown) {
                    _this.spinner.stop();
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
    };

    InstitutionalAgreementEditModel.prototype.fileVisibilityClicked = function (me, e) {
        var _this = this;
        if (this.agreementIsEdit()) {
            var data = ko.mapping.toJS({
                agreementId: me.agreementId,
                uploadGuid: me.guid,
                originalName: me.guid,
                extension: me.extension,
                customName: me.customName,
                visibility: me.visibility
            });
            var url = App.Routes.WebApi.Agreements.Files.put(this.agreementId, me.id());
            $.ajax({
                type: 'PUT',
                url: url,
                data: data,
                success: function (response, statusText, xhr) {
                },
                error: function (xhr, statusText, errorThrown) {
                    _this.spinner.stop();
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
        return true;
    };

    //downloadAFile(me, e): void {
    //    //this.agreementId = 2
    //    var url = App.Routes.WebApi.Agreements.Files.Content.download(this.agreementId, me.id());
    //    window.location.href = url;
    //}
    //viewAFile(me, e): void {
    //    //this.agreementId = 2
    //    var url = App.Routes.WebApi.Agreements.Files.Content.view(this.agreementId, me.id());
    //    window.open(
    //      url,
    //      '_blank'
    //    );
    //}
    InstitutionalAgreementEditModel.prototype.updateKendoDialog = function (windowWidth) {
        $(".k-window").css({
            left: (windowWidth / 2 - ($(".k-window").width() / 2) + 10)
        });
    };

    InstitutionalAgreementEditModel.prototype.bindjQueryKendo = function (result) {
        var _this = this;
        var self = this;
        this.isCustomTypeAllowed(result.isCustomTypeAllowed);
        this.isCustomStatusAllowed(result.isCustomStatusAllowed);
        this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
        this.statusOptions.push(new this.selectConstructor("", ""));
        this.contactTypeOptions.push(new this.selectConstructor("", undefined));
        this.typeOptions.push(new this.selectConstructor("", ""));
        for (var i = 0; i < result.statusOptions.length; i++) {
            this.statusOptions.push(new this.selectConstructor(result.statusOptions[i], result.statusOptions[i]));
        }
        ;
        for (var i = 0; i < result.contactTypeOptions.length; i++) {
            this.contactTypeOptions.push(new this.selectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
        }
        ;
        for (var i = 0; i < result.typeOptions.length; i++) {
            this.typeOptions.push(new this.selectConstructor(result.typeOptions[i], result.typeOptions[i]));
        }
        ;
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
        if (this.isCustomStatusAllowed) {
            $("#statusOptions").kendoComboBox({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: this.statusOptions()
                })
            });
        } else {
            $("#statusOptions").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: this.statusOptions()
                })
            });
        }
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
        $(".hasDate").each(function (index, item) {
            $(item).kendoDatePicker({
                value: new Date($(item).val()),
                //have to use change event for ko validation-change does a double call so need to check for null
                change: function (e) {
                    if (this.value() != null) {
                        $(e.sender.element).val(Globalize.format(this.value(), 'd'));
                    }
                },
                close: function (e) {
                    if (this.value() != null) {
                        $(e.sender.element).val(Globalize.format(this.value(), 'd'));
                    }
                }
            });
        });

        this.$bindKendoFile();
        $("#helpExpDate").kendoTooltip({
            width: 520,
            position: "top",
            content: $("#templateExpToolTip").html(),
            showOn: "click",
            autoHide: false
        });

        this.contactPhoneTextValue.subscribe(function (me) {
            if (_this.contactPhoneTextValue().length > 0) {
                if (_this.agreementIsEdit()) {
                    var url = App.Routes.WebApi.Agreements.Contacts.Phones.post(_this.agreementId, _this.contactId());
                    var data = { id: "0", type: '', contactId: '', value: _this.contactPhoneTextValue() };

                    //var data = { id: 0, type: '', contactId: '', value: this.contactPhoneTextValue() };
                    $.post(url, data).done(function (response, statusText, xhr) {
                        var myUrl = xhr.getResponseHeader('Location');
                        data.id = myUrl.substring(myUrl.lastIndexOf("/") + 1);

                        //data.id = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                        _this.contactPhones.push(data);
                        _this.contactPhoneTextValue("");

                        $(".phoneTypes").kendoDropDownList({
                            dataTextField: "name",
                            dataValueField: "id",
                            dataSource: new kendo.data.DataSource({
                                data: ko.mapping.toJS(_this.phoneTypes())
                            })
                        });
                        //this.agreementId = 2;//response.agreementId
                        //this.agreementPostFiles(response, statusText, xhr);
                        //this.agreementPostContacts(response, statusText, xhr);
                    }).fail(function (xhr, statusText, errorThrown) {
                        _this.spinner.stop();
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

        this.$addContactDialog.kendoWindow({
            width: 950,
            close: function () {
                $("#addAContact").fadeIn(500);
                _this.clearContact();
            },
            visible: false,
            draggable: false,
            resizable: false
        });

        $(".k-window").css({
            position: 'fixed',
            margin: 'auto',
            top: '20px'
        });

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
                                email: _this.contactEmail(),
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

        $(window).scroll(function () {
            var $participants = $("#participants");
            var $basicInfo = $("#basicInfo");
            var $effectiveDatesCurrentStatus = $("#effectiveDatesCurrentStatus");
            var $contacts = $("#contacts");
            var $fileAttachments = $("#fileAttachments");
            var $overallVisibility = $("#overallVisibility");

            var $navparticipants = $("#navParticipants");
            var $navbasicInfo = $("#navBasicInfo");
            var $naveffectiveDatesCurrentStatus = $("#navEffectiveDatesCurrentStatus");
            var $navcontacts = $("#navContacts");
            var $navfileAttachments = $("#navFileAttachments");
            var $navoverallVisibility = $("#navOverallVisibility");

            var $participantsTop = $participants.offset();
            var $basicInfoTop = $basicInfo.offset();
            var $effectiveDatesCurrentStatusTop = $effectiveDatesCurrentStatus.offset();
            var $contactsTop = $contacts.offset();
            var $fileAttachmentsTop = $fileAttachments.offset();
            var $overallVisibilityTop = $overallVisibility.offset();

            var $body;

            if (!$("body").scrollTop()) {
                $body = $("html, body").scrollTop() + 100;
            } else {
                $body = $("body").scrollTop() + 100;
            }
            if ($body <= $participantsTop.top + $participants.height() + 40) {
                $("aside").find("li").removeClass("current");
                $navparticipants.addClass("current");
            } else if ($body >= $basicInfoTop.top && $body <= $basicInfoTop.top + $basicInfo.height() + 40) {
                $("aside").find("li").removeClass("current");
                $navbasicInfo.addClass("current");
            } else if ($body >= $effectiveDatesCurrentStatusTop.top && $body <= $effectiveDatesCurrentStatusTop.top + $effectiveDatesCurrentStatus.height() + 40) {
                $("aside").find("li").removeClass("current");
                $naveffectiveDatesCurrentStatus.addClass("current");
            } else if ($body >= $contactsTop.top && $body <= $contactsTop.top + $contacts.height() + 40) {
                $("aside").find("li").removeClass("current");
                $navcontacts.addClass("current");
            } else if ($body >= $fileAttachmentsTop.top && $body <= $fileAttachmentsTop.top + $fileAttachments.height() + 40) {
                $("aside").find("li").removeClass("current");
                $navfileAttachments.addClass("current");
            } else if ($body >= $overallVisibilityTop.top) {
                $("aside").find("li").removeClass("current");
                $navoverallVisibility.closest("li").addClass("current");
            }
        });

        // create Editor from textarea HTML element with default set of tools
        $("#agreementContent").kendoEditor({
            tools: [
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "fontName",
                "foreColor",
                "justifyLeft",
                "justifyCenter",
                "justifyRight",
                "justifyFull",
                "insertUnorderedList",
                "insertOrderedList",
                "indent",
                "outdent",
                "createLink",
                "unlink",
                "insertImage",
                "subscript",
                "superscript",
                "viewHtml",
                {
                    name: "formatting",
                    items: [
                        { text: "Paragraph", value: "p" },
                        { text: "Quotation", value: "blockquote" },
                        { text: "Heading 2", value: "h2" },
                        { text: "Heading 3", value: "h3" },
                        { text: "Heading 4", value: "h4" },
                        { text: "Heading 5", value: "h5" },
                        { text: "Heading 6", value: "h6" }
                    ],
                    width: "200px"
                }
            ]
        });

        $("#addContactDialog").on("change", ".phoneTypes", function () {
            var _this = this;
            var context = ko.dataFor(this);
            if (context.type != $(this).val() && $(this).val() !== "") {
                context.type = $(this).val();
                //added for wierd bug for when adding more than 1 phone number then editing the type.
            }
            if (self.agreementIsEdit()) {
                var url = App.Routes.WebApi.Agreements.Contacts.Phones.put(self.agreementId, context.contactId, context.id);
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: context,
                    success: function (response, statusText, xhr) {
                    },
                    error: function (xhr, statusText, errorThrown) {
                        _this.spinner.stop();
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
                    var url = App.Routes.WebApi.Agreements.Contacts.Phones.put(self.agreementId, context.contactId, context.id);
                    $.ajax({
                        type: 'PUT',
                        url: url,
                        data: context,
                        success: function (response, statusText, xhr) {
                        },
                        error: function (xhr, statusText, errorThrown) {
                            _this.spinner.stop();
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
    };

    InstitutionalAgreementEditModel.prototype.getSettings = function () {
        var _this = this;
        var url = 'App.Routes.WebApi.Agreements.Settings.get()';
        var agreementSettingsGet;
        $.ajax({
            url: eval(url),
            type: 'GET'
        }).done(function (result) {
            _this.bindjQueryKendo(result);
        }).fail(function (xhr) {
            alert('fail: status = ' + xhr.status + ' ' + xhr.statusText + '; message = "' + xhr.responseText + '"');
        });
    };

    InstitutionalAgreementEditModel.prototype.hideOtherGroups = function () {
        $("#allParticipants").css("visibility", "").hide();
        $("#estSearch").css("visibility", "").hide();
        $("#addEstablishment").css("visibility", "").hide();
    };

    InstitutionalAgreementEditModel.prototype.removeParticipant = function (establishmentResultViewModel, e) {
        if (confirm('Are you sure you want to remove "' + establishmentResultViewModel.establishmentTranslatedName() + '" as a participant from this agreement?')) {
            var self = this;
            if (this.agreementIsEdit()) {
                var url = App.Routes.WebApi.Agreements.Participants.del(this.agreementId, ko.dataFor(e.target).establishmentId());
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    success: function () {
                        self.participants.remove(function (item) {
                            if (item.establishmentId() === establishmentResultViewModel.establishmentId()) {
                                $(item.participantEl).slideUp('fast', function () {
                                    self.participants.remove(item);
                                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                                });
                            }
                            return false;
                        });
                    },
                    error: function (xhr, statusText, errorThrown) {
                        alert(xhr.responseText);
                    }
                });
            } else {
                self.participants.remove(function (item) {
                    if (item.establishmentId() === establishmentResultViewModel.establishmentId()) {
                        $(item.participantEl).slideUp('fast', function () {
                            self.participants.remove(item);
                            $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                        });
                    }
                    return false;
                });
            }
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    InstitutionalAgreementEditModel.prototype.SearchPageBind = function (parentOrParticipant) {
        var _this = this;
        var $cancelAddParticipant = $("#cancelAddParticipant");
        var $searchSideBarAddNew = $("#searchSideBarAddNew");
        this.establishmentSearchViewModel.detailTooltip = function () {
            return 'Choose this establishment as a ' + parentOrParticipant;
        };
        $cancelAddParticipant.off();
        $searchSideBarAddNew.off();
        $searchSideBarAddNew.on("click", function (e) {
            _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
            e.preventDefault();
            return false;
        });
        if (parentOrParticipant === "parent") {
            $cancelAddParticipant.on("click", function (e) {
                //this.percentOffBodyHeight = .6;
                _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                e.preventDefault();
                return false;
            });
        } else {
            $cancelAddParticipant.on("click", function (e) {
                //this.percentOffBodyHeight = .6;
                _this.establishmentSearchViewModel.sammy.setLocation('#/index');
                e.preventDefault();
                return false;
            });
        }
        var dfd = $.Deferred();
        var dfd2 = $.Deferred();
        var $obj = $("#allParticipants");
        var $obj2 = $("#addEstablishment");
        var time = 500;
        this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
        $.when(dfd, dfd2).done(function () {
            $("#estSearch").fadeIn(500);
        });
    };

    InstitutionalAgreementEditModel.prototype.fadeModsOut = function (dfd, dfd2, $obj, $obj2, time) {
        if ($obj.css("display") !== "none") {
            $obj.fadeOut(time, function () {
                dfd.resolve();
            });
        } else {
            dfd.resolve();
        }
        if ($obj2.css("display") !== "none") {
            $obj2.fadeOut(time, function () {
                dfd2.resolve();
            });
        } else {
            dfd2.resolve();
        }
    };

    InstitutionalAgreementEditModel.prototype.scrollMyBody = function (position) {
        var $body;

        if (!$("body").scrollTop()) {
            $("html, body").scrollTop(position);
        } else {
            $("body").scrollTop(position);
        }
    };

    InstitutionalAgreementEditModel.prototype.bindSearch = function () {
        var _this = this;
        if (!this.hasBoundSearch) {
            this.establishmentSearchViewModel.sammyBeforeRoute = /\#\/index\/(.*)\//;
            this.establishmentSearchViewModel.sammyGetPageRoute = '#/index';
            this.establishmentSearchViewModel.sammyDefaultPageRoute = '/agreements[\/]?';
            ko.applyBindings(this.establishmentSearchViewModel, $('#estSearch')[0]);
            var lastURL = "asdf";
            if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#") === -1) {
                if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.editOrNewUrl + "") === -1) {
                    this.establishmentSearchViewModel.sammy.setLocation("/agreements/" + this.editOrNewUrl + "#/index");
                } else {
                    this.establishmentSearchViewModel.sammy.setLocation('#/index');
                }
            }
            if (sessionStorage.getItem("addest") == undefined) {
                sessionStorage.setItem("addest", "no");
            }
            this.establishmentSearchViewModel.sammy.bind("location-changed", function () {
                if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                    var $asideRootSearch = $("#asideRootSearch");
                    var $asideParentSearch = $("#asideParentSearch");
                    if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + _this.editOrNewUrl + "#/new/") > 0) {
                        var $addEstablishment = $("#addEstablishment");
                        var dfd = $.Deferred();
                        var dfd2 = $.Deferred();
                        var $obj = $("#estSearch");
                        var $obj2 = $("#allParticipants");
                        var time = 500;
                        _this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                        $.when(dfd, dfd2).done(function () {
                            $addEstablishment.css("visibility", "").hide().fadeIn(500, function () {
                                if (!_this.hasBoundItem) {
                                    _this.establishmentItemViewModel = new Establishments.ViewModels.Item();
                                    _this.establishmentItemViewModel.goToSearch = function () {
                                        sessionStorage.setItem("addest", "yes");
                                        _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                    };
                                    _this.establishmentItemViewModel.submitToCreate = function (formElement) {
                                        if (!_this.establishmentItemViewModel.id || _this.establishmentItemViewModel.id === 0) {
                                            var me = _this.establishmentItemViewModel;
                                            _this.establishmentItemViewModel.validatingSpinner.start();

                                            // reference the single name and url
                                            var officialName = _this.establishmentItemViewModel.names()[0];
                                            var officialUrl = _this.establishmentItemViewModel.urls()[0];
                                            var location = _this.establishmentItemViewModel.location;

                                            if (officialName.text.isValidating() || officialUrl.value.isValidating() || _this.establishmentItemViewModel.ceebCode.isValidating() || _this.establishmentItemViewModel.uCosmicCode.isValidating()) {
                                                setTimeout(function () {
                                                    var waitResult = _this.establishmentItemViewModel.submitToCreate(formElement);
                                                    return false;
                                                }, 50);
                                                return false;
                                            }

                                            // check validity
                                            _this.establishmentItemViewModel.isValidationSummaryVisible(true);
                                            if (!_this.establishmentItemViewModel.isValid()) {
                                                _this.establishmentItemViewModel.errors.showAllMessages();
                                            }
                                            if (!officialName.isValid()) {
                                                officialName.errors.showAllMessages();
                                            }
                                            if (!officialUrl.isValid()) {
                                                officialUrl.errors.showAllMessages();
                                            }
                                            _this.establishmentItemViewModel.validatingSpinner.stop();

                                            if (officialName.isValid() && officialUrl.isValid() && _this.establishmentItemViewModel.isValid()) {
                                                var $LoadingPage = $("#LoadingPage").find("strong");
                                                var url = App.Routes.WebApi.Establishments.post();
                                                var data = _this.establishmentItemViewModel.serializeData();
                                                $LoadingPage.text("Creating Establishment...");
                                                data.officialName = officialName.serializeData();
                                                data.officialUrl = officialUrl.serializeData();
                                                data.location = location.serializeData();
                                                _this.establishmentItemViewModel.createSpinner.start();
                                                $.post(url, data).done(function (response, statusText, xhr) {
                                                    _this.establishmentItemViewModel.createSpinner.stop();
                                                    $LoadingPage.text("Establishment created, you are being redirected to previous page...");
                                                    $("#addEstablishment").fadeOut(500, function () {
                                                        //this.percentOffBodyHeight = .6;
                                                        $("#LoadingPage").fadeIn(500);
                                                        setTimeout(function () {
                                                            $("#LoadingPage").fadeOut(500, function () {
                                                                $LoadingPage.text("Loading Page...");
                                                            });
                                                            _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                                        }, 5000);
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
                                            }
                                        }
                                        return false;
                                    };
                                    ko.applyBindings(_this.establishmentItemViewModel, $addEstablishment[0]);
                                    var $cancelAddEstablishment = $("#cancelAddEstablishment");
                                    $cancelAddEstablishment.on("click", function (e) {
                                        sessionStorage.setItem("addest", "no");
                                        _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                        e.preventDefault();
                                        return false;
                                    });
                                    _this.hasBoundItem = true;
                                }
                            });
                        });
                        _this.scrollMyBody(0);
                        lastURL = "#/new/";
                    } else if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + _this.editOrNewUrl + "#/page/") > 0) {
                        if (sessionStorage.getItem("addest") === "yes") {
                            _this.establishmentSearchViewModel.clickAction = function (context) {
                                _this.establishmentItemViewModel.parentEstablishment(context);
                                _this.establishmentItemViewModel.parentId(context.id());
                                _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                                return false;
                            };
                            _this.establishmentSearchViewModel.header("Choose a parent establishment");
                            $asideRootSearch.hide();
                            $asideParentSearch.show();
                            _this.SearchPageBind("parent");
                            _this.establishmentSearchViewModel.header("Choose a parent establishment");
                        } else {
                            $asideRootSearch.show();
                            $asideParentSearch.hide();
                            _this.SearchPageBind("participant");
                            _this.establishmentSearchViewModel.header("Choose a participant");
                            _this.establishmentSearchViewModel.clickAction = function (context) {
                                var myParticipant = new InstitutionalAgreementParticipantModel(false, context.id(), context.officialName(), context.translatedName());
                                var alreadyExist = false;
                                for (var i = 0; i < _this.participants().length; i++) {
                                    if (_this.participants()[i].establishmentId() === myParticipant.establishmentId()) {
                                        alreadyExist = true;
                                        break;
                                    }
                                }
                                if (alreadyExist !== true) {
                                    $.ajax({
                                        url: App.Routes.WebApi.Agreements.Participants.isOwner(myParticipant.establishmentId()),
                                        type: 'GET',
                                        async: false
                                    }).done(function (response) {
                                        myParticipant.isOwner(response);
                                        if (_this.agreementIsEdit()) {
                                            var url = App.Routes.WebApi.Agreements.Participants.put(_this.agreementId, myParticipant.establishmentId());
                                            $.ajax({
                                                type: 'PUT',
                                                url: url,
                                                data: myParticipant,
                                                success: function (response, statusText, xhr) {
                                                    _this.participants.push(myParticipant);
                                                },
                                                error: function (xhr, statusText, errorThrown) {
                                                    alert(xhr.responseText);
                                                }
                                            });
                                        } else {
                                            _this.participants.push(myParticipant);
                                        }

                                        //this.percentOffBodyHeight = .6;
                                        _this.establishmentSearchViewModel.sammy.setLocation("agreements/" + _this.editOrNewUrl + "");
                                        $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));
                                    }).fail(function () {
                                        if (_this.agreementIsEdit()) {
                                            var url = App.Routes.WebApi.Agreements.Participants.put(_this.agreementId, myParticipant.establishmentId());
                                            $.ajax({
                                                type: 'PUT',
                                                url: url,
                                                data: myParticipant,
                                                success: function (response, statusText, xhr) {
                                                    _this.participants.push(myParticipant);
                                                },
                                                error: function (xhr, statusText, errorThrown) {
                                                    alert(xhr.responseText);
                                                }
                                            });
                                        } else {
                                            _this.participants.push(myParticipant);
                                        }
                                        _this.establishmentSearchViewModel.sammy.setLocation("agreements/" + _this.editOrNewUrl + "");
                                    });
                                } else {
                                    alert("This Participant has already been added.");
                                }
                                return false;
                            };
                        }
                        _this.scrollMyBody(0);
                        lastURL = "#/page/";
                    } else if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("agreements/" + _this.editOrNewUrl + "") > 0) {
                        sessionStorage.setItem("addest", "no");
                        lastURL = "#/index";
                        _this.establishmentSearchViewModel.sammy.setLocation('#/index');
                        var dfd = $.Deferred();
                        var dfd2 = $.Deferred();
                        var $obj = $("#estSearch");
                        var $obj2 = $("#addEstablishment");
                        var time = 500;
                        _this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                        $.when(dfd, dfd2).done(function () {
                            $("#allParticipants").fadeIn(500).promise().done(function () {
                                $(_this).show();
                                _this.scrollMyBody(0);
                                _this.dfdPageFadeIn.resolve();
                            });
                        });
                    } else {
                        window.location.replace(_this.establishmentSearchViewModel.sammy.getLocation());
                    }
                }
            });
            this.establishmentSearchViewModel.sammy.run();
        }
    };

    InstitutionalAgreementEditModel.prototype.editAContact = function (me) {
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

        //this.contactPhones = ko.observableArray(me.phones());
        //this.contactPhones = me.phones();
        //this.contactPhones = ko.mapping.fromJS(me.phones());
        //this.contactPhones.removeAll();
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
            _this.contactPhones.push(data);
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

        $("#addAContact").fadeOut(500, function () {
        });
        $("input.phoneTypes").kendoDropDownList({
            dataTextField: "name",
            dataValueField: "id",
            dataSource: new kendo.data.DataSource({
                data: ko.mapping.toJS(this.phoneTypes())
            })
        });

        $("input.phoneTypes").each(function (index) {
            dropdownlist = $(this).data("kendoDropDownList");
            dropdownlist.select(function (dataItem) {
                return dataItem.name === me.phones()[index].type();
            });
        });
    };

    //clearContactInfo(): void {
    //    this.contactEmail('');
    //    this.contactDisplayName('');
    //    this.contactPersonId('');
    //    this.contactUserId = '';
    //    this.contactJobTitle('');
    //    this.contactFirstName('');
    //    this.contactMiddleName('');
    //    this.contactLastName('');
    //    this.contactPhones = ko.mapping.fromJS([]);
    //    this.contactTypeOptionSelected('');
    //    if (this.isCustomContactTypeAllowed) {
    //        var dropdownlist = $("#contactTypeOptions").data("kendoComboBox");
    //    } else {
    //        var dropdownlist = $("#contactTypeOptions").data("kendoDropDownList");
    //    }
    //    dropdownlist.select(0);
    //    var dropdownlist = $("#contactSalutation").data("kendoDropDownList");
    //    dropdownlist.select(0);
    //    var dropdownlist = $("#contactSuffix").data("kendoDropDownList");
    //    dropdownlist.select(0);
    //}
    InstitutionalAgreementEditModel.prototype.editContact = function (me) {
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

            //this.contacts()[this.contactIndex].phones(ko.mapping.toJS(this.contactPhones()));
            //this.contacts()[this.contactIndex].phones(this.contactPhones());
            //var phoneData = [];
            this.contacts()[this.contactIndex].phones.removeAll();
            $.each(this.contactPhones(), function (i, item) {
                var data = ko.mapping.toJS({
                    id: item.id,
                    contactId: item.contactId,
                    type: item.type,
                    value: item.value
                });

                //phoneData.push(data);
                _this.contacts()[_this.contactIndex].phones.push(ko.mapping.fromJS(data));
            });

            //this.contacts()[this.contactIndex].phones(this.contactPhones());
            this.contacts()[this.contactIndex].type(this.contactTypeOptionSelected());
            this.contacts()[this.contactIndex].salutation(this.contactSalutationSelected());
            this.contacts()[this.contactIndex].suffix(this.contactSuffixSelected());

            $("#addAContact").fadeIn(500);

            if (this.agreementIsEdit()) {
                this.contacts()[this.contactIndex].agreementId(this.agreementId);

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
                    Phones: this.contacts()[this.contactIndex].phones()
                };

                //var data = ko.mapping.toJS(this.contacts()[this.contactIndex])
                var url = App.Routes.WebApi.Agreements.Contacts.put(this.agreementId, this.contacts()[this.contactIndex].id());
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: function (response, statusText, xhr) {
                    },
                    error: function (xhr, statusText, errorThrown) {
                        _this.spinner.stop();
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

    InstitutionalAgreementEditModel.prototype.addContact = function (me, e) {
        var _this = this;
        if (this.validateContact.isValid()) {
            if (this.contactDisplayName() == undefined || this.contactDisplayName() == "") {
                this.contactDisplayName(this.contactFirstName() + " " + this.contactLastName());
            }
            var data = {
                agreementId: this.agreementId,
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
                middleName: this.contactMiddleName
            };

            //this.contacts.push(ko.mapping.fromJS({ title: this.contactJobTitle(), firstName: this.contactFirstName(), lastName: this.contactLastName(), id: 1, personId: this.contactPersonId(), userId: this.contactUserId, phones: ko.mapping.toJS(this.contactPhones()), emailAddress: this.contactEmail(), type: this.contactTypeOptionSelected(), suffix: this.contactSuffix(), salutation: this.contactSalutation(), displayName: this.contactDisplayName(), middleName: this.contactMiddleName }));
            this.$addContactDialog.data("kendoWindow").close();

            $("#addAContact").fadeIn(500);
            $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));

            if (this.agreementIsEdit()) {
                var url = App.Routes.WebApi.Agreements.Contacts.post(this.agreementId);
                $.post(url, data).done(function (response, statusText, xhr) {
                    var myUrl = xhr.getResponseHeader('Location');
                    data.id = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                    _this.contacts.push(ko.mapping.fromJS(data));
                    //this.agreementId = 2;//response.agreementId
                    //this.agreementPostFiles(response, statusText, xhr);
                    //this.agreementPostContacts(response, statusText, xhr);
                }).fail(function (xhr, statusText, errorThrown) {
                    _this.spinner.stop();
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

    InstitutionalAgreementEditModel.prototype.addAContact = function (me, e) {
        this.contactsIsEdit(false);
        this.clearContact();
        this.$addContactDialog.data("kendoWindow").open().title("Add Contact");
        $("#addAContact").fadeOut(500);
    };

    InstitutionalAgreementEditModel.prototype.cancelContact = function () {
        this.$addContactDialog.data("kendoWindow").close();
        $("#addAContact").fadeIn(500);
    };

    InstitutionalAgreementEditModel.prototype.clearContact = function () {
        //this.clearContactInfo();
        this.$contactEmail.prop('disabled', '');
        this.$contactLastName.prop('disabled', '');
        this.$contactFirstName.prop('disabled', '');
        $("#contactMiddleName").prop('disabled', '');
        this.$contactSalutation.data("kendoDropDownList").enable(true);
        this.$contactSuffix.data("kendoDropDownList").enable(true);
        this.validateContact.errors.showAllMessages(false);
        this.validateContact.errors.showAllMessages(false);

        this.contactEmail('');
        this.contactDisplayName('');
        this.contactPersonId('');
        this.contactUserId('');
        this.contactJobTitle('');
        this.contactFirstName('');
        this.contactMiddleName('');
        this.contactLastName('');
        this.contactPhones.removeAll();

        //this.contactPhones = ko.mapping.fromJS([]);
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

    InstitutionalAgreementEditModel.prototype.removeContact = function (me, e) {
        var _this = this;
        if (confirm('Are you sure you want to remove "' + me.firstName() + " " + me.lastName() + '" as a contact from this agreement?')) {
            var url = "";
            if (this.agreementIsEdit()) {
                url = App.Routes.WebApi.Agreements.Contacts.del(this.agreementId, me.id());

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

    InstitutionalAgreementEditModel.prototype.removePhone = function (me, e) {
        var _this = this;
        var url = App.Routes.WebApi.Agreements.Contacts.Phones.del(this.agreementId, me.contactId, me.id);
        $.ajax({
            url: url,
            type: 'DELETE',
            success: function () {
                _this.files.remove(me);
                $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
            }
        });

        this.contactPhones.remove(me);
        e.preventDefault();
        e.stopPropagation();
    };

    InstitutionalAgreementEditModel.prototype.addPhone = function (me, e) {
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

    InstitutionalAgreementEditModel.prototype.addParticipant = function (establishmentResultViewModel) {
        this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
        this.hasBoundSearch = true;
    };

    InstitutionalAgreementEditModel.prototype.swipeCallback = function () {
    };

    InstitutionalAgreementEditModel.prototype.lockAnimation = function () {
        this.nextForceDisabled(true);
        this.prevForceDisabled(true);
    };

    InstitutionalAgreementEditModel.prototype.unlockAnimation = function () {
        this.nextForceDisabled(false);
        this.prevForceDisabled(false);
    };

    InstitutionalAgreementEditModel.prototype._setupValidation = function () {
        ko.validation.rules['greaterThan'] = {
            validator: function (val, otherVal) {
                if (otherVal() == undefined) {
                    return true;
                } else {
                    return Globalize.parseDate(val) > Globalize.parseDate(otherVal());
                    //return new Date(val) > new Date(otherVal());
                }
            },
            message: 'The field must be greater than start date'
        };
        ko.validation.rules.date.validator = function (value, validate) {
            return !value.length || (validate && Globalize.parseDate(value) != null);
        };

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
        });
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

    InstitutionalAgreementEditModel.prototype.goToSection = function (location, data, event) {
        var offset = $("#" + location).offset();

        if (!$("body").scrollTop()) {
            $("html, body").scrollTop(offset.top - 20);
        } else {
            $("body").scrollTop(offset.top - 20);
        }
        $(event.target).closest("ul").find("li").removeClass("current");
        $(event.target).closest("li").addClass("current");
    };

    InstitutionalAgreementEditModel.prototype.postMe = function (data, url) {
        var _this = this;
        $.post(url, data).done(function (response, statusText, xhr) {
        }).fail(function (xhr, statusText, errorThrown) {
            _this.spinner.stop();
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

    InstitutionalAgreementEditModel.prototype.agreementPostFiles = function (response, statusText, xhr) {
        var _this = this;
        var tempUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId);

        $.each(this.files(), function (i, item) {
            var data = ko.mapping.toJS({
                agreementId: item.agreementId,
                uploadGuid: item.guid,
                originalName: item.guid,
                extension: item.extension,
                customName: item.customName,
                visibility: item.visibility
            });
            _this.postMe(data, tempUrl);
        });
        this.spinner.stop();
    };

    InstitutionalAgreementEditModel.prototype.agreementPostContacts = function (response, statusText, xhr) {
        var _this = this;
        var tempUrl = App.Routes.WebApi.Agreements.Contacts.post(this.agreementId);

        $.each(this.contacts(), function (i, item) {
            //var data = ko.mapping.toJS({
            //    agreementId: this.agreementId,
            //    PersonId: item.personId,
            //    Type: item.type,
            //    DisplayName: item.displayName,
            //    FirstName: item.firstName,
            //    MiddleName: item.middleName,
            //    LastName: item.lastName,
            //    Suffix: item.suffix,
            //    EmailAddress: item.emailAddress,
            //    PersonId: item.personId,
            //    Phones: item.phones
            //})
            var data = {
                agreementId: _this.agreementId,
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

    InstitutionalAgreementEditModel.prototype.saveUpdateAgreement = function () {
        var _this = this;
        var offset;

        if (!this.validateEffectiveDatesCurrentStatus.isValid()) {
            offset = $("#effectiveDatesCurrentStatus").offset();
            this.validateEffectiveDatesCurrentStatus.errors.showAllMessages(true);
            $("#navEffectiveDatesCurrentStatus").closest("ul").find("li").removeClass("current");
            $("#navEffectiveDatesCurrentStatus").addClass("current");
        }
        if (!this.validateBasicInfo.isValid()) {
            offset = $("#basicInfo").offset();
            this.validateBasicInfo.errors.showAllMessages(true);
            $("#navValidateBasicInfo").closest("ul").find("li").removeClass("current");
            $("#navValidateBasicInfo").addClass("current");
        }
        $("#participantsErrorMsg").show();
        if (this.participantsShowErrorMsg()) {
            offset = $("#participants").offset();
            $("#navParticipants").closest("ul").find("li").removeClass("current");
            $("#navParticipants").addClass("current");
        }
        if (offset != undefined) {
            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(offset.top - 20);
            } else {
                $("body").scrollTop(offset.top - 20);
            }
        } else {
            var url;
            var $LoadingPage = $("#LoadingPage").find("strong");
            this.spinner.start();

            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(0);
            } else {
                $("body").scrollTop(0);
            }
            var $LoadingPage = $("#LoadingPage").find("strong");
            $LoadingPage.text("Saving agreement...");
            $("#allParticipants").show().fadeOut(500, function () {
                $("#LoadingPage").hide().fadeIn(500);
            });

            $.each(this.participants(), function (i, item) {
                _this.participantsExport.push({
                    agreementId: item.agreementId,
                    establishmentId: item.establishmentId,
                    establishmentOfficialName: item.establishmentOfficialName,
                    establishmentTranslatedName: item.establishmentTranslatedName,
                    isOwner: item.isOwner,
                    center: item.center
                });
            });
            var myAutoRenew = null;
            if (this.autoRenew() == 0) {
                myAutoRenew = false;
            } else if (this.autoRenew() == 1) {
                myAutoRenew = true;
            }

            var editor = $("#agreementContent").data("kendoEditor");

            //editor.value("<p>New content</p>");
            this.content(editor.value());

            var data = ko.mapping.toJS({
                content: this.content(),
                expiresOn: this.expDate(),
                startsOn: this.startDate(),
                isAutoRenew: myAutoRenew,
                name: this.nickname(),
                notes: this.privateNotes(),
                status: this.statusOptionSelected(),
                visibility: this.visibility(),
                isExpirationEstimated: this.isEstimated(),
                participants: this.participantsExport,
                umbrellaId: this.uAgreementSelected(),
                type: this.typeOptionSelected()
            });
            if (this.agreementIsEdit()) {
                url = App.Routes.WebApi.Agreements.put(this.agreementId);
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: function (response, statusText, xhr) {
                        $LoadingPage.text("Agreement Saved...");
                        setTimeout(function () {
                            $("#LoadingPage").show().fadeOut(500, function () {
                                $("#allParticipants").hide().fadeIn(500);
                            });
                        }, 5000);
                    },
                    error: function (xhr, statusText, errorThrown) {
                        _this.spinner.stop();
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
            } else {
                url = App.Routes.WebApi.Agreements.post();
                $.post(url, data).done(function (response, statusText, xhr) {
                    var myUrl = xhr.getResponseHeader('Location');
                    _this.agreementId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));

                    //this.agreementId = 2;//response.agreementId
                    _this.agreementPostFiles(response, statusText, xhr);
                    _this.agreementPostContacts(response, statusText, xhr);

                    //change url to edit
                    $LoadingPage.text("Agreement Saved...");
                    setTimeout(function () {
                        if (xhr != undefined) {
                            window.location.hash = "";
                            window.location.href = "/agreements/" + xhr.getResponseHeader('Location').substring(xhr.getResponseHeader('Location').lastIndexOf("/") + 1) + "/edit/";
                            //window.location.pathname = "/agreements/" + xhr.getResponseHeader('Location').substring(xhr.getResponseHeader('Location').lastIndexOf("/")+1) + "/edit/"
                        } else {
                            alert("success, but no location");
                        }
                    }, 5000);
                }).fail(function (xhr, statusText, errorThrown) {
                    _this.spinner.stop();
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
            }
        }
    };
    return InstitutionalAgreementEditModel;
})();
