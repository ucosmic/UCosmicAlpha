var ViewModels;
(function (ViewModels) {
    (function (GeographicExpertises) {
        var GeographicExpertiseSearchInput = (function () {
            function GeographicExpertiseSearchInput() { }
            return GeographicExpertiseSearchInput;
        })();
        GeographicExpertises.GeographicExpertiseSearchInput = GeographicExpertiseSearchInput;        
        var GeographicExpertiseList = (function () {
            function GeographicExpertiseList(personId) {
                this.personId = personId;
            }
            GeographicExpertiseList.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var expertiseSearchInput = new GeographicExpertiseSearchInput();
                expertiseSearchInput.personId = this.personId;
                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = 2147483647;
                $.get(App.Routes.WebApi.GeographicExpertises.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
 {
                        ko.mapping.fromJS(data, {
                        }, _this);
                        deferred.resolve();
                    }
                }).fail(function (jqXhr, textStatus, errorThrown) {
 {
                        deferred.reject(jqXhr, textStatus, errorThrown);
                    }
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
                                location.href = App.Routes.Mvc.My.Profile.get(1);
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
            };
            GeographicExpertiseList.prototype.newExpertise = function (data, event) {
                location.href = App.Routes.Mvc.My.Profile.geographicExpertiseEdit("0");
            };
            GeographicExpertiseList.prototype.formatLocations = function (locations) {
                var formattedLocations = "";
                for(var i = 0; i < locations.length; i += 1) {
                    if(i > 0) {
                        formattedLocations += ", ";
                    }
                    formattedLocations += locations[i].placeOfficialName();
                }
                return formattedLocations;
            };
            return GeographicExpertiseList;
        })();
        GeographicExpertises.GeographicExpertiseList = GeographicExpertiseList;        
    })(ViewModels.GeographicExpertises || (ViewModels.GeographicExpertises = {}));
    var GeographicExpertises = ViewModels.GeographicExpertises;
})(ViewModels || (ViewModels = {}));
