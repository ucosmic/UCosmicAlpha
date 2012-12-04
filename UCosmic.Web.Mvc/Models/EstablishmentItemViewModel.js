/// <reference path="../scripts/jquery-1.8.0.js" />
/// <reference path="../scripts/knockout-2.2.0.js" />
/// <reference path="../scripts/knockout.mapping-latest.js" />
/// <reference path="../scripts/knockout.validation.debug.js" />
/// <reference path="../scripts/app/app.js" />
/// <reference path="../scripts/app/routes.js" />

ko.validation.rules['validEstablishmentNameText'] = {
    async: true,
    validator: function (val, vm, callback) {
        var validation = this;
        if (!vm.isTextValidatableAsync()) {
            callback(true);
        }
        else if (!validation.isAwaitingResponse) {
            var route = app.routes.webApi.establishmentNames.validateText(vm.ownerId(), vm.id());
            validation.isAwaitingResponse = true;
            $.post(route, vm.serializeData())
            .complete(function () {
                validation.isAwaitingResponse = false;
            })
            .success(function () {
                callback(true);
            })
            .error(function (xhr) {
                callback({ isValid: false, message: xhr.responseText });
            });
        }
    },
    message: 'error'
};

function EstablishmentNameViewModel(js, $parent) {
    var self = this;
    var saveEditorClicked = false;
    if (!js)
        js = {
            id: 0,
            ownerId: $parent.id,
            text: '',
            isOfficialName: false,
            isFormerName: false,
            languageCode: '',
            languageName: ''
        };
    var originalValues = js; // hold onto original values so they can be reset on cancel
    ko.mapping.fromJS(js, {}, self); // map api properties to observables

    self.isOfficialNameEnabled = ko.computed(function() {
        return !originalValues.isOfficialName;
    });

    self.isTextValidatableAsync = ko.computed(function () {
        return self.text() !== originalValues.text;
    });

    // validate text property
    self.text.extend({
        required: {
            message: 'Establishment name is required.'
        },
        maxLength: 400,
        validEstablishmentNameText: self
    });

    self.text.isValidating.subscribe(function (isValidating) {
        if (isValidating) {
            self.isSpinningSaveValidator(true);
        }
        else {
            self.isSpinningSaveValidator(false);
            if (saveEditorClicked) self.saveEditor();
        }
    });

    self.textElement = undefined; // bind to this so we can focus it on actions
    self.languagesElement = undefined; // bind to this so we can restore on back button
    self.selectedLanguageCode = ko.observable(js.languageCode); // shadow to restore after list items are bound
    $parent.languages.subscribe(function () { // select correct option after options are loaded
        self.selectedLanguageCode(self.languageCode()); // shadow property is bound to dropdown list
    });

    self.isOfficialName.subscribe(function (newValue) { // official name cannot be former name
        if (newValue) self.isFormerName(false);
    });

    self.isSpinningSaveValidator = ko.observable(false);
    self.isSpinningSave = ko.observable(false); // when save button is clicked
    self.editMode = ko.observable(); // shows either form or read-only view
    self.showEditor = function () { // click to hide viewer and show editor
        var editingName = $parent.editingName(); // disallow if another name is being edited
        if (!editingName) {
            $parent.editingName(self.id() || -1); // tell parent which item is being edited
            self.editMode(true); // show the form / hide the viewer
            $(self.textElement).trigger('autosize');
            $(self.textElement).focus(); // focus the text box
        }
    };

    self.saveEditor = function () {
        saveEditorClicked = true;
        if (!self.isValid()) { // validate
            saveEditorClicked = false;
            self.errors.showAllMessages();
        }
        else if (!self.text.isValidating()) { // hit server
            saveEditorClicked = false;
            self.isSpinningSave(true); // start save spinner

            if (self.id()) {
                $.ajax({ // submit ajax PUT request
                    url: app.routes.webApi.establishmentNames.put($parent.id, self.id()),
                    type: 'PUT',
                    data: self.serializeData()
                })
                .success(mutationSuccess).error(mutationError);
            }
            else if ($parent.id) {
                $.ajax({ // submit ajax POST request
                    url: app.routes.webApi.establishmentNames.post($parent.id),
                    type: 'POST',
                    data: self.serializeData()
                })
                .success(mutationSuccess).error(mutationError);
            }
        }
    };

    self.cancelEditor = function () { // decide not to edit this item
        $parent.editingName(undefined); // tell parent no item is being edited anymore
        if (self.id()) {
            ko.mapping.fromJS(originalValues, {}, self); // restore original values
            self.editMode(false); // hide the form, show the view
        }
        else {
            $parent.names.shift(); // remove the new empty item
        }
    };

    self.clickOfficialNameCheckbox = function () { // educate users on how to change the official name
        if (originalValues.isOfficialName) { // only when the name is already official in the db
            $($parent.genericAlertDialog).find('p.content')
                .html('In order to choose a different official name for this establishment, edit the name you wish to make the new official name.');
            $($parent.genericAlertDialog).dialog({
                title: 'Alert Message',
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: {
                    'Ok': function () { $(this).dialog('close'); }
                }
            });
        }
        return true;
    };

    self.isSpinningPurge = ko.observable(false);
    self.purge = function (vm, e) {
        e.stopPropagation();
        if ($parent.editingName()) return;
        if (self.isOfficialName()) {
            $($parent.genericAlertDialog).find('p.content')
                .html('You cannot delete an establishment\'s official name.<br />To delete this name, first assign another name as official.');
            $($parent.genericAlertDialog).dialog({
                title: 'Alert Message',
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: {
                    'Ok': function () { $(this).dialog('close'); }
                }
            });
            return;
        }
        self.isSpinningPurge(true);
        var shouldRemainSpinning = false;
        $(self.confirmPurgeDialog).dialog({
            dialogClass: 'jquery-ui',
            width: 'auto',
            resizable: false,
            modal: true,
            close: function () {
                if (!shouldRemainSpinning) self.isSpinningPurge(false);
            },
            buttons: [
                {
                    text: 'Yes, confirm delete',
                    click: function () {
                        shouldRemainSpinning = true;
                        $(self.confirmPurgeDialog).dialog('close');
                        $.ajax({ // submit ajax DELETE request
                            url: app.routes.webApi.establishmentNames.del($parent.id, self.id()),
                            type: 'DELETE'
                        })
                        .success(mutationSuccess)
                        .error(mutationError);
                    }
                },
                {
                    text: 'No, cancel delete',
                    click: function () {
                        $(self.confirmPurgeDialog).dialog('close');
                        self.isSpinningPurge(false);
                    },
                    'data-css-link': true
                }
            ]
        });
    };

    self.serializeData = function () {
        return {
            id: self.id(),
            ownerId: self.ownerId(),
            text: $.trim(self.text()),
            isOfficialName: self.isOfficialName(),
            isFormerName: self.isFormerName(),
            languageCode: self.selectedLanguageCode(),
        };
    };
    var mutationError = function (xhr) {
        if (xhr.status === 400) { // validation message will be in xhr response text...
            $($parent.genericAlertDialog).find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
            $($parent.genericAlertDialog).dialog({
                title: 'Alert Message',
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: {
                    'Ok': function () { $(this).dialog('close'); }
                }
            });
        }
        self.isSpinningSave(false); // stop save spinner TODO: what if server throws non-validation exception?
        self.isSpinningPurge(false);
    };
    var mutationSuccess = function (response) {
        $parent.requestNames(function () { // when parent receives response,
            $parent.editingName(undefined); // tell parent no item is being edited anymore
            self.editMode(false); // hide the form, show the view
            self.isSpinningSave(false); // stop save spinner
            self.isSpinningPurge(false); // stop purge spinner
            app.flasher.flash(response);
        });
    };

    ko.validation.group(self); // create a separate validation group for this item
}

ko.validation.rules['validEstablishmentUrlValue'] = {
    async: true,
    validator: function (val, vm, callback) {
        var validation = this;
        if (!vm.isValueValidatableAsync()) {
            callback(true);
        }
        else if (!validation.isAwaitingResponse) {
            var route = app.routes.webApi.establishmentUrls.validateValue(vm.ownerId(), vm.id());
            validation.isAwaitingResponse = true;
            $.post(route, vm.serializeData())
            .complete(function() {
                validation.isAwaitingResponse = false;
            })
            .success(function () {
                callback(true);
            })
            .error(function (xhr) {
                callback({ isValid: false, message: xhr.responseText });
            });
        }
    },
    message: 'error'
};

function EstablishmentUrlViewModel(js, $parent) {
    var self = this;
    var saveEditorClicked;
    if (!js)
        js = {
            id: 0,
            ownerId: $parent.id,
            value: '',
            isOfficialUrl: false,
            isFormerUrl: false
        };
    var originalValues = js; // hold onto original values so they can be reset on cancel
    ko.mapping.fromJS(js, {}, self); // map api properties to observables

    self.isOfficialUrlEnabled = ko.computed(function () {
        return !originalValues.isOfficialUrl;
    });

    self.isValueValidatableAsync = ko.computed(function () {
        return self.value() !== originalValues.value;
    });

    // validate value property
    self.value.extend({
        required: {
            message: 'Establishment URL is required.'
        },
        maxLength: 200,
        validEstablishmentUrlValue: self
    });

    self.value.isValidating.subscribe(function (isValidating) {
        if (isValidating) {
            self.isSpinningSaveValidator(true);
        }
        else {
            self.isSpinningSaveValidator(false);
            if (saveEditorClicked) self.saveEditor();
        }
    });

    self.valueElement = undefined; // bind to this so we can focus it on actions

    self.isOfficialUrl.subscribe(function (newValue) { // official url cannot be former url
        if (newValue) self.isFormerUrl(false);
    });

    self.isSpinningSaveValidator = ko.observable(false);
    self.isSpinningSave = ko.observable(false); // when save button is clicked
    self.editMode = ko.observable(); // shows either form or read-only view
    self.showEditor = function () { // click to hide viewer and show editor
        var editingUrl = $parent.editingUrl(); // disallow if another url is being edited
        if (!editingUrl) {
            $parent.editingUrl(self.id() || -1); // tell parent which item is being edited
            self.editMode(true); // show the form / hide the viewer
            $(self.valueElement).trigger('autosize');
            $(self.valueElement).focus(); // focus the text box
        }
    };

    self.saveEditor = function () {
        saveEditorClicked = true;
        if (!self.isValid()) { // validate
            saveEditorClicked = false;
            self.errors.showAllMessages();
        }
        else if (!self.value.isValidating()) { // hit server
            saveEditorClicked = false;
            self.isSpinningSave(true); // start save spinner

            if (self.id()) {
                $.ajax({ // submit ajax PUT request
                    url: app.routes.webApi.establishmentUrls.put($parent.id, self.id()),
                    type: 'PUT',
                    data: self.serializeData()
                })
                .success(mutationSuccess).error(mutationError);
            }
            else if ($parent.id) {
                $.ajax({ // submit ajax POST request
                    url: app.routes.webApi.establishmentUrls.post($parent.id),
                    type: 'POST',
                    data: self.serializeData()
                })
                .success(mutationSuccess).error(mutationError);
            }
        }
    };

    self.cancelEditor = function () { // decide not to edit this item
        $parent.editingUrl(undefined); // tell parent no item is being edited anymore
        if (self.id()) {
            ko.mapping.fromJS(originalValues, {}, self); // restore original values
            self.editMode(false); // hide the form, show the view
        }
        else {
            $parent.urls.shift(); // remove the new empty item
        }
    };

    self.clickOfficialUrlCheckbox = function () { // educate users on how to change the official url
        if (originalValues.isOfficialUrl) { // only when the url is already official in the db
            $($parent.genericAlertDialog).find('p.content')
                .html('In order to choose a different official URL for this establishment, edit the URL you wish to make the new official URL.');
            $($parent.genericAlertDialog).dialog({
                title: 'Alert Message',
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: {
                    'Ok': function () { $(this).dialog('close'); }
                }
            });
        }
        return true;
    };

    self.valueHref = ko.computed(function() {
        var url = self.value();
        if (!url) return url;
        return 'http://' + url;
    });

    self.clickLink = function (vm, e) {
        e.stopPropagation();
        return true;
    };

    self.isSpinningPurge = ko.observable(false);
    self.purge = function (vm, e) {
        e.stopPropagation();
        if ($parent.editingUrl()) return;
        if (self.isOfficialUrl()) {
            $($parent.genericAlertDialog).find('p.content')
                .html('You cannot delete an establishment\'s official URL.<br />To delete this URL, first assign another URL as official.');
            $($parent.genericAlertDialog).dialog({
                title: 'Alert Message',
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: {
                    'Ok': function () { $(this).dialog('close'); }
                }
            });
            return;
        }
        self.isSpinningPurge(true);
        var shouldRemainSpinning = false;
        $(self.confirmPurgeDialog).dialog({
            dialogClass: 'jquery-ui',
            width: 'auto',
            resizable: false,
            modal: true,
            close: function () {
                if (!shouldRemainSpinning) self.isSpinningPurge(false);
            },
            buttons: [
                {
                    text: 'Yes, confirm delete',
                    click: function () {
                        shouldRemainSpinning = true;
                        $(self.confirmPurgeDialog).dialog('close');
                        $.ajax({ // submit ajax DELETE request
                            url: app.routes.webApi.establishmentUrls.del($parent.id, self.id()),
                            type: 'DELETE'
                        })
                        .success(mutationSuccess)
                        .error(mutationError);
                    }
                },
                {
                    text: 'No, cancel delete',
                    click: function () {
                        $(self.confirmPurgeDialog).dialog('close');
                        self.isSpinningPurge(false);
                    },
                    'data-css-link': true
                }
            ]
        });
    };

    self.serializeData = function () {
        return {
            id: self.id(),
            ownerId: self.ownerId(),
            value: $.trim(self.value()),
            isOfficialUrl: self.isOfficialUrl(),
            isFormerUrl: self.isFormerUrl()
        };
    };
    var mutationError = function (xhr) {
        if (xhr.status === 400) { // validation message will be in xhr response text...
            $($parent.genericAlertDialog).find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
            $($parent.genericAlertDialog).dialog({
                title: 'Alert Message',
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: {
                    'Ok': function () { $(this).dialog('close'); }
                }
            });
        }
        self.isSpinningSave(false); // stop save spinner TODO: what if server throws non-validation exception?
        self.isSpinningPurge(false);
    };
    var mutationSuccess = function (response) {
        $parent.requestUrls(function () { // when parent receives response,
            $parent.editingUrl(undefined); // tell parent no item is being edited anymore
            self.editMode(false); // hide the form, show the view
            self.isSpinningSave(false); // stop save spinner
            self.isSpinningPurge(false); // stop purge spinner
            app.flasher.flash(response);
        });
    };

    ko.validation.group(self); // create a separate validation group for this item
}

function EstablishmentItemViewModel(id) {
    var self = this;

    self.id = id || 0; // initialize the aggregate id
    self.genericAlertDialog = undefined;

    // languages dropdowns
    self.languages = ko.observableArray(); // select options
    ko.computed(function () { // get languages from the server
        $.getJSON(app.routes.webApi.languages.get())
        .success(function (response) {
            response.splice(0, 0, { code: undefined, name: '[Language Neutral]' }); // add null option
            self.languages(response); // set the options dropdown
        });
    })
    .extend({ throttle: 1 });

    // names
    self.isSpinningNames = ko.observable(true);
    self.names = ko.observableArray();
    self.editingName = ko.observable();
    self.namesMapping = {
        create: function (options) {
            return new EstablishmentNameViewModel(options.data, self);
        }
    };
    self.receiveNames = function (js) {
        ko.mapping.fromJS(js || [], self.namesMapping, self.names);
        self.isSpinningNames(false);
        app.obtrude(document);
    };
    self.requestNames = function (callback) {
        self.isSpinningNames(true);
        $.get(app.routes.webApi.establishmentNames.get(self.id), {})
        .success(function (response) {
            self.receiveNames(response);
            if (callback) callback(response);
        });
    };
    self.addName = function () {
        var newName = new EstablishmentNameViewModel(null, self);
        self.names.unshift(newName);
        newName.showEditor();
        app.obtrude(document);
    };

    ko.computed(self.requestNames).extend({ throttle: 1 });

    // urls
    self.isSpinningUrls = ko.observable(true);
    self.urls = ko.observableArray();
    self.editingUrl = ko.observable();
    self.urlsMapping = {
        create: function (options) {
            return new EstablishmentUrlViewModel(options.data, self);
        }
    };
    self.receiveUrls = function (js) {
        ko.mapping.fromJS(js || [], self.urlsMapping, self.urls);
        self.isSpinningUrls(false);
        app.obtrude(document);
    };
    self.requestUrls = function (callback) {
        self.isSpinningUrls(true);
        $.get(app.routes.webApi.establishmentUrls.get(self.id), {})
        .success(function (response) {
            self.receiveUrls(response);
            if (callback) callback(response);
        });
    };
    self.addUrl = function () {
        var newUrl = new EstablishmentUrlViewModel(null, self);
        self.urls.unshift(newUrl);
        newUrl.showEditor();
        app.obtrude(document);
    };

    ko.computed(self.requestUrls).extend({ throttle: 1 });
}

ko.validation.registerExtenders();
