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
    var phoneNumber = (function () {
        function phoneNumber(textValue, type, id) {
            this.textValue = textValue;
            this.type = type;
            this.id = id;
        }
        return phoneNumber;
    })();
    exports.phoneNumber = phoneNumber;    
    var InstitutionalAgreementEditModel = (function () {
        function InstitutionalAgreementEditModel(initDefaultPageRoute) {
            if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
            this.initDefaultPageRoute = initDefaultPageRoute;
            this.selectConstructor = function (name, id) {
                this.name = name;
                this.id = id;
            };
            this.fileConstructor = function (name, path, visibility, id) {
                this.name = name;
                this.path = path;
                this.visibility = visibility;
                this.id = id;
            };
            this.contactConstructor = function (jobTitle, firstName, lastName, id, personId, phone, email) {
                this.jobTitle = jobTitle;
                this.firstName = firstName;
                this.lastName = lastName;
                this.id = id;
                this.personId = personId;
                this.phone = phone;
                this.email = email;
            };
            this.visibility = ko.observableArray();
            this.$typeOptions = ko.observable();
            this.typeOptions = ko.mapping.fromJS([]);
            this.typeOptionSelected = ko.observable();
            this.$statusOptions = ko.observable();
            this.statusOptions = ko.mapping.fromJS([]);
            this.statusOptionSelected = ko.observable();
            this.$contactTypeOptions = ko.observable();
            this.contactTypeOptions = ko.mapping.fromJS([]);
            this.contactTypeOptionSelected = ko.observable();
            this.uAgreements = ko.mapping.fromJS([]);
            this.uAgreementSelected = ko.observable(0);
            this.nickname = ko.observable();
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
            this.phoneTypeSelected = ko.observable();
            this.$file = ko.observable();
            this.hasFile = ko.observable();
            this.isFileExtensionInvalid = ko.observable(false);
            this.isFileTooManyBytes = ko.observable(false);
            this.isFileFailureUnexpected = ko.observable(false);
            this.fileFileExtension = ko.observable();
            this.fileFileName = ko.observable();
            this.fileSrc = ko.observable(App.Routes.WebApi.Agreements.File.get({
                maxSide: 128
            }));
            this.fileUploadSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
            this.fileDeleteSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400));
            this.participants = ko.mapping.fromJS([]);
            this.contacts = ko.mapping.fromJS([]);
            this.files = ko.mapping.fromJS([]);
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
            this.SearchPageBind = function (parentOrParticipant) {
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
            this.fadeModsOut = function (dfd, dfd2, $obj, $obj2, time) {
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
            this.bindSearch = function () {
                var _this = this;
                if(!this.hasBoundSearch) {
                    $(document).ready(function () {
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
                    });
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
                                });
                            } else {
                                window.location = _this.establishmentSearchViewModel.sammy.getLocation();
                            }
                        }
                    });
                    this.establishmentSearchViewModel.sammy.run();
                }
            };
            this.trail = ko.observableArray([]);
            this.nextForceDisabled = ko.observable(false);
            this.prevForceDisabled = ko.observable(false);
            this.pageNumber = ko.observable();
            this.populateParticipants();
            this.populateFiles();
            this.populateContacts();
            this.isBound(true);
            this.removeParticipant = this.removeParticipant.bind(this);
            this.removeContact = this.removeContact.bind(this);
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
            this.visibility = ko.observableArray([
                new this.selectConstructor("[None]", 0), 
                new this.selectConstructor("public", 1), 
                new this.selectConstructor("private", 2), 
                new this.selectConstructor("protected", 3)
            ]);
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
            $.get(App.Routes.WebApi.Agreements.Participants.get()).done(function (response) {
                _this.receiveResults(response);
                $("#LoadingPage").hide();
            });
        };
        InstitutionalAgreementEditModel.prototype.populateFiles = function () {
            this.files.push(new this.fileConstructor("asdf", "asdf2", "asdf3", 5));
            this.files.push(new this.fileConstructor("asdf4", "asdf5", "asdf6", 6));
            this.files.push(new this.fileConstructor("asdf9", "asdf8", "asdf7", 7));
        };
        InstitutionalAgreementEditModel.prototype.populateContacts = function () {
            var newPhone = ko.mapping.fromJS([]);
            newPhone.push(new phoneNumber("32145", "home", 1));
            newPhone.push(new phoneNumber("321345645", "work", 2));
            this.contacts.push(new this.contactConstructor("asdf", "asdf2", "asdf3", 5, "asdf", newPhone, "asdf@as.as"));
            var newPhone2 = ko.mapping.fromJS([]);
            newPhone2.push(new phoneNumber("32145222", "home2", 2));
            newPhone2.push(new phoneNumber("3213456452", "work2", 3));
            this.contacts.push(new this.contactConstructor("asdf22", "asdf222", "asdf322", 2, "asdf22", newPhone2, "asdf@as.as22"));
        };
        InstitutionalAgreementEditModel.prototype.$bindKendoFile = function () {
            var _this = this;
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
                upload: function (e) {
                    var allowedExtensions = [
                        'pdf', 
                        'doc', 
                        'docx', 
                        'odt', 
                        'xls', 
                        'xlsx', 
                        'ods', 
                        'ppt', 
                        'pptx'
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
                        } else if(e.files[index].rawFile.size > (1024 * 1024)) {
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
                        _this.hasFile(true);
                        _this.fileSrc(App.Routes.WebApi.Agreements.File.get({
                            maxSide: 128,
                            refresh: new Date().toUTCString()
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
        InstitutionalAgreementEditModel.prototype.startDeletingFile = function () {
            var _this = this;
            if(this.$confirmPurgeDialog && this.$confirmPurgeDialog.length) {
                this.$confirmPurgeDialog.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: function () {
                                _this.$confirmPurgeDialog.dialog('close');
                                _this._deleteFile();
                            }
                        }, 
                        {
                            text: 'No, cancel delete',
                            click: function () {
                                _this.$confirmPurgeDialog.dialog('close');
                                _this.fileDeleteSpinner.stop();
                            },
                            'data-css-link': true
                        }
                    ]
                });
            } else if(confirm('Are you sure you want to delete your profile file?')) {
                this._deleteFile();
            }
        };
        InstitutionalAgreementEditModel.prototype._deleteFile = function () {
            var _this = this;
            this.fileDeleteSpinner.start();
            this.isFileExtensionInvalid(false);
            this.isFileTooManyBytes(false);
            this.isFileFailureUnexpected(false);
            $.ajax({
                url: App.Routes.WebApi.Agreements.File.del(),
                type: 'DELETE'
            }).always(function () {
                _this.fileDeleteSpinner.stop();
            }).done(function (response, statusText, xhr) {
                if(typeof response === 'string') {
                    App.flasher.flash(response);
                }
                _this.hasFile(false);
                _this.fileSrc(App.Routes.WebApi.Agreements.File.get({
                    maxSide: 128,
                    refresh: new Date().toUTCString()
                }));
            }).fail(function () {
                _this.isFileFailureUnexpected(true);
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
                _this.isCustomTypeAllowed(result.isCustomTypeAllowed);
                _this.isCustomStatusAllowed(result.isCustomStatusAllowed);
                _this.isCustomContactTypeAllowed(result.isCustomContactTypeAllowed);
                _this.statusOptions.push(new _this.selectConstructor("", 0));
                _this.contactTypeOptions.push(new _this.selectConstructor("", 0));
                _this.typeOptions.push(new _this.selectConstructor("", 0));
                for(var i = 0; i < result.statusOptions.length; i++) {
                    _this.statusOptions.push(new _this.selectConstructor(result.statusOptions[i], i + 1));
                }
                ;
                for(var i = 0; i < result.contactTypeOptions.length; i++) {
                    _this.contactTypeOptions.push(new _this.selectConstructor(result.contactTypeOptions[i], i));
                }
                ;
                for(var i = 0; i < result.typeOptions.length; i++) {
                    _this.typeOptions.push(new _this.selectConstructor(result.typeOptions[i], i));
                }
                ;
                if(_this.isCustomTypeAllowed) {
                    $("#typeOptions").kendoComboBox({
                        dataTextField: "name",
                        dataValueField: "id",
                        dataSource: new kendo.data.DataSource({
                            data: _this.typeOptions()
                        })
                    });
                }
                if(_this.isCustomStatusAllowed) {
                    $("#statusOptions").kendoComboBox({
                        dataTextField: "name",
                        dataValueField: "id",
                        dataSource: new kendo.data.DataSource({
                            data: _this.statusOptions()
                        })
                    });
                }
                if(_this.isCustomContactTypeAllowed) {
                    $("#contactTypeOptions").kendoComboBox({
                        dataTextField: "name",
                        dataValueField: "id",
                        dataSource: new kendo.data.DataSource({
                            data: _this.contactTypeOptions()
                        })
                    });
                }
                $(".hasDate").kendoDatePicker({
                    open: function (e) {
                        this.options.format = "MM/dd/yyyy";
                    }
                });
                _this.$bindKendoFile();
                $("#helpExpDate").kendoTooltip({
                    width: 120,
                    position: "top",
                    content: "testing",
                    showOn: "click",
                    autoHide: false
                });
            }).fail(function (xhr) {
                alert('fail: status = ' + xhr.status + ' ' + xhr.statusText + '; message = "' + xhr.responseText + '"');
            });
        };
        InstitutionalAgreementEditModel.prototype.hideOtherGroups = function () {
            $("#allParticipants").css("visibility", "").hide();
            $("#estSearch").css("visibility", "").hide();
            $("#addEstablishment").css("visibility", "").hide();
            $("#addContact").css("visibility", "").hide();
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
        InstitutionalAgreementEditModel.prototype.removeContact = function (me, e) {
            if(confirm('Are you sure you want to remove "' + me.firstName + " " + me.lastName + '" as a participant from this agreement?')) {
                this.contacts.remove(me);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        InstitutionalAgreementEditModel.prototype.addAContact = function () {
            $("#addAContact").fadeOut(500, function () {
                $("#addContact").fadeIn(500);
            });
        };
        InstitutionalAgreementEditModel.prototype.addContact = function () {
            $("#addContact").fadeOut(500, function () {
                $("#addAContact").fadeIn(500);
            });
        };
        InstitutionalAgreementEditModel.prototype.cancelContact = function () {
            $("#addContact").fadeOut(500, function () {
                $("#addAContact").fadeIn(500);
            });
        };
        InstitutionalAgreementEditModel.prototype.addAFile = function () {
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
        return InstitutionalAgreementEditModel;
    })();
    exports.InstitutionalAgreementEditModel = InstitutionalAgreementEditModel;    
})
