/// <reference path="../scripts/jquery-1.8.0.js" />
/// <reference path="../scripts/knockout-2.1.0.js" />
/// <reference path="../scripts/knockout.mapping-latest.js" />
/// <reference path="../scripts/knockout.validation.js" />
/// <reference path="../scripts/app/app.js" />
/// <reference path="../scripts/T4MvcJs/WebApiRoutes.js" />


function EstablishmentNameViewModel(js, $parent) {
    var self = this;
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

    self.isSpinning = ko.observable(false); // when save button is clicked
    self.editMode = ko.observable(); // shows either form or read-only view
    self.showEditor = function () { // click to hide viewer and show editor
        var editingName = $parent.editingName(); // disallow if another name is being edited
        if (!editingName) {
            $parent.editingName(self.revisionId()); // tell parent which item is being edited
            self.editMode(true); // show the form / hide the viewer
            $(self.textElement).focus(); // focus the text box
        }
    };
    self.saveEditor = function () {
        if (!self.isValid()) { // validate
            self.errors.showAllMessages();
        }
        else { // PUT
            //var languageCode = self.selectedLanguageCode();
            //if (!languageCode) self.languageName('');
            //else if (languageCode != self.originalValues.languageCode)
            //    self.languageName($(self.languagesElement).children('option:selected').text());
            self.isSpinning(true); // start save spinner

            $.ajax({ // submit ajax PUT request
                url: '/api/establishments/names/' + self.revisionId(), // TODO: put this in stronger URL helper
                data: {
                    revisionId: self.revisionId(),
                    text: $.trim(self.text()),
                    isOfficialName: self.isOfficialName(),
                    isFormerName: self.isFormerName(),
                    languageCode: self.selectedLanguageCode(),
                },
                type: 'PUT'
            })
            .success(function () { // update the whole list (sort may be effected by this update)
                $parent.requestNames(function () { // when parent receives response,
                    $parent.editingName(undefined); // tell parent no item is being edited anymore
                    self.editMode(false); // hide the form, show the view
                    self.isSpinning(false); // stop save spinner
                });
            })
            .error(function (xhr) { // server will throw exceptions when invalid
                if (xhr.responseText) { // validation message will be in xht response text...
                    var response = $.parseJSON(xhr.responseText); // ...as a string, parse it to JS
                    if (response.exceptionType === 'FluentValidation.ValidationException') {
                        alert(response.exceptionMessage); // alert validation messages only
                    }
                }
                self.isSpinning(false); // stop spinner TODO: what if server throws non-validation exception?
            });
        }
    };

    self.cancelEditor = function () { // decide not to edit this item
        ko.mapping.fromJS(self.originalValues, {}, self); // restore original values
        $parent.editingName(undefined); // tell parent no item is being edited anymore
        self.editMode(false); // hide the form, show the view
    };

    self.clickOfficialNameCheckbox = function () { // TODO educate users on how to change the official name
        if (self.originalValues.isOfficialName) // only when the name is already official in the db
            alert('In order to choose a different official name for this establishment, edit the name you wish to make the new official name.');
        return true;
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
    ko.computed(self.requestNames).extend({ throttle: 1 });
}