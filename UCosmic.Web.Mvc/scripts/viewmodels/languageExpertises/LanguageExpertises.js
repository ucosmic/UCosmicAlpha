var ViewModels;
(function (ViewModels) {
    (function (LanguageExpertises) {
        var LanguageExpertiseSearchInput = (function () {
            function LanguageExpertiseSearchInput() { }
            return LanguageExpertiseSearchInput;
        })();
        LanguageExpertises.LanguageExpertiseSearchInput = LanguageExpertiseSearchInput;        
        var LanguageExpertiseList = (function () {
            function LanguageExpertiseList(personId) {
                this.personId = personId;
            }
            LanguageExpertiseList.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var expertiseSearchInput = new LanguageExpertiseSearchInput();
                expertiseSearchInput.personId = this.personId;
                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = 2147483647;
                $.get(App.Routes.WebApi.LanguageExpertises.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
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
            LanguageExpertiseList.prototype.deleteExpertiseById = function (expertiseId) {
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.LanguageExpertises.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus);
                    }
                });
            };
            LanguageExpertiseList.prototype.deleteExpertise = function (data, event, viewModel) {
                $("#confirmLanguageExpertiseDeleteDialog").dialog({
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
                                location.href = App.Routes.Mvc.My.Profile.get(2);
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
            LanguageExpertiseList.prototype.editExpertise = function (data, event, expertiseId) {
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
            LanguageExpertiseList.prototype.newExpertise = function (data, event) {
                location.href = App.Routes.Mvc.My.Profile.geographicExpertiseEdit("new");
            };
            LanguageExpertiseList.prototype.formatLocations = function (locations) {
                var formattedLocations = "";
                for(var i = 0; i < locations.length; i += 1) {
                    if(i > 0) {
                        formattedLocations += ", ";
                    }
                    formattedLocations += locations[i].placeOfficialName();
                }
                return formattedLocations;
            };
            return LanguageExpertiseList;
        })();
        LanguageExpertises.LanguageExpertiseList = LanguageExpertiseList;        
    })(ViewModels.LanguageExpertises || (ViewModels.LanguageExpertises = {}));
    var LanguageExpertises = ViewModels.LanguageExpertises;
})(ViewModels || (ViewModels = {}));
