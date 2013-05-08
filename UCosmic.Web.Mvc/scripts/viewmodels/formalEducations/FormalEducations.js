var ViewModels;
(function (ViewModels) {
    (function (FormalEducations) {
        var DegreeSearchInput = (function () {
            function DegreeSearchInput() { }
            return DegreeSearchInput;
        })();
        FormalEducations.DegreeSearchInput = DegreeSearchInput;        
        var FormalEducationList = (function () {
            function FormalEducationList(personId) {
                this.personId = personId;
            }
            FormalEducationList.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();
                var expertiseSearchInput = new DegreeSearchInput();
                expertiseSearchInput.personId = this.personId;
                expertiseSearchInput.orderBy = "";
                expertiseSearchInput.pageNumber = 1;
                expertiseSearchInput.pageSize = 2147483647;
                $.get(App.Routes.WebApi.Degrees.get(), expertiseSearchInput).done(function (data, textStatus, jqXHR) {
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
            FormalEducationList.prototype.deleteEducationById = function (expertiseId) {
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.Degrees.del(expertiseId),
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
            FormalEducationList.prototype.newEducation = function (data, event) {
                $.ajax({
                    type: "POST",
                    url: App.Routes.WebApi.Degrees.post(),
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
