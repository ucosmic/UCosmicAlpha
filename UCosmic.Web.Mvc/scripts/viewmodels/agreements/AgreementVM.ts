/// <reference path="../../app/Spinner.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/globalize/globalize.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
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
/// <reference path="./datesStatus.ts" />
/// <reference path="./visibility.ts" />
/// <reference path="./participants.ts" />
/// <reference path="./basicInfo.ts" />
/// <reference path="./establishmentSearchNav.ts" />

class InstitutionalAgreementEditModel {
    constructor(public initDefaultPageRoute: boolean = true) {

        this.establishmentSearchNavClass = new agreements.establishmentSearchNav(this.editOrNewUrl, this.participantsClass, this.agreementIsEdit, this.agreementId, scrollBody, this.dfdPageFadeIn);

        this.participantsClass = new agreements.participants(this.agreementId, this.dfdPopParticipants, this.agreementIsEdit, this.establishmentSearchNavClass.establishmentSearchViewModel, this.establishmentSearchNavClass.hasBoundSearch);
        this.establishmentSearchNavClass.participantsClass = this.participantsClass;
        ko.applyBindings(this.participantsClass, $('#participants')[0]);
        this.basicInfoClass = new agreements.basicInfo(this.agreementId, this.dfdUAgreements);
        ko.applyBindings(this.basicInfoClass, $('#basicInfo')[0]);
        this.contactClass = new agreements.contacts(this.basicInfoClass.isCustomContactTypeAllowed, this.establishmentSearchNavClass.establishmentItemViewModel, this.agreementIsEdit, this.agreementId, this.kendoWindowBug, this.dfdPopContacts);
        ko.applyBindings(this.contactClass, $('#contacts')[0]);
        this.fileAttachmentClass = new agreements.fileAttachments(this.agreementId, this.agreementIsEdit, this.spinner, this.establishmentSearchNavClass.establishmentItemViewModel, this.dfdPopFiles);
        ko.applyBindings(this.fileAttachmentClass, $('#fileAttachments')[0]);
        this.datesStatusClass = new agreements.datesStatus(this.basicInfoClass.isCustomStatusAllowed);
        ko.applyBindings(this.datesStatusClass, $('#effectiveDatesCurrentStatus')[0]);
        this.visibilityClass = new agreements.visibility();
        ko.applyBindings(this.visibilityClass, $('#overallVisibility')[0]);        

        var culture = $("meta[name='accept-language']").attr("content");
        if (window.location.href.toLowerCase().indexOf("agreements/new") > 0) {
            Globalize.culture(culture)
            this.editOrNewUrl.val = "new/";
            this.agreementIsEdit(false);
            this.visibilityClass.visibility("Public");
            $("#LoadingPage").hide();
            this.participantsClass.populateParticipants();
            $.when(this.dfdPageFadeIn, this.dfdPopParticipants)
                .done(() => {
                    this.updateKendoDialog($(window).width());
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * this.percentOffBodyHeight)));
                });
        } else {
            this.percentOffBodyHeight = .2;
            this.editOrNewUrl.val = window.location.href.toLowerCase().substring(window.location.href.toLowerCase().indexOf("agreements/") + 11);
            this.editOrNewUrl.val = this.editOrNewUrl.val.substring(0, this.editOrNewUrl.val.indexOf("/edit") + 5) + "/";
            this.agreementIsEdit(true);
            this.agreementId.val = parseInt(this.editOrNewUrl.val.substring(0, this.editOrNewUrl.val.indexOf("/")));
            this.participantsClass.populateParticipants();
            this.fileAttachmentClass.populateFiles();
            this.contactClass.populateContacts();
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

        this.basicInfoClass.populateUmbrella();
        this.hideOtherGroups();
        this.establishmentSearchNavClass.bindSearch();
        this.getSettings();

        $(window).resize(() => {
            this.updateKendoDialog($(window).width());
        });
    }

    selectConstructor = function (name: string, id: string) {
        this.name = name;
        this.id = id;
    }

    //module classes
    participantsClass;
    basicInfoClass;
    contactClass;
    fileAttachmentClass;
    datesStatusClass;
    visibilityClass;
    establishmentSearchNavClass;

    percentOffBodyHeight = .6;
    //jquery defered for setting body height.
    dfdUAgreements = $.Deferred();
    dfdPopParticipants = $.Deferred();
    dfdPopContacts = $.Deferred();
    dfdPopFiles = $.Deferred();
    dfdPageFadeIn = $.Deferred();

    agreementIsEdit = ko.observable();
    agreementId = { val: 0 };

    //set the path for editing an agreement or new agreement.
    editOrNewUrl = { val: 'new' };
    trail: KnockoutObservableArray<string> = ko.observableArray([]);
    nextForceDisabled: KnockoutObservable<boolean> = ko.observable(false);
    prevForceDisabled: KnockoutObservable<boolean> = ko.observable(false);
    pageNumber: KnockoutObservable<number> = ko.observable();
    $genericAlertDialog: JQuery = undefined;

    //added this because kendo window after selecting a autocomplte and then clicking the window, 
    //the body would scroll to the top.
    kendoWindowBug = { val: 0 };
        
    isBound = ko.observable();
    spinner: App.Spinner = new App.Spinner(new App.SpinnerOptions(400, true));

    //to correctly bind with ko, must set visibility to hidden. this removes the visibility to hidden and 
    //changes it to display none.
    hideOtherGroups(): void {
        $("#allParticipants").css("visibility", "").hide();
        $("#estSearch").css("visibility", "").hide();
        $("#addEstablishment").css("visibility", "").hide();
    }

    officialNameDoesNotMatchTranslation = ko.computed(function () {
        return !(this.participants.establishmentOfficialName === this.participants.establishmentTranslatedName);
    });
    
    populateAgreementData(): void {
        $.when(this.dfdUAgreements)
            .done(() => {
                $.get(App.Routes.WebApi.Agreements.get(this.agreementId.val))
                    .done((response: any): void => {
                        var dropdownlist;
                        var editor = $("#agreementContent").data("kendoEditor");

                        editor.value(response.content);
                        this.basicInfoClass.content(response.content);
                        this.datesStatusClass.expDate(Globalize.format(new Date(response.expiresOn.substring(0, response.expiresOn.lastIndexOf("T"))), 'd'));
                        this.datesStatusClass.startDate(Globalize.format(new Date(response.startsOn.substring(0, response.startsOn.lastIndexOf("T"))), 'd'));
                        if (response.isAutoRenew == null) {
                            this.datesStatusClass.autoRenew(2);
                        } else {
                            this.datesStatusClass.autoRenew(response.isAutoRenew);
                        };

                        this.basicInfoClass.nickname(response.name);
                        this.basicInfoClass.privateNotes(response.notes);
                        this.visibilityClass.visibility(response.visibility);
                        this.datesStatusClass.isEstimated(response.isExpirationEstimated);
                        ko.mapping.fromJS(response.participants, this.participantsClass.participants);
                        this.dfdPopParticipants.resolve();
                        this.basicInfoClass.uAgreementSelected(response.umbrellaId);

                        dropdownlist = $("#uAgreements").data("kendoDropDownList");
                        dropdownlist.select((dataItem) => {
                            return dataItem.value == this.basicInfoClass.uAgreementSelected();
                        });

                        this.datesStatusClass.statusOptionSelected(response.status);
                        if (this.basicInfoClass.isCustomStatusAllowed()) {
                            dropdownlist = $("#statusOptions").data("kendoComboBox");
                            dropdownlist.select((dataItem) => {
                                return dataItem.name === this.datesStatusClass.statusOptionSelected();
                            });
                        } else {
                            dropdownlist = $("#statusOptions").data("kendoDropDownList");
                            dropdownlist.select((dataItem) => {
                                return dataItem.text === this.datesStatusClass.statusOptionSelected();
                            });
                        }

                        this.basicInfoClass.typeOptionSelected(response.type);
                        if (this.basicInfoClass.isCustomTypeAllowed()) {
                            dropdownlist = $("#typeOptions").data("kendoComboBox");
                            dropdownlist.select((dataItem) => {
                                return dataItem.name === this.basicInfoClass.typeOptionSelected();
                            });
                        } else {
                            dropdownlist = $("#typeOptions").data("kendoDropDownList");
                            dropdownlist.select((dataItem) => {
                                return dataItem.text === this.basicInfoClass.typeOptionSelected();
                            });
                        }
                    });
            });
    }
            
    updateKendoDialog(windowWidth): void {
        $(".k-window").css({
            left: (windowWidth / 2 - ($(".k-window").width() / 2) + 10)
        });
    }

    bindjQueryKendo(result): void {
        var self = this;
        this.basicInfoClass.isCustomTypeAllowed(result.isCustomTypeAllowed);
        this.basicInfoClass.isCustomStatusAllowed(result.isCustomStatusAllowed);
        this.basicInfoClass.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
        this.datesStatusClass.statusOptions.push(new this.selectConstructor("", ""));
        for (var i = 0; i < result.statusOptions.length; i++) {
            this.datesStatusClass.statusOptions.push(new this.selectConstructor(result.statusOptions[i], result.statusOptions[i]));
        };
        this.contactClass.contactTypeOptions.push(new this.selectConstructor("", undefined));
        for (var i = 0; i < result.contactTypeOptions.length; i++) {
            this.contactClass.contactTypeOptions.push(new this.selectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
        };
        this.basicInfoClass.typeOptions.push(new this.selectConstructor("", ""));
        for (var i = 0; i < result.typeOptions.length; i++) {
            this.basicInfoClass.typeOptions.push(new this.selectConstructor(result.typeOptions[i], result.typeOptions[i]));
        };
        
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
            if (this.kendoWindowBug.val != 0) {
                scrollBody.scrollMyBody(this.kendoWindowBug.val)
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

        this.basicInfoClass.bindJquery();
        this.contactClass.bindJquery();
        this.fileAttachmentClass.bindJquery();
        this.datesStatusClass.bindJquery();
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
            
    saveUpdateAgreement(): void {
        var offset;
        // validate in this order to put scroll in right place
        if (!this.datesStatusClass.validateEffectiveDatesCurrentStatus.isValid()) {
            offset = $("#effectiveDatesCurrentStatus").offset();
            this.datesStatusClass.validateEffectiveDatesCurrentStatus.errors.showAllMessages(true);
            $("#navEffectiveDatesCurrentStatus").closest("ul").find("li").removeClass("current");
            $("#navEffectiveDatesCurrentStatus").addClass("current");
        }
        if (!this.basicInfoClass.validateBasicInfo.isValid()) {
            offset = $("#basicInfo").offset();
            this.basicInfoClass.validateBasicInfo.errors.showAllMessages(true);
            $("#navValidateBasicInfo").closest("ul").find("li").removeClass("current");
            $("#navValidateBasicInfo").addClass("current");
        }
        $("#participantsErrorMsg").show();
        if (this.participantsClass.participantsShowErrorMsg()) {
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

            $.each(this.participantsClass.participants(), (i, item) => {
                this.participantsClass.participantsExport.push({
                    agreementId: item.agreementId,
                    establishmentId: item.establishmentId,
                    establishmentOfficialName: item.establishmentOfficialName,
                    establishmentTranslatedName: item.establishmentTranslatedName,
                    isOwner: item.isOwner,
                    center: item.center
                });
            });
            var myAutoRenew = null;
            if (this.datesStatusClass.autoRenew()== 0) {
                myAutoRenew = false;
            } else if (this.datesStatusClass.autoRenew() == 1) {
                myAutoRenew = true;
            }

            this.basicInfoClass.content(editor.value());

            var data = ko.mapping.toJS({
                content: this.basicInfoClass.content(),
                expiresOn: this.datesStatusClass.expDate(),
                startsOn: this.datesStatusClass.startDate(),
                isAutoRenew: myAutoRenew,
                name: this.basicInfoClass.nickname(),
                notes: this.basicInfoClass.privateNotes(),
                status: this.datesStatusClass.statusOptionSelected(),
                visibility: this.visibilityClass.visibility(),
                isExpirationEstimated: this.datesStatusClass.isEstimated(),
                participants: this.participantsClass.participantsExport,
                umbrellaId: this.basicInfoClass.uAgreementSelected(),
                type: this.basicInfoClass.typeOptionSelected()
            })
            if (this.agreementIsEdit()) {
                url = App.Routes.WebApi.Agreements.put(this.agreementId.val);
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
                            this.establishmentSearchNavClass.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                                .html(xhr.responseText.replace('\n', '<br /><br />'));
                            this.establishmentSearchNavClass.establishmentItemViewModel.$genericAlertDialog.dialog({
                                title: 'Alert Message',
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    'Ok': (): void => { this.establishmentSearchNavClass.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
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
                        this.agreementId.val = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                        this.fileAttachmentClass.agreementPostFiles(response, statusText, xhr);
                        this.contactClass.agreementPostContacts(response, statusText, xhr);
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
                            this.establishmentSearchNavClass.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                                .html(xhr.responseText.replace('\n', '<br /><br />'));
                            this.establishmentSearchNavClass.establishmentItemViewModel.$genericAlertDialog.dialog({
                                title: 'Alert Message',
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    'Ok': (): void => { this.establishmentSearchNavClass.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
                                }
                            });
                        }
                    });
            }
        }
    }
}

