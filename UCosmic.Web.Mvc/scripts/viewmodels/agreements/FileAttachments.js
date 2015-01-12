var Agreements;
(function (Agreements) {
    var FileAttachments = (function () {
        function FileAttachments(agreementId, agreementIsEdit, spinner, establishmentItemViewModel, files) {
            this.$file = ko.observable();
            this.hasFile = ko.observable();
            this.isFileExtensionInvalid = ko.observable(false);
            this.isFileTooManyBytes = ko.observable(false);
            this.isFileFailureUnexpected = ko.observable(false);
            this.isFileInvalid = ko.observable(false);
            this.fileError = ko.observable();
            this.fileFileExtension = ko.observable();
            this.fileFileName = ko.observable();
            this.fileSrc = ko.observable();
            this.fileUploadSpinner = new App.Spinner({ delay: 400, });
            this.fileDeleteSpinner = new App.Spinner({ delay: 400, });
            this.tempFileId = 0;
            this.agreementId = agreementId;
            this.files = files;
            this.agreementIsEdit = agreementIsEdit;
            this.spinner = spinner;
            this.establishmentItemViewModel = establishmentItemViewModel;
            this.updateFile = this.updateFile.bind(this);
            this.fileVisibilityClicked = this.fileVisibilityClicked.bind(this);
            this.removeFile = this.removeFile.bind(this);
        }
        FileAttachments.prototype._$bindKendoFile = function () {
            var _this = this;
            var saveUrl = "";
            if (this.agreementIsEdit()) {
                saveUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId);
            }
            else {
                saveUrl = App.Routes.WebApi.Uploads.post();
            }
            $("#fileUpload").kendoUpload({
                multiple: true,
                showFileList: false,
                localization: {
                    select: 'Choose a file to upload...'
                },
                select: function (e) {
                    var url, data;
                    for (var i = 0, j = e.files.length; i < j; i++) {
                        data = ko.mapping.toJS({
                            Name: e.files[i].name,
                            Length: e.files[i].rawFile.size
                        });
                        url = App.Routes.WebApi.Agreements.Files.Validate.post();
                        $.ajax({
                            type: 'POST',
                            url: url,
                            async: false,
                            data: data,
                            success: function (response, statusText, xhr) {
                                _this.isFileInvalid(false);
                            },
                            error: function (xhr, statusText, errorThrown) {
                                e.preventDefault();
                                _this.isFileInvalid(true);
                                _this.fileError(xhr.responseText);
                            }
                        });
                    }
                },
                async: {
                    saveUrl: saveUrl
                },
                upload: function (e) {
                    if (_this.agreementIsEdit()) {
                        e.data = {
                            originalName: e.files[0].name,
                            visibility: 'Private',
                            customName: e.files[0].name,
                            agreementId: _this.agreementId
                        };
                    }
                    if (!e.isDefaultPrevented()) {
                        _this.fileUploadSpinner.start();
                    }
                },
                complete: function () {
                    _this.fileUploadSpinner.stop();
                },
                success: function (e) {
                    if (e.operation == 'upload') {
                        var myId;
                        if (e.response && e.response.message) {
                            App.flasher.flash(e.response.message);
                        }
                        if (_this.agreementIsEdit()) {
                            var myUrl;
                            if (e.XMLHttpRequest != undefined) {
                                myUrl = e.XMLHttpRequest.getResponseHeader('Location');
                            }
                            else {
                                myUrl = e.response.location;
                            }
                            myId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                        }
                        else {
                            _this.tempFileId = _this.tempFileId + .01;
                            myId = _this.tempFileId;
                        }
                        _this.files.push(ko.mapping.fromJS({
                            id: myId,
                            originalName: e.files[0].name,
                            customName: e.files[0].name,
                            visibility: "Public",
                            guid: e.response.guid,
                            isEdit: false,
                            isNotValidated: false,
                            customNameFile: e.files[0].name.substring(0, e.files[0].name.indexOf(e.files[0].extension)),
                            customNameExt: e.files[0].extension
                        }));
                    }
                },
                error: function (e) {
                    var fileName, fileExtension;
                    if (e.files && e.files.length > 0) {
                        fileName = e.files[0].name;
                        fileExtension = e.files[0].extension;
                    }
                    if (fileName)
                        _this.fileFileName(fileName);
                    if (fileExtension)
                        _this.fileFileExtension(fileExtension);
                    if (e.XMLHttpRequest.status === 415)
                        _this.isFileExtensionInvalid(true);
                    else if (e.XMLHttpRequest.status === 413)
                        _this.isFileTooManyBytes(true);
                    else
                        _this.isFileFailureUnexpected(true);
                }
            });
        };
        FileAttachments.prototype.removeFile = function (me, e) {
            var _this = this;
            if (confirm('Are you sure you want to remove this file from this agreement?')) {
                var url = "";
                if (this.agreementIsEdit()) {
                    url = App.Routes.WebApi.Agreements.Files.del(this.agreementId, me.id());
                }
                else {
                    url = App.Routes.WebApi.Uploads.del(me.guid());
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
        FileAttachments.prototype.editAFile = function (me, e) {
            me.isEdit(true);
        };
        FileAttachments.prototype.cancelEditAFile = function (me, e) {
            me.customNameFile(me.customName().substring(0, me.customName().lastIndexOf(".")));
            me.isEdit(false);
            e.stopImmediatePropagation();
            return false;
        };
        FileAttachments.prototype.updateFile = function (me, e) {
            var _this = this;
            if (me.customNameFile().length > 0) {
                me.isNotValidated(false);
            }
            else {
                me.isNotValidated(true);
                return;
            }
            me.customName(me.customNameFile() + me.customNameExt());
            me.isEdit(false);
            if (this.agreementIsEdit()) {
                var data = ko.mapping.toJS({
                    agreementId: me.agreementId,
                    uploadGuid: me.guid,
                    originalName: me.originalName,
                    extension: me.customNameExt,
                    customName: me.customName,
                    visibility: me.visibility
                }), url = App.Routes.WebApi.Agreements.Files.put(this.agreementId, me.id());
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: function (response, statusText, xhr) {
                    },
                    error: function (xhr, statusText, errorThrown) {
                        _this.spinner.stop();
                        if (xhr.status === 400) {
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
                    }
                });
            }
        };
        FileAttachments.prototype.bindJquery = function () {
            this._$bindKendoFile();
            $("#helpExpDate").kendoTooltip({
                width: 520,
                position: "top",
                content: $("#templateExpToolTip").html(),
                showOn: "click",
                autoHide: false
            });
        };
        FileAttachments.prototype.fileVisibilityClicked = function (me, e) {
            var _this = this;
            if (me.customNameFile().length > 0) {
                me.isNotValidated(false);
            }
            else {
                me.isNotValidated(true);
                return false;
            }
            if (this.agreementIsEdit() && e.target.textContent == "") {
                var data = ko.mapping.toJS({
                    agreementId: me.agreementId,
                    uploadGuid: me.guid,
                    originalName: me.originalName,
                    extension: me.customNameExt,
                    customName: me.customName,
                    visibility: me.visibility
                }), url = App.Routes.WebApi.Agreements.Files.put(this.agreementId, me.id());
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: function (response, statusText, xhr) {
                    },
                    error: function (xhr, statusText, errorThrown) {
                        _this.spinner.stop();
                        if (xhr.status === 400) {
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
                    }
                });
            }
            return true;
        };
        FileAttachments.prototype.postMe = function (data, url) {
            var _this = this;
            $.ajax({
                type: 'POST',
                url: url,
                async: false,
                data: data,
                error: function (xhr, statusText, errorThrown) {
                    _this.spinner.stop();
                    App.Failures.message(xhr, xhr.responseText, true);
                }
            });
        };
        FileAttachments.prototype.agreementPostFiles = function (response, statusText, xhr, deferred) {
            var _this = this;
            var tempUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId), data;
            $.each(this.files(), function (i, item) {
                data = ko.mapping.toJS({
                    agreementId: item.agreementId,
                    uploadGuid: item.guid,
                    originalName: item.guid,
                    extension: item.extension,
                    customName: item.customName,
                    visibility: item.visibility
                });
                _this.postMe(data, tempUrl);
            });
            deferred.resolve();
            this.spinner.stop();
        };
        return FileAttachments;
    })();
    Agreements.FileAttachments = FileAttachments;
})(Agreements || (Agreements = {}));
