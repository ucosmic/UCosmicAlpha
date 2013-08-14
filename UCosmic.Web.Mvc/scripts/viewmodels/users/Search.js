var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    /// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
    /// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
    /// <reference path="../../typings/sammyjs/sammyjs.d.ts" />
    /// <reference path="../../typings/kendo/kendo.all.d.ts" />
    /// <reference path="../../app/Routes.ts" />
    /// <reference path="../../app/Flasher.ts" />
    /// <reference path="../../app/PagedSearch.ts" />
    /// <reference path="SearchResult.ts" />
    (function (Users) {
        var Search = (function (_super) {
            __extends(Search, _super);
            function Search() {
                _super.call(this);
                this.sammy = Sammy();
                this.$historyJson = ko.observable();
                this._history = ko.observableArray([]);
                this._historyIndex = 0;
                this.impersonateUserName = ko.observable();
                this.flasherProxy = new App.FlasherProxy();
                this._init();
            }
            Search.prototype._init = function () {
                this._setupHistory();
                this._setupSammy();
                this._setupQueryComputed();
                this._setupPagingDefaults();
                this._setupSessionStorage();
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
                this.spinner.start();
                this.nextForceDisabled(true);
                this.prevForceDisabled(true);
                $.ajax({
                    url: App.Routes.WebApi.Identity.Users.get(),
                    data: queryParameters,
                    cache: false
                }).done(function (response, statusText, xhr) {
                    deferred.resolve(response, statusText, xhr);
                }).fail(function (xhr, statusText, errorThrown) {
                    deferred.reject(xhr, statusText, errorThrown);
                }).always(function () {
                    _this.spinner.stop();
                    _this.nextForceDisabled(false);
                    _this.prevForceDisabled(false);
                });
                return deferred;
            };

            Search.prototype._loadResults = function (results) {
                var _this = this;
                var resultsMapping = {
                    items: {
                        key: function (data) {
                            return ko.utils.unwrapObservable(data.id);
                        },
                        create: function (options) {
                            return new ViewModels.Users.SearchResult(options.data, _this);
                        }
                    },
                    ignore: ['pageSize', 'pageNumber']
                };
                ko.mapping.fromJS(results, resultsMapping, this);
                this.transitionedPageNumber(this.pageNumber());
            };

            Search.prototype._setupQueryComputed = function () {
                var _this = this;
                ko.computed(function () {
                    if (_this.pageSize() === undefined || _this.orderBy() === undefined)
                        return;

                    _this._pullResults().done(function (response) {
                        _this._loadResults(response);
                    }).fail(function () {
                        //alert('failed to get users :(');
                    });
                }).extend({ throttle: 250 });
            };

            Search.prototype._setupSammy = function () {
                var _this = this;
                var self = this;

                this.sammy.before(/\#\/page\/(.*)/, function () {
                    if (self.nextForceDisabled() || self.prevForceDisabled())
                        return false;

                    if (self._history().length > 1) {
                        var toPath = this.path;
                        for (var i = 0; i < self._history().length; i++) {
                            var existingPath = self._history()[i];
                            if (toPath === existingPath) {
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
                    if (pageNumber && parseInt(pageNumber) !== Number(self.pageNumber()))
                        self.pageNumber(parseInt(pageNumber));
                    document.title = 'Users (Page #' + self.pageNumber() + ')';
                });

                // this causes the hash to default to page 1
                this.sammy.get('/users[\/]?', function () {
                    _this.sammy.setLocation(_this.getPageHash(1));
                });
            };

            Search.prototype._setupHistory = function () {
                var _this = this;
                this.$historyJson.subscribe(function (newValue) {
                    if (newValue && newValue.length) {
                        var json = newValue.val();
                        if (json) {
                            var js = $.parseJSON(json);
                            ko.mapping.fromJS(js, {}, _this._history);
                        }
                    }
                });

                this._history.subscribe(function (newValue) {
                    if (_this.$historyJson() && _this.$historyJson().length) {
                        var currentJson = _this.$historyJson().val();
                        var newJson = ko.toJSON(newValue);
                        if (currentJson !== newJson)
                            _this.$historyJson().val(newJson);
                    }
                });
            };

            Search.prototype._setupPagingDefaults = function () {
                this.orderBy($('input[type=hidden][data-bind*="value: orderBy"]').val());
                this.pageSize($('input[type=hidden][data-bind*="value: pageSize"]').val());
            };

            Search.prototype._setupSessionStorage = function () {
                this.keyword.subscribe(function (newValue) {
                    sessionStorage.setItem(Search.KeywordSessionKey, newValue);
                });
                this.pageSize.subscribe(function (newValue) {
                    sessionStorage.setItem(Search.PageSizeSessionKey, newValue.toString());
                });
                this.orderBy.subscribe(function (newValue) {
                    sessionStorage.setItem(Search.OrderBySessionKey, newValue);
                });
            };

            Search.prototype.applySession = function () {
                this.keyword(sessionStorage.getItem(Search.KeywordSessionKey) || this.keyword());
                this.pageSize(parseInt(window.sessionStorage.getItem('UserSearchPageSize')) || Number(this.pageSize()));
                this.orderBy(sessionStorage.getItem(Search.OrderBySessionKey) || this.orderBy());
            };

            Search.prototype.nextPage = function () {
                this._gotoPage(1);
            };
            Search.prototype.prevPage = function () {
                this._gotoPage(-1);
            };
            Search.prototype._gotoPage = function (pageDelta) {
                if (pageDelta == 0)
                    return;
                var isEnabled = pageDelta < 0 ? this.prevEnabled() : this.nextEnabled();
                if (isEnabled) {
                    var pageNumber = Number(this.pageNumber()) + pageDelta;
                    if (pageNumber > 0 && pageNumber <= this.pageCount()) {
                        if (this._history().length > 1) {
                            var toPath = location.pathname + this.getPageHash(pageNumber);
                            var i = (pageDelta < 0) ? 0 : this._history().length - 1;
                            var iMove = function () {
                                if (pageDelta < 0)
                                    i++;
else
                                    i--;
                            };
                            for (; i < this._history().length && i >= 0; iMove()) {
                                var existingPath = this._history()[i];
                                if (toPath === existingPath) {
                                    // fake a forward or back button click
                                    var historyDelta = i - this._historyIndex;
                                    history.go(historyDelta);
                                    this._historyIndex = i;
                                    return;
                                }
                            }
                        }
                        this.pageNumber(pageNumber);
                        var pagePath = this.getPageHash(pageNumber);
                        if (this.sammy.getLocation() !== pagePath)
                            this.sammy.setLocation(pagePath);
                    }
                }
            };
            Search.KeywordSessionKey = 'UserSearchKeyword';
            Search.PageSizeSessionKey = 'UserSearchPageSize';
            Search.OrderBySessionKey = 'UserSearchOrderBy';
            return Search;
        })(App.PagedSearch);
        Users.Search = Search;
    })(ViewModels.Users || (ViewModels.Users = {}));
    var Users = ViewModels.Users;
})(ViewModels || (ViewModels = {}));
