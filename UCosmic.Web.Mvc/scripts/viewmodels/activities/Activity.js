var ViewModels;
(function (ViewModels) {
    (function (Activities) {
        var Activity = (function () {
            function Activity(activityId) {
                this.revisionId = ko.observable(activityId);
            }
            Activity.prototype.Load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var locationsPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.Locations.get()).done(function (data, textStatus, jqXHR) {
                    locationsPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                });
                var typesPact = $.Deferred();
                $.get(App.Routes.WebApi.Activities.Types.get()).done(function (data, textStatus, jqXHR) {
                    typesPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    typesPact.reject(jqXHR, textStatus, errorThrown);
                });
                var dataPact = $.Deferred();
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.Activity.get() + this.revisionId().toString(),
                    success: function (data, textStatus, jqXHR) {
                        dataPact.resolve(data);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        dataPact.reject(jqXHR, textStatus, errorThrown);
                    }
                });
                $.when(typesPact, locationsPact, dataPact).done(function (types, locations, data) {
                    _this.activityTypesList = types;
                    _this.activityLocationsList = locations;
                    ko.mapping.fromJS(data, {
                    }, _this);
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });
                return deferred;
            };
            Activity.prototype.getTypeName = function (id) {
                var typeName = "";
                if(this.activityTypesList != null) {
                    var i = 0;
                    while((i < this.activityTypesList.length) && (id != this.activityTypesList[i].id)) {
                        i += 1;
                    }
                    if(i < this.activityTypesList.length) {
                        typeName = this.activityTypesList[i].type;
                    }
                }
                return typeName;
            };
            Activity.prototype.getLocationName = function (id) {
                var locationName = "";
                if(this.activityLocationsList != null) {
                    var i = 0;
                    while((i < this.activityLocationsList.length) && (id != this.activityLocationsList[i].placeId)) {
                        i += 1;
                    }
                    if(i < this.activityLocationsList.length) {
                        locationName = this.activityLocationsList[i].officialName;
                    }
                }
                return locationName;
            };
            return Activity;
        })();
        Activities.Activity = Activity;        
    })(ViewModels.Activities || (ViewModels.Activities = {}));
    var Activities = ViewModels.Activities;
})(ViewModels || (ViewModels = {}));
