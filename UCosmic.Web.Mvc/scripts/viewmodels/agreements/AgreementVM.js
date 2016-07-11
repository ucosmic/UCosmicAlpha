var InstitutionalAgreementEditModel = (function () {
    function InstitutionalAgreementEditModel(agreementId) {
        var _this = this;
        this.agreementId = agreementId;
        this.percentOffBodyHeight = .6;
        this.runningAjax = false;
        this.deferredUAgreements = $.Deferred();
        this.deferredPopParticipants = $.Deferred();
        this.deferredPopContacts = $.Deferred();
        this.deferredPopFiles = $.Deferred();
        this.deferredPageFadeIn = $.Deferred();
        this.agreementIsEdit = ko.observable();
        this.editOrNewUrl = { val: 'new' };
        this.trail = ko.observableArray([]);
        this.nextForceDisabled = ko.observable(false);
        this.prevForceDisabled = ko.observable(false);
        this.pageNumber = ko.observable();
        this.$genericAlertDialog = undefined;
        this.deleteErrorMessage = ko.observable('');
        this.kendoWindowBug = { val: 0 };
        this.isBound = ko.observable();
        this.spinner = new App.Spinner({ delay: 400, runImmediately: true, });
        this.officialNameDoesNotMatchTranslation = ko.computed(function () {
            return !(this.participants.establishmentOfficialName === this.participants.establishmentTranslatedName);
        });
        $("table.data").children("tbody").addClass("searchResults");
        var culture = $("meta[name='accept-language']").attr("content");
        this.scrollBody = new ScrollBody.Scroll({
            bindTo: "[data-current-module=agreements]",
            section1: "participants",
            section2: "basic_info",
            section3: "effective_dates_current_status",
            section4: "contacts",
            section5: "file_attachments",
            section6: "overall_visibility",
            kendoWindowBug: this.kendoWindowBug
        });
        this.establishmentSearchNav = new Agreements.EstablishmentSearchNav(this.editOrNewUrl, this.participants, this.agreementIsEdit, this.agreementId, this.scrollBody, this.deferredPageFadeIn);
        this.participants = new Agreements.Participants(this.agreementId, this.deferredPopParticipants, this.agreementIsEdit, this.establishmentSearchNav.establishmentSearchViewModel, this.establishmentSearchNav.hasBoundSearch);
        this.establishmentSearchNav.participants = this.participants;
        this.basicInfo = new Agreements.BasicInfo(this.agreementId, this.deferredUAgreements);
        ko.applyBindings(this.basicInfo, $('#basic_info')[0]);
        this.contact = new Agreements.Contacts(this.basicInfo.isCustomContactTypeAllowed, this.establishmentSearchNav.establishmentItemViewModel, this.agreementIsEdit, this.agreementId, this.kendoWindowBug, this.deferredPopContacts);
        ko.applyBindings(this.contact, $('#contacts')[0]);
        this.fileListPopulator = new Agreements.FileListPopulator();
        this.fileAttachment = new Agreements.FileAttachments(this.agreementId, this.agreementIsEdit, this.spinner, this.establishmentSearchNav.establishmentItemViewModel, this.fileListPopulator.files);
        ko.applyBindings(this.fileAttachment, $('#file_attachments')[0]);
        this.datesStatus = new Agreements.DatesStatus(this.basicInfo.isCustomStatusAllowed);
        ko.applyBindings(this.datesStatus, $('#effective_dates_current_status')[0]);
        this.visibility = new Agreements.Visibility();
        ko.applyBindings(this.visibility, $('#overall_visibility')[0]);
        this._getSettings();
        if (this.agreementId === 0) {
            Globalize.culture(culture);
            this.editOrNewUrl.val = "new/";
            this.agreementIsEdit(false);
            this.visibility.visibility("Public");
            $("#Loading_page").hide();
            this.participants.populateParticipants();
            $.when(this.deferredPageFadeIn, this.deferredPopParticipants)
                .done(function () {
                ko.applyBindings(_this.participants, $('#participants')[0]);
                _this._updateKendoDialog($(window).width());
                _this._bindjQueryKendo();
            });
        }
        else {
            this.percentOffBodyHeight = .2;
            this.editOrNewUrl.val = agreementId + "/edit/";
            this.agreementIsEdit(true);
            this.participants.populateParticipants();
            this.fileListPopulator.populate(this.agreementId, this.deferredPopFiles);
            this.contact.populateContacts();
            Globalize.culture(culture);
            this._populateAgreementData();
            $("#Loading_page").hide();
            $.when(this.deferredPopContacts, this.deferredPopFiles, this.deferredPopParticipants, this.deferredPageFadeIn)
                .done(function () {
                ko.applyBindings(_this.participants, $('#participants')[0]);
                _this._updateKendoDialog($(window).width());
            });
        }
        this.isBound(true);
        this.basicInfo.populateUmbrella();
        this.establishmentSearchNav.bindSearch();
        $(window).resize(function () {
            _this._updateKendoDialog($(window).width());
        });
        this._hideOtherGroups();
    }
    InstitutionalAgreementEditModel.prototype._hideOtherGroups = function () {
        $("[data-current-module=agreements]").css("visibility", "").hide();
        $("#establishment_search").css("visibility", "").hide();
        $("#add_establishment").css("visibility", "").hide();
    };
    InstitutionalAgreementEditModel.prototype._populateAgreementData = function () {
        var _this = this;
        $.when(this.deferredUAgreements)
            .done(function () {
            $.get(App.Routes.WebApi.Agreements.get(_this.agreementId))
                .done(function (response) {
                var dropdownlist;
                _this.basicInfo.content(response.content);
                _this.datesStatus.expDate(Globalize.format(new Date(response.expiresOn.replace('T', ' ')), 'd'));
                _this.datesStatus.startDate(Globalize.format(new Date(response.startsOn.replace('T', ' ')), 'd'));
                if (response.isAutoRenew == null) {
                    _this.datesStatus.autoRenew(2);
                }
                else {
                    _this.datesStatus.autoRenew(response.isAutoRenew);
                }
                ;
                _this.basicInfo.nickname(response.name);
                _this.basicInfo.privateNotes(response.notes);
                _this.visibility.visibility(response.visibility);
                _this.datesStatus.isEstimated(response.isExpirationEstimated);
                var mappingOptions = {
                    create: function (options) {
                        return (new (function () {
                            this.officialNameDoesNotMatchTranslation = ko.computed(function () {
                                return !(options.data.establishmentOfficialName === options.data.establishmentTranslatedName || !options.data.establishmentOfficialName);
                            });
                            ko.mapping.fromJS(options.data, {}, this);
                        })());
                    }
                };
                ko.mapping.fromJS(response.participants, mappingOptions, _this.participants.participants);
                _this.deferredPopParticipants.resolve();
                _this.basicInfo.uAgreementSelected(response.umbrellaId);
                _this.datesStatus.statusOptionSelected(response.status);
                _this.basicInfo.typeOptionSelected(response.type);
                _this._bindjQueryKendo();
                dropdownlist = $("#umbrella_agreements").data("kendoDropDownList");
                dropdownlist.select(function (dataItem) {
                    return dataItem.value == _this.basicInfo.uAgreementSelected();
                });
                if (_this.basicInfo.isCustomStatusAllowed()) {
                    dropdownlist = $("#status_options").data("kendoComboBox");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.name === _this.datesStatus.statusOptionSelected();
                    });
                    if (dropdownlist.selectedIndex === -1) {
                        dropdownlist.dataSource.add({ name: _this.datesStatus.statusOptionSelected() });
                        dropdownlist.select(dropdownlist.dataSource.length);
                    }
                }
                else {
                    dropdownlist = $("#status_options").data("kendoDropDownList");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.text === _this.datesStatus.statusOptionSelected();
                    });
                }
                if (_this.basicInfo.isCustomTypeAllowed()) {
                    dropdownlist = $("#type_options").data("kendoComboBox");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.name === _this.basicInfo.typeOptionSelected();
                    });
                    if (dropdownlist.selectedIndex === -1) {
                        dropdownlist.dataSource.add({ name: _this.basicInfo.typeOptionSelected() });
                        dropdownlist.select(dropdownlist.dataSource.length);
                    }
                }
                else {
                    dropdownlist = $("#type_options").data("kendoDropDownList");
                    dropdownlist.select(function (dataItem) {
                        return dataItem.text === _this.basicInfo.typeOptionSelected();
                    });
                }
            });
        });
    };
    InstitutionalAgreementEditModel.prototype._updateKendoDialog = function (windowWidth) {
        $(".k-window").css({
            left: (windowWidth / 2 - ($(".k-window").width() / 2) + 10)
        });
    };
    InstitutionalAgreementEditModel.prototype.processSettings = function (result) {
        var self = this;
        this.basicInfo.isCustomTypeAllowed(result.isCustomTypeAllowed);
        this.basicInfo.isCustomStatusAllowed(result.isCustomStatusAllowed);
        this.basicInfo.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
        this.datesStatus.statusOptions.push(new Agreements.SelectConstructor("", ""));
        for (var i = 0, j = result.statusOptions.length; i < j; i++) {
            this.datesStatus.statusOptions.push(new Agreements.SelectConstructor(result.statusOptions[i], result.statusOptions[i]));
        }
        ;
        this.contact.contactTypeOptions.push(new Agreements.SelectConstructor("", undefined));
        for (var i = 0, j = result.contactTypeOptions.length; i < j; i++) {
            this.contact.contactTypeOptions.push(new Agreements.SelectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
        }
        ;
        this.basicInfo.typeOptions.push(new Agreements.SelectConstructor("", ""));
        for (var i = 0, j = result.typeOptions.length; i < j; i++) {
            this.basicInfo.typeOptions.push(new Agreements.SelectConstructor(result.typeOptions[i], result.typeOptions[i]));
        }
        ;
    };
    InstitutionalAgreementEditModel.prototype._bindjQueryKendo = function () {
        var self = this;
        $(".hasDate").each(function (index, item) {
            $(item).kendoDatePicker({
                value: new Date($(item).val()),
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
                        { text: "Heading 3", value: "h3" },
                        { text: "Heading 4", value: "h4" }
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
    };
    InstitutionalAgreementEditModel.prototype._getSettings = function () {
        var _this = this;
        var url = 'App.Routes.WebApi.Agreements.Settings.get()', agreementSettingsGet;
        $.ajax({
            url: eval(url),
            type: 'GET'
        })
            .done(function (result) {
            _this.processSettings(result);
        })
            .fail(function (xhr) {
            App.Failures.message(xhr, xhr.responseText, true);
        });
    };
    InstitutionalAgreementEditModel.prototype.deleteAgreement = function () {
        var _this = this;
        if (this.runningAjax == false) {
            this.runningAjax = true;
            this.deleteErrorMessage('');
            var url = App.Routes.WebApi.Agreements.del(this.agreementId);
            $.ajax({
                type: 'DELETE',
                url: url,
                success: function (response, statusText, xhr) {
                    _this.runningAjax = false;
                    sessionStorage.setItem("agreementSaved", "deleted");
                    location.href = App.Routes.Mvc.Agreements.show();
                },
                error: function (xhr) {
                    _this.runningAjax = false;
                    _this.spinner.stop();
                    if (xhr.status == 400) {
                        _this.deleteErrorMessage(xhr.responseText);
                    }
                    else {
                        App.Failures.message(xhr, xhr.responseText, true);
                    }
                }
            });
        }
    };
    InstitutionalAgreementEditModel.prototype.saveUpdateAgreement = function () {
        var _this = this;
        var offset;
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
            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(offset.top - 20);
            }
            else {
                $("body").scrollTop(offset.top - 20);
            }
        }
        else {
            var url, $LoadingPage = $("#Loading_page").find("strong"), editor = $("#agreement_content").data("kendoEditor"), $LoadingPage = $("#Loading_page").find("strong"), myAutoRenew = null, data;
            this.spinner.start();
            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(0);
            }
            else {
                $("body").scrollTop(0);
            }
            $.each(this.participants.participants(), function (i, item) {
                _this.participants.participantsExport.push({
                    agreementId: item.agreementId,
                    establishmentId: item.establishmentId,
                    establishmentOfficialName: item.establishmentOfficialName,
                    establishmentTranslatedName: item.establishmentTranslatedName,
                    isOwner: item.isOwner,
                    center: item.center
                });
            });
            if (this.datesStatus.autoRenew() == 0) {
                myAutoRenew = false;
            }
            else if (this.datesStatus.autoRenew() == 1) {
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
                umbrellaId: (this.basicInfo.uAgreementSelected() != 0) ? this.basicInfo.uAgreementSelected() : undefined,
                type: this.basicInfo.typeOptionSelected()
            });
            if (this.runningAjax == false) {
                this.runningAjax = true;
                if (this.agreementIsEdit()) {
                    $LoadingPage.text("Saving changes...");
                    $("[data-current-module=agreements]").show().fadeOut(500, function () {
                        $("#Loading_page").hide().fadeIn(500);
                    });
                    url = App.Routes.WebApi.Agreements.put(this.agreementId);
                    $.ajax({
                        type: 'PUT',
                        url: url,
                        data: data,
                        success: function (response, statusText, xhr) {
                            _this.runningAjax = false;
                            sessionStorage.setItem("agreementSaved", "yes");
                            location.href = App.Routes.Mvc.Agreements.show(_this.agreementId);
                        },
                        error: function (xhr) {
                            _this.runningAjax = false;
                            _this.spinner.stop();
                            App.Failures.message(xhr, xhr.responseText, true);
                        }
                    });
                }
                else {
                    $LoadingPage.text("Saving agreement...");
                    $("[data-current-module=agreements]").show().fadeOut(500, function () {
                        $("#Loading_page").hide().fadeIn(500);
                    });
                    url = App.Routes.WebApi.Agreements.post();
                    $.post(url, data)
                        .done(function (response, statusText, xhr) {
                        _this.agreementId = parseInt(xhr.getResponseHeader('Location').substring(xhr.getResponseHeader('Location').lastIndexOf("/") + 1));
                        _this.runningAjax = false;
                        var myUrl = xhr.getResponseHeader('Location');
                        _this.agreementId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                        _this.fileAttachment.agreementId = _this.agreementId;
                        _this.contact.agreementId = _this.agreementId;
                        var deferredPostFiles = $.Deferred();
                        var deferredPostContacts = $.Deferred();
                        _this.fileAttachment.agreementPostFiles(response, statusText, xhr, deferredPostFiles);
                        _this.contact.agreementPostContacts(response, statusText, xhr, deferredPostContacts);
                        $.when(deferredPostFiles, deferredPostContacts);
                        {
                            sessionStorage.setItem("agreementSaved", "yes");
                            location.href = App.Routes.Mvc.Agreements.show(_this.agreementId);
                        }
                    })
                        .fail(function (xhr, statusText, errorThrown) {
                        _this.runningAjax = false;
                        _this.spinner.stop();
                        App.Failures.message(xhr, xhr.responseText, true);
                    });
                }
            }
        }
    };
    return InstitutionalAgreementEditModel;
})();
