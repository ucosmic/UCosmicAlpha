var ViewModels;
(function (ViewModels) {
    (function (My) {
        var Profile = (function () {
            function Profile() {
                this._isInitialized = false;
                this._activitiesViewModel = null;
                this._geographicExpertisesViewModel = null;
                this._languageExpertisesViewModel = null;
                this._degreesViewModel = null;
                this._affiliationsViewModel = null;
                this.hasPhoto = ko.observable();
                this.isPhotoExtensionInvalid = ko.observable(false);
                this.isPhotoTooManyBytes = ko.observable(false);
                this.isPhotoFailureUnexpected = ko.observable(false);
                this.photoFileExtension = ko.observable();
                this.photoFileName = ko.observable();
                this.photoSrc = ko.observable(App.Routes.WebApi.My.Profile.Photo.get({
                    maxSide: 128
                }));
                this.photoUploadSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(400));
                this.photoDeleteSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(400));
                this.isDisplayNameDerived = ko.observable();
                this.displayName = ko.observable();
                this._userDisplayName = '';
                this.personId = 0;
                this.salutation = ko.observable();
                this.firstName = ko.observable();
                this.middleName = ko.observable();
                this.lastName = ko.observable();
                this.suffix = ko.observable();
                this.facultyRanks = ko.observableArray();
                this.facultyRankId = ko.observable();
                this.jobTitles = ko.observable();
                this.administrativeAppointments = ko.observable();
                this.gender = ko.observable();
                this.isActive = ko.observable();
                this.$photo = ko.observable();
                this.$facultyRanks = ko.observable();
                this.$nameSalutation = ko.observable();
                this.$nameSuffix = ko.observable();
                this.editMode = ko.observable(false);
                this.saveSpinner = new ViewModels.Spinner(new ViewModels.SpinnerOptions(200));
                this._initialize();
                this._setupValidation();
                this._setupKendoWidgets();
                this._setupDisplayNameDerivation();
                this._setupCardComputeds();
            }
            Profile.prototype._initialize = function () {
                var _this = this;
                var facultyRanksPact = $.Deferred();
                $.get(App.Routes.WebApi.Employees.ModuleSettings.FacultyRanks.get()).done(function (data, textStatus, jqXHR) {
                    facultyRanksPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    facultyRanksPact.reject(jqXHR, textStatus, errorThrown);
                });
                var viewModelPact = $.Deferred();
                $.get(App.Routes.WebApi.My.Profile.get()).done(function (data, textStatus, jqXHR) {
                    viewModelPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    viewModelPact.reject(jqXHR, textStatus, errorThrown);
                });
                $.when(facultyRanksPact, viewModelPact).then(function (facultyRanks, viewModel) {
                    _this.facultyRanks(facultyRanks);
                    ko.mapping.fromJS(viewModel, {
                        ignore: "personId"
                    }, _this);
                    _this.personId = viewModel.personId;
                    _this._originalValues = viewModel;
                    if(!_this._isInitialized) {
                        $(_this).trigger('ready');
                        _this._isInitialized = true;
                        _this.$facultyRanks().kendoDropDownList();
                    }
                }, function (xhr, textStatus, errorThrown) {
                });
            };
            Profile.prototype.startTab = function (tabName) {
                var _this = this;
                var viewModel;
                if((tabName === "Activities") || (tabName === "activities")) {
                    if(this._activitiesViewModel == null) {
                        this._activitiesViewModel = new ViewModels.Activities.ActivityList(this.personId);
                        this._activitiesViewModel.load().done(function () {
                            ko.applyBindings(_this._activitiesViewModel, $("#activities")[0]);
                        }).fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                    }
                } else if((tabName === "Geographic Expertise") || (tabName === "geographic-expertise")) {
                    if(this._geographicExpertisesViewModel == null) {
                        this._geographicExpertisesViewModel = new ViewModels.GeographicExpertises.GeographicExpertiseList(this.personId);
                        this._geographicExpertisesViewModel.load().done(function () {
                            ko.applyBindings(_this._geographicExpertisesViewModel, $("#geographic-expertises")[0]);
                        }).fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                    }
                } else if((tabName === "Language Expertise") || (tabName === "language-expertise")) {
                } else if((tabName === "Formal Education") || (tabName === "formal-education")) {
                    if(this._degreesViewModel == null) {
                        this._degreesViewModel = new ViewModels.Degrees.DegreeList(this.personId);
                        this._degreesViewModel.load().done(function () {
                            ko.applyBindings(_this._degreesViewModel, $("#degrees")[0]);
                        }).fail(function (jqXhr, textStatus, errorThrown) {
                            alert(textStatus + "|" + errorThrown);
                        });
                    }
                } else if((tabName === "Affiliations") || (tabName === "affiliations")) {
                }
            };
            Profile.prototype.tabClickHandler = function (event) {
                var tabName = event.item.innerText;
                if(tabName == null) {
                    tabName = event.item.textContent;
                }
                this.startTab(tabName);
            };
            Profile.prototype.startEditing = function () {
                this.editMode(true);
                if(this.$editSection.length) {
                    this.$editSection.slideDown();
                }
            };
            Profile.prototype.stopEditing = function () {
                this.editMode(false);
                if(this.$editSection.length) {
                    this.$editSection.slideUp();
                }
            };
            Profile.prototype.cancelEditing = function () {
                ko.mapping.fromJS(this._originalValues, {
                }, this);
                this.stopEditing();
            };
            Profile.prototype.saveInfo = function () {
                var _this = this;
                if(!this.isValid()) {
                    this.errors.showAllMessages();
                } else {
                    var apiModel = ko.mapping.toJS(this);
                    this.saveSpinner.start();
                    $.ajax({
                        url: App.Routes.WebApi.My.Profile.put(),
                        type: 'PUT',
                        data: apiModel
                    }).done(function (responseText, statusText, xhr) {
                        App.flasher.flash(responseText);
                        _this.stopEditing();
                        _this._initialize();
                    }).fail(function () {
                    }).always(function () {
                        _this.saveSpinner.stop();
                    });
                }
            };
            Profile.prototype.startDeletingPhoto = function () {
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
                                    _this._deletePhoto();
                                }
                            }, 
                            {
                                text: 'No, cancel delete',
                                click: function () {
                                    _this.$confirmPurgeDialog.dialog('close');
                                    _this.photoDeleteSpinner.stop();
                                },
                                'data-css-link': true
                            }
                        ]
                    });
                } else if(confirm('Are you sure you want to delete your profile photo?')) {
                    this._deletePhoto();
                }
            };
            Profile.prototype._deletePhoto = function () {
                var _this = this;
                this.photoDeleteSpinner.start();
                this.isPhotoExtensionInvalid(false);
                this.isPhotoTooManyBytes(false);
                this.isPhotoFailureUnexpected(false);
                $.ajax({
                    url: App.Routes.WebApi.My.Profile.Photo.del(),
                    type: 'DELETE'
                }).always(function () {
                    _this.photoDeleteSpinner.stop();
                }).done(function (response, statusText, xhr) {
                    if(typeof response === 'string') {
                        App.flasher.flash(response);
                    }
                    _this.hasPhoto(false);
                    _this.photoSrc(App.Routes.WebApi.My.Profile.Photo.get({
                        maxSide: 128,
                        refresh: new Date().toUTCString()
                    }));
                }).fail(function () {
                    _this.isPhotoFailureUnexpected(true);
                });
            };
            Profile.prototype._setupValidation = function () {
                this.displayName.extend({
                    required: {
                        message: 'Display name is required.'
                    },
                    maxLength: 200
                });
                this.salutation.extend({
                    maxLength: 50
                });
                this.firstName.extend({
                    maxLength: 100
                });
                this.middleName.extend({
                    maxLength: 100
                });
                this.lastName.extend({
                    maxLength: 100
                });
                this.suffix.extend({
                    maxLength: 50
                });
                this.jobTitles.extend({
                    maxLength: 500
                });
                this.administrativeAppointments.extend({
                    maxLength: 500
                });
                ko.validation.group(this);
            };
            Profile.prototype._setupKendoWidgets = function () {
                var _this = this;
                this.$nameSalutation.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        newValue.kendoComboBox({
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: new kendo.data.DataSource({
                                transport: {
                                    read: {
                                        url: App.Routes.WebApi.People.Names.Salutations.get()
                                    }
                                }
                            })
                        });
                    }
                });
                this.$nameSuffix.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        newValue.kendoComboBox({
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: new kendo.data.DataSource({
                                transport: {
                                    read: {
                                        url: App.Routes.WebApi.People.Names.Suffixes.get()
                                    }
                                }
                            })
                        });
                    }
                });
                this.$photo.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        newValue.kendoUpload({
                            multiple: false,
                            showFileList: false,
                            localization: {
                                select: 'Choose a photo to upload...'
                            },
                            async: {
                                saveUrl: App.Routes.WebApi.My.Profile.Photo.post(),
                                removeUrl: App.Routes.WebApi.My.Profile.Photo.kendoRemove()
                            },
                            upload: function (e) {
                                var allowedExtensions = [
                                    '.png', 
                                    '.jpg', 
                                    '.jpeg', 
                                    '.gif'
                                ];
                                _this.isPhotoExtensionInvalid(false);
                                _this.isPhotoTooManyBytes(false);
                                _this.isPhotoFailureUnexpected(false);
                                $(e.files).each(function (index) {
                                    var isExtensionAllowed = false;
                                    var isByteNumberAllowed = false;
                                    var extension = e.files[index].extension;
                                    _this.photoFileExtension(extension || '[NONE]');
                                    _this.photoFileName(e.files[index].name);
                                    for(var i = 0; i < allowedExtensions.length; i++) {
                                        if(allowedExtensions[i] === extension.toLowerCase()) {
                                            isExtensionAllowed = true;
                                            break;
                                        }
                                    }
                                    if(!isExtensionAllowed) {
                                        e.preventDefault();
                                        _this.isPhotoExtensionInvalid(true);
                                    } else if(e.files[index].rawFile.size > (1024 * 1024)) {
                                        e.preventDefault();
                                        _this.isPhotoTooManyBytes(true);
                                    }
                                });
                                if(!e.isDefaultPrevented()) {
                                    _this.photoUploadSpinner.start();
                                }
                            },
                            complete: function () {
                                _this.photoUploadSpinner.stop();
                            },
                            success: function (e) {
                                if(e.operation == 'upload') {
                                    if(e.response && e.response.message) {
                                        App.flasher.flash(e.response.message);
                                    }
                                    _this.hasPhoto(true);
                                    _this.photoSrc(App.Routes.WebApi.My.Profile.Photo.get({
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
                                    _this.photoFileName(fileName);
                                }
                                if(fileExtension) {
                                    _this.photoFileExtension(fileExtension);
                                }
                                if(e.XMLHttpRequest.status === 415) {
                                    _this.isPhotoExtensionInvalid(true);
                                } else if(e.XMLHttpRequest.status === 413) {
                                    _this.isPhotoTooManyBytes(true);
                                } else {
                                    _this.isPhotoFailureUnexpected(true);
                                }
                            }
                        });
                    }
                });
            };
            Profile.prototype._setupDisplayNameDerivation = function () {
                var _this = this;
                this.displayName.subscribe(function (newValue) {
                    if(!_this.isDisplayNameDerived()) {
                        _this._userDisplayName = newValue;
                    }
                });
                ko.computed(function () {
                    if(_this.isDisplayNameDerived() && _this._isInitialized) {
                        var data = ko.mapping.toJS(_this);
                        $.ajax({
                            url: App.Routes.WebApi.People.Names.DeriveDisplayName.get(),
                            type: 'GET',
                            cache: false,
                            data: data
                        }).done(function (result) {
                            _this.displayName(result);
                        });
                    } else if(_this._isInitialized) {
                        if(!_this._userDisplayName) {
                            _this._userDisplayName = _this.displayName();
                        }
                        _this.displayName(_this._userDisplayName);
                    }
                }).extend({
                    throttle: 400
                });
            };
            Profile.prototype._setupCardComputeds = function () {
                var _this = this;
                this.genderText = ko.computed(function () {
                    var genderCode = _this.gender();
                    if(genderCode === 'M') {
                        return 'Male';
                    }
                    if(genderCode === 'F') {
                        return 'Female';
                    }
                    if(genderCode === 'P') {
                        return 'Gender Undisclosed';
                    }
                    return 'Gender Unknown';
                });
                this.isActiveText = ko.computed(function () {
                    return _this.isActive() ? 'Active' : 'Inactive';
                });
                this.isFacultyRankEditable = ko.computed(function () {
                    return _this.facultyRanks() && _this.facultyRanks().length > 0;
                });
                this.facultyRankText = ko.computed(function () {
                    var id = _this.facultyRankId();
                    for(var i = 0; i < _this.facultyRanks().length; i++) {
                        var facultyRank = _this.facultyRanks()[i];
                        if(id === facultyRank.id) {
                            return facultyRank.rank;
                        }
                    }
                    return undefined;
                });
                this.isFacultyRankVisible = ko.computed(function () {
                    return _this.isFacultyRankEditable() && _this.facultyRankId() && _this.facultyRankText() && _this.facultyRankText().toLowerCase() !== 'other';
                });
            };
            return Profile;
        })();
        My.Profile = Profile;        
    })(ViewModels.My || (ViewModels.My = {}));
    var My = ViewModels.My;
})(ViewModels || (ViewModels = {}));
