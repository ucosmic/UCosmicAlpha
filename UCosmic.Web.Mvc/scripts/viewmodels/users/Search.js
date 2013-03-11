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
                this._init();
            }
            Search.prototype._init = function () {
                this._setupSammy();
                this._setupQueryComputed();
            };
            Search.prototype._pullResults = function () {
                var deferred = $.Deferred();
                var queryParameters = {
                    pageSize: this.pageSize(),
                    pageNumber: this.pageNumber(),
                    keyword: this.throttledKeyword(),
                    orderBy: this.orderBy()
                };
                $.get(App.Routes.WebApi.Users.get(), queryParameters).done(function (response, statusText, xhr) {
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
                    var pageNumber = this.params['pageNumber'];
                    if(pageNumber && parseInt(pageNumber) !== parseInt(self.pageNumber())) {
                        self.pageNumber(parseInt(pageNumber));
                    }
                    return true;
                });
                this.sammy.get('#/page/:pageNumber/', function () {
                });
                this.sammy.get('/users[\/]?', function () {
                    _this.sammy.setLocation('#/page/1/');
                });
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
