/// <reference path="../scripts/jquery-1.8.0.js" />
/// <reference path="../scripts/knockout-2.1.0.js" />
/// <reference path="../scripts/knockout.mapping-latest.js" />
/// <reference path="../scripts/app/app.js" />
/// <reference path="../scripts/T4MvcJs/WebApiRoutes.js" />


function EstablishmentNameViewModel(js, $parent) {
    var self = this;
    self.originalValues = js;
    ko.mapping.fromJS(js, {}, self);

    self.textElement = undefined;
    self.languagesElement = undefined;
    self.selectedLanguageCode = ko.observable(js.languageCode);
    $parent.languages.subscribe(function () {
        self.selectedLanguageCode(self.languageCode());
    });

    self.isOfficialName.subscribe(function (newValue) {
        if (newValue)
            self.isFormerName(false);
    });

    self.editMode = ko.observable();
    self.showEditor = function () {
        var editingName = $parent.editingName();
        if (!editingName) {
            $parent.editingName(self.revisionId());
            self.editMode(true);
            $(self.textElement).focus();
        }
    };
    self.saveEditor = function () {
        var languageCode = self.selectedLanguageCode();
        if (!languageCode) self.languageName('');
        else if (languageCode != self.originalValues.languageCode)
            self.languageName($(self.languagesElement).children('option:selected').text());
        $parent.editingName(undefined);
        self.originalValues = {
            revisionId: self.revisionId(),
            text: self.text(),
            isOfficialName: self.isOfficialName(),
            isFormerName: self.isFormerName(),
            languageName: self.languageName(),
            languageCode: self.selectedLanguageCode()
        };

        $.ajax({
            url: '/api/establishments/names/' + self.revisionId(),
            data: {
                revisionId: self.revisionId(),
                text: self.text(),
                isOfficialName: self.isOfficialName(),
                isFormerName: self.isFormerName(),
                languageCode: self.selectedLanguageCode(),
            },
            type: 'PUT'
        })
        .success(function () {
            alert('success!');
        });

        self.editMode(false);
    };

    self.cancelEditor = function () {
        ko.mapping.fromJS(self.originalValues, {}, self);
        $parent.editingName(undefined);
        self.editMode(false);
    };

    self.clickOfficialNameCheckbox = function() {
        if (self.originalValues.isOfficialName)
            alert('In order to choose a different official name for this establishment, edit the name you wish to make the new official name.');
        return true;
    };
}

function EstablishmentItemViewModel(id) {
    var self = this;

    self.id = id || 0;

    self.languages = ko.observableArray();

    // languages dropdowns
    ko.computed(function() {
        $.get(app.webApiRoutes.Languages.Get())
        .success(function (response) {
            response.splice(0, 0, { code: undefined, name: '[Language Neutral]' });
            self.languages(response);
        });
    })
    .extend({ throttle: 1 });

    self.names = ko.observableArray();
    self.editingName = ko.observable();
    self.namesMapping = {
        key: function (data) {
            return ko.utils.unwrapObservable(data.revisionId);
        },
        create: function (options) {
            return new EstablishmentNameViewModel(options.data, self);
        }
    };
    self.receiveNames = function (js) {
        ko.mapping.fromJS(js || [], self.namesMapping, self.names);
        app.obtrude(document);
    };
    self.requestNames = function () {
        $.get('/api/establishments/' + self.id + '/names', {})
        .success(function (response) {
            self.receiveNames(response);
        });
    };
    ko.computed(self.requestNames).extend({ throttle: 1 });

}