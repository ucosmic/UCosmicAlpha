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
    self.editMode = ko.observable();
    self.showEditor = function (vm, e) {
        var editingName = $parent.editingName();
        if (!editingName) {
            $parent.editingName(self.revisionId());
            self.editMode(true);
            $(self.textElement).focus();
        }
    };
    self.saveEditor = function () {
        var languageCode = self.languageCode();
        if (!languageCode) self.languageName('');
        else if (languageCode != self.originalValues.languageCode)
            self.languageName($(self.languagesElement).children('option:selected').text());
        $parent.editingName(undefined);
        self.editMode(false);
    };

    self.cancelEditor = function () {
        ko.mapping.fromJS(self.originalValues, {}, self);
        $parent.editingName(undefined);
        self.editMode(false);
    };
}

function EstablishmentItemViewModel(id) {
    var self = this;

    self.id = id || 0;

    self.languages = ko.observableArray();

    // languages dropdowns
    ko.computed(function () {
        $.get(app.webApiRoutes.Languages.Get())
        .success(function (response) {
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