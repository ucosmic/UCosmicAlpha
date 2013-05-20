var ViewModels;
(function (ViewModels) {
    (function (LanguageExpertises) {
        var ExpertiseSearchInput = (function () {
            function ExpertiseSearchInput() { }
            return ExpertiseSearchInput;
        })();
        LanguageExpertises.ExpertiseSearchInput = ExpertiseSearchInput;        
        var LanguageExpertiseList = (function () {
            function LanguageExpertiseList(personId) {
                this.personId = personId;
            }
            LanguageExpertiseList.prototype.load = function () {
                var deferred = $.Deferred();
                var dataPact = $.Deferred();
                var expertiseSearchInput = new ExpertiseSearchInput();
                expertiseSearchInput.personId = this.personId;
                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = 10;
                $.get(App.Routes.WebApi.LanguageExpertises.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
 {
                        dataPact.resolve(data);
                    }
                }).fail(function (jqXhr, textStatus, errorThrown) {
 {
                        dataPact.reject(jqXhr, textStatus, errorThrown);
                    }
                });
                $.when(dataPact).done(function (data) {
                    deferred.resolve();
                }).fail(function (xhr, textStatus, errorThrown) {
                    deferred.reject(xhr, textStatus, errorThrown);
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
            LanguageExpertiseList.prototype.editExpertise = function (data, event, expertiseId) {
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.LanguageExpertises.get(expertiseId),
                    success: function (editState, textStatus, jqXHR) {
                        if(editState.isInEdit) {
                            $("#languageExpertiseBeingEditedDialog").dialog({
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
            LanguageExpertiseList.prototype.newExpertise = function (data, event) {
                $.ajax({
                    type: "POST",
                    url: App.Routes.WebApi.LanguageExpertises.post(),
                    success: function (newExpertiseId, textStatus, jqXHR) {
                        location.href = App.Routes.Mvc.My.Profile.languageExpertiseEdit(newExpertiseId);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus + "|" + errorThrown);
                    }
                });
            };
            return LanguageExpertiseList;
        })();
        LanguageExpertises.LanguageExpertiseList = LanguageExpertiseList;        
    })(ViewModels.LanguageExpertises || (ViewModels.LanguageExpertises = {}));
    var LanguageExpertises = ViewModels.LanguageExpertises;
})(ViewModels || (ViewModels = {}));
