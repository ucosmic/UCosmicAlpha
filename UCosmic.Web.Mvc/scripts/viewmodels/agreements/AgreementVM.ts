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
/// <reference path="./populateFiles.ts" />
/// <reference path="./basicInfo.ts" />
/// <reference path="./establishmentSearchNav.ts" />

//class SelectConstructor{
//    constructor(public name: string, public id: string) {
//        this.name = name;
//        this.id = id;
//    }
//}

class InstitutionalAgreementEditModel {
    constructor(public agreementId: number) {
        $("table.data").children("tbody").addClass("searchResults");
        var culture = $("meta[name='accept-language']").attr("content");
        this.scrollBody = new ScrollBody.Scroll("participants","basic_info",
            "effective_dates_current_status", "contacts", "file_attachments", "overall_visibility", null, null, null,
            null, this.kendoWindowBug);
        this.establishmentSearchNav = new Agreements.EstablishmentSearchNav(this.editOrNewUrl,
            this.participants, this.agreementIsEdit, this.agreementId, this.scrollBody, this.deferredPageFadeIn);
        this.participants = new Agreements.Participants(this.agreementId, this.deferredPopParticipants,
            this.agreementIsEdit, this.establishmentSearchNav.establishmentSearchViewModel,
            this.establishmentSearchNav.hasBoundSearch);
        this.establishmentSearchNav.participants = this.participants;
        ko.applyBindings(this.participants, $('#participants')[0]);
        this.basicInfo = new Agreements.BasicInfo(this.agreementId, this.deferredUAgreements);
        ko.applyBindings(this.basicInfo, $('#basic_info')[0]);
        this.contact = new Agreements.Contacts(this.basicInfo.isCustomContactTypeAllowed,
            this.establishmentSearchNav.establishmentItemViewModel, this.agreementIsEdit, this.agreementId,
            this.kendoWindowBug, this.deferredPopContacts);
        ko.applyBindings(this.contact, $('#contacts')[0]);

        this.fileListPopulator = new Agreements.FileListPopulator();
        //ko.applyBindings(this.populateFiles, $('file_attachments')[0]); 
        this.fileAttachment = new Agreements.FileAttachments(this.agreementId, this.agreementIsEdit,
            this.spinner, this.establishmentSearchNav.establishmentItemViewModel, this.fileListPopulator.files);
        ko.applyBindings(this.fileAttachment, $('#file_attachments')[0]);
        this.datesStatus = new Agreements.DatesStatus(this.basicInfo.isCustomStatusAllowed);
        ko.applyBindings(this.datesStatus, $('#effective_dates_current_status')[0]);
        this.visibility = new Agreements.Visibility();
        ko.applyBindings(this.visibility, $('#overall_visibility')[0]);     

        if (this.agreementId === 0) {
            Globalize.culture(culture)
            this.editOrNewUrl.val = "new/";
            this.agreementIsEdit(false);
            this.visibility.visibility("Public");
            $("#Loading_page").hide();
            this.participants.populateParticipants();
            $.when(this.deferredPageFadeIn, this.deferredPopParticipants)
                .done(() => {
                    this._updateKendoDialog($(window).width());
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * this.percentOffBodyHeight)));
                });
        } else {
            this.percentOffBodyHeight = .2;
            //this.editOrNewUrl.val = window.location.href.toLowerCase().substring(window.location.href.toLowerCase().indexOf("agreements/") + 11);
            this.editOrNewUrl.val = agreementId + "/edit/"//this.editOrNewUrl.val.substring(0, this.editOrNewUrl.val.indexOf("/edit") + 5) + "/";
            this.agreementIsEdit(true);
            //this.agreementId = parseInt(this.editOrNewUrl.val.substring(0, this.editOrNewUrl.val.indexOf("/")));
            this.participants.populateParticipants();
            this.fileListPopulator.populate(this.agreementId, this.deferredPopFiles);
            this.contact.populateContacts();
            Globalize.culture(culture)
            this._populateAgreementData();
            $("#Loading_page").hide();
            $.when(this.deferredPopContacts, this.deferredPopFiles, this.deferredPopParticipants, this.deferredPageFadeIn)
                .done(() => {
                    this._updateKendoDialog($(window).width());
                    $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * this.percentOffBodyHeight)));
                });
        }
        
        this.isBound(true);
        this.basicInfo.populateUmbrella();
        this.establishmentSearchNav.bindSearch();
        this._getSettings();

        $(window).resize(() => {
            this._updateKendoDialog($(window).width());
        });
        this._hideOtherGroups();
    }

    //imported class instances
    participants;
    basicInfo;
    contact;
    fileAttachment;
    datesStatus;
    visibility;
    establishmentSearchNav;
    scrollBody;
    fileListPopulator;

    percentOffBodyHeight = .6;
    //jquery defered for setting body height.
    deferredUAgreements = $.Deferred();
    deferredPopParticipants = $.Deferred();
    deferredPopContacts = $.Deferred();
    deferredPopFiles = $.Deferred();
    deferredPageFadeIn = $.Deferred();

    agreementIsEdit = ko.observable();
    //agreementId = { val: 0 };

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

    //agreements.SelectConstructor = function (name: string, id: string) {
    //    this.name = name;
    //    this.id = id;
    //}

    //to correctly bind with ko, must set visibility to hidden. this removes the visibility to hidden and 
    //changes it to display none.
    private _hideOtherGroups(): void {
        $("[data-current-module='agreements']").css("visibility", "").hide();
        $("#establishment_search").css("visibility", "").hide();
        $("#add_establishment").css("visibility", "").hide();
    }

    officialNameDoesNotMatchTranslation = ko.computed(function () {
        return !(this.participants.establishmentOfficialName === this.participants.establishmentTranslatedName);
    });
    
    private _populateAgreementData(): void {
        $.when(this.deferredUAgreements)
            .done(() => {
                $.get(App.Routes.WebApi.Agreements.get(this.agreementId))
                    .done((response: any): void => {
                        var dropdownlist,
                            editor = $("#agreement_content").data("kendoEditor");


                        //editor.value(response.content);
                        this.basicInfo.content(response.content);
                        this.datesStatus.expDate(Globalize.format(new Date(response.expiresOn.substring(0, response.expiresOn.lastIndexOf("T"))), 'd'));
                        this.datesStatus.startDate(Globalize.format(new Date(response.startsOn.substring(0, response.startsOn.lastIndexOf("T"))), 'd'));
                        if (response.isAutoRenew == null) {
                            this.datesStatus.autoRenew(2);
                        } else {
                            this.datesStatus.autoRenew(response.isAutoRenew);
                        };
                        this.basicInfo.nickname(response.name);
                        this.basicInfo.privateNotes(response.notes);
                        this.visibility.visibility(response.visibility);
                        this.datesStatus.isEstimated(response.isExpirationEstimated);
                        ko.mapping.fromJS(response.participants, this.participants.participants);
                        this.deferredPopParticipants.resolve();
                        this.basicInfo.uAgreementSelected(response.umbrellaId);
                        dropdownlist = $("#umbrella_agreements").data("kendoDropDownList");
                        dropdownlist.select((dataItem) => {
                            return dataItem.value == this.basicInfo.uAgreementSelected();
                        });
                        this.datesStatus.statusOptionSelected(response.status);
                        if (this.basicInfo.isCustomStatusAllowed()) {
                            dropdownlist = $("#status_options").data("kendoComboBox");
                            dropdownlist.select((dataItem) => {
                                return dataItem.name === this.datesStatus.statusOptionSelected();
                            });
                            if (dropdownlist.selectedIndex === -1) {
                                dropdownlist.dataSource.add({ name: this.datesStatus.statusOptionSelected() });
                                dropdownlist.select(dropdownlist.dataSource.length);
                            }
                        } else {
                            dropdownlist = $("#status_options").data("kendoDropDownList");
                            dropdownlist.select((dataItem) => {
                                return dataItem.text === this.datesStatus.statusOptionSelected();
                            });
                        }
                        this.basicInfo.typeOptionSelected(response.type);
                        if (this.basicInfo.isCustomTypeAllowed()) {
                            dropdownlist = $("#type_options").data("kendoComboBox");
                            dropdownlist.select((dataItem) => {
                                return dataItem.name === this.basicInfo.typeOptionSelected();
                            });
                            if (dropdownlist.selectedIndex === -1) {
                                dropdownlist.dataSource.add({ name: this.basicInfo.typeOptionSelected() });
                                dropdownlist.select(dropdownlist.dataSource.length);
                            }
                        } else {
                            dropdownlist = $("#type_options").data("kendoDropDownList");
                            dropdownlist.select((dataItem) => {
                                return dataItem.text === this.basicInfo.typeOptionSelected();
                            });
                        }
                    });
            });
    }
            
    private _updateKendoDialog(windowWidth): void {
        $(".k-window").css({
            left: (windowWidth / 2 - ($(".k-window").width() / 2) + 10)
        });
    }

    private _bindjQueryKendo(result): void {
        var self = this;

        this.basicInfo.isCustomTypeAllowed(result.isCustomTypeAllowed);
        this.basicInfo.isCustomStatusAllowed(result.isCustomStatusAllowed);
        this.basicInfo.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
        this.datesStatus.statusOptions.push(new Agreements.SelectConstructor("", ""));
        for (var i = 0, j = result.statusOptions.length; i < j; i++) {
            this.datesStatus.statusOptions.push(new Agreements.SelectConstructor(result.statusOptions[i], result.statusOptions[i]));
        };
        this.contact.contactTypeOptions.push(new Agreements.SelectConstructor("", undefined));
        for (var i = 0, j = result.contactTypeOptions.length; i < j; i++) {
            this.contact.contactTypeOptions.push(new Agreements.SelectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
        };
        this.basicInfo.typeOptions.push(new Agreements.SelectConstructor("", ""));
        for (var i = 0, j = result.typeOptions.length; i < j; i++) {
            this.basicInfo.typeOptions.push(new Agreements.SelectConstructor(result.typeOptions[i], result.typeOptions[i]));
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
        // create Editor from textarea HTML element
        $("#agreement_content").kendoEditor({
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
        this.basicInfo.bindJquery();
        this.contact.bindJquery();
        this.fileAttachment.bindJquery();
        this.datesStatus.bindJquery();
        this.scrollBody.bindJquery();
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
            this._bindjQueryKendo(result);
        })
        .fail(function (xhr) {
            alert('fail: status = ' + xhr.status + ' ' + xhr.statusText + '; message = "' + xhr.responseText + '"');
        });
    }
            
    saveUpdateAgreement(): void {
        var offset;

        // validate in this order to put scroll in right place
        if (!this.datesStatus.validateEffectiveDatesCurrentStatus.isValid()) {
            offset = $("#effective_dates_current_status").offset();
            this.datesStatus.validateEffectiveDatesCurrentStatus.errors.showAllMessages(true);
            $("#nav_effective_dates_current_status").closest("ul").find("li").removeClass("current");
            $("#nav_effective_dates_current_status").addClass("current");
        }
        if (!this.basicInfo.validateBasicInfo.isValid()) {
            offset = $("#basic_info").offset();
            this.basicInfo.validateBasicInfo.errors.showAllMessages(true);
            $("#nav_basic_info").closest("ul").find("li").removeClass("current");
            $("#nav_basic_info").addClass("current");
        }
        $("#participants_error_msg").show();
        if (this.participants.participantsShowErrorMsg()) {
            offset = $("#participants").offset();
            $("#nav_participants").closest("ul").find("li").removeClass("current");
            $("#nav_participants").addClass("current");
        } 
        if (offset != undefined) {
            //ie sucks!
            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(offset.top - 20);
            } else {
               $("body").scrollTop(offset.top - 20);
            }
        } else {
            var url,
                $LoadingPage = $("#Loading_page").find("strong"),
                editor = $("#agreement_content").data("kendoEditor"),
                $LoadingPage = $("#Loading_page").find("strong"),
                myAutoRenew = null,
                data;

            this.spinner.start();
            //ie sucks!
            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(0);
            } else {
                $("body").scrollTop(0);
            }

            $.each(this.participants.participants(), (i, item) => {
                this.participants.participantsExport.push({
                    agreementId: item.agreementId,
                    establishmentId: item.establishmentId,
                    establishmentOfficialName: item.establishmentOfficialName,
                    establishmentTranslatedName: item.establishmentTranslatedName,
                    isOwner: item.isOwner,
                    center: item.center
                });
            });
            if (this.datesStatus.autoRenew()== 0) {
                myAutoRenew = false;
            } else if (this.datesStatus.autoRenew() == 1) {
                myAutoRenew = true;
            }
            this.basicInfo.content(editor.value());
            data = ko.mapping.toJS({
                content: this.basicInfo.content(),
                expiresOn: this.datesStatus.expDate(),
                startsOn: this.datesStatus.startDate(),
                isAutoRenew: myAutoRenew,
                name: this.basicInfo.nickname(),
                notes: this.basicInfo.privateNotes(),
                status: this.datesStatus.statusOptionSelected(),
                visibility: this.visibility.visibility(),
                isExpirationEstimated: this.datesStatus.isEstimated(),
                participants: this.participants.participantsExport,
                umbrellaId: (this.basicInfo.uAgreementSelected() != 0) ? this.basicInfo.uAgreementSelected() : undefined ,
                type: this.basicInfo.typeOptionSelected()
            })
            if (this.agreementIsEdit()) {
                $LoadingPage.text("Saving changes...");

                $("[data-current-module='agreements']").show().fadeOut(500, function () {
                    $("#Loading_page").hide().fadeIn(500);
                });
                url = App.Routes.WebApi.Agreements.put(this.agreementId);
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                        $LoadingPage.text("Agreement Saved...");
                        setTimeout(function () {
                            $("#Loading_page").show().fadeOut(500, function () {
                                $("[data-current-module='agreements']").hide().fadeIn(500);
                            });
                        }, 5000);
                    },
                    error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                        this.spinner.stop();
                        if (xhr.status === 400) { // validation message will be in xhr response text...
                            this.establishmentSearchNav.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                                .html(xhr.responseText.replace('\n', '<br /><br />'));
                            this.establishmentSearchNav.establishmentItemViewModel.$genericAlertDialog.dialog({
                                title: 'Alert Message',
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    'Ok': (): void => { this.establishmentSearchNav.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
                                }
                            });
                        }
                    }
                });
            } else {
                $LoadingPage.text("Saving agreement...");

                $("[data-current-module='agreements']").show().fadeOut(500, function () {
                    $("#Loading_page").hide().fadeIn(500);
                });
                url = App.Routes.WebApi.Agreements.post();
                $.post(url, data)
                    .done((response: any, statusText: string, xhr: JQueryXHR): void => {
                        var myUrl = xhr.getResponseHeader('Location');

                        this.agreementId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                        this.fileAttachment.agreementId = this.agreementId;
                        this.contact.agreementId = this.agreementId;
                        this.fileAttachment.agreementPostFiles(response, statusText, xhr);
                        this.contact.agreementPostContacts(response, statusText, xhr);
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
                            this.establishmentSearchNav.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                                .html(xhr.responseText.replace('\n', '<br /><br />'));
                            this.establishmentSearchNav.establishmentItemViewModel.$genericAlertDialog.dialog({
                                title: 'Alert Message',
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    'Ok': (): void => { this.establishmentSearchNav.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
                                }
                            });
                        }
                    });
            }
        }
    }
}

