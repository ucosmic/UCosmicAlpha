var ViewModels;
(function (ViewModels) {
    (function (Degrees) {
        var DegreeSearchInput = (function () {
            function DegreeSearchInput() { }
            return DegreeSearchInput;
        })();
        Degrees.DegreeSearchInput = DegreeSearchInput;        
        var DegreeList = (function () {
            function DegreeList(personId) {
                this.personId = personId;
            }
            DegreeList.prototype.load = function () {
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
            DegreeList.prototype.deleteEducationById = function (expertiseId) {
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
            DegreeList.prototype.deleteEducation = function (data, event, viewModel) {
                $("#confirmDegreeDeleteDialog").dialog({
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
                                location.href = App.Routes.Mvc.My.Profile.get(3);
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
            DegreeList.prototype.editEducation = function (data, event, expertiseId) {
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
            DegreeList.prototype.newEducation = function (data, event) {
                location.href = App.Routes.Mvc.My.Profile.degreeEdit("new");
            };
            return DegreeList;
        })();
        Degrees.DegreeList = DegreeList;        
    })(ViewModels.Degrees || (ViewModels.Degrees = {}));
    var Degrees = ViewModels.Degrees;
})(ViewModels || (ViewModels = {}));
