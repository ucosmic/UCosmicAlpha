var ViewModels;
(function (ViewModels) {
    (function (Affiliations) {
        var AffiliationSearchInput = (function () {
            function AffiliationSearchInput() { }
            return AffiliationSearchInput;
        })();
        Affiliations.AffiliationSearchInput = AffiliationSearchInput;        
        var AffiliationList = (function () {
            function AffiliationList(personId) {
                this.personId = personId;
            }
            AffiliationList.prototype.load = function () {
                var deferred = $.Deferred();
                var dataPact = $.Deferred();
                var expertiseSearchInput = new AffiliationSearchInput();
                expertiseSearchInput.personId = this.personId;
                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = 10;
                $.get(App.Routes.WebApi.Affiliations.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
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
            AffiliationList.prototype.deleteAffiliationById = function (expertiseId) {
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.Affiliations.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus);
                    }
                });
            };
            AffiliationList.prototype.deleteAffiliation = function (data, event, viewModel) {
                $("#confirmAffiliationDeleteDialog").dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: "Yes, confirm delete",
                            click: function () {
                                viewModel.deleteAffiliationById(data.id());
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
            AffiliationList.prototype.editAffiliation = function (data, event, expertiseId) {
                $.ajax({
                    type: "GET",
                    url: App.Routes.WebApi.Affiliations.get(expertiseId),
                    success: function (editState, textStatus, jqXHR) {
                        if(editState.isInEdit) {
                            $("#AffiliationBeingEditedDialog").dialog({
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
            AffiliationList.prototype.newAffiliation = function (data, event) {
                $.ajax({
                    type: "POST",
                    url: App.Routes.WebApi.Affiliations.post(),
                    success: function (newAffiliationId, textStatus, jqXHR) {
                        location.href = App.Routes.Mvc.My.Profile.affiliationEdit(newAffiliationId);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert(textStatus + "|" + errorThrown);
                    }
                });
            };
            return AffiliationList;
        })();
        Affiliations.AffiliationList = AffiliationList;        
    })(ViewModels.Affiliations || (ViewModels.Affiliations = {}));
    var Affiliations = ViewModels.Affiliations;
})(ViewModels || (ViewModels = {}));
