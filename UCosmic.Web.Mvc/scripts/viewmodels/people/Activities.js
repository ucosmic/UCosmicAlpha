var People;
(function (People) {
    (function (ViewModels) {
        var ActivityInputModel = (function () {
            function ActivityInputModel(modelData) {
                this.pageSize = ko.observable();
                this.pageNumber = ko.observable();
                this.keyword = ko.observable();
                this.countries = ko.observableArray();
                this.countryCode = ko.observable();
                this.prevEnabled = ko.observable(true);
                this.nextEnabled = ko.observable(true);
                this.orderBy = ko.observable();
                this.hasInitialized = false;
                this.optionsEnabled = ko.observable(false);
                this.purgeSpinner = new App.Spinner();
                this.modelData = modelData;
                this.pageSize(this.modelData.pageSize);
                this.pageNumber((this.modelData.pageNumber != null) ? this.modelData.pageNumber : "1");
                this.keyword(this.modelData.keyword);
                this.orderBy(this.modelData.orderBy);
                var pageCount = (modelData.itemTotal / parseInt(this.pageSize()));
                if (parseInt(pageCount.toString()) < pageCount) {
                    pageCount = parseInt(pageCount.toString()) + 1;
                }
                this._setupCountryDropDown();
                if (parseInt(this.pageNumber()) >= pageCount) {
                    this.nextEnabled(false);
                }
                if (parseInt(this.pageNumber()) == 1) {
                    this.prevEnabled(false);
                }
                this.pageNumber.subscribe(function (newValue) {
                    if (this.hasInitialized) {
                        this.search();
                    }
                }, this);
                this.orderBy.subscribe(function (newValue) {
                    if (this.hasInitialized) {
                        this.search();
                    }
                }, this);
                this.pageSize.subscribe(function (newValue) {
                    if (this.hasInitialized) {
                        this.search();
                    }
                    this.optionsEnabled(true);
                }, this);
                this.countryCode.subscribe(function (newValue) {
                    if (this.hasInitialized) {
                        this.hasInitialized = true;
                        this.search();
                    }
                }, this);
            }
            ActivityInputModel.prototype.nextPage = function (model, event) {
                event.preventDefault();
                this.pageNumber((parseInt(this.pageNumber()) + 1).toString());
                this.search();
            };

            ActivityInputModel.prototype.prevPage = function (model, event) {
                event.preventDefault();
                this.pageNumber((parseInt(this.pageNumber()) - 1).toString());
                this.search();
            };

            ActivityInputModel.prototype.search = function () {
                this.$form.submit();
            };

            ActivityInputModel.prototype._setupCountryDropDown = function () {
                var _this = this;
                ko.computed(function () {
                    var lastCountryCode = $('input[type=hidden][data-bind="value: countryCode"]').val();

                    $.get(App.Routes.WebApi.Countries.get()).done(function (response) {
                        var emptyValue = {
                            code: '-1',
                            name: '[Without country]'
                        };
                        response.splice(response.length, 0, emptyValue);

                        _this.countries(response);

                        _this.countryCode(_this.modelData.countryCode);
                        _this.hasInitialized = true;
                    });
                }).extend({ throttle: 1 });
            };

            ActivityInputModel.prototype._purge = function (expertiseId) {
                var _this = this;
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.Activities.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                        _this.purgeSpinner.stop();
                    },
                    error: function (xhr) {
                        _this.purgeSpinner.stop();
                        App.Failures.message(xhr, 'while deleting your activity', true);
                    }
                });
            };
            ActivityInputModel.prototype.purge = function (expertiseId, thisData, event) {
                var _this = this;
                this.purgeSpinner.start();
                if (this.$confirmDeleteActivity && this.$confirmDeleteActivity.length) {
                    this.$confirmDeleteActivity.dialog({
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: [
                            {
                                text: 'Yes, confirm delete',
                                click: function () {
                                    _this.$confirmDeleteActivity.dialog('close');
                                    _this.purgeSpinner.start(true);
                                    _this._purge(expertiseId);

                                    if ($(event.target).closest("ul").children().length == 2) {
                                        $("#activity_no_results").css("display", "block");
                                    }
                                    $(event.target).closest("li").remove();
                                },
                                'data-confirm-delete-link': true
                            },
                            {
                                text: 'No, cancel delete',
                                click: function () {
                                    _this.$confirmDeleteActivity.dialog('close');
                                },
                                'data-css-link': true
                            }
                        ],
                        close: function () {
                            _this.purgeSpinner.stop();
                        }
                    });
                } else {
                    if (confirm('Are you sure you want to delete this activity?')) {
                        this._purge(expertiseId);
                    } else {
                        this.purgeSpinner.stop();
                    }
                }
            };
            ActivityInputModel.prototype.edit = function (id) {
                window.location.href = App.Routes.Mvc.My.Activities.edit(id);
            };
            ActivityInputModel.prototype.addActivity = function () {
                window.location.href = App.Routes.Mvc.My.Activities.create();
            };
            return ActivityInputModel;
        })();
        ViewModels.ActivityInputModel = ActivityInputModel;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
