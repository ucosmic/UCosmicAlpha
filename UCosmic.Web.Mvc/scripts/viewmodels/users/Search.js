var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ViewModels;
(function (ViewModels) {
    (function (Users) {
        var Search = (function (_super) {
            __extends(Search, _super);
            function Search() {
                        _super.call(this);
                this.sammy = Sammy();
                this.$historyJson = ko.observable();
                this._history = ko.observableArray([]);
                this._historyIndex = 0;
                this._init();
            }
            Search.prototype._init = function () {
                this._setupHistory();
                this._setupSammy();
                this._setupQueryComputed();
            };
            Search.prototype._pullResults = function () {
                var _this = this;
                var deferred = $.Deferred();
                var queryParameters = {
                    pageSize: this.pageSize(),
                    pageNumber: this.pageNumber(),
                    keyword: this.throttledKeyword(),
                    orderBy: this.orderBy()
                };
                this.nextForceDisabled(true);
                this.prevForceDisabled(true);
                $.get(App.Routes.WebApi.Users.get(), queryParameters).done(function (response, statusText, xhr) {
                    _this.nextForceDisabled(false);
                    _this.prevForceDisabled(false);
                    deferred.resolve(response, statusText, xhr);
                }).fail(function (xhr, statusText, errorThrown) {
                    deferred.reject(xhr, statusText, errorThrown);
                });
                return deferred;
            };
            Search.prototype._loadResults = function (results) {
                var resultsMapping = {
                    items: {
                        key: function (data) {
                            return ko.utils.unwrapObservable(data.id);
                        },
                        create: function (options) {
                            return new ViewModels.Users.SearchResult(options.data);
                        }
                    },
                    ignore: [
                        'pageSize', 
                        'pageNumber'
                    ]
                };
                ko.mapping.fromJS(results, resultsMapping, this);
                this.spinner.stop();
                this.transitionedPageNumber(this.pageNumber());
            };
            Search.prototype._setupQueryComputed = function () {
                var _this = this;
                ko.computed(function () {
                    if(_this.pageSize() === undefined || _this.orderBy() === undefined) {
                        return;
                    }
                    _this._pullResults().done(function (response) {
                        _this._loadResults(response);
                    }).fail(function () {
                    });
                }).extend({
                    throttle: 250
                });
            };
            Search.prototype._setupSammy = function () {
                var _this = this;
                var self = this;
                this.sammy.before(/\#\/page\/(.*)/, function () {
                    if(self.nextForceDisabled() || self.prevForceDisabled()) {
                        return false;
                    }
                    if(self._history().length > 1) {
                        var toPath = this.path;
                        for(var i = 0; i < self._history().length; i++) {
                            var existingPath = self._history()[i];
                            if(toPath === existingPath) {
                                self._historyIndex = i;
                                return true;
                            }
                        }
                    }
                    self._history.push(this.path);
                    self._historyIndex = self._history().length - 1;
                    return true;
                });
                this.sammy.get(this.getPageHash(':pageNumber'), function () {
                    var pageNumber = this.params['pageNumber'];
                    if(pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber())) {
                        self.pageNumber(parseInt(pageNumber));
                    }
                    document.title = 'Users (Page #' + self.pageNumber() + ')';
                });
                this.sammy.get('/users[\/]?', function () {
                    _this.sammy.setLocation(_this.getPageHash(1));
                });
            };
            Search.prototype._setupHistory = function () {
                var _this = this;
                this.$historyJson.subscribe(function (newValue) {
                    if(newValue && newValue.length) {
                        var json = newValue.val();
                        if(json) {
                            var js = $.parseJSON(json);
                            ko.mapping.fromJS(js, {
                            }, _this._history);
                        }
                    }
                });
                this._history.subscribe(function (newValue) {
                    if(_this.$historyJson() && _this.$historyJson().length) {
                        var currentJson = _this.$historyJson().val();
                        var newJson = ko.toJSON(newValue);
                        if(currentJson !== newJson) {
                            _this.$historyJson().val(newJson);
                        }
                    }
                });
            };
            Search.prototype.nextPage = function () {
                this._gotoPage(1);
            };
            Search.prototype.prevPage = function () {
                this._gotoPage(-1);
            };
            Search.prototype._gotoPage = function (pageDelta) {
                if(pageDelta == 0) {
                    return;
                }
                var isEnabled = pageDelta < 0 ? this.prevEnabled() : this.nextEnabled();
                if(isEnabled) {
                    var pageNumber = parseInt(this.pageNumber()) + pageDelta;
                    if(pageNumber > 0 && pageNumber <= this.pageCount()) {
                        if(this._history().length > 1) {
                            var toPath = location.pathname + this.getPageHash(pageNumber);
                            var i = (pageDelta < 0) ? 0 : this._history().length - 1;
                            var iMove = function () {
                                if(pageDelta < 0) {
                                    i++;
                                } else {
                                    i--;
                                }
                            };
                            for(; i < this._history().length && i >= 0; iMove()) {
                                var existingPath = this._history()[i];
                                if(toPath === existingPath) {
                                    var historyDelta = i - this._historyIndex;
                                    history.go(historyDelta);
                                    this._historyIndex = i;
                                    return;
                                }
                            }
                        }
                        this.pageNumber(pageNumber);
                        var pagePath = this.getPageHash(pageNumber);
                        if(this.sammy.getLocation() !== pagePath) {
                            this.sammy.setLocation(pagePath);
                        }
                    }
                }
            };
            return Search;
        })(ViewModels.PagedSearch);
        Users.Search = Search;        
        var SearchResult = (function () {
            function SearchResult(values) {
                ko.mapping.fromJS(values, {
                }, this);
                this._setupRoleGrantComputeds();
            }
            SearchResult.prototype._setupRoleGrantComputeds = function () {
                var _this = this;
                this.hasRoles = ko.computed(function () {
                    return _this.roleGrants().length > 0;
                });
                this.hasNoRoles = ko.computed(function () {
                    return !_this.hasRoles();
                });
            };
            return SearchResult;
        })();
        Users.SearchResult = SearchResult;        
    })(ViewModels.Users || (ViewModels.Users = {}));
    var Users = ViewModels.Users;
})(ViewModels || (ViewModels = {}));
