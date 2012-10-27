/// <reference path="../scripts/jquery-1.8.0.js" />
/// <reference path="../scripts/knockout-2.1.0.js" />
/// <reference path="../scripts/knockout.mapping-latest.js" />
/// <reference path="../scripts/knockout.validation.js" />
/// <reference path="../scripts/app/app.js" />
/// <reference path="../scripts/T4MvcJs/WebApiRoutes.js" />


function EstablishmentNameViewModel(js, $parent) {
    var self = this;
    if (!js)
        js = {
            id: 0,
            text: '',
            isOfficialName: false,
            isFormerName: false,
            languageCode: '',
            languageName: ''
        };
    self.originalValues = js; // hold onto original values so they can be reset on cancel
    ko.mapping.fromJS(js, {}, self); // map api properties to observables

    // validate text property
    self.text.extend({
        required: {
            message: 'Establishment name is required.'
        },
        maxLength: 400
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
        if (!self.isValid()) { // validate
            self.errors.showAllMessages();
        }
        else { // hit server
            self.isSpinningSave(true); // start save spinner

            if (self.id()) {
                $.ajax({ // submit ajax PUT request
                    url: '/api/establishments/names/' + self.id(), // TODO: put this in stronger URL helper
                    data: {
                        id: self.id(),
                        text: $.trim(self.text()),
                        isOfficialName: self.isOfficialName(),
                        isFormerName: self.isFormerName(),
                        languageCode: self.selectedLanguageCode(),
                    },
                    type: 'PUT'
                })
                .success(function() { // update the whole list (sort may be effected by this update)
                    $parent.requestNames(function() { // when parent receives response,
                        $parent.editingName(undefined); // tell parent no item is being edited anymore
                        self.editMode(false); // hide the form, show the view
                        self.isSpinningSave(false); // stop save spinner
                    });
                })
                .error(function(xhr) { // server will throw exceptions when invalid
                    if (xhr.responseText) { // validation message will be in xht response text...
                        var response = $.parseJSON(xhr.responseText); // ...as a string, parse it to JS
                        if (response.exceptionType === 'FluentValidation.ValidationException') {
                            alert(response.exceptionMessage); // alert validation messages only
                        }
                    }
                    self.isSpinningSave(false); // stop save spinner TODO: what if server throws non-validation exception?
                });
            }
            else if ($parent.id) {
                $.ajax({ // submit ajax POST request
                    url: '/api/establishments/' + $parent.id + '/names', // TODO: put this in stronger URL helper
                    data: {
                        text: $.trim(self.text()),
                        isOfficialName: self.isOfficialName(),
                        isFormerName: self.isFormerName(),
                        languageCode: self.selectedLanguageCode(),
                    },
                    type: 'POST'
                })
                .success(function () { // update the whole list (sort may be effected by this update)
                    $parent.requestNames(function () { // when parent receives response,
                        $parent.editingName(undefined); // tell parent no item is being edited anymore
                        self.editMode(false); // hide the form, show the view
                        self.isSpinningSave(false); // stop save spinner
                    });
                })
                .error(function (xhr) { // server will throw exceptions when invalid
                    if (xhr.responseText) { // validation message will be in xht response text...
                        var response = $.parseJSON(xhr.responseText); // ...as a string, parse it to JS
                        if (response.exceptionType === 'FluentValidation.ValidationException') {
                            alert(response.exceptionMessage); // alert validation messages only
                        }
                    }
                    self.isSpinningSave(false); // stop save spinner TODO: what if server throws non-validation exception?
                });
            }
        }
    };

    self.cancelEditor = function () { // decide not to edit this item
        $parent.editingName(undefined); // tell parent no item is being edited anymore
        if (self.id()) {
            ko.mapping.fromJS(self.originalValues, { }, self); // restore original values
            self.editMode(false); // hide the form, show the view
        }
        else {
            $parent.names.shift();
        }
    };

    self.clickOfficialNameCheckbox = function () { // TODO educate users on how to change the official name
        if (self.originalValues.isOfficialName) // only when the name is already official in the db
            alert('In order to choose a different official name for this establishment, edit the name you wish to make the new official name.');
        return true;
    };

    self.isSpinningPurge = ko.observable(false);
    self.confirmPurgeName = undefined;
    self.purge = function (vm, e) {
        e.stopPropagation();
        if ($parent.editingName()) return;
        if (self.isOfficialName()) {
            alert('You cannot delete an establishment\'s official name.\nTo delete this name, first assign another name as official.');
            return;
        }
        self.isSpinningPurge(true);
        var shouldRemainSpinning = false;
        $(self.confirmPurgeDialog).dialog({
            dialogClass: 'jquery-ui',
            width: 'auto',
            maxWidth: 710,
            resizable: false,
            modal: true,
            close: function () {
                if (!shouldRemainSpinning) self.isSpinningPurge(false);
            },
            buttons: {
                'Yes, confirm delete': function () {
                    shouldRemainSpinning = true;
                    $(self.confirmPurgeDialog).dialog('close');
                    $.ajax({ // submit ajax DELETE request
                        url: '/api/establishments/names/' + self.id(), // TODO: put this in stronger URL helper
                        type: 'DELETE'
                    })
                    .success(function () { // update the whole list (sort may be effected by this update)
                        $parent.requestNames(function () {
                            self.isSpinningPurge(false);
                        });
                    })
                    .error(function (xhr) { // server will throw exceptions when invalid
                        if (xhr.responseText) { // validation message will be in xht response text...
                            var response = $.parseJSON(xhr.responseText); // ...as a string, parse it to JS
                            if (response.exceptionType === 'FluentValidation.ValidationException') {
                                alert(response.exceptionMessage); // alert validation messages only
                            }
                        }
                        self.isSpinningPurge(false);
                    });
                },
                'No, cancel delete': function () {
                    $(self.confirmPurgeDialog).dialog('close');
                    self.isSpinningPurge(false);
                }
            }
        });
    };

    ko.validation.group(self); // create a separate validation group for this item
}

function EstablishmentItemViewModel(id) {
    var self = this;

    self.id = id || 0; // initialize the aggregate id


    // languages dropdowns
    self.languages = ko.observableArray(); // select options
    ko.computed(function () { // get languages from the server
        $.get(app.webApiRoutes.Languages.Get())
        .success(function (response) {
            response.splice(0, 0, { code: undefined, name: '[Language Neutral]' }); // add null option
            self.languages(response); // set the options dropdown
        });
    })
    .extend({ throttle: 1 });

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
        $.get('/api/establishments/' + self.id + '/names', {})
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
}