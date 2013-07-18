/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../kendo/kendo.all.d.ts" />
/// <reference path="../../typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/SideSwiper.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../sammy/sammyjs-0.7.d.ts" />

import SearchResultModule = module('../amd-modules/Establishments/SearchResult');
import SearchModule = module('../amd-modules/Establishments/Search');
import ItemModule = module('../amd-modules/Establishments/Item');
import SearchApiModel = module('../amd-modules/Establishments/ServerApiModel');
import Spinner = module('../amd-modules/Widgets/Spinner');
import Name = module('../amd-modules/Establishments/Name')
import Url = module('../amd-modules/Establishments/Url')
var Search = SearchModule.Search;
var Item = ItemModule.Item;
var SearchResult = SearchResultModule.SearchResult;


export class InstitutionalAgreementParticipantModel {

    constructor(isOwner: any, establishmentId: number, establishmentOfficialName: string,
        establishmentTranslatedName: string) {
        this.isOwner = ko.observable(isOwner);
        this.establishmentId = ko.observable(establishmentId);
        this.establishmentOfficialName = ko.observable(establishmentOfficialName);
        this.establishmentTranslatedName = ko.observable(establishmentTranslatedName);
    }

    isOwner;

    establishmentId;
    establishmentOfficialName;
    establishmentTranslatedName;

};

export class InstitutionalAgreementEditModel {
    constructor(public initDefaultPageRoute?: bool = true) {
        if (window.location.href.indexOf("new") > 0) {
            this.populateParticipants();
            this.agreementIsEdit(false);
            this.visibility("Public");
            $("#LoadingPage").hide();
            $.when(this.dfdPopParticipants, this.dfdPageFadeIn)
                .done(function () => {
                    this.updateKendoDialog($(window).width());
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * this.percentOffBodyHeight)));
                });
        } else {
            this.agreementIsEdit(true);
            this.agreementId = 1 //window.location.subString()
            this.populateFiles();
            this.populateContacts();
            this.populateAgreementData();
            $("#LoadingPage").hide();
            $.when(this.dfdPopContacts, this.dfdPopFiles, this.dfdPopParticipants, this.dfdPageFadeIn)
                .done(function () => {
                    this.updateKendoDialog($(window).width());
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * this.percentOffBodyHeight)));
                });
        }
        //this.populateAgreementData();


        $(window).resize(function () => {
            this.updateKendoDialog($(window).width());
        });


        this.isBound(true);
        this.removeParticipant = <() => bool> this.removeParticipant.bind(this);
        //this.editContact = <() => bool> this.editContact.bind(this);
        this.editAContact = <() => bool> this.editAContact.bind(this);
        this.removeContact = <() => bool> this.removeContact.bind(this);
        this.removePhone = <() => void > this.removePhone.bind(this);
        this.addPhone = <() => void > this.addPhone.bind(this);
        this.removeFile = <() => void > this.removeFile.bind(this);
        this._setupValidation = <() => void > this._setupValidation.bind(this);
        this.participantsShowErrorMsg = ko.computed(function () => {

            var validateParticipantsHasOwner = false;
            var validateParticipantsHasParticipant = false;
            $.each(this.participants(), function (i, item) => {
                if (item.isOwner() == true) {
                    validateParticipantsHasOwner = true;
                }
                if (item.isOwner() == false) {
                    validateParticipantsHasParticipant = true;
                }
            });
            if (validateParticipantsHasOwner == false && validateParticipantsHasParticipant == false) {
                this.participantsErrorMsg("Home and Partner participants are required.");
                return true;
            } else if (validateParticipantsHasOwner == false) {
                this.participantsErrorMsg("Home participant is required.");
                return true;
            } else if (validateParticipantsHasParticipant == false) {
                this.participantsErrorMsg("Partner participant is required.");
                return true;
            } else {
                return false;
            }

        });
        
        this.hideOtherGroups();
        this.bindSearch();

        this.getSettings();

        this.uAgreements = ko.mapping.fromJS([
                new this.selectConstructor("[None - this is a top-level or standalone agreement]", ""),
                new this.selectConstructor("test", "test"),
                new this.selectConstructor("test2", "test2"),
                new this.selectConstructor("test3", "test3")
        ]);
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
        //this.visibility = ko.observableArray([
        //        new this.selectConstructor("[None]", ""),
        //        new this.selectConstructor("public", "public"),
        //        new this.selectConstructor("private", "private"),
        //        new this.selectConstructor("protected", "protected")
        //]);
        this._setupValidation();
    }
    selectConstructor = function (name: string, id: string) {
        this.name = name;
        this.id = id;
    };

    percentOffBodyHeight = .6;
    dfdPopParticipants = $.Deferred();
    dfdPopContacts = $.Deferred();
    dfdPopFiles = $.Deferred();
    dfdPageFadeIn = $.Deferred();
    
    agreementIsEdit = ko.observable();
    agreementId = 1;
    visibility = ko.observable();
    $typeOptions: KnockoutObservableJQuery = ko.observable();
    typeOptions = ko.mapping.fromJS([]);
    typeOptionSelected: KnockoutObservableString = ko.observable();
    $statusOptions: KnockoutObservableJQuery = ko.observable();
    statusOptions = ko.mapping.fromJS([]);
    statusOptionSelected: KnockoutObservableString = ko.observable();
    $contactTypeOptions: KnockoutObservableJQuery = ko.observable();
    contactTypeOptions = ko.mapping.fromJS([]);
    contactTypeOptionSelected: KnockoutObservableString = ko.observable();
    contactsIsEdit = ko.observable(false);
    contactFirstName = ko.observable();
    contactLastName = ko.observable();
    contactSuffix = ko.mapping.fromJS([]);
    contactSuffixSelected = ko.observable();
    $$contactSuffix: KnockoutObservableJQuery = ko.observable();
    contactSalutation = ko.mapping.fromJS([]);
    contactSalutationSelected = ko.observable();
    $$contactSalutation: KnockoutObservableJQuery = ko.observable();
    contactJobTitle = ko.observable();
    contactPersonId = ko.observable();
    contactDisplayName = ko.observable();
    contactIndex = 0;
    contactEmail = ko.observable();
    //contactMoreDetails = ko.observable(false);
    contactMiddleName = ko.observable();
    contactPhoneTextValue = ko.observable("");
    contactPhoneType = ko.observable();
    $addContactDialog = $("#addContactDialog");
    //contact = ko.observable();
    $contactEmail = $("#contactEmail");
    $contactLastName = $("#contactLastName");
    $contactFirstName = $("#contactFirstName");
    $contactSalutation = $("#contactSalutation");
    $contactSuffix = $("#contactSuffix");
    validateContact;
    validateBasicInfo;
    validateEffectiveDatesCurrentStatus;

    uAgreements = ko.mapping.fromJS([]);
    uAgreementSelected = ko.observable(0);
    nickname = ko.observable();
    content = ko.observable();
    startDate = ko.observable();
    expDate = ko.observable();
    isEstimated = ko.observable();
    autoRenew = ko.observable();
    privateNotes = ko.observable();
    agreementContent = ko.observable();
    isCustomTypeAllowed = ko.observable();
    isCustomStatusAllowed = ko.observable();
    isCustomContactTypeAllowed = ko.observable();
    phoneTypes = ko.mapping.fromJS([]);
    $phoneTypes: KnockoutObservableJQuery = ko.observable();
    phoneTypeSelected = ko.observable();
    $file: KnockoutObservableJQuery = ko.observable();
    hasFile: KnockoutObservableBool = ko.observable();
    isFileExtensionInvalid: KnockoutObservableBool = ko.observable(false);
    isFileTooManyBytes: KnockoutObservableBool = ko.observable(false);
    isFileFailureUnexpected: KnockoutObservableBool = ko.observable(false);
    fileFileExtension: KnockoutObservableString = ko.observable();
    fileFileName: KnockoutObservableString = ko.observable();
    fileSrc: KnockoutObservableString = ko.observable(
        // TODO TIM: the maxSide and refresh params are not valid for agreement files
        // maxSide was used for profile photo to request it at a specific size
        // refresh was used to cache-bust, but i don't think we'll need that here
        // since i do not have the files controller set to cache anything
        // (the profile photo controller action is set to cache responses so refresh was needed there)
        //App.Routes.WebApi.Agreements.File.get({ maxSide: 128 })
    );
    fileUploadSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
    fileDeleteSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
    $confirmPurgeDialog: JQuery;
    tempFileId = 0;
    files = ko.mapping.fromJS([]);

    participantsExport = ko.mapping.fromJS([]);
    participants = ko.mapping.fromJS([]);
    contacts = ko.mapping.fromJS([]);
    contactPhones = ko.mapping.fromJS([]);

    participantsErrorMsg = ko.observable();
    participantsShowErrorMsg;


    officialNameDoesNotMatchTranslation = ko.computed( function() {
        return !(this.participants.establishmentOfficialName === this.participants.establishmentTranslatedName);
    });

    addNewParticipant: KnockoutComputed;
    isBound = ko.observable();

    back = function () {
        history.back();
    };

    sideSwiper = new App.SideSwiper({
        speed: '',
        frameWidth: 970,
        root: '[data-current-module=agreements]'
    });

    // participants
    owner = new Search(false);
    owner2 = new Search(false);
    tenantDomain = "uc.edu"; 
    spinner: Spinner.Spinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400, true));
    receiveResults(js: SearchApiModel.IServerApiFlatModel[]): void {
        if (!js) {
            ko.mapping.fromJS({
                items: [],
                itemTotal: 0
            }, this.participants);
        }
        else {
            ko.mapping.fromJS(js, this.participants);
        }
    }

    populateParticipants(): void {
        $.get(App.Routes.WebApi.Agreements.Participants.get(this.agreementId))
            .done((response: SearchApiModel.IServerApiFlatModel[]): void => {
                this.receiveResults(response);
                this.dfdPopParticipants.resolve();
            });
    }

    populateAgreementData(): void {
        $.get(App.Routes.WebApi.Agreements.get(this.agreementId))
            .done((response: any): void => {
                this.content(response.content);
                this.expDate(response.expiresOn);
                this.startDate(response.startsOn);
                if (response.isAutoRenew == null) {
                    this.autoRenew(2);
                } else {
                    this.autoRenew(response.isAutoRenew);
                };
                
                this.nickname(response.name);
                this.privateNotes(response.notes);
                this.statusOptionSelected(response.status);
                this.visibility(response.visibility);
                this.isEstimated(response.isExpirationEstimated);
                ko.mapping.fromJS(response.participants, this.participants);
                this.dfdPopParticipants.resolve();
                this.uAgreementSelected(response.umbrellaId);
                this.typeOptionSelected(response.type);
            });
    }

    populateFiles(): void {
        // TODO TIM: you need to know the agreementId in order to do Files.get()
        $.get(App.Routes.WebApi.Agreements.Files.get(this.agreementId) + "?useTestData=true")
            .done((response: any): void => {
                // use foreach instead of mapping so that I can add isEdit, fileNamewithoutExt , and ext, 
                // and then push the rest
                $.each(response, function (i, item) => {
                    this.files.push(ko.mapping.fromJS({
                        id: item.id,
                        originalName: item.originalName,
                        customName: item.customName,
                        visibility: item.visibility,
                        isEdit: false,
                        customNameFile: item.customName.substring(0, item.customName.lastIndexOf(".")),
                        customNameExt: item.customName.substring(item.customName.lastIndexOf("."), item.customName.length)
                    }));
                });
                this.dfdPopFiles.resolve();
                //ko.mapping.fromJS(response, this.files)
            });
    }

    populateContacts(): void {
        $.get(App.Routes.WebApi.Agreements.Contacts.get(this.agreementId))
            .done((response: any): void => {
                ko.mapping.fromJS(response, this.contacts)
                this.dfdPopContacts.resolve();
            });

    }

    $bindKendoFile(): void {// this is getting a little long, can probably factor out event handlers / validation stuff
        
        $("#fileUpload").kendoUpload({
            multiple: true,
            showFileList: false,
            localization: {
                select: 'Choose a file to upload...'
            },
            async: {
                // TODO TIM: I changed this, look at it, but leave it as-is
                // NOTE: we upload to the uploads endpoint, and POST as a file later with an upload GUID
                // also, i don't think we will need kendoRemove when this becomes multiple: true
                //saveUrl: App.Routes.WebApi.Agreements.File.post(),
                saveUrl: App.Routes.WebApi.Uploads.post()//,
                //removeUrl: App.Routes.WebApi.Agreements.File.kendoRemove() // should not need this
            },
            upload: (e: any): void => {
                // client-side check for file extension
                var allowedExtensions: string[] = ['.pdf', '.doc', '.docx', '.odt', '.xls', '.xlsx', '.ods', '.ppt', '.pptx'];
                this.isFileExtensionInvalid(false);
                this.isFileTooManyBytes(false);
                this.isFileFailureUnexpected(false);
                $(e.files).each((index: number): void => {
                    var isExtensionAllowed: bool = false;
                    var isByteNumberAllowed: bool = false;
                    var extension: string = e.files[index].extension;
                    this.fileFileExtension(extension || '[NONE]');
                    this.fileFileName(e.files[index].name);
                    for (var i = 0; i < allowedExtensions.length; i++) {
                        if (allowedExtensions[i] === extension.toLowerCase()) {
                            isExtensionAllowed = true;
                            break;
                        }
                    }
                    if (!isExtensionAllowed) {
                        e.preventDefault(); // prevent upload
                        this.isFileExtensionInvalid(true); // update UI with feedback
                    }
                    else if (e.files[index].rawFile.size > (1024 * 1024 * 25)) {
                        e.preventDefault(); // prevent upload
                        this.isFileTooManyBytes(true); // update UI with feedback
                    }
                });
                if (!e.isDefaultPrevented()) {
                    this.fileUploadSpinner.start(); // display async wait message
                }
            },
            complete: (): void => {
                this.fileUploadSpinner.stop(); // hide async wait message
            },
            success: (e: any): void => {
                // this event is triggered by both upload and remove requests
                // ignore remove operations becuase they don't actually do anything
                if (e.operation == 'upload') {
                    if (e.response && e.response.message) {
                        App.flasher.flash(e.response.message);
                    }
                    //this.contacts.push(ko.mapping.fromJS({ title: this.contactJobTitle(), firstName: this.contactFirstName(), lastName: this.contactLastName(), id: 1, personId: this.contactPersonId(), phones: ko.mapping.toJS(this.contactPhones()), emailAddress: this.contactEmail(), type: this.contactTypeOptionSelected(), suffix: this.contactSuffix(), salutation: this.contactSalutation(), displayName: this.contactDisplayName(), middleName: this.contactMiddleName }));
                    this.tempFileId  = this.tempFileId + .01
                    this.files.push(ko.mapping.fromJS({
                        id: this.tempFileId,
                        originalName: e.files[0].name,
                        customName: e.files[0].name,
                        visibility: "Public",
                        guid: e.response.guid,
                        isEdit: false,
                        customNameFile: e.files[0].name.substring(0, e.files[0].name.indexOf(e.files[0].extension)),
                        customNameExt: e.files[0].extension
                    }));
                }
            },
            error: (e: any): void => {
                // kendo response is as json string, not js object
                var fileName: string, fileExtension: string;

                if (e.files && e.files.length > 0) {
                    fileName = e.files[0].name;
                    fileExtension = e.files[0].extension;
                }
                if (fileName) this.fileFileName(fileName);
                if (fileExtension) this.fileFileExtension(fileExtension);

                if (e.XMLHttpRequest.status === 415)
                    this.isFileExtensionInvalid(true);
                else if (e.XMLHttpRequest.status === 413)
                    this.isFileTooManyBytes(true);
                else this.isFileFailureUnexpected(true);
            }
        });
            
    }
    
    removeFile(me, e): void {
        if (confirm('Are you sure you want to remove this file from this agreement?')) {
            // all files will have a guid in create, none will have a guid in edit agreement
            // so do a check for agreementId - if it is undefined(for now 0)
            var url = "";
            if (this.agreementId != 0) {
                url = App.Routes.WebApi.Agreements.Files.del(this.agreementId, me.id());
            } else {
                url = App.Routes.WebApi.Agreements.FilesUpload.del(me.guid());
            }
            $.ajax({ 
                url: url,
                type: 'DELETE',
                success: (): void => {
                    this.files.remove(me);
                }
            })
        }
        e.preventDefault();
        e.stopPropagation();
    }

    editAFile(me, e): void {
        me.isEdit(true);
    };

    closeEditAFile(me, e): void {
        me.customName(me.customNameFile() + me.customNameExt())
        me.isEdit(false);
    };

    downloadAFile(me, e): void {
        this.agreementId = 2
        var url = App.Routes.WebApi.Agreements.Files.Content.download(this.agreementId, me.id());
        window.location.href = url;
    };

    viewAFile(me, e): void {
        this.agreementId = 2
        var url = App.Routes.WebApi.Agreements.Files.Content.view(this.agreementId, me.id());
        window.open(
          url,
          '_blank'
        );
    };


    updateKendoDialog(windowWidth): void {

        $(".k-window").css({
            left: (windowWidth / 2 - ($(".k-window").width() / 2) + 10)
        });
    }

    bindjQueryKendo(result): void {

        this.isCustomTypeAllowed(result.isCustomTypeAllowed);
        this.isCustomStatusAllowed(result.isCustomStatusAllowed);
        this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
        this.statusOptions.push(new this.selectConstructor("", ""));
        this.contactTypeOptions.push(new this.selectConstructor("", undefined));
        this.typeOptions.push(new this.selectConstructor("", ""));
        for (var i = 0; i < result.statusOptions.length; i++) {
            this.statusOptions.push(new this.selectConstructor(result.statusOptions[i], result.statusOptions[i]));
        };
        for (var i = 0; i < result.contactTypeOptions.length; i++) {
            this.contactTypeOptions.push(new this.selectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
        };
        for (var i = 0; i < result.typeOptions.length; i++) {
            this.typeOptions.push(new this.selectConstructor(result.typeOptions[i], result.typeOptions[i]));
        };
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

        this.$contactSalutation.kendoComboBox({
            dataTextField: "name",
            dataValueField: "id",
            dataSource: new kendo.data.DataSource({
                data: ko.mapping.toJS(this.contactSalutation())
            })
        });

        this.$contactSuffix.kendoComboBox({
            dataTextField: "name",
            dataValueField: "id",
            dataSource: new kendo.data.DataSource({
                data: ko.mapping.toJS(this.contactSuffix())
            })
        });

        //$(".hasDate").kendoDatePicker({
        //    open: function (e) { this.options.format = "MM/dd/yyyy"; }
        //});

        $(".hasDate").each(function (index, item) {
            $(item).kendoDatePicker({
                value: new Date($(item).val()),
                open: function (e) { this.options.format = "MM/dd/yyyy"; }
            });
        });


        this.$bindKendoFile();

        $("#helpExpDate").kendoTooltip({
            width: 120,
            position: "top",
            content: "testing",
            showOn: "click",
            autoHide: false
        })
        this.contactPhoneTextValue.subscribe((me: string): void => {
            if (this.contactPhoneTextValue().length > 0) {
                this.contactPhones.push(ko.mapping.fromJS({ type: this.contactPhoneType(), value: this.contactPhoneTextValue() }))
                this.contactPhoneTextValue("");
                $(".phoneTypes").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: ko.mapping.toJS(this.phoneTypes())
                    })
                });
            }
        });
        this.$addContactDialog.kendoWindow({
            width: 950,
            close: function () => {
                $("#addAContact").fadeIn(500);
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

        function kacSelext(me, e) => {

            var dataItem = me.dataItem(e.item.index());
            this.contactFirstName(dataItem.firstName);
            this.contactLastName(dataItem.lastName);
            this.contactEmail(dataItem.defaultEmailAddress);
            this.contactMiddleName(dataItem.middleName);
            this.contactPersonId(dataItem.id);
            this.contactSuffixSelected(dataItem.suffix);
            this.contactSalutationSelected(dataItem.salutation);
            this.$contactEmail.prop('disabled', true);
            this.$contactLastName.prop('disabled', true);
            this.$contactFirstName.prop('disabled', true);
            $("#contactMiddleName").prop('disabled', true);
            this.$contactSalutation.data("kendoComboBox").enable(false);
            this.$contactSuffix.data("kendoComboBox").enable(false);
            this.validateContact.errors.showAllMessages(true);
        };

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
            change: (e: any): void => {
                //this.checkInstitutionForNull();
            },
            select: (e: any): void => {
                kacSelext(this.$contactLastName.data("kendoAutoComplete"), e);
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
            change: (e: any): void => {
                //this.checkInstitutionForNull();
            },
            select: (e: any): void => {
                kacSelext(this.$contactLastName.data("kendoAutoComplete"), e);
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
            change: (e: any): void => {
                //this.checkInstitutionForNull();
            },
            select: (e: any): void => {
                kacSelext(this.$contactLastName.data("kendoAutoComplete"), e);
            }
        });

        //add sections and when the scroll to the top of the section, change side nav - also change side nav
        // when I click it(style) 


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

            var $body = $("body").scrollTop() + 100;
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
                name: "formatBlock",
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
    }

    getSettings(): void {

        var url = 'App.Routes.WebApi.Agreements.Settings.get()';
        var agreementSettingsGet;
        $.ajax({
            url: eval(url),
            type: 'GET'
        })
        .done(function (result) => {
            this.bindjQueryKendo(result);
        })
        .fail(function (xhr) {
            alert('fail: status = ' + xhr.status + ' ' + xhr.statusText + '; message = "' + xhr.responseText + '"');
        });

    }

    hideOtherGroups(): void {
        $("#allParticipants").css("visibility", "").hide();
        $("#estSearch").css("visibility", "").hide();
        $("#addEstablishment").css("visibility", "").hide();
    }

    removeParticipant(establishmentResultViewModel, e): bool {
        if (confirm('Are you sure you want to remove "' +
            establishmentResultViewModel.establishmentTranslatedName() +
            '" as a participant from this agreement?')) {
            var self = this;
            self.participants.remove(function (item) {
                if (item.establishmentId() === establishmentResultViewModel.establishmentId()) {
                    $(item.participantEl).slideUp('fast', function () {
                        self.participants.remove(item);
                    });
                }
                return false;
            });
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    };


    establishmentSearchViewModel = new Search();


    establishmentItemViewModel; 

    hasBoundSearch = false;

    hasBoundItem = false;


    SearchPageBind(parentOrParticipant: string): void {

        var $cancelAddParticipant = $("#cancelAddParticipant");
        var $searchSideBarAddNew = $("#searchSideBarAddNew");
        this.establishmentSearchViewModel.detailTooltip = (): string => {
            return 'Choose this establishment as a ' + parentOrParticipant;
        };
        $cancelAddParticipant.off();
        $searchSideBarAddNew.off();
        $searchSideBarAddNew.on("click", function (e) => {
            this.establishmentSearchViewModel.sammy.setLocation('#/new/');
            e.preventDefault();
            return false;
        });
        if (parentOrParticipant === "parent") {
            $cancelAddParticipant.on("click", function (e) => {
                this.percentOffBodyHeight = .2;
                this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                e.preventDefault();
                return false;
            });
        } else {
            $cancelAddParticipant.on("click", function (e) => {
                this.percentOffBodyHeight = .2;
                this.establishmentSearchViewModel.sammy.setLocation('#/index');
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
        $.when(dfd, dfd2)
            .done(function () => {
                $("#estSearch").fadeIn(500, function () => {
                   // this.dfdPageFadeIn.resolve();
                });
            });

        
    };

    fadeModsOut(dfd, dfd2, $obj, $obj2, time): void {
        if ($obj.css("display") !== "none") {
            $obj.fadeOut(time, function () {
                dfd.resolve();
            });
        }
        else {
            dfd.resolve();
        }
        if ($obj2.css("display") !== "none") {
            $obj2.fadeOut(time, function () {
                dfd2.resolve();
            });
        }
        else {
            dfd2.resolve();
        }
    };
    
    bindSearch(): void{
        if (!this.hasBoundSearch) {
            
            this.establishmentSearchViewModel.sammyBeforeRoute = /\#\/index\/(.*)\//;
            this.establishmentSearchViewModel.sammyGetPageRoute = '#/index';
            this.establishmentSearchViewModel.sammyDefaultPageRoute = '/agreements[\/]?';
            ko.applyBindings(this.establishmentSearchViewModel, $('#estSearch')[0]);
            var lastURL = "asdf";
            if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#") === -1) {
                if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("new/") === -1) {
                    this.establishmentSearchViewModel.sammy.setLocation('/agreements/new/#/index');
                } else {
                    this.establishmentSearchViewModel.sammy.setLocation('#/index');
                }
            }
            if (sessionStorage.getItem("addest") == undefined) {
                sessionStorage.setItem("addest", "no");
            }
            this.establishmentSearchViewModel.sammy.bind("location-changed", function () => {
                if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                    var $asideRootSearch = $("#asideRootSearch");
                    var $asideParentSearch = $("#asideParentSearch");
                    if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("new/#/new/") > 0) {
                        var $addEstablishment = $("#addEstablishment");
                        var dfd = $.Deferred();
                        var dfd2 = $.Deferred();
                        var $obj = $("#estSearch");
                        var $obj2 = $("#allParticipants");
                        var time = 500;
                        this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                        $.when(dfd, dfd2)
                            .done(function () => {
                                $addEstablishment.css("visibility", "").hide().fadeIn(500, function () => {
                                    if (!this.hasBoundItem) {
                                        this.establishmentItemViewModel = new Item();
                                        this.establishmentItemViewModel.goToSearch = function () => {
                                            sessionStorage.setItem("addest", "yes");
                                            this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                        }
                                        this.establishmentItemViewModel.submitToCreate = function(formElement: HTMLFormElement): bool => {
                                            if (!this.establishmentItemViewModel.id || this.establishmentItemViewModel.id === 0) {
                                                var me = this.establishmentItemViewModel;
                                                this.establishmentItemViewModel.validatingSpinner.start();

                                                // reference the single name and url
                                                var officialName: Name.Name = this.establishmentItemViewModel.names()[0];
                                                var officialUrl: Url.Url = this.establishmentItemViewModel.urls()[0];
                                                var location = this.establishmentItemViewModel.location;

                                                // wait for async validation to stop
                                                if (officialName.text.isValidating() || officialUrl.value.isValidating() ||
                                                    this.establishmentItemViewModel.ceebCode.isValidating() || this.establishmentItemViewModel.uCosmicCode.isValidating()) {
                                                    setTimeout((): bool => {
                                                        var waitResult = this.establishmentItemViewModel.submitToCreate(formElement);
                                                        return false;
                                                    }, 50);
                                                    return false;
                                                }

                                                // check validity
                                                this.establishmentItemViewModel.isValidationSummaryVisible(true);
                                                if (!this.establishmentItemViewModel.isValid()) {
                                                    this.establishmentItemViewModel.errors.showAllMessages();
                                                }
                                                if (!officialName.isValid()) {
                                                    officialName.errors.showAllMessages();
                                                }
                                                if (!officialUrl.isValid()) {
                                                    officialUrl.errors.showAllMessages();
                                                }
                                                this.establishmentItemViewModel.validatingSpinner.stop();

                                                if (officialName.isValid() && officialUrl.isValid() && this.establishmentItemViewModel.isValid()) {
                                                    var $LoadingPage = $("#LoadingPage").find("strong")
                                                    var url = App.Routes.WebApi.Establishments.post();
                                                    var data = this.establishmentItemViewModel.serializeData();
                                                    $LoadingPage.text("Creating Establishment...");
                                                    data.officialName = officialName.serializeData();
                                                    data.officialUrl = officialUrl.serializeData();
                                                    data.location = location.serializeData();
                                                    this.establishmentItemViewModel.createSpinner.start();
                                                    $.post(url, data)
                                                    .done((response: any, statusText: string, xhr: JQueryXHR): void => {
                                                        this.establishmentItemViewModel.createSpinner.stop();
                                                        $LoadingPage.text("Establishment created, you are being redirected to previous page...");
                                                        $("#addEstablishment").fadeOut(500, function () => {
                                                            this.percentOffBodyHeight = .2;
                                                            $("#LoadingPage").fadeIn(500);
                                                            setTimeout(function () => {
                                                                $("#LoadingPage").fadeOut(500, function () {
                                                                    //this.dfdPageFadeIn.resolve();
                                                                    $LoadingPage.text("Loading Page...");
                                                                });
                                                                this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                                            }, 5000);
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
                                                }
                                            }

                                            return false;
                                        }
                                        ko.applyBindings(this.establishmentItemViewModel, $addEstablishment[0]);
                                        var $cancelAddEstablishment = $("#cancelAddEstablishment");
                                        $cancelAddEstablishment.on("click", function (e) => {
                                            sessionStorage.setItem("addest", "no");
                                            this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                            e.preventDefault();
                                            return false;
                                        });
                                        this.hasBoundItem = true;
                                    }
                                    //this.dfdPageFadeIn.resolve();
                                });
                            })
                        lastURL = "#/new/";
                    } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("new/#/page/") > 0) {
                        if (sessionStorage.getItem("addest") === "yes") {
                            this.establishmentSearchViewModel.clickAction = function (context): bool => {
                                this.establishmentItemViewModel.parentEstablishment(context);
                                this.establishmentItemViewModel.parentId(context.id());
                                this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                            };
                            this.establishmentSearchViewModel.header("Choose a parent establishment");
                            $asideRootSearch.hide();
                            $asideParentSearch.show();
                            this.SearchPageBind("parent");
                            this.establishmentSearchViewModel.header("Choose a parent establishment");
                        }
                        else {
                            $asideRootSearch.show();
                            $asideParentSearch.hide();
                            this.SearchPageBind("participant");
                            this.establishmentSearchViewModel.header("Choose a participant");
                            this.establishmentSearchViewModel.clickAction = function (context): bool => {
                                var myParticipant = new InstitutionalAgreementParticipantModel(
                                    false,
                                    context.id(),
                                    context.officialName(),
                                    context.translatedName()
                                );
                                var alreadyExist = false;
                                for (var i = 0; i < this.participants().length; i++) {
                                    if (this.participants()[i].establishmentId() === myParticipant.establishmentId()) {
                                        alreadyExist = true;
                                        break;
                                    }
                                }
                                if (alreadyExist !== true) {
                                    $.ajax({
                                        url: App.Routes.WebApi.Agreements.Participant.get(myParticipant.establishmentId()),
                                        type: 'GET',
                                        async: false
                                    })
                                    .done(function (response) => {
                                        myParticipant.isOwner(response.isOwner);
                                        this.participants.push(myParticipant);
                                        this.percentOffBodyHeight = .2;
                                        this.establishmentSearchViewModel.sammy.setLocation('agreements/new/');
                                    })
                                    .fail(function () => {
                                        //alert('fail');
                                        this.percentOffBodyHeight = .2;
                                        this.participants.push(myParticipant);
                                        this.establishmentSearchViewModel.sammy.setLocation('agreements/new/');
                                    });
                                } else {
                                    alert("This Participant has already been added.")
                                }
                            }
                        }
                        lastURL = "#/page/";
                    } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("agreements/new") > 0) {
                        sessionStorage.setItem("addest", "no");
                        lastURL = "#/index";
                        this.establishmentSearchViewModel.sammy.setLocation('#/index');
                        var dfd = $.Deferred();
                        var dfd2 = $.Deferred();
                        var $obj = $("#estSearch");
                        var $obj2 = $("#addEstablishment");
                        var time = 500;
                        this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                        $.when(dfd, dfd2)
                            .done(function () => {
                                $("#allParticipants").fadeIn(500).promise().done(function () => {
                                    $(this).show();
                                    //$("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .2)));
                                    this.dfdPageFadeIn.resolve();
                                });
                                //$("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .2)));
                            });
                    } else {
                        window.location.replace(this.establishmentSearchViewModel.sammy.getLocation());
                    }
                }
            });
            this.establishmentSearchViewModel.sammy.run();
        }
    };

    editAContact(me): void {
        this.$addContactDialog.data("kendoWindow").open().title("Edit Contact")
        this.contactsIsEdit(true);
        this.contactEmail(me.emailAddress());
        this.contactDisplayName(me.displayName());
        this.contactPersonId(me.personId());
        this.contactJobTitle(me.title());
        this.contactFirstName(me.firstName());
        this.contactLastName(me.lastName());
        this.contactPhones(me.phones());
        this.contactMiddleName(me.middleName());
        this.contactIndex = this.contacts.indexOf(me)
        this.$contactEmail.prop('disabled', true);
        this.$contactLastName.prop('disabled', true);
        this.$contactFirstName.prop('disabled', true);
        $("#contactMiddleName").prop('disabled', true);
        this.$contactSalutation.data("kendoComboBox").enable(false);
        this.$contactSuffix.data("kendoComboBox").enable(false);

        this.contactTypeOptionSelected(me.type());
        var dropdownlist = $("#contactTypeOptions").data("kendoComboBox");
        dropdownlist.select(function (dataItem) {
            return dataItem.name === me.type();
        });

        dropdownlist = $("#contactSuffix").data("kendoComboBox");
        dropdownlist.select(function (dataItem) {
            return dataItem.name === me.suffix();
        });

        dropdownlist = $("#contactSalutation").data("kendoComboBox");
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
    }

    clearContactInfo(): void {
        this.contactEmail('');
        this.contactDisplayName('');
        this.contactPersonId('');
        this.contactJobTitle('');
        this.contactFirstName('');
        this.contactMiddleName('');
        this.contactLastName('');
        this.contactPhones('');
        this.contactTypeOptionSelected('');
        var dropdownlist = $("#contactTypeOptions").data("kendoComboBox");
        dropdownlist.select(0);
        var dropdownlist = $("#contactSalutation").data("kendoComboBox");
        dropdownlist.select(0);
        var dropdownlist = $("#contactSuffix").data("kendoComboBox");
        dropdownlist.select(0);
    }

    editContact(me): void {
        if (this.validateContact.isValid()) {
            this.contactsIsEdit(false);
            this.contacts()[this.contactIndex].emailAddress(this.contactEmail());
            this.contacts()[this.contactIndex].title(this.contactJobTitle());
            this.contacts()[this.contactIndex].displayName(this.contactDisplayName());
            this.contacts()[this.contactIndex].personId(this.contactPersonId());
            this.contacts()[this.contactIndex].firstName(this.contactFirstName());
            this.contacts()[this.contactIndex].lastName(this.contactLastName());
            this.contacts()[this.contactIndex].middleName(this.contactMiddleName());
            this.contacts()[this.contactIndex].phones(this.contactPhones());
            this.contacts()[this.contactIndex].type(this.contactTypeOptionSelected());
            this.contacts()[this.contactIndex].salutation(this.contactSalutationSelected());
            this.contacts()[this.contactIndex].suffix(this.contactSuffixSelected());
            this.clearContactInfo();
            this.$addContactDialog.data("kendoWindow").close()
            $("#addAContact").fadeIn(500);
        } else {
            this.validateContact.errors.showAllMessages(true);
        }
    }

    addContact(me, e): void {
        if (this.validateContact.isValid()) {
            this.contacts.push(ko.mapping.fromJS({ title: this.contactJobTitle(), firstName: this.contactFirstName(), lastName: this.contactLastName(), id: 1, personId: this.contactPersonId(), phones: ko.mapping.toJS(this.contactPhones()), emailAddress: this.contactEmail(), type: this.contactTypeOptionSelected(), suffix: this.contactSuffix(), salutation: this.contactSalutation(), displayName: this.contactDisplayName(), middleName: this.contactMiddleName }));
            this.clearContactInfo();
            this.$addContactDialog.data("kendoWindow").close();
            $("#addAContact").fadeIn(500);

        } else {
            this.validateContact.errors.showAllMessages(true);
        }
    }

    addAContact(me, e): void {
        this.$contactEmail.prop('disabled', false);
        this.$contactLastName.prop('disabled', false);
        this.$contactFirstName.prop('disabled', false);
        $("#contactMiddleName").prop('disabled', false);
        this.$contactSalutation.data("kendoComboBox").enable(true);
        this.$contactSuffix.data("kendoComboBox").enable(true);
        this.validateContact.errors.showAllMessages(false);
        this.$addContactDialog.data("kendoWindow").open().title("Add Contact")
        $("#addAContact").fadeOut(500, function () {
        });
    }

    cancelContact(): void {
        this.$addContactDialog.data("kendoWindow").close()
        $("#addAContact").fadeIn(500);
    }

    clearContact(): void {
        this.clearContactInfo();
        var $contactEmail = $("#contactEmail");
        var $contactLastName = $("#contactLastName");
        var $contactFirstName = $("#contactFirstName");
        var $contactSalutation = $("#contactSalutation");
        var $contactSuffix = $("#contactSuffix");
        $contactEmail.prop('disabled', false);
        $contactLastName.prop('disabled', false);
        $contactFirstName.prop('disabled', false);
        $("#contactMiddleName").prop('disabled', false);
        $contactSalutation.data("kendoComboBox").enable(true);
        $contactSuffix.data("kendoComboBox").enable(true);
        this.validateContact.errors.showAllMessages(false);
    }

    removeContact(me, e): bool {
        if (confirm('Are you sure you want to remove "' +
            me.firstName() + " " + me.lastName() +
            '" as a contact from this agreement?')) {
            this.contacts.remove(me);
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    removePhone(me, e): void {
        this.contactPhones.remove(me);
        e.preventDefault();
        e.stopPropagation();
    }


    addPhone(me, e): void {
        if (this.contactPhoneTextValue().length > 0) {
            this.contactPhones.push(ko.mapping.fromJS({ type: '', value: this.contactPhoneTextValue() }))
            //use index instead of id or make an incrimental observable
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

    addParticipant(establishmentResultViewModel): void {
        this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
        this.hasBoundSearch = true;
    };
       
    trail: KnockoutObservableStringArray = ko.observableArray([]);
    swipeCallback(): void {
    }

    nextForceDisabled: KnockoutObservableBool = ko.observable(false);
    prevForceDisabled: KnockoutObservableBool = ko.observable(false);
    pageNumber: KnockoutObservableNumber = ko.observable();
    lockAnimation(): void {
        this.nextForceDisabled(true);
        this.prevForceDisabled(true);
    }
    unlockAnimation(): void {
        this.nextForceDisabled(false);
        this.prevForceDisabled(false);
    }
    
    private _setupValidation(): void {
        this.validateEffectiveDatesCurrentStatus = ko.validatedObservable({
            startDate: this.startDate.extend({
                required: {
                    message: "Start date is required."
                },
                maxLength: 50
            }),
            expDate: this.expDate.extend({
                required: {
                    message: "Expiration date is required."
                },
                maxLength: 50
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
        })
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
            }),
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
                }
            }).extend({
                pattern: {
                    message: 'Email is in wrong format.',
                    params: '^(?:(?!Email).)*$'
                }
            }),

            contactSuffix: this.contactSuffix.extend({
                maxLength: 50
            }),

            contactJobTitle: this.contactJobTitle.extend({
                maxLength: 50
            })
        });
    }

    goToSection(location, data, event): void {

        var offset = $("#" + location).offset();
       
        $("body").scrollTop(offset.top - 20);
        $(event.target).closest("ul").find("li").removeClass("current");
        $(event.target).closest("li").addClass("current");
    };

    updateAgreement(): void {

    }
    
    saveAgreement(): void {

        var offset;
        // validate in this order to put scroll in right place
        if (!this.validateEffectiveDatesCurrentStatus.isValid()) {
            var offset = $("#effectiveDatesCurrentStatus").offset();
            this.validateEffectiveDatesCurrentStatus.errors.showAllMessages(true);
            $("#navEffectiveDatesCurrentStatus").closest("ul").find("li").removeClass("current");
            $("#navEffectiveDatesCurrentStatus").addClass("current");
        }
        if (!this.validateBasicInfo.isValid()) {
            var offset = $("#basicInfo").offset();
            this.validateBasicInfo.errors.showAllMessages(true);
            $("#navValidateBasicInfo").closest("ul").find("li").removeClass("current");
            $("#navValidateBasicInfo").addClass("current");
        }
        $("#participantsErrorMsg").show();
        if (this.participantsShowErrorMsg()) {
            var offset = $("#participants").offset();
            $("#navParticipants").closest("ul").find("li").removeClass("current");
            $("#navParticipants").addClass("current");
        } 
        if (offset != undefined) {
            $("body").scrollTop(offset.top - 20);
        } else {

            var $LoadingPage = $("#LoadingPage").find("strong")
            var url = App.Routes.WebApi.Agreements.post();
            this.spinner.start();
            function agreementPostDone(response: any, statusText: string, xhr: JQueryXHR) {

                this.spinner.stop();
                //get agreementId and post to file and/or contacts if needed
            }
            $.each(this.participants(), function (i, item) => {
                this.participantsExport.push({
                    agreementId: item.agreementId,
                    establishmentId: item.establishmentId,
                    establishmentOfficialName: item.establishmentOfficialName,
                    establishmentTranslatedName: item.establishmentTranslatedName,
                    isOwner: item.isOwner,
                    center: item.center
                });
            });
            var data = ko.mapping.toJSON({
                content: this.content(),
                expiresOn: this.expDate(),
                startsOn: this.startDate(),
                isAutoRenew: this.autoRenew(),
                name: this.nickname(),
                notes: this.privateNotes(),
                status: this.statusOptionSelected(),
                visibility: this.visibility(),
                isExpirationEstimated: this.isEstimated(),
                participants: this.participantsExport,
                umbrellaId: this.uAgreementSelected(),
                type: this.typeOptionSelected()
            })
            $.post(url, data)
                .done((response: any, statusText: string, xhr: JQueryXHR): void => {
                    agreementPostDone(response, statusText, xhr);
                })
                .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                    this.spinner.stop();
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


    };

}

