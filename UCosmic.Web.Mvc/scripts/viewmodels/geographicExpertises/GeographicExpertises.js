var ViewModels;
(function (ViewModels) {
    (function (GeographicExpertises) {
        var ExpertiseSearchInput = (function () {
            function ExpertiseSearchInput() { }
            return ExpertiseSearchInput;
        })();
        GeographicExpertises.ExpertiseSearchInput = ExpertiseSearchInput;        
        var GeographicExpertiseList = (function () {
            function GeographicExpertiseList(personId) {
                this.personId = personId;
            }
            GeographicExpertiseList.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var locationsPact = $.Deferred();
                $.get(App.Routes.WebApi.GeographicExpertises.Locations.get()).done(function (data, textStatus, jqXHR) {
                    locationsPact.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    locationsPact.reject(jqXHR, textStatus, errorThrown);
                });
                var dataPact = $.Deferred();
                var expertiseSearchInput = new ExpertiseSearchInput();
                expertiseSearchInput.personId = this.personId;
                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = 2147483647;
                $.get(App.Routes.WebApi.GeographicExpertises.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
 {
                        dataPact.resolve(data);
                    }
                }).fail(function (jqXhr, textStatus, errorThrown) {
 {
                        dataPact.reject(jqXhr, textStatus, errorThrown);
                    }
                });
                $.when(locationsPact, dataPact).done(function (locations, data) {
                    _this.expertiseLocationsList = locations;
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
                });
                return deferred;
            };
            GeographicExpertiseList.prototype.deleteExpertiseById = function (expertiseId) {
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.GeographicExpertises.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus);
                    }
                });
            };
            GeographicExpertiseList.prototype.deleteExpertise = function (data, event, viewModel) {
                $("#confirmGeographicExpertiseDeleteDialog").dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: "Yes, confirm delete",
                            click: function () {
                                viewModel.deleteExpertiseById(data.id());
                                $(this).dialog("close");
                                location.href = App.Routes.Mvc.My.Profile.get();
                            }
                        }, 
                        {
                            text: "No, cancel delete",
                            click: function () {
                                $(this).dialog("close");
                            }
                        }, 
                        
                    ]
                });
            };
            GeographicExpertiseList.prototype.editExpertise = function (data, event, expertiseId) {
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.GeographicExpertises.getEditState(expertiseId),
                    success: function (editState, textStatus, jqXHR) {
                        if(editState.isInEdit) {
                            $("#geographicExpertiseBeingEditedDialog").dialog({
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    Ok: function () {
                                        $(this).dialog("close");
                                        return;
                                    }
                                }
                            });
                        } else {
                            var element = event.target;
                            var url = null;
                            while((element != null) && (element.nodeName != 'TR')) {
                                element = element.parentElement;
                            }
                            if(element != null) {
                                url = element.attributes["href"].value;
                            }
                            if(url != null) {
                                location.href = url;
                            }
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus + "|" + errorThrown);
                    }
                });
            };
            GeographicExpertiseList.prototype.newExpertise = function (data, event) {
                $.ajax({
                    type: "POST",
                    url: App.Routes.WebApi.GeographicExpertises.post(),
                    success: function (newExpertiseId, textStatus, jqXHR) {
                        location.href = App.Routes.Mvc.My.Profile.geographicExpertiseEdit(newExpertiseId);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus + "|" + errorThrown);
                    }
                });
            };
            return GeographicExpertiseList;
        })();
        GeographicExpertises.GeographicExpertiseList = GeographicExpertiseList;        
    })(ViewModels.GeographicExpertises || (ViewModels.GeographicExpertises = {}));
    var GeographicExpertises = ViewModels.GeographicExpertises;
})(ViewModels || (ViewModels = {}));
