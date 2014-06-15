var Activities;
(function (Activities) {
    (function (ViewModels) {
        var Map = (function () {
            function Map(settings) {
                var _this = this;
                this.settings = settings;
                this.orderBy = ko.observable(this.settings.input.orderBy);
                this.keyword = ko.observable(this.settings.input.keyword);
                this.pivot = ko.observable(this.settings.input.pivot);
                this.isActivitiesChecked = ko.computed(function () {
                    return _this.pivot() != 2 /* people */;
                });
                this.isPeopleChecked = ko.computed(function () {
                    return _this.pivot() == 2 /* people */;
                });
                this.loadingSpinner = new App.Spinner();
                this.activityTypeCheckBoxes = ko.observableArray(Enumerable.From(this.settings.activityTypes).Select(function (x) {
                    return new ViewModels.ActivityTypeSearchCheckBox(x, _this.settings);
                }).ToArray());
                this.isCheckAllActivityTypesDisabled = ko.computed(function () {
                    return Enumerable.From(_this.activityTypeCheckBoxes()).All(function (x) {
                        return x.isChecked();
                    });
                });
                this.isUncheckAllActivityTypesDisabled = ko.computed(function () {
                    return Enumerable.From(_this.activityTypeCheckBoxes()).All(function (x) {
                        return !x.isChecked();
                    });
                });
                this.since = ko.observable(this.settings.input.since);
                this.until = ko.observable(this.settings.input.until);
                this.isClearSinceDisabled = ko.computed(function () {
                    return _this.since() ? false : true;
                });
                this.isClearUntilDisabled = ko.computed(function () {
                    return _this.until() ? false : true;
                });
            }
            Map.prototype.applyBindings = function (element) {
                ko.applyBindings(this, element);
                kendo.init($(element));
                this._applyKendo();
                this._applySubscriptions();
            };

            Map.prototype._applyKendo = function () {
                var _this = this;
                var kendoSince = this.$since.data('kendoDatePicker');
                kendoSince.element.val(this.settings.input.since);
                var kendoUntil = this.$until.data('kendoDatePicker');
                kendoUntil.element.val(this.settings.input.until);

                var inputInitialized = false;
                var emptyDataItem = {
                    officialName: '[Begin typing to see options]',
                    placeId: undefined
                };
                var emptyDataSource = new kendo.data.DataSource({ data: [emptyDataItem] });
                var serverDataSource = new kendo.data.DataSource({
                    serverFiltering: true,
                    transport: {
                        read: {
                            url: Routes.Api.Places.Names.autocomplete()
                        },
                        parameterMap: function (data, action) {
                            if (action == 'read' && data && data.filter && data.filter.filters && data.filter.filters.length) {
                                return {
                                    terms: data.filter.filters[0].value,
                                    maxResults: 20,
                                    granularity: 2
                                };
                            }
                            return data;
                        }
                    }
                });
                var hasPlace = (this.settings.input.placeIds && this.settings.input.placeIds.length && this.settings.input.placeNames && this.settings.input.placeNames.length && this.settings.input.placeIds[0] && this.settings.input.placeNames[0]) ? true : false;
                var dataSource = hasPlace ? 'server' : 'empty';
                var checkDataSource = function (widget) {
                    var inputVal = $.trim(widget.input.val());
                    if (!inputVal && dataSource == 'empty')
                        return;
                    if (inputVal && dataSource == 'server')
                        return;
                    if (!inputVal && dataSource != 'empty') {
                        dataSource = 'empty';
                        widget.value('');
                        _this.$placeIds.val('');
                        if (_this.settings.input.placeIds && _this.settings.input.placeIds.length) {
                        } else {
                            widget.setDataSource(emptyDataSource);
                        }
                        return;
                    }
                    if (inputVal && dataSource != 'server') {
                        dataSource = 'server';
                        widget.setDataSource(serverDataSource);
                        return;
                    }
                };
                this.$location.kendoComboBox({
                    suggest: true,
                    animation: false,
                    height: 420,
                    dataTextField: 'officialName',
                    dataValueField: 'placeId',
                    filter: 'contains',
                    dataSource: hasPlace ? serverDataSource : emptyDataSource,
                    select: function (e) {
                        var dataItem = e.sender.dataItem(e.item.index());

                        if (dataItem.placeId == -1) {
                            e.sender.value('');
                            e.sender.input.val('');
                            _this.$placeIds.val('');
                            e.preventDefault();
                            _this._submitForm();
                            return;
                        }

                        if (dataItem.officialName == emptyDataItem.officialName) {
                            _this.$placeIds.val('');
                            e.preventDefault();
                            return;
                        }

                        if (!_this.settings.input.placeIds || !_this.settings.input.placeIds.length || _this.settings.input.placeIds[0] != dataItem.placeId) {
                            e.sender.input.val(dataItem.officialName);
                            _this.$location.val(dataItem.officialName);
                            _this.$placeIds.val(dataItem.placeId);
                            _this._submitForm();
                        }
                    },
                    change: function (e) {
                        var dataItem = e.sender.dataItem(e.sender.select());
                        if (!dataItem) {
                            _this.$placeIds.val('');
                            e.sender.value('');
                            checkDataSource(e.sender);
                        } else {
                            e.sender.input.val(dataItem.officialName);
                            _this.$location.val(dataItem.officialName);
                            _this.$placeIds.val(dataItem.placeId);
                            if (!_this.settings.input.placeIds || !_this.settings.input.placeIds.length || _this.settings.input.placeIds[0] != dataItem.placeId) {
                                _this._submitForm();
                            }
                        }
                    },
                    dataBound: function (e) {
                        var widget = e.sender;
                        var input = widget.input;
                        var inputVal = $.trim(input.val());

                        if (!inputInitialized) {
                            input.attr('name', 'placeNames');
                            _this.$location.attr('name', '');
                            input.on('keydown', function () {
                                setTimeout(function () {
                                    checkDataSource(widget);
                                }, 0);
                            });
                            if (hasPlace && inputVal) {
                                widget.search(inputVal);
                                widget.close();
                            }
                            inputInitialized = true;
                        } else if (hasPlace) {
                            widget.select(function (dataItem) {
                                return dataItem.placeId == this.settings.input.placeIds[0];
                            });
                            widget.close();
                            input.blur();
                            hasPlace = false;
                        }

                        var value = e.sender.value();
                        if (value) {
                            var dataSource = e.sender.dataSource;
                            var data = dataSource.data();
                            var hasClearer = Enumerable.From(data).Any(function (x) {
                                return x.placeId == -1;
                            });
                            if (!hasClearer)
                                dataSource.add({ officialName: '[Clear current selection]', placeId: -1 });
                        }
                    }
                });
                var comboBox = this.$location.data('kendoComboBox');
                comboBox.list.addClass('k-ucosmic');
            };

            Map.prototype._applySubscriptions = function () {
                var _this = this;
                this.orderBy.subscribe(function (newValue) {
                    _this._submitForm();
                });
            };

            Map.prototype._submitForm = function () {
                if (this.loadingSpinner.isVisible())
                    return;
                this.loadingSpinner.start();
                this.search();
            };

            Map.prototype.search = function () {
                $("#activityTypesSearch").val("1").change();
            };

            Map.prototype.onKeywordInputSearchEvent = function (viewModel, e) {
                if ($.trim(this.keyword()) && !$.trim($(e.target).val()) && this.$form)
                    this.search();
            };

            Map.prototype.checkAllActivityTypes = function () {
                Enumerable.From(this.activityTypeCheckBoxes()).ForEach(function (x) {
                    x.isChecked(true);
                });
            };

            Map.prototype.uncheckAllActivityTypes = function () {
                Enumerable.From(this.activityTypeCheckBoxes()).ForEach(function (x) {
                    x.isChecked(false);
                });
            };

            Map.prototype.clearSince = function () {
                this.since('');
            };

            Map.prototype.clearUntil = function () {
                this.until('');
            };
            return Map;
        })();
        ViewModels.Map = Map;
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
