module agreements {

    export class fileAttachments {
        constructor(agreementId, agreementIsEdit, spinner, establishmentItemViewModel, dfdPopFiles) {
            this.agreementId = agreementId;
            this.agreementIsEdit = agreementIsEdit;
            this.spinner = spinner;
            this.establishmentItemViewModel = establishmentItemViewModel;
            this.dfdPopFiles = dfdPopFiles;

            this.updateFile = <() => void > this.updateFile.bind(this);
            this.fileVisibilityClicked = <() => boolean > this.fileVisibilityClicked.bind(this);
            this.removeFile = <() => void > this.removeFile.bind(this);
        }
        //imported vars
        agreementId;
        agreementIsEdit;
        spinner;
        establishmentItemViewModel;
        dfdPopFiles;

        //file vars
        $file: KnockoutObservable<JQuery> = ko.observable();
        hasFile: KnockoutObservable<boolean> = ko.observable();
        isFileExtensionInvalid: KnockoutObservable<boolean> = ko.observable(false);
        isFileTooManyBytes: KnockoutObservable<boolean> = ko.observable(false);
        isFileFailureUnexpected: KnockoutObservable<boolean> = ko.observable(false);
        isFileInvalid: KnockoutObservable<boolean> = ko.observable(false);
        fileError: KnockoutObservable<string> = ko.observable();
        fileFileExtension: KnockoutObservable<string> = ko.observable();
        fileFileName: KnockoutObservable<string> = ko.observable();
        fileSrc: KnockoutObservable<string> = ko.observable();
        fileUploadSpinner = new App.Spinner(new App.SpinnerOptions(400));
        fileDeleteSpinner = new App.Spinner(new App.SpinnerOptions(400));
        $confirmPurgeDialog: JQuery;
        tempFileId = 0;
        files = ko.mapping.fromJS([]);
        $bindKendoFile(): void {
            var saveUrl = "";
            if (this.agreementIsEdit()) {
                    saveUrl = App.Routes.WebApi.Agreements.Files.post(this.agreementId.val)
            } else {
                    saveUrl = App.Routes.WebApi.Uploads.post()
            }
            $("#fileUpload").kendoUpload({
                multiple: true,
                showFileList: false,
                localization: {
                    select: 'Choose a file to upload...'
                },
                select: (e: any): void => {
                    //when selecting multiple files, this is only called 1 time, so we need to loop through e.files list
                    for (var i = 0; i < e.files.length; i++) {
                        var data = ko.mapping.toJS({
                            Name: e.files[i].name,
                            Length: e.files[i].rawFile.size
                        })
                    var url = App.Routes.WebApi.Agreements.Files.Validate.post();
                        $.ajax({
                            type: 'POST',
                            url: url,
                            async: false,
                            data: data,
                            success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                                this.isFileInvalid(false);
                            },
                            error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                                e.preventDefault();
                                this.isFileInvalid(true);
                                this.fileError(xhr.responseText);
                            }
                        });
                    }
                },
                async: {
                    saveUrl: saveUrl
                },
                upload: (e: any): void => {
                    if (this.agreementIsEdit()) {
                        e.data = {
                            originalName: e.files[0].name,
                            visibility: 'Private',
                            customName: e.files[0].name,
                            agreementId: this.agreementId.val
                        }
                }
                    if (!e.isDefaultPrevented()) {
                        this.fileUploadSpinner.start(); // display async wait message
                    }
                },
                complete: (): void => {
                    this.fileUploadSpinner.stop(); // hide async wait message
                },
                success: (e: any): void => {
                    // this event is triggered by both upload and remove requests
                    // ignore remove operations because they don't actually do anything
                    if (e.operation == 'upload') {
                        if (e.response && e.response.message) {
                            App.flasher.flash(e.response.message);
                        }
                        var myId;
                        if (this.agreementIsEdit()) {
                            var myUrl;
                            if (e.XMLHttpRequest != undefined) {
                                myUrl = e.XMLHttpRequest.getResponseHeader('Location')
                        } else {
                                myUrl = e.response.location
                        }
                            myId = parseInt(myUrl.substring(myUrl.lastIndexOf("/") + 1));
                        } else {
                            this.tempFileId = this.tempFileId + .01
                        myId = this.tempFileId
                    }
                        this.files.push(ko.mapping.fromJS({
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
                error: (e: any): void => {
                    // kendo response is as json string, not js object
                    var fileName: string, fileExtension: string;

                    if (e.files && e.files.length > 0) {
                        fileName = e.files[0].name;
                        fileExtension = e.files[0].extension;
                    }
                    if (fileName) this.fileFileName(fileName);
                    if (fileExtension) this.fileFileExtension(fileExtension);

                    if (e.XMLHttpRequest.status === 415)
                        this.isFileExtensionInvalid(true);
                    else if (e.XMLHttpRequest.status === 413)
                        this.isFileTooManyBytes(true);
                    else this.isFileFailureUnexpected(true);
                }
            });

        }

        removeFile(me, e): void {
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
                    success: (): void => {
                        this.files.remove(me);
                        $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                    }
                })
        }
            e.preventDefault();
            e.stopPropagation();
        }

        editAFile(me, e): void {
            me.isEdit(true);
        }

        cancelEditAFile(me, e): boolean {
            me.customNameFile(me.customName().substring(0, me.customName().lastIndexOf(".")))
        me.isEdit(false);
            e.stopImmediatePropagation();
            return false;
        }

        updateFile(me, e): void {
            me.customName(me.customNameFile() + me.customNameExt())
        me.isEdit(false);
            if (this.agreementIsEdit()) {
                var data = ko.mapping.toJS({
                    agreementId: me.agreementId,
                    uploadGuid: me.guid,
                    originalName: me.guid,
                    extension: me.extension,
                    customName: me.customName,
                    visibility: me.visibility
                })
            var url = App.Routes.WebApi.Agreements.Files.put(this.agreementId.val, me.id());
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                    },
                    error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                        this.spinner.stop();
                        if (xhr.status === 400) { // validation message will be in xhr response text...
                            this.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                                .html(xhr.responseText.replace('\n', '<br /><br />'));
                            this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                title: 'Alert Message',
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    'Ok': (): void => { this.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
                                }
                            });
                        }
                    }
                });
            }
        }

        bindJquery(): void {
            this.$bindKendoFile();
            $("#helpExpDate").kendoTooltip({
                width: 520,
                position: "top",
                content: $("#templateExpToolTip").html(),
                showOn: "click",
                autoHide: false
            })
        }

        fileVisibilityClicked(me, e): boolean {
            //add e.target.textContent for double click firing.
            if (this.agreementIsEdit() && e.target.textContent == "") {
                var data = ko.mapping.toJS({
                    agreementId: this.agreementId.val,
                    uploadGuid: me.guid,
                    originalName: me.guid,
                    extension: me.extension,
                    customName: me.customName,
                    visibility: me.visibility
                })
            var url = App.Routes.WebApi.Agreements.Files.put(this.agreementId.val, me.id());
                $.ajax({
                    type: 'PUT',
                    url: url,
                    data: data,
                    success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                    },
                    error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                        this.spinner.stop();
                        if (xhr.status === 400) { // validation message will be in xhr response text...
                            this.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                                .html(xhr.responseText.replace('\n', '<br /><br />'));
                            this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                title: 'Alert Message',
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    'Ok': (): void => { this.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
                                }
                            });
                        }
                    }
                });
            }
            return true;
        }

        populateFiles(): void {
            $.get(App.Routes.WebApi.Agreements.Files.get(this.agreementId.val), { useTestData: true })
                .done((response: any): void => {
                    $.each(response, (i, item) => {
                        this.files.push(ko.mapping.fromJS({
                            id: item.id,
                            originalName: item.originalName,
                            customName: item.customName,
                            visibility: item.visibility,
                            isEdit: false,
                            customNameFile: item.customName.substring(0, item.customName.lastIndexOf(".")),
                            customNameExt: item.customName.substring(item.customName.lastIndexOf("."), item.customName.length)
                        }));
                    });
                    this.dfdPopFiles.resolve();
                });
        }

    }
}