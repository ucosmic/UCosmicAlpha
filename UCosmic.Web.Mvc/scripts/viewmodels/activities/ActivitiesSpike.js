var Activities;
(function (Activities) {
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/moment/moment.d.ts" />
    (function (ViewModels) {
        var PublicView = (function () {
            function PublicView(data) {
                this.isBound = ko.observable(false);
                var mapping = {
                    //how to create a property with knockout mapping
                    //create: function (options) {
                    //    //customize at the root level.
                    //    var innerModel = ko.mapping.fromJS(options.data);
                    //    innerModel.typeIconUrl = ko.observable('Hello World');
                    //    ko.computed(function () {
                    //        return App.flasher.text();
                    //    })
                    //    return innerModel;
                    //},
                    'StartsOn': {
                        create: function (options) {
                            var value = options.data.substr(6);
                            var myDate = new Date(parseInt(value));
                            if (myDate.getFullYear() < 1500) {
                                return "unknown";
                            }
                            return (moment(myDate)).format('M/D/YYYY');
                        }
                    },
                    'EndsOn': {
                        create: function (options) {
                            var value = options.data.substr(6);
                            var myDate = new Date(parseInt(value));
                            if (myDate.getFullYear() < 1500) {
                                return "unknown";
                            }
                            return (moment(myDate)).format('M/D/YYYY');
                        }
                    },
                    'UpdatedOnUtc': {
                        create: function (options) {
                            var value = options.data.substr(6);
                            var myDate = new Date(parseInt(value));
                            if (myDate.getFullYear() < 1500) {
                                return "unknown";
                            }
                            return (moment(myDate)).format('M/D/YYYY');
                        }
                    },
                    'DocumentId': {
                        create: function (options) {
                            return "/api/activities/" + options.data + "/documents";
                        }
                    }
                };
                this.activity = ko.mapping.fromJS(data, mapping);
                this.isBound(true);
            }
            return PublicView;
        })();
        ViewModels.PublicView = PublicView;
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
