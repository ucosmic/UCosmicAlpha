var ViewModels;
(function (ViewModels) {
    (function (FormalEducations) {
        var FormalEducationList = (function () {
            function FormalEducationList(personId) {
                this.personId = personId;
            }
            FormalEducationList.prototype.load = function () {
                var deferred = $.Deferred();
                var dataPact = $.Deferred();
                var expertiseSearchInput = new Service.ApiModels.FormalEducation.EducationSearchInput();
                expertiseSearchInput.personId = this.personId;
                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = 2147483647;
                $.get(App.Routes.WebApi.FormalEducations.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
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
            FormalEducationList.prototype.deleteEducationById = function (expertiseId) {
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.FormalEducations.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus);
                    }
                });
            };
            FormalEducationList.prototype.deleteEducation = function (data, event, viewModel) {
                $("#confirmFormalEducationDeleteDialog").dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: "Yes, confirm delete",
                            click: function () {
                                viewModel.deleteEducationById(data.id());
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
            FormalEducationList.prototype.editEducation = function (data, event, expertiseId) {
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.FormalEducations.getEditState(expertiseId),
                    success: function (editState, textStatus, jqXHR) {
                        if(editState.isInEdit) {
                            $("#formalEducationBeingEditedDialog").dialog({
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
            FormalEducationList.prototype.newEducation = function (data, event) {
                $.ajax({
                    type: "POST",
                    url: App.Routes.WebApi.FormalEducations.post(),
                    success: function (newEducationId, textStatus, jqXHR) {
                        location.href = App.Routes.Mvc.My.Profile.formalEducationEdit(newEducationId);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus + "|" + errorThrown);
                    }
                });
            };
            return FormalEducationList;
        })();
        FormalEducations.FormalEducationList = FormalEducationList;        
    })(ViewModels.FormalEducations || (ViewModels.FormalEducations = {}));
    var FormalEducations = ViewModels.FormalEducations;
})(ViewModels || (ViewModels = {}));
