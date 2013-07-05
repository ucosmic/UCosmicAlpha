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
            this.contactsIsEdit = ko.observable(false);
            this.contactFirstName = ko.observable();
            this.contactLastName = ko.observable();
            this.contactSuffix = ko.mapping.fromJS([]);
            this.contactSuffixSelected = ko.observable();
            this.$contactSuffix = ko.observable();
            this.contactSalutation = ko.mapping.fromJS([]);
            this.contactSalutationSelected = ko.observable();
            this.$contactSalutation = ko.observable();
            this.contactJobTitle = ko.observable();
            this.contactPersonId = ko.observable();
            this.contactDisplayName = ko.observable();
            this.contactIndex = 0;
            this.contactEmail = ko.observable();
            this.contactMiddleName = ko.observable();
            this.contactPhoneTextValue = ko.observable("");
            this.contactPhoneType = ko.observable();
            this.$addContactDialog = $("#addContactDialog");
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
            this.$phoneTypes = ko.observable();
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
            this.contactPhones = ko.mapping.fromJS([]);
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
            $.get(App.Routes.WebApi.Agreements.Participants.get()).done(function (response) {
                _this.receiveResults(response);
                $("#LoadingPage").hide();
            });
        };
        InstitutionalAgreementEditModel.prototype.populateFiles = function () {
            this.files.push(new this.fileConstructor("asdf", "asdf2", "Private", 5));
            this.files.push(new this.fileConstructor("asdf4", "asdf5", "Protected", 6));
            this.files.push(new this.fileConstructor("asdf9", "asdf8", "Public", 7));
        };
        InstitutionalAgreementEditModel.prototype.populateContacts = function () {
            var newPhone = ko.mapping.fromJS([]);
            newPhone.push(new phoneNumber("32145", "home", 1));
            newPhone.push(new phoneNumber("321345645", "work", 2));
            this.contacts.push(ko.mapping.fromJS({
                jobTitle: "job1",
                firstName: "joe",
                lastName: "blow",
                id: 1,
                personId: "asdf",
                phone: newPhone,
                email: "asdf@as.as11",
                type: "Home Principal",
                suffix: "Jr.",
                salutation: "Dr.",
                displayName: "Joe Blow",
                middleName: "middle"
            }));
            var newPhone2 = ko.mapping.fromJS([]);
            newPhone2.push(new phoneNumber("32145222", "home2", 2));
            newPhone2.push(new phoneNumber("3213456452", "work2", 3));
            this.contacts.push(ko.mapping.fromJS({
                jobTitle: "job2",
                firstName: "arya",
                lastName: "stark",
                id: 2,
                personId: "asdf22",
                phone: newPhone2,
                email: "asdf@as.as22",
                type: "Home Principal",
                suffix: "Sr.",
                salutation: "Ms.",
                displayName: "Arya Stark",
                middleName: "middle2"
            }));
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
                _this.statusOptions.push(new _this.selectConstructor("", ""));
                _this.contactTypeOptions.push(new _this.selectConstructor("", undefined));
                _this.typeOptions.push(new _this.selectConstructor("", ""));
                for(var i = 0; i < result.statusOptions.length; i++) {
                    _this.statusOptions.push(new _this.selectConstructor(result.statusOptions[i], result.statusOptions[i]));
                }
                ;
                for(var i = 0; i < result.contactTypeOptions.length; i++) {
                    _this.contactTypeOptions.push(new _this.selectConstructor(result.contactTypeOptions[i], result.contactTypeOptions[i]));
                }
                ;
                for(var i = 0; i < result.typeOptions.length; i++) {
                    _this.typeOptions.push(new _this.selectConstructor(result.typeOptions[i], result.typeOptions[i]));
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
                } else {
                    $("#typeOptions").kendoDropDownList({
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
                } else {
                    $("#statusOptions").kendoDropDownList({
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
                } else {
                    $("#contactTypeOptions").kendoDropDownList({
                        dataTextField: "name",
                        dataValueField: "id",
                        dataSource: new kendo.data.DataSource({
                            data: _this.contactTypeOptions()
                        })
                    });
                }
                $("#contactSalutation").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: ko.mapping.toJS(_this.contactSalutation())
                    })
                });
                $("#contactSuffix").kendoComboBox({
                    dataTextField: "name",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: ko.mapping.toJS(_this.contactSuffix())
                    })
                });
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
                _this.contactPhoneTextValue.subscribe(function (me) {
                    if(_this.contactPhoneTextValue().length > 0) {
                        _this.contactPhones.push(ko.mapping.fromJS({
                            type: _this.contactPhoneType(),
                            textValue: _this.contactPhoneTextValue()
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
                _this.$addContactDialog.kendoWindow({
                    width: 950,
                    close: function () {
                        $("#addAContact").fadeIn(500);
                    },
                    visible: false
                });
                $(".k-window").css({
                    position: 'fixed',
                    margin: 'auto',
                    top: '10%'
                });
                _this.$addContactDialog.data("kendoWindow").close();
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
        InstitutionalAgreementEditModel.prototype.editAContact = function (me) {
            this.$addContactDialog.data("kendoWindow").open().title("Edit Contact");
            this.contactsIsEdit(true);
            this.contactEmail(me.email());
            this.contactDisplayName(me.displayName());
            this.contactPersonId(me.personId());
            this.contactJobTitle(me.jobTitle());
            this.contactFirstName(me.firstName());
            this.contactLastName(me.lastName());
            this.contactPhones(me.phone());
            this.contactMiddleName(me.middleName());
            this.contactIndex = this.contacts.indexOf(me);
            var dropdownlist = $("#contactTypeOptions").data("kendoComboBox");
            dropdownlist.select(function (dataItem) {
                return dataItem.name === me.type();
            });
            var dropdownlist = $("#contactSuffix").data("kendoComboBox");
            dropdownlist.select(function (dataItem) {
                return dataItem.name === me.suffix();
            });
            var dropdownlist = $("#contactSalutation").data("kendoComboBox");
            dropdownlist.select(function (dataItem) {
                return dataItem.name === me.salutation();
            });
            $("#addAContact").fadeOut(500, function () {
            });
            $(".phoneTypes").kendoDropDownList({
                dataTextField: "name",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: ko.mapping.toJS(this.phoneTypes())
                })
            });
        };
        InstitutionalAgreementEditModel.prototype.clearContactInfo = function () {
            this.contactEmail('');
            this.contactDisplayName('');
            this.contactPersonId('');
            this.contactJobTitle('');
            this.contactFirstName('');
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
            this.contactsIsEdit(false);
            this.contacts()[this.contactIndex].email(this.contactEmail());
            this.contacts()[this.contactIndex].jobTitle(this.contactJobTitle());
            this.contacts()[this.contactIndex].displayName(this.contactDisplayName());
            this.contacts()[this.contactIndex].personId(this.contactPersonId());
            this.contacts()[this.contactIndex].firstName(this.contactFirstName());
            this.contacts()[this.contactIndex].lastName(this.contactLastName());
            this.contacts()[this.contactIndex].middleName(this.contactMiddleName());
            this.contacts()[this.contactIndex].phone(this.contactPhones());
            this.contacts()[this.contactIndex].type(this.contactTypeOptionSelected());
            this.contacts()[this.contactIndex].salutation(this.contactSalutationSelected());
            this.contacts()[this.contactIndex].suffix(this.contactSuffixSelected());
            this.clearContactInfo();
            this.$addContactDialog.data("kendoWindow").close();
            $("#addAContact").fadeIn(500);
        };
        InstitutionalAgreementEditModel.prototype.addContact = function (me, e) {
            if(this.validateContact.isValid()) {
                this.contacts.push(ko.mapping.fromJS({
                    jobTitle: this.contactJobTitle(),
                    firstName: this.contactFirstName(),
                    lastName: this.contactLastName(),
                    id: 1,
                    personId: this.contactPersonId(),
                    phone: ko.mapping.toJS(this.contactPhones()),
                    email: this.contactEmail(),
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
            this.$addContactDialog.data("kendoWindow").open().title("Add Contact");
            $("#addAContact").fadeOut(500, function () {
            });
        };
        InstitutionalAgreementEditModel.prototype.cancelContact = function () {
            this.$addContactDialog.data("kendoWindow").close();
            $("#addAContact").fadeIn(500);
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
                    type: this.contactPhoneType(),
                    textValue: this.contactPhoneTextValue()
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
        InstitutionalAgreementEditModel.prototype.addAFile = function () {
        };
        InstitutionalAgreementEditModel.prototype.removeFile = function (me, e) {
            if(confirm('Are you sure you want to remove this file from this agreement?')) {
                this.files.remove(me);
            }
            e.preventDefault();
            e.stopPropagation();
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
            this.validateContact = ko.validatedObservable({
                contactDisplayName: this.contactDisplayName.extend({
                    required: {
                        message: 'Display name is required.'
                    },
                    maxLength: 50
                }),
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
                }),
                contactPersonId: this.contactPersonId.extend({
                    maxLength: 50
                })
            });
        };
        return InstitutionalAgreementEditModel;
    })();
    exports.InstitutionalAgreementEditModel = InstitutionalAgreementEditModel;    
})
