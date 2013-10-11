var agreements;
(function (agreements) {
    var fileAttachments = (function () {
        function fileAttachments(agreementId, agreementIsEdit, spinner, establishmentItemViewModel, files) {
            //file vars
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
            this.fileUploadSpinner = new App.Spinner(new App.SpinnerOptions(400));
            this.fileDeleteSpinner = new App.Spinner(new App.SpinnerOptions(400));
            this.tempFileId = 0;
            this.agreementId = agreementId;
            this.files = files;
            this.agreementIsEdit = agreementIsEdit;
            this.spinner = spinner;
            this.establishmentItemViewModel = establishmentItemViewModel;

            //this.dfdPopFiles = dfdPopFiles;
            this.updateFile = this.updateFile.bind(this);
            this.fileVisibilityClicked = this.fileVisibilityClicked.bind(this);
            this.removeFile = this.removeFile.bind(this);
        }
        //files = ko.mapping.fromJS([]);
        fileAttachments.prototype.$bindKendoFile = function () {
            var _this = this;
            var saveUrl = "";

            if (this.agreementIsEdit()) {
                saveUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId.val);
            } else {
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
                            agreementId: _this.agreementId.val
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
                            } else {
                                myUrl = e.response.location;
                            }
                            myId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                        } else {
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
                            customNameFile: e.files[0].name.substring(0, e.files[0].name.indexOf(e.files[0].extension)),
                            customNameExt: e.files[0].extension
                        }));
                        $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));
                    }
                },
                error: function (e) {
                    // kendo response is as json string, not js object
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

        fileAttachments.prototype.removeFile = function (me, e) {
            var _this = this;
            if (confirm('Are you sure you want to remove this file from this agreement?')) {
                // all files will have a guid in create, none will have a guid in edit agreement
                // so do a check for agreementId - if it is undefined(for now 0)
                var url = "";

                if (this.agreementIsEdit()) {
                    url = App.Routes.WebApi.Agreements.Files.del(this.agreementId.val, me.id());
                } else {
                    url = App.Routes.WebApi.Uploads.del(me.guid());
                }
                $.ajax({
                    url: url,
                    type: 'DELETE',
                    success: function () {
                        _this.files.remove(me);
                        $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                    }
                });
            }
            e.preventDefault();
            e.stopPropagation();
        };

        fileAttachments.prototype.editAFile = function (me, e) {
            me.isEdit(true);
        };

        fileAttachments.prototype.cancelEditAFile = function (me, e) {
            me.customNameFile(me.customName().substring(0, me.customName().lastIndexOf(".")));
            me.isEdit(false);
            e.stopImmediatePropagation();
            return false;
        };

        fileAttachments.prototype.updateFile = function (me, e) {
            var _this = this;
            me.customName(me.customNameFile() + me.customNameExt());
            me.isEdit(false);
            if (this.agreementIsEdit()) {
                var data = ko.mapping.toJS({
                    agreementId: me.agreementId,
                    uploadGuid: me.guid,
                    originalName: me.guid,
                    extension: me.extension,
                    customName: me.customName,
                    visibility: me.visibility
                }), url = App.Routes.WebApi.Agreements.Files.put(this.agreementId.val, me.id());

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

        fileAttachments.prototype.bindJquery = function () {
            this.$bindKendoFile();
            $("#helpExpDate").kendoTooltip({
                width: 520,
                position: "top",
                content: $("#templateExpToolTip").html(),
                showOn: "click",
                autoHide: false
            });
        };

        fileAttachments.prototype.fileVisibilityClicked = function (me, e) {
            var _this = this;
            if (this.agreementIsEdit() && e.target.textContent == "") {
                var data = ko.mapping.toJS({
                    agreementId: this.agreementId.val,
                    uploadGuid: me.guid,
                    originalName: me.guid,
                    extension: me.extension,
                    customName: me.customName,
                    visibility: me.visibility
                }), url = App.Routes.WebApi.Agreements.Files.put(this.agreementId.val, me.id());

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

        //populateFiles(): void {
        //    $.get(App.Routes.WebApi.Agreements.Files.get(this.agreementId.val), { useTestData: true })
        //        .done((response: any): void => {
        //            $.each(response, (i, item) => {
        //                this.files.push(ko.mapping.fromJS({
        //                    id: item.id,
        //                    originalName: item.originalName,
        //                    customName: item.customName,
        //                    visibility: item.visibility,
        //                    isEdit: false,
        //                    customNameFile: item.customName.substring(0, item.customName.lastIndexOf(".")),
        //                    customNameExt: item.customName.substring(item.customName.lastIndexOf("."), item.customName.length)
        //                }));
        //            });
        //            this.dfdPopFiles.resolve();
        //        });
        //}
        //post files
        fileAttachments.prototype.postMe = function (data, url) {
            var _this = this;
            $.post(url, data).done(function (response, statusText, xhr) {
            }).fail(function (xhr, statusText, errorThrown) {
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
            });
        };

        //part of save agreement
        fileAttachments.prototype.agreementPostFiles = function (response, statusText, xhr) {
            var _this = this;
            var tempUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId.val), data;

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
            this.spinner.stop();
        };
        return fileAttachments;
    })();
    agreements.fileAttachments = fileAttachments;
})(agreements || (agreements = {}));
