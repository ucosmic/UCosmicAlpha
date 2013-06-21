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
            this.uAgreements = ko.mapping.fromJS([]);
            this.agreementTypes = ko.mapping.fromJS([]);
            this.uAgreementSelected = ko.observable(0);
            this.agreementTypeSelected = ko.observable(0);
            this.nickname = ko.observable();
            this.privateNotes = ko.observable();
            this.agreementContent = ko.observable();
            this.participants = ko.mapping.fromJS([]);
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
                        this.establishmentSearchViewModel.sammy.setLocation('#/index');
                    }
                    if(sessionStorage.getItem("addest") == undefined) {
                        sessionStorage.setItem("addest", "no");
                    }
                    this.establishmentSearchViewModel.sammy.bind("location-changed", function () {
                        if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                            var $asideRootSearch = $("#asideRootSearch");
                            var $asideParentSearch = $("#asideParentSearch");
                            if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#/new/") > 0) {
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
                            } else if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#/page/") > 0) {
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
                                                _this.establishmentSearchViewModel.sammy.setLocation('Agreements/');
                                            }).fail(function () {
                                                _this.participants.push(myParticipant);
                                                _this.establishmentSearchViewModel.sammy.setLocation('Agreements/');
                                            });
                                        } else {
                                            alert("This Participant has already been added.");
                                        }
                                    };
                                }
                                lastURL = "#/page/";
                            } else {
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
            this.isBound(true);
            this.removeParticipant = this.removeParticipant.bind(this);
            this.hideOtherGroups();
            this.bindSearch();
            this.uAgreements = ko.mapping.fromJS([
                new this.selectConstructor("[None - this is a top-level or standalone agreement]", 0), 
                new this.selectConstructor("test", 1), 
                new this.selectConstructor("test2", 2), 
                new this.selectConstructor("test3", 3)
            ]);
            this.agreementTypes = ko.mapping.fromJS([
                new this.selectConstructor("test", 1), 
                new this.selectConstructor("test2", 2), 
                new this.selectConstructor("test3", 3)
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
            this.spinner.stop();
        };
        InstitutionalAgreementEditModel.prototype.populateParticipants = function () {
            var _this = this;
            $.get(App.Routes.WebApi.Agreements.Participants.get()).done(function (response) {
                _this.receiveResults(response);
                $("#LoadingPage").hide();
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
