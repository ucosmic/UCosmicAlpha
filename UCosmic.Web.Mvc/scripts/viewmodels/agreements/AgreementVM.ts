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
export class phoneNumber{
    constructor(textValue: string, type: string, id: number) {
        this.textValue = textValue;
        this.type = type;
        this.id = id;
    };
    textValue;
    type;
    id;
}

export class InstitutionalAgreementEditModel {
    constructor(public initDefaultPageRoute?: bool = true) {

        this.populateParticipants();

        this.isBound(true);
        this.removeParticipant = <() => bool> this.removeParticipant.bind(this);

        this.hideOtherGroups();
        this.bindSearch();

        this.getSettings();

        this.uAgreements = ko.mapping.fromJS([
                new this.selectConstructor("[None - this is a top-level or standalone agreement]", 0),
                new this.selectConstructor("test", 1),
                new this.selectConstructor("test2", 2),
                new this.selectConstructor("test3", 3)
        ]);
        this.phoneTypes = ko.mapping.fromJS([
                new this.selectConstructor("[None]", 0),
                new this.selectConstructor("home", 1),
                new this.selectConstructor("work", 2),
                new this.selectConstructor("mobile", 3)
        ]);
        //this.agreementTypes = ko.mapping.fromJS([
        //        new this.selectConstructor("test", 1),
        //        new this.selectConstructor("test2", 2),
        //        new this.selectConstructor("test3", 3)
        //]);
    }
    selectConstructor = function (name: string, id: number) {
        this.name = name;
        this.id = id;
    };
    fileConstructor = function (name: string, path: string, visibility: string, id: number) {
        this.name = name;
        this.path = path;
        this.visibility = visibility;
        this.id = id;
    };
    phoneNumberConstructor = function (textValue: string, type: string, id: number) {
        this.textValue = textValue;
        this.type = type;
        this.id = id;
    };
    contactConstructor = function (jobTitle: string, firstName: string, lastName: string, id: number, personId: number, phone: phoneNumber) {
        this.jobTitle = jobTitle;
        this.firstName = firstName;
        this.lastName = lastName;
        this.id = id;
        this.personId = personId;
        this.phone = phone;
    };
    $typeOptions: KnockoutObservableJQuery = ko.observable();
    typeOptions = ko.mapping.fromJS([]);
    typeOptionSelected: KnockoutObservableString = ko.observable();
    $statusOptions: KnockoutObservableJQuery = ko.observable();
    statusOptions = ko.mapping.fromJS([]);
    statusOptionSelected: KnockoutObservableString = ko.observable();
    $contactTypeOptions: KnockoutObservableJQuery = ko.observable();
    contactTypeOptions = ko.mapping.fromJS([]);
    contactTypeOptionSelected: KnockoutObservableString = ko.observable();
    uAgreements = ko.mapping.fromJS([]);
    uAgreementSelected = ko.observable(0);
    nickname = ko.observable();
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
    phoneTypeSelected = ko.observable();
    $file: KnockoutObservableJQuery = ko.observable();
    hasFile: KnockoutObservableBool = ko.observable();
    isFileExtensionInvalid: KnockoutObservableBool = ko.observable(false);
    isFileTooManyBytes: KnockoutObservableBool = ko.observable(false);
    isFileFailureUnexpected: KnockoutObservableBool = ko.observable(false);
    fileFileExtension: KnockoutObservableString = ko.observable();
    fileFileName: KnockoutObservableString = ko.observable();
    fileSrc: KnockoutObservableString = ko.observable(
        App.Routes.WebApi.Agreements.File.get({ maxSide: 128 }));
    fileUploadSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
    fileDeleteSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
    $confirmPurgeDialog: JQuery;

    participants = ko.mapping.fromJS([]);


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
        this.spinner.stop();
    }

    populateParticipants(): void {

        $.get(App.Routes.WebApi.Agreements.Participants.get())
            .done((response: SearchApiModel.IServerApiFlatModel[]): void => {
                this.receiveResults(response);
                $("#LoadingPage").hide();
            });


    }

    $bindKendoFile(): void {// this is getting a little long, can probably factor out event handlers / validation stuff
        
        $("#fileUpload").kendoUpload({
            multiple: false,
            showFileList: false,
            localization: {
                select: 'Choose a file to upload...'
            },
            async: {
                saveUrl: App.Routes.WebApi.Agreements.File.post(),
                removeUrl: App.Routes.WebApi.Agreements.File.kendoRemove()
            },
            upload: (e: any): void => {
                // client-side check for file extension
                var allowedExtensions: string[] = ['pdf', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ods', 'ppt', 'pptx'];
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
                    else if (e.files[index].rawFile.size > (1024 * 1024)) {
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
                    this.hasFile(true);
                    this.fileSrc(App.Routes.WebApi.Agreements.File
                        .get({ maxSide: 128, refresh: new Date().toUTCString() }));
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

    startDeletingFile(): void {
        if (this.$confirmPurgeDialog && this.$confirmPurgeDialog.length) {
            this.$confirmPurgeDialog.dialog({
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: 'Yes, confirm delete',
                        click: (): void => {
                            this.$confirmPurgeDialog.dialog('close');
                            this._deleteFile();
                        }
                    },
                    {
                        text: 'No, cancel delete',
                        click: (): void => {
                            this.$confirmPurgeDialog.dialog('close');
                            this.fileDeleteSpinner.stop();
                        },
                        'data-css-link': true
                    }
                ]
            });
        }
        else if (confirm('Are you sure you want to delete your profile file?')) {
            this._deleteFile();
        }
    }

    private _deleteFile(): void {
        this.fileDeleteSpinner.start();
        this.isFileExtensionInvalid(false);
        this.isFileTooManyBytes(false);
        this.isFileFailureUnexpected(false);
        $.ajax({ // submit ajax DELETE request
            url: App.Routes.WebApi.Agreements.File.del(),
            type: 'DELETE'
        })
        .always((): void => {
            this.fileDeleteSpinner.stop();
        })
        .done((response: string, statusText: string, xhr: JQueryXHR): void => {
            if (typeof response === 'string') App.flasher.flash(response);
            this.hasFile(false);
            this.fileSrc(App.Routes.WebApi.Agreements.File
                .get({ maxSide: 128, refresh: new Date().toUTCString() }));
        })
        .fail((): void => {
            this.isFileFailureUnexpected(true);
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
            this.isCustomTypeAllowed(result.isCustomTypeAllowed);
            this.isCustomStatusAllowed(result.isCustomStatusAllowed);
            this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
            this.statusOptions.push(new this.selectConstructor("", 0));
            this.contactTypeOptions.push(new this.selectConstructor("", 0));
            this.typeOptions.push(new this.selectConstructor("", 0));
            for (var i = 0; i < result.statusOptions.length; i++) {
                this.statusOptions.push(new this.selectConstructor(result.statusOptions[i], i+1));
            };
            for (var i = 0; i < result.contactTypeOptions.length; i++) {
                this.contactTypeOptions.push(new this.selectConstructor(result.contactTypeOptions[i], i));
            };
            for (var i = 0; i < result.typeOptions.length; i++) {
                this.typeOptions.push(new this.selectConstructor(result.typeOptions[i], i));
            };
            if (this.isCustomTypeAllowed) {
                $("#typeOptions").kendoComboBox( {
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
            }
            if (this.isCustomContactTypeAllowed) {
                $("#contactTypeOptions").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: this.contactTypeOptions()
                    })
                });
            }

            $(".hasDate").kendoDatePicker({
                /* If user clicks date picker button, reset format */
                open: function (e) { this.options.format = "MM/dd/yyyy"; }
            });
            this.$bindKendoFile();

            $("#helpExpDate").kendoTooltip({
                width: 120,
                position: "top",
                content: "testing",
                showOn: "click",
                autoHide: false
            })
        })
        .fail(function (xhr) {
            alert('fail: status = ' + xhr.status + ' ' + xhr.statusText + '; message = "' + xhr.responseText + '"');
        });

    }

    hideOtherGroups(): void {
        $("#allParticipants").css("visibility", "").hide();
        $("#estSearch").css("visibility", "").hide();
        $("#addEstablishment").css("visibility", "").hide();
        $("#addContact").css("visibility", "").hide();
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


    SearchPageBind = function (parentOrParticipant: string) {

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
                this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                e.preventDefault();
                return false;
            });
        } else {
            $cancelAddParticipant.on("click", function (e) => {
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
                $("#estSearch").fadeIn(500);
            });

        
    };

    fadeModsOut = function (dfd, dfd2, $obj, $obj2, time) {
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
    
    bindSearch = function () {
        if (!this.hasBoundSearch) {
            $(document).ready(function () {
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
            });
            
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
                                                            $("#LoadingPage").fadeIn(500);
                                                            setTimeout(function () => {
                                                                $("#LoadingPage").fadeOut(500, function () {
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
                                        this.establishmentSearchViewModel.sammy.setLocation('agreements/new');
                                    })
                                    .fail(function () => {
                                        //alert('fail');
                                        this.participants.push(myParticipant);
                                        this.establishmentSearchViewModel.sammy.setLocation('agreements/new');
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
                                $("#allParticipants").fadeIn(500);
                            });
                    } else {
                        window.location = this.establishmentSearchViewModel.sammy.getLocation();
                    }
                }
            });
            this.establishmentSearchViewModel.sammy.run();
        }
    };

    addAContact(): void {
        $("#addAContact").fadeOut(500, function () {
            $("#addContact").fadeIn(500);
        });
    }

    addContact(): void {
        // push to contact array
        $("#addContact").fadeOut(500, function () {
            $("#addAContact").fadeIn(500);
        });
    }

    cancelContact(): void {
        $("#addContact").fadeOut(500, function () {
            $("#addAContact").fadeIn(500);
        });
    }

    addAFile(): void {
        // push to contact array
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



}

