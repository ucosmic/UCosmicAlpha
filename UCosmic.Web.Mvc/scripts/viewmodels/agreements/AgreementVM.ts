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
/// <reference path="../../app/Spinner.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
/// <reference path="../establishments/ApiModels.d.ts" />
/// <reference path="./scrollBody.ts" />
/// <reference path="./contacts.ts" />
/// <reference path="./fileAttachments.ts" />

class InstitutionalAgreementParticipantModel {
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

class InstitutionalAgreementEditModel {
    constructor(public initDefaultPageRoute: boolean = true) {
        this.contactClass = new agreements.contacts(this.isCustomContactTypeAllowed, this.spinner, this.establishmentItemViewModel, this.agreementIsEdit, this.agreementId, this.kendoWindowBug);
        ko.applyBindings(this.contactClass, $('#contacts')[0]);
        this.fileAttachmentClass = new agreements.fileAttachments(this.agreementId, this.agreementIsEdit, this.spinner, this.establishmentItemViewModel);
        ko.applyBindings(this.fileAttachmentClass, $('#fileAttachments')[0]);

        var culture = $("meta[name='accept-language']").attr("content");
        if (window.location.href.toLowerCase().indexOf("agreements/new") > 0) {
            Globalize.culture(culture)
            this.editOrNewUrl = "new/";
            this.agreementIsEdit(false);
            this.visibility("Public");
            $("#LoadingPage").hide();
            this.populateParticipants();
            $.when(this.dfdPageFadeIn, this.dfdPopParticipants)
                .done(() => {
                    this.updateKendoDialog($(window).width());
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * this.percentOffBodyHeight)));
                });
        } else {
            this.percentOffBodyHeight = .2;
            this.editOrNewUrl = window.location.href.toLowerCase().substring(window.location.href.toLowerCase().indexOf("agreements/") + 11);
            this.editOrNewUrl = this.editOrNewUrl.substring(0, this.editOrNewUrl.indexOf("/edit") + 5) + "/";
            this.agreementIsEdit(true);
            this.agreementId = this.editOrNewUrl.substring(0, this.editOrNewUrl.indexOf("/"))
            this.populateParticipants();
            this.populateFiles();
            this.populateContacts();
            Globalize.culture(culture)
            this.populateAgreementData();
            $("#LoadingPage").hide();
            $.when(this.dfdPopContacts, this.dfdPopFiles, this.dfdPopParticipants, this.dfdPageFadeIn)
                .done(() => {
                    this.updateKendoDialog($(window).width());
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * this.percentOffBodyHeight)));
                });
        }
        
        this.isBound(true);
        this.removeParticipant = <() => boolean> this.removeParticipant.bind(this);
        this._setupValidation = <() => void > this._setupValidation.bind(this);
        this.participantsShowErrorMsg = ko.computed(() => {
            var validateParticipantsHasOwner = false;
            $.each(this.participants(), function (i, item) {
                if (item.isOwner() == true) {
                    validateParticipantsHasOwner = true;
                }
            });
            if (validateParticipantsHasOwner == false) {
                this.participantsErrorMsg("Home participant is required.");
                return true;
            } else {
                return false;
            }
        });

        this.populateUmbrella();
        this.hideOtherGroups();
        this.bindSearch();
        this.getSettings();
        this._setupValidation();

        $(window).resize(() => {
            this.updateKendoDialog($(window).width());
        });
    }

    selectConstructor = function (name: string, id: string) {
        this.name = name;
        this.id = id;
    }

    contactClass;
    fileAttachmentClass;

    percentOffBodyHeight = .6;
    //jquery defered for setting body height.
    dfdUAgreements = $.Deferred();
    dfdPopParticipants = $.Deferred();
    dfdPopContacts = $.Deferred();
    dfdPopFiles = $.Deferred();
    dfdPageFadeIn = $.Deferred();

    agreementIsEdit = ko.observable();
    agreementId = 0;
    visibility = ko.observable();

    //set the path for editing an agreement or new agreement.
    editOrNewUrl;
    trail: KnockoutObservableArray<string> = ko.observableArray([]);
    nextForceDisabled: KnockoutObservable<boolean> = ko.observable(false);
    prevForceDisabled: KnockoutObservable<boolean> = ko.observable(false);
    pageNumber: KnockoutObservable<number> = ko.observable();
    $genericAlertDialog: JQuery = undefined;

    //added this because kendo window after selecting a autocomplte and then clicking the window, the body would scroll to the top.
    kendoWindowBug = 0;

    //validate vars
    validateBasicInfo;
    validateEffectiveDatesCurrentStatus;

    //basic info vars
    $uAgreements: KnockoutObservable<JQuery> = ko.observable();
    uAgreements = ko.mapping.fromJS([]);
    uAgreementSelected = ko.observable("");
    nickname = ko.observable();
    content = ko.observable();
    privateNotes = ko.observable();
    $typeOptions: KnockoutObservable<JQuery> = ko.observable();
    typeOptions = ko.mapping.fromJS([]);
    typeOptionSelected: KnockoutObservable<string> = ko.observable();
    agreementContent = ko.observable();
    isCustomTypeAllowed = ko.observable();
    isCustomStatusAllowed = ko.observable();
    isCustomContactTypeAllowed = ko.observable();

    //dates vars
    startDate = ko.observable();
    expDate = ko.observable();
    isEstimated = ko.observable();
    autoRenew = ko.observable(2);
    $statusOptions: KnockoutObservable<JQuery> = ko.observable();
    statusOptions = ko.mapping.fromJS([]);
    statusOptionSelected: KnockoutObservable<string> = ko.observable();
    
    //participant vars
    participantsExport = ko.mapping.fromJS([]);
    participants = ko.mapping.fromJS([]);
    participantsErrorMsg = ko.observable();
    participantsShowErrorMsg;

    //search vars
    establishmentSearchViewModel = new Establishments.ViewModels.Search();
    establishmentItemViewModel;
    hasBoundSearch = false;
    hasBoundItem = false;

    isBound = ko.observable();
    spinner: App.Spinner = new App.Spinner(new App.SpinnerOptions(400, true));

    officialNameDoesNotMatchTranslation = ko.computed(function () {
        return !(this.participants.establishmentOfficialName === this.participants.establishmentTranslatedName);
    });

    receiveParticipants(js: Establishments.ApiModels.FlatEstablishment[]): void {
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
            .done((response: Establishments.ApiModels.FlatEstablishment[]): void => {
                this.receiveParticipants(response);
                this.dfdPopParticipants.resolve();
            });
    }

    populateAgreementData(): void {
        $.when(this.dfdUAgreements)
            .done(() => {
                $.get(App.Routes.WebApi.Agreements.get(this.agreementId))
                    .done((response: any): void => {
                        var dropdownlist;
                        var editor = $("#agreementContent").data("kendoEditor");

                        editor.value(response.content);
                        this.content(response.content);
                        this.expDate(Globalize.format(new Date(response.expiresOn.substring(0, response.expiresOn.lastIndexOf("T"))), 'd'));
                        this.startDate(Globalize.format(new Date(response.startsOn.substring(0, response.startsOn.lastIndexOf("T"))), 'd'));
                        if (response.isAutoRenew == null) {
                            this.autoRenew(2);
                        } else {
                            this.autoRenew(response.isAutoRenew);
                        };

                        this.nickname(response.name);
                        this.privateNotes(response.notes);
                        this.visibility(response.visibility);
                        this.isEstimated(response.isExpirationEstimated);
                        ko.mapping.fromJS(response.participants, this.participants);
                        this.dfdPopParticipants.resolve();
                        this.uAgreementSelected(response.umbrellaId);

                        dropdownlist = $("#uAgreements").data("kendoDropDownList");
                        dropdownlist.select((dataItem) => {
                            return dataItem.value == this.uAgreementSelected();
                        });

                        this.statusOptionSelected(response.status);
                        if (this.isCustomStatusAllowed()) {
                            dropdownlist = $("#statusOptions").data("kendoComboBox");
                            dropdownlist.select((dataItem) => {
                                return dataItem.name === this.statusOptionSelected();
                            });
                        } else {
                            dropdownlist = $("#statusOptions").data("kendoDropDownList");
                            dropdownlist.select((dataItem) => {
                                return dataItem.text === this.statusOptionSelected();
                            });
                        }

                        this.typeOptionSelected(response.type);
                        if (this.isCustomTypeAllowed()) {
                            dropdownlist = $("#typeOptions").data("kendoComboBox");
                            dropdownlist.select((dataItem) => {
                                return dataItem.name === this.typeOptionSelected();
                            });
                        } else {
                            dropdownlist = $("#typeOptions").data("kendoDropDownList");
                            dropdownlist.select((dataItem) => {
                                return dataItem.text === this.typeOptionSelected();
                            });
                        }
                    });
            });
    }

    populateFiles(): void {
        $.get(App.Routes.WebApi.Agreements.Files.get(this.agreementId), { useTestData: true })
            .done((response: any): void => {
                $.each(response, (i, item) => {
                    this.fileAttachmentClass.files.push(ko.mapping.fromJS({
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
            });
    }

    populateContacts(): void {
        $.get(App.Routes.WebApi.Agreements.Contacts.get(this.agreementId), { useTestData: false })
            .done((response: any): void => {
                ko.mapping.fromJS(response, this.contactClass.contacts)
                this.dfdPopContacts.resolve();
            });

    }
    
    populateUmbrella(): void {
        $.get(App.Routes.WebApi.Agreements.UmbrellaOptions.get(this.agreementId))
            .done((response: any): void => {
                this.uAgreements(response);
                $("#uAgreements").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    optionLabel: "[None - this is a top-level or standalone agreement]",
                    dataSource: new kendo.data.DataSource({
                        data: this.uAgreements()
                    })
                });
                this.dfdUAgreements.resolve();
            });
    }
    
    updateKendoDialog(windowWidth): void {
        $(".k-window").css({
            left: (windowWidth / 2 - ($(".k-window").width() / 2) + 10)
        });
    }

    bindjQueryKendo(result): void {
        var self = this;
        this.isCustomTypeAllowed(result.isCustomTypeAllowed);
        this.isCustomStatusAllowed(result.isCustomStatusAllowed);
        this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
        this.statusOptions.push(new this.selectConstructor("", ""));
        this.typeOptions.push(new this.selectConstructor("", ""));
        for (var i = 0; i < result.statusOptions.length; i++) {
            this.statusOptions.push(new this.selectConstructor(result.statusOptions[i], result.statusOptions[i]));
        };
        this.contactClass.contactTypeOptions.push(new this.selectConstructor("", undefined));
        for (var i = 0; i < result.contactTypeOptions.length; i++) {
            this.contactClass.contactTypeOptions.push(new this.selectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
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
        
        $(".k-window").css({
            position: 'fixed',
            margin: 'auto',
            top: '20px'
        });
                
        //bind scroll to side nav
        $(window).scroll( () => {
            if (this.kendoWindowBug != 0) {
                scrollBody.scrollMyBody(this.kendoWindowBug)
            }
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
            //ie sucks!
            if (!$("body").scrollTop()){
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

        // create Editor from textarea HTML element
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

        this.contactClass.bindJquery();
        this.fileAttachmentClass.bindJquery();
    }

    //get settings for agreements.
    getSettings(): void {
        var url = 'App.Routes.WebApi.Agreements.Settings.get()';
        var agreementSettingsGet;
        $.ajax({
            url: eval(url),
            type: 'GET'
        })
        .done((result) => {
            this.bindjQueryKendo(result);
        })
        .fail(function (xhr) {
            alert('fail: status = ' + xhr.status + ' ' + xhr.statusText + '; message = "' + xhr.responseText + '"');
        });
    }

    //to correctly bind with ko, I had to set visibility to hidden. this removes that and changes it to display none.
    hideOtherGroups(): void {
        $("#allParticipants").css("visibility", "").hide();
        $("#estSearch").css("visibility", "").hide();
        $("#addEstablishment").css("visibility", "").hide();
    }

    removeParticipant(establishmentResultViewModel, e): boolean {
        if (confirm('Are you sure you want to remove "' +
            establishmentResultViewModel.establishmentTranslatedName() +
            '" as a participant from this agreement?')) {
                var self = this;
                if (this.agreementIsEdit()) {
                    var url = App.Routes.WebApi.Agreements.Participants.del(this.agreementId, ko.dataFor(e.target).establishmentId());
                    $.ajax({
                        url: url,
                        type: 'DELETE',
                        success: (): void => {
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
                        error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {// validation message will be in xhr response text...
                            alert(xhr.responseText);
                        }
                    })
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
    }

    addParticipant(establishmentResultViewModel): void {
        this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
        this.hasBoundSearch = true;
    }
    
    SearchPageBind(parentOrParticipant: string): void {
        var $cancelAddParticipant = $("#cancelAddParticipant");
        var $searchSideBarAddNew = $("#searchSideBarAddNew");
        this.establishmentSearchViewModel.detailTooltip = (): string => {
            return 'Choose this establishment as a ' + parentOrParticipant;
        }
        $cancelAddParticipant.off();
        $searchSideBarAddNew.off();
        $searchSideBarAddNew.on("click", (e) => {
            this.establishmentSearchViewModel.sammy.setLocation('#/new/');
            e.preventDefault();
            return false;
        });
        if (parentOrParticipant === "parent") {
            $cancelAddParticipant.on("click", (e) => {
                this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                e.preventDefault();
                return false;
            });
        } else {
            $cancelAddParticipant.on("click", (e) => {
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
            .done(function () {
                $("#estSearch").fadeIn(500);
            });
    }

    //fade non active modules out
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
    }
        
    bindSearch(): void{
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
            //Check the url for changes
            this.establishmentSearchViewModel.sammy.bind("location-changed", () => {
                if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                    var $asideRootSearch = $("#asideRootSearch");
                    var $asideParentSearch = $("#asideParentSearch");
                    if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.editOrNewUrl + "#/new/") > 0) {
                        var $addEstablishment = $("#addEstablishment");
                        var dfd = $.Deferred();
                        var dfd2 = $.Deferred();
                        var $obj = $("#estSearch");
                        var $obj2 = $("#allParticipants");
                        var time = 500;
                        this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                        $.when(dfd, dfd2)
                            .done(() => {
                                $addEstablishment.css("visibility", "").hide().fadeIn(500, () => {
                                    if (!this.hasBoundItem) {
                                        this.establishmentItemViewModel = new Establishments.ViewModels.Item();
                                        this.establishmentItemViewModel.goToSearch = () => {
                                            sessionStorage.setItem("addest", "yes");
                                            this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                        }
                                        this.establishmentItemViewModel.submitToCreate = (formElement: HTMLFormElement): boolean => {
                                            if (!this.establishmentItemViewModel.id || this.establishmentItemViewModel.id === 0) {
                                                var me = this.establishmentItemViewModel;
                                                this.establishmentItemViewModel.validatingSpinner.start();
                                                // reference the single name and url
                                                var officialName: Establishments.ViewModels.Name = this.establishmentItemViewModel.names()[0];
                                                var officialUrl: Establishments.ViewModels.Url = this.establishmentItemViewModel.urls()[0];
                                                var location = this.establishmentItemViewModel.location;
                                                // wait for async validation to stop
                                                if (officialName.text.isValidating() || officialUrl.value.isValidating() ||
                                                    this.establishmentItemViewModel.ceebCode.isValidating() || this.establishmentItemViewModel.uCosmicCode.isValidating()) {
                                                    setTimeout((): boolean => {
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
                                                        $("#addEstablishment").fadeOut(500, () => {
                                                            $("#LoadingPage").fadeIn(500);
                                                            setTimeout(() => {
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
                                        $cancelAddEstablishment.on("click", (e) => {
                                            sessionStorage.setItem("addest", "no");
                                            this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                            e.preventDefault();
                                            return false;
                                        });
                                        this.hasBoundItem = true;
                                    }
                                });
                            })
                        scrollBody.scrollMyBody(0);
                        lastURL = "#/new/";
                    } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.editOrNewUrl + "#/page/") > 0) {
                        if (sessionStorage.getItem("addest") === "yes") {
                            this.establishmentSearchViewModel.clickAction = (context): boolean => {
                                this.establishmentItemViewModel.parentEstablishment(context);
                                this.establishmentItemViewModel.parentId(context.id());
                                this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                                return false;
                            }
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
                            this.establishmentSearchViewModel.clickAction = (context): boolean => {
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
                                        url: App.Routes.WebApi.Agreements.Participants.isOwner(myParticipant.establishmentId()),
                                        type: 'GET',
                                        async: false
                                    })
                                    .done((response) => {
                                        myParticipant.isOwner(response);
                                        if (this.agreementIsEdit()) {
                                            var url = App.Routes.WebApi.Agreements.Participants.put(this.agreementId, myParticipant.establishmentId());
                                            $.ajax({
                                                type: 'PUT',
                                                url: url,
                                                data: myParticipant,
                                                success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                                                    this.participants.push(myParticipant);
                                                },
                                                error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                                                    alert(xhr.responseText);
                                                }
                                            });
                                        } else {
                                            this.participants.push(myParticipant);
                                        }
                                        this.establishmentSearchViewModel.sammy.setLocation("agreements/" + this.editOrNewUrl + "");
                                        $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));
                                    })
                                    .fail(() => {
                                        if (this.agreementIsEdit()) {
                                            var url = App.Routes.WebApi.Agreements.Participants.put(this.agreementId, myParticipant.establishmentId());
                                            $.ajax({
                                                type: 'PUT',
                                                url: url,
                                                data: myParticipant,
                                                success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                                                    this.participants.push(myParticipant);
                                                },
                                                error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                                                    alert(xhr.responseText);
                                                }
                                            });
                                        } else {
                                            this.participants.push(myParticipant);
                                        }
                                        this.establishmentSearchViewModel.sammy.setLocation("agreements/" + this.editOrNewUrl + "");
                                    });
                                } else {
                                    alert("This Participant has already been added.")
                                }
                                return false;
                            }
                        }
                        scrollBody.scrollMyBody(0);
                        lastURL = "#/page/";
                    } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("agreements/" + this.editOrNewUrl + "") > 0) {
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
                            .done(() => {
                                $("#allParticipants").fadeIn(500).promise().done(() => {
                                    $(this).show();
                                    scrollBody.scrollMyBody(0);
                                    this.dfdPageFadeIn.resolve();
                                });
                            });
                    } else {
                        window.location.replace(this.establishmentSearchViewModel.sammy.getLocation());
                    }
                }
            });
            this.establishmentSearchViewModel.sammy.run();
        }
    }
           
    private _setupValidation(): void {
        ko.validation.rules['greaterThan'] = {
            validator: function (val, otherVal) {
                if (otherVal() == undefined) {
                    return true;
                } else {
                    return Globalize.parseDate(val) > Globalize.parseDate(otherVal())
                }
            },
            message: 'The field must be greater than start date'
        }
        ko.validation.rules.date.validator = function (value, validate) {
            return !value.length || (validate && Globalize.parseDate(value) != null);
        }

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
            })
        });
    }
    
    //post files
    postMe(data, url): void {
        $.post(url, data)
            .done((response: any, statusText: string, xhr: JQueryXHR): void => {
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

    //part of save agreement
    agreementPostFiles(response: any, statusText: string, xhr: JQueryXHR): void {
        var tempUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId);

        $.each(this.fileAttachmentClass.files(), (i, item) => {
            var data = ko.mapping.toJS({
                agreementId: item.agreementId,
                uploadGuid: item.guid,
                originalName: item.guid,
                extension: item.extension,
                customName: item.customName,
                visibility: item.visibility
            })
            this.postMe(data, tempUrl);
        });
        this.spinner.stop();
    }

    //part of save agreement
    agreementPostContacts(response: any, statusText: string, xhr: JQueryXHR): void {
        var tempUrl = App.Routes.WebApi.Agreements.Contacts.post(this.agreementId);

        $.each(this.contactClass.contacts(), (i, item) => {
            var data = {
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
    }
    
    saveUpdateAgreement(): void {
        var offset;
        // validate in this order to put scroll in right place
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
            //ie sucks!
            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(offset.top - 20);
            } else {
               $("body").scrollTop(offset.top - 20);
            }
        } else {
            var url;
            var $LoadingPage = $("#LoadingPage").find("strong")
            var editor = $("#agreementContent").data("kendoEditor");
            this.spinner.start();
            //ie sucks!
            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(0);
            } else {
                $("body").scrollTop(0);
            }
            var $LoadingPage = $("#LoadingPage").find("strong")
            $LoadingPage.text("Saving agreement...");
            $("#allParticipants").show().fadeOut(500, function ()  {
                $("#LoadingPage").hide().fadeIn(500);
            });

            $.each(this.participants(), (i, item) => {
                this.participantsExport.push({
                    agreementId: item.agreementId,
                    establishmentId: item.establishmentId,
                    establishmentOfficialName: item.establishmentOfficialName,
                    establishmentTranslatedName: item.establishmentTranslatedName,
                    isOwner: item.isOwner,
                    center: item.center
                });
            });
            var myAutoRenew = null;
            if (this.autoRenew()== 0) {
                myAutoRenew = false;
            } else if (this.autoRenew() == 1) {
                myAutoRenew = true;
            }

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
            })
            if (this.agreementIsEdit()) {
                url = App.Routes.WebApi.Agreements.put(this.agreementId);
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                        $LoadingPage.text("Agreement Saved...");
                        setTimeout(function () {
                            $("#LoadingPage").show().fadeOut(500, function () {
                                $("#allParticipants").hide().fadeIn(500);
                            });
                        }, 5000);
                    },
                    error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
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
                    }
                });
            } else {
                url = App.Routes.WebApi.Agreements.post();
                $.post(url, data)
                    .done((response: any, statusText: string, xhr: JQueryXHR): void => {
                        var myUrl = xhr.getResponseHeader('Location');
                        this.agreementId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                        this.agreementPostFiles(response, statusText, xhr);
                        this.agreementPostContacts(response, statusText, xhr);
                        //change url to edit
                        $LoadingPage.text("Agreement Saved...");
                        setTimeout(function ()  {
                            if (xhr != undefined) {
                                window.location.hash = ""
                                window.location.href = "/agreements/" + xhr.getResponseHeader('Location').substring(xhr.getResponseHeader('Location').lastIndexOf("/") + 1) + "/edit/"
                                }
                            else {
                                alert("success, but no location")
                            }
                        }, 5000);
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
        }
    }
}

