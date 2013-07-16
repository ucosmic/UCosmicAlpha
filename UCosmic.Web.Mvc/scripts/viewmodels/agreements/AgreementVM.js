define(["require", "exports", '../amd-modules/Establishments/SearchResult', '../amd-modules/Establishments/Search', '../amd-modules/Establishments/Item', '../amd-modules/Widgets/Spinner'], function(require, exports, __SearchResultModule__, __SearchModule__, __ItemModule__, __Spinner__) {
    var SearchResultModule = __SearchResultModule__;

    var SearchModule = __SearchModule__;

    var ItemModule = __ItemModule__;

    
    var Spinner = __Spinner__;

    
    
    var Search = SearchModule.Search;
    var Item = ItemModule.Item;
    var SearchResult = SearchResultModule.SearchResult;
    var InstitutionalAgreementParticipantModel = (function () {
        function InstitutionalAgreementParticipantModel(isOwner, establishmentId, establishmentOfficialName, establishmentTranslatedName) {
            this.isOwner = ko.observable(isOwner);
            this.establishmentId = ko.observable(establishmentId);
            this.establishmentOfficialName = ko.observable(establishmentOfficialName);
            this.establishmentTranslatedName = ko.observable(establishmentTranslatedName);
        }
        return InstitutionalAgreementParticipantModel;
    })();
    exports.InstitutionalAgreementParticipantModel = InstitutionalAgreementParticipantModel;    
    ;
    var InstitutionalAgreementEditModel = (function () {
        function InstitutionalAgreementEditModel(initDefaultPageRoute) {
            if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
            this.initDefaultPageRoute = initDefaultPageRoute;
            this.selectConstructor = function (name, id) {
                this.name = name;
                this.id = id;
            };
            this.agreementIsEdit = ko.observable();
            this.agreementId = 25;
            this.visibility = ko.observable();
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
            this.contactSuffix = ko.mapping.fromJS([]);
            this.contactSuffixSelected = ko.observable();
            this.$$contactSuffix = ko.observable();
            this.contactSalutation = ko.mapping.fromJS([]);
            this.contactSalutationSelected = ko.observable();
            this.$$contactSalutation = ko.observable();
            this.contactJobTitle = ko.observable();
            this.contactPersonId = ko.observable();
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
            this.uAgreements = ko.mapping.fromJS([]);
            this.uAgreementSelected = ko.observable(0);
            this.nickname = ko.observable();
            this.content = ko.observable();
            this.startDate = ko.observable();
            this.expDate = ko.observable();
            this.isEstimated = ko.observable();
            this.autoRenew = ko.observable();
            this.privateNotes = ko.observable();
            this.agreementContent = ko.observable();
            this.isCustomTypeAllowed = ko.observable();
            this.isCustomStatusAllowed = ko.observable();
            this.isCustomContactTypeAllowed = ko.observable();
            this.phoneTypes = ko.mapping.fromJS([]);
            this.$phoneTypes = ko.observable();
            this.phoneTypeSelected = ko.observable();
            this.$file = ko.observable();
            this.hasFile = ko.observable();
            this.isFileExtensionInvalid = ko.observable(false);
            this.isFileTooManyBytes = ko.observable(false);
            this.isFileFailureUnexpected = ko.observable(false);
            this.fileFileExtension = ko.observable();
            this.fileFileName = ko.observable();
            this.fileSrc = ko.observable();
            this.fileUploadSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
            this.fileDeleteSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
            this.tempFileId = 0;
            this.files = ko.mapping.fromJS([]);
            this.participants = ko.mapping.fromJS([]);
            this.contacts = ko.mapping.fromJS([]);
            this.contactPhones = ko.mapping.fromJS([]);
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
            this.owner = new Search(false);
            this.owner2 = new Search(false);
            this.tenantDomain = "uc.edu";
            this.spinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400, true));
            this.establishmentSearchViewModel = new Search();
            this.hasBoundSearch = false;
            this.hasBoundItem = false;
            this.trail = ko.observableArray([]);
            this.nextForceDisabled = ko.observable(false);
            this.prevForceDisabled = ko.observable(false);
            this.pageNumber = ko.observable();
            if(window.location.href.indexOf("new") > 0) {
                this.populateParticipants();
                this.agreementIsEdit(false);
                this.visibility("Public");
                $("#LoadingPage").hide();
            } else {
                this.agreementIsEdit(true);
                this.agreementId = 25;
                this.populateFiles();
                this.populateContacts();
                this.populateAgreementData();
                $("#LoadingPage").hide();
            }
            this.isBound(true);
            this.removeParticipant = this.removeParticipant.bind(this);
            this.editAContact = this.editAContact.bind(this);
            this.removeContact = this.removeContact.bind(this);
            this.removePhone = this.removePhone.bind(this);
            this.addPhone = this.addPhone.bind(this);
            this.removeFile = this.removeFile.bind(this);
            this._setupValidation = this._setupValidation.bind(this);
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
            this._setupValidation();
        }
        InstitutionalAgreementEditModel.prototype.receiveResults = function (js) {
            if(!js) {
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
            });
        };
        InstitutionalAgreementEditModel.prototype.populateAgreementData = function () {
            var _this = this;
            $.get(App.Routes.WebApi.Agreements.get(this.agreementId)).done(function (response) {
                _this.content(response.content);
                _this.expDate(response.expiresOn);
                _this.startDate(response.startsOn);
                if(response.isAutoRenew == null) {
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
                _this.uAgreementSelected(response.umbrellaId);
                _this.typeOptionSelected(response.type);
            });
        };
        InstitutionalAgreementEditModel.prototype.populateFiles = function () {
            var _this = this;
            $.get(App.Routes.WebApi.Agreements.Files.get(this.agreementId) + "?useTestData=true").done(function (response) {
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
            });
        };
        InstitutionalAgreementEditModel.prototype.populateContacts = function () {
            var _this = this;
            $.get(App.Routes.WebApi.Agreements.Contacts.get(this.agreementId)).done(function (response) {
                ko.mapping.fromJS(response, _this.contacts);
            });
        };
        InstitutionalAgreementEditModel.prototype.$bindKendoFile = function () {
            var _this = this;
            $("#fileUpload").kendoUpload({
                multiple: true,
                showFileList: false,
                localization: {
                    select: 'Choose a file to upload...'
                },
                async: {
                    saveUrl: App.Routes.WebApi.Uploads.post()
                },
                upload: function (e) {
                    var allowedExtensions = [
                        '.pdf', 
                        '.doc', 
                        '.docx', 
                        '.odt', 
                        '.xls', 
                        '.xlsx', 
                        '.ods', 
                        '.ppt', 
                        '.pptx'
                    ];
                    _this.isFileExtensionInvalid(false);
                    _this.isFileTooManyBytes(false);
                    _this.isFileFailureUnexpected(false);
                    $(e.files).each(function (index) {
                        var isExtensionAllowed = false;
                        var isByteNumberAllowed = false;
                        var extension = e.files[index].extension;
                        _this.fileFileExtension(extension || '[NONE]');
                        _this.fileFileName(e.files[index].name);
                        for(var i = 0; i < allowedExtensions.length; i++) {
                            if(allowedExtensions[i] === extension.toLowerCase()) {
                                isExtensionAllowed = true;
                                break;
                            }
                        }
                        if(!isExtensionAllowed) {
                            e.preventDefault();
                            _this.isFileExtensionInvalid(true);
                        } else if(e.files[index].rawFile.size > (1024 * 1024 * 25)) {
                            e.preventDefault();
                            _this.isFileTooManyBytes(true);
                        }
                    });
                    if(!e.isDefaultPrevented()) {
                        _this.fileUploadSpinner.start();
                    }
                },
                complete: function () {
                    _this.fileUploadSpinner.stop();
                },
                success: function (e) {
                    if(e.operation == 'upload') {
                        if(e.response && e.response.message) {
                            App.flasher.flash(e.response.message);
                        }
                        _this.tempFileId = _this.tempFileId + .01;
                        _this.files.push(ko.mapping.fromJS({
                            id: _this.tempFileId,
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
                error: function (e) {
                    var fileName, fileExtension;
                    if(e.files && e.files.length > 0) {
                        fileName = e.files[0].name;
                        fileExtension = e.files[0].extension;
                    }
                    if(fileName) {
                        _this.fileFileName(fileName);
                    }
                    if(fileExtension) {
                        _this.fileFileExtension(fileExtension);
                    }
                    if(e.XMLHttpRequest.status === 415) {
                        _this.isFileExtensionInvalid(true);
                    } else if(e.XMLHttpRequest.status === 413) {
                        _this.isFileTooManyBytes(true);
                    } else {
                        _this.isFileFailureUnexpected(true);
                    }
                }
            });
        };
        InstitutionalAgreementEditModel.prototype.removeFile = function (me, e) {
            var _this = this;
            if(confirm('Are you sure you want to remove this file from this agreement?')) {
                var url = "";
                if(this.agreementId != 0) {
                    url = App.Routes.WebApi.Agreements.Files.del(this.agreementId, me.id());
                } else {
                    url = App.Routes.WebApi.Agreements.FilesUpload.del(me.guid());
                }
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    success: function () {
                        _this.files.remove(me);
                    }
                });
            }
            e.preventDefault();
            e.stopPropagation();
        };
        InstitutionalAgreementEditModel.prototype.editAFile = function (me, e) {
            me.isEdit(true);
        };
        InstitutionalAgreementEditModel.prototype.closeEditAFile = function (me, e) {
            me.customName(me.customNameFile() + me.customNameExt());
            me.isEdit(false);
        };
        InstitutionalAgreementEditModel.prototype.downloadAFile = function (me, e) {
            this.agreementId = 2;
            var url = App.Routes.WebApi.Agreements.Files.Content.download(this.agreementId, me.id());
            window.location.href = url;
        };
        InstitutionalAgreementEditModel.prototype.viewAFile = function (me, e) {
            this.agreementId = 2;
            var url = App.Routes.WebApi.Agreements.Files.Content.view(this.agreementId, me.id());
            window.open(url, '_blank');
        };
        InstitutionalAgreementEditModel.prototype.bindjQueryKendo = function (result) {
            var _this = this;
            this.isCustomTypeAllowed(result.isCustomTypeAllowed);
            this.isCustomStatusAllowed(result.isCustomStatusAllowed);
            this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
            this.statusOptions.push(new this.selectConstructor("", ""));
            this.contactTypeOptions.push(new this.selectConstructor("", undefined));
            this.typeOptions.push(new this.selectConstructor("", ""));
            for(var i = 0; i < result.statusOptions.length; i++) {
                this.statusOptions.push(new this.selectConstructor(result.statusOptions[i], result.statusOptions[i]));
            }
            ;
            for(var i = 0; i < result.contactTypeOptions.length; i++) {
                this.contactTypeOptions.push(new this.selectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
            }
            ;
            for(var i = 0; i < result.typeOptions.length; i++) {
                this.typeOptions.push(new this.selectConstructor(result.typeOptions[i], result.typeOptions[i]));
            }
            ;
            if(this.isCustomTypeAllowed) {
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
            if(this.isCustomStatusAllowed) {
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
            if(this.isCustomContactTypeAllowed) {
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
            $(".hasDate").each(function (index, item) {
                $(item).kendoDatePicker({
                    value: new Date($(item).val()),
                    open: function (e) {
                        this.options.format = "MM/dd/yyyy";
                    }
                });
            });
            this.$bindKendoFile();
            $("#helpExpDate").kendoTooltip({
                width: 120,
                position: "top",
                content: "testing",
                showOn: "click",
                autoHide: false
            });
            this.contactPhoneTextValue.subscribe(function (me) {
                if(_this.contactPhoneTextValue().length > 0) {
                    _this.contactPhones.push(ko.mapping.fromJS({
                        type: _this.contactPhoneType(),
                        value: _this.contactPhoneTextValue()
                    }));
                    _this.contactPhoneTextValue("");
                    $(".phoneTypes").kendoDropDownList({
                        dataTextField: "name",
                        dataValueField: "id",
                        dataSource: new kendo.data.DataSource({
                            data: ko.mapping.toJS(_this.phoneTypes())
                        })
                    });
                }
            });
            this.$addContactDialog.kendoWindow({
                width: 950,
                close: function () {
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
            function kacSelext(me, e) {
                var dataItem = me.dataItem(e.item.index());
                _this.contactFirstName(dataItem.firstName);
                _this.contactLastName(dataItem.lastName);
                _this.contactEmail(dataItem.defaultEmailAddress);
                _this.contactMiddleName(dataItem.middleName);
                _this.contactPersonId(dataItem.id);
                _this.contactSuffixSelected(dataItem.suffix);
                _this.contactSalutationSelected(dataItem.salutation);
                _this.$contactEmail.prop('disabled', true);
                _this.$contactLastName.prop('disabled', true);
                _this.$contactFirstName.prop('disabled', true);
                $("#contactMiddleName").prop('disabled', true);
                _this.$contactSalutation.data("kendoComboBox").enable(false);
                _this.$contactSuffix.data("kendoComboBox").enable(false);
                _this.validateContact.errors.showAllMessages(true);
            }
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
                change: function (e) {
                },
                select: function (e) {
                    kacSelext(_this.$contactLastName.data("kendoAutoComplete"), e);
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
                change: function (e) {
                },
                select: function (e) {
                    kacSelext(_this.$contactLastName.data("kendoAutoComplete"), e);
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
                change: function (e) {
                },
                select: function (e) {
                    kacSelext(_this.$contactLastName.data("kendoAutoComplete"), e);
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
                var $body = $("body").scrollTop() + 100;
                if($body <= $participantsTop.top + $participants.height()) {
                    $("aside").find("li").removeClass("current");
                    $navparticipants.addClass("current");
                } else if($body >= $basicInfoTop.top && $body <= $basicInfoTop.top + $basicInfo.height()) {
                    $("aside").find("li").removeClass("current");
                    $navbasicInfo.addClass("current");
                } else if($body >= $effectiveDatesCurrentStatusTop.top && $body <= $effectiveDatesCurrentStatusTop.top + $effectiveDatesCurrentStatus.height()) {
                    $("aside").find("li").removeClass("current");
                    $naveffectiveDatesCurrentStatus.addClass("current");
                } else if($body >= $contactsTop.top && $body <= $contactsTop.top + $contacts.height()) {
                    $("aside").find("li").removeClass("current");
                    $navcontacts.addClass("current");
                } else if($body >= $fileAttachmentsTop.top && $body <= $fileAttachmentsTop.top + $fileAttachments.height()) {
                    $("aside").find("li").removeClass("current");
                    $navfileAttachments.addClass("current");
                } else if($body >= $overallVisibilityTop.top) {
                    $("aside").find("li").removeClass("current");
                    $navoverallVisibility.closest("li").addClass("current");
                }
            });
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
                            {
                                text: "Paragraph",
                                value: "p"
                            }, 
                            {
                                text: "Quotation",
                                value: "blockquote"
                            }, 
                            {
                                text: "Heading 2",
                                value: "h2"
                            }, 
                            {
                                text: "Heading 3",
                                value: "h3"
                            }, 
                            {
                                text: "Heading 4",
                                value: "h4"
                            }, 
                            {
                                text: "Heading 5",
                                value: "h5"
                            }, 
                            {
                                text: "Heading 6",
                                value: "h6"
                            }
                        ],
                        width: "200px"
                    }
                ]
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
            if(confirm('Are you sure you want to remove "' + establishmentResultViewModel.establishmentTranslatedName() + '" as a participant from this agreement?')) {
                var self = this;
                self.participants.remove(function (item) {
                    if(item.establishmentId() === establishmentResultViewModel.establishmentId()) {
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
            if(parentOrParticipant === "parent") {
                $cancelAddParticipant.on("click", function (e) {
                    _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                    e.preventDefault();
                    return false;
                });
            } else {
                $cancelAddParticipant.on("click", function (e) {
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
            if($obj.css("display") !== "none") {
                $obj.fadeOut(time, function () {
                    dfd.resolve();
                });
            } else {
                dfd.resolve();
            }
            if($obj2.css("display") !== "none") {
                $obj2.fadeOut(time, function () {
                    dfd2.resolve();
                });
            } else {
                dfd2.resolve();
            }
        };
        InstitutionalAgreementEditModel.prototype.bindSearch = function () {
            var _this = this;
            if(!this.hasBoundSearch) {
                this.establishmentSearchViewModel.sammyBeforeRoute = /\#\/index\/(.*)\//;
                this.establishmentSearchViewModel.sammyGetPageRoute = '#/index';
                this.establishmentSearchViewModel.sammyDefaultPageRoute = '/agreements[\/]?';
                ko.applyBindings(this.establishmentSearchViewModel, $('#estSearch')[0]);
                var lastURL = "asdf";
                if(this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#") === -1) {
                    if(this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("new/") === -1) {
                        this.establishmentSearchViewModel.sammy.setLocation('/agreements/new/#/index');
                    } else {
                        this.establishmentSearchViewModel.sammy.setLocation('#/index');
                    }
                }
                if(sessionStorage.getItem("addest") == undefined) {
                    sessionStorage.setItem("addest", "no");
                }
                this.establishmentSearchViewModel.sammy.bind("location-changed", function () {
                    if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                        var $asideRootSearch = $("#asideRootSearch");
                        var $asideParentSearch = $("#asideParentSearch");
                        if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("new/#/new/") > 0) {
                            var $addEstablishment = $("#addEstablishment");
                            var dfd = $.Deferred();
                            var dfd2 = $.Deferred();
                            var $obj = $("#estSearch");
                            var $obj2 = $("#allParticipants");
                            var time = 500;
                            _this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                            $.when(dfd, dfd2).done(function () {
                                $addEstablishment.css("visibility", "").hide().fadeIn(500, function () {
                                    if(!_this.hasBoundItem) {
                                        _this.establishmentItemViewModel = new Item();
                                        _this.establishmentItemViewModel.goToSearch = function () {
                                            sessionStorage.setItem("addest", "yes");
                                            _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                        };
                                        _this.establishmentItemViewModel.submitToCreate = function (formElement) {
                                            if(!_this.establishmentItemViewModel.id || _this.establishmentItemViewModel.id === 0) {
                                                var me = _this.establishmentItemViewModel;
                                                _this.establishmentItemViewModel.validatingSpinner.start();
                                                var officialName = _this.establishmentItemViewModel.names()[0];
                                                var officialUrl = _this.establishmentItemViewModel.urls()[0];
                                                var location = _this.establishmentItemViewModel.location;
                                                if(officialName.text.isValidating() || officialUrl.value.isValidating() || _this.establishmentItemViewModel.ceebCode.isValidating() || _this.establishmentItemViewModel.uCosmicCode.isValidating()) {
                                                    setTimeout(function () {
                                                        var waitResult = _this.establishmentItemViewModel.submitToCreate(formElement);
                                                        return false;
                                                    }, 50);
                                                    return false;
                                                }
                                                _this.establishmentItemViewModel.isValidationSummaryVisible(true);
                                                if(!_this.establishmentItemViewModel.isValid()) {
                                                    _this.establishmentItemViewModel.errors.showAllMessages();
                                                }
                                                if(!officialName.isValid()) {
                                                    officialName.errors.showAllMessages();
                                                }
                                                if(!officialUrl.isValid()) {
                                                    officialUrl.errors.showAllMessages();
                                                }
                                                _this.establishmentItemViewModel.validatingSpinner.stop();
                                                if(officialName.isValid() && officialUrl.isValid() && _this.establishmentItemViewModel.isValid()) {
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
                                                            $("#LoadingPage").fadeIn(500);
                                                            setTimeout(function () {
                                                                $("#LoadingPage").fadeOut(500, function () {
                                                                    $LoadingPage.text("Loading Page...");
                                                                });
                                                                _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                                            }, 5000);
                                                        });
                                                    }).fail(function (xhr, statusText, errorThrown) {
                                                        if(xhr.status === 400) {
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
                            lastURL = "#/new/";
                        } else if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("new/#/page/") > 0) {
                            if(sessionStorage.getItem("addest") === "yes") {
                                _this.establishmentSearchViewModel.clickAction = function (context) {
                                    _this.establishmentItemViewModel.parentEstablishment(context);
                                    _this.establishmentItemViewModel.parentId(context.id());
                                    _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
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
                                    for(var i = 0; i < _this.participants().length; i++) {
                                        if(_this.participants()[i].establishmentId() === myParticipant.establishmentId()) {
                                            alreadyExist = true;
                                            break;
                                        }
                                    }
                                    if(alreadyExist !== true) {
                                        $.ajax({
                                            url: App.Routes.WebApi.Agreements.Participant.get(myParticipant.establishmentId()),
                                            type: 'GET',
                                            async: false
                                        }).done(function (response) {
                                            myParticipant.isOwner(response.isOwner);
                                            _this.participants.push(myParticipant);
                                            _this.establishmentSearchViewModel.sammy.setLocation('agreements/new');
                                        }).fail(function () {
                                            _this.participants.push(myParticipant);
                                            _this.establishmentSearchViewModel.sammy.setLocation('agreements/new');
                                        });
                                    } else {
                                        alert("This Participant has already been added.");
                                    }
                                };
                            }
                            lastURL = "#/page/";
                        } else if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("agreements/new") > 0) {
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
                                $("#allParticipants").fadeIn(500);
                                $("body").height($(window).height() + $("body").height() - 300);
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
            this.$addContactDialog.data("kendoWindow").open().title("Edit Contact");
            this.contactsIsEdit(true);
            this.contactEmail(me.emailAddress());
            this.contactDisplayName(me.displayName());
            this.contactPersonId(me.personId());
            this.contactJobTitle(me.title());
            this.contactFirstName(me.firstName());
            this.contactLastName(me.lastName());
            this.contactPhones(me.phones());
            this.contactMiddleName(me.middleName());
            this.contactIndex = this.contacts.indexOf(me);
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
        };
        InstitutionalAgreementEditModel.prototype.clearContactInfo = function () {
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
        };
        InstitutionalAgreementEditModel.prototype.editContact = function (me) {
            if(this.validateContact.isValid()) {
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
                this.$addContactDialog.data("kendoWindow").close();
                $("#addAContact").fadeIn(500);
            } else {
                this.validateContact.errors.showAllMessages(true);
            }
        };
        InstitutionalAgreementEditModel.prototype.addContact = function (me, e) {
            if(this.validateContact.isValid()) {
                this.contacts.push(ko.mapping.fromJS({
                    title: this.contactJobTitle(),
                    firstName: this.contactFirstName(),
                    lastName: this.contactLastName(),
                    id: 1,
                    personId: this.contactPersonId(),
                    phones: ko.mapping.toJS(this.contactPhones()),
                    emailAddress: this.contactEmail(),
                    type: this.contactTypeOptionSelected(),
                    suffix: this.contactSuffix(),
                    salutation: this.contactSalutation(),
                    displayName: this.contactDisplayName(),
                    middleName: this.contactMiddleName
                }));
                this.clearContactInfo();
                this.$addContactDialog.data("kendoWindow").close();
                $("#addAContact").fadeIn(500);
            } else {
                this.validateContact.errors.showAllMessages(true);
            }
        };
        InstitutionalAgreementEditModel.prototype.addAContact = function (me, e) {
            this.$contactEmail.prop('disabled', false);
            this.$contactLastName.prop('disabled', false);
            this.$contactFirstName.prop('disabled', false);
            $("#contactMiddleName").prop('disabled', false);
            this.$contactSalutation.data("kendoComboBox").enable(true);
            this.$contactSuffix.data("kendoComboBox").enable(true);
            this.validateContact.errors.showAllMessages(false);
            this.$addContactDialog.data("kendoWindow").open().title("Add Contact");
            $("#addAContact").fadeOut(500, function () {
            });
        };
        InstitutionalAgreementEditModel.prototype.cancelContact = function () {
            this.$addContactDialog.data("kendoWindow").close();
            $("#addAContact").fadeIn(500);
        };
        InstitutionalAgreementEditModel.prototype.clearContact = function () {
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
        };
        InstitutionalAgreementEditModel.prototype.removeContact = function (me, e) {
            if(confirm('Are you sure you want to remove "' + me.firstName() + " " + me.lastName() + '" as a contact from this agreement?')) {
                this.contacts.remove(me);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        InstitutionalAgreementEditModel.prototype.removePhone = function (me, e) {
            this.contactPhones.remove(me);
            e.preventDefault();
            e.stopPropagation();
        };
        InstitutionalAgreementEditModel.prototype.addPhone = function (me, e) {
            if(this.contactPhoneTextValue().length > 0) {
                this.contactPhones.push(ko.mapping.fromJS({
                    type: '',
                    value: this.contactPhoneTextValue()
                }));
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
        };
        InstitutionalAgreementEditModel.prototype.goToSection = function (location, data, event) {
            var offset = $("#" + location).offset();
            $("body").scrollTop(offset.top - 20);
            $(event.target).closest("ul").find("li").removeClass("current");
            $(event.target).closest("li").addClass("current");
        };
        InstitutionalAgreementEditModel.prototype.saveAgreement = function () {
            var offset;
            if(!this.validateEffectiveDatesCurrentStatus.isValid()) {
                var offset = $("#effectiveDatesCurrentStatus").offset();
                this.validateEffectiveDatesCurrentStatus.errors.showAllMessages(true);
                $("#navEffectiveDatesCurrentStatus").closest("ul").find("li").removeClass("current");
                $("#navEffectiveDatesCurrentStatus").addClass("current");
            }
            if(!this.validateBasicInfo.isValid()) {
                var offset = $("#basicInfo").offset();
                this.validateBasicInfo.errors.showAllMessages(true);
                $("#navValidateBasicInfo").closest("ul").find("li").removeClass("current");
                $("#navValidateBasicInfo").addClass("current");
            }
            var validateParticipantsHasOwner = false;
            var validateParticipantsHasParticipant = false;
            $.each(this.participants(), function (i, item) {
                if(item.isOwner() == true) {
                    validateParticipantsHasOwner = true;
                }
                if(item.isOwner() == false) {
                    validateParticipantsHasParticipant = true;
                }
            });
            if(validateParticipantsHasOwner != true || validateParticipantsHasOwner != true) {
                var offset = $("#participants").offset();
                $("#navParticipants").closest("ul").find("li").removeClass("current");
                $("#navParticipants").addClass("current");
            }
            if(offset != undefined) {
                $("body").scrollTop(offset.top - 20);
            }
        };
        return InstitutionalAgreementEditModel;
    })();
    exports.InstitutionalAgreementEditModel = InstitutionalAgreementEditModel;    
})
