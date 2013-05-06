var ViewModels;
(function (ViewModels) {
    (function (FormalEducations) {
        var FormalEducation = (function () {
            function FormalEducation(educationId) {
                this.inititializationErrors = "";
                this.dirtyFlag = ko.observable(false);
                this.saving = false;
                this._initialize(educationId);
            }
            FormalEducation.prototype._initialize = function (educationId) {
                var _this = this;
                this.id = ko.observable(educationId);
                this.dirty = ko.computed(function () {
                    if(_this.dirtyFlag()) {
                        _this.autoSave(_this, null);
                    }
                });
            };
            FormalEducation.prototype.setupWidgets = function (countrySelectorId) {
            };
            FormalEducation.prototype.setupValidation = function () {
            };
            FormalEducation.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var dataPact = $.Deferred();
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.FormalEducations.getEdit(this.id()),
                    success: function (data, textStatus, jqXhr) {
                        dataPact.resolve(data);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        dataPact.reject(jqXhr, textStatus, errorThrown);
                    }
                });
                $.when(dataPact).done(function (data) {
                    ko.mapping.fromJS(data, {
                    }, _this);
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });
                return deferred;
            };
            FormalEducation.prototype.autoSave = function (viewModel, event) {
                var _this = this;
                if(this.saving) {
                    return;
                }
                if(!this.dirtyFlag()) {
                    return;
                }
                var model = ko.mapping.toJS(this);
                this.saving = true;
                $.ajax({
                    type: 'PUT',
                    url: App.Routes.WebApi.FormalEducations.put(viewModel.id()),
                    data: model,
                    dataType: 'json',
                    success: function (data, textStatus, jqXhr) {
                        _this.saving = false;
                        _this.dirtyFlag(false);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.saving = false;
                        _this.dirtyFlag(false);
                        alert(textStatus + "; " + errorThrown);
                    }
                });
            };
            FormalEducation.prototype.save = function (viewModel, event, mode) {
                var _this = this;
                this.autoSave(viewModel, event);
                while(this.saving) {
                    alert("Please wait while education is saved.");
                }
                this.saving = true;
                $.ajax({
                    async: false,
                    type: 'PUT',
                    url: App.Routes.WebApi.FormalEducations.putEdit(viewModel.id()),
                    data: ko.toJSON(mode),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (data, textStatus, jqXhr) {
                        _this.saving = false;
                        _this.dirtyFlag(false);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        _this.saving = false;
                        _this.dirtyFlag(false);
                        alert(textStatus + "; " + errorThrown);
                    }
                });
                location.href = App.Routes.Mvc.My.Profile.get();
            };
            FormalEducation.prototype.cancel = function (item, event, mode) {
                $("#cancelConfirmDialog").dialog({
                    modal: true,
                    resizable: false,
                    width: 450,
                    buttons: {
                        "Do not cancel": function () {
                            $(this).dialog("close");
                        },
                        "Cancel and lose changes": function () {
                            $.ajax({
                                async: false,
                                type: 'DELETE',
                                url: App.Routes.WebApi.FormalEducations.del(item.id()),
                                dataType: 'json',
                                contentType: 'application/json',
                                success: function (data, textStatus, jqXhr) {
                                },
                                error: function (jqXhr, textStatus, errorThrown) {
                                    alert(textStatus + "; " + errorThrown);
                                }
                            });
                            $(this).dialog("close");
                            location.href = App.Routes.Mvc.My.Profile.get();
                        }
                    }
                });
            };
            return FormalEducation;
        })();
        FormalEducations.FormalEducation = FormalEducation;        
    })(ViewModels.FormalEducations || (ViewModels.FormalEducations = {}));
    var FormalEducations = ViewModels.FormalEducations;
})(ViewModels || (ViewModels = {}));
