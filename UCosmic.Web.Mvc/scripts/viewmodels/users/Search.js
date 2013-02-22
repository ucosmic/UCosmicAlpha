var ViewModels;
(function (ViewModels) {
    (function (Users) {
        var Search = (function () {
            function Search() {
                this.items = ko.observableArray();
                this._init();
            }
            Search.prototype._init = function () {
                var _this = this;
                this._pullItems().done(function (response) {
                    _this._loadItems(response);
                }).fail(function () {
                });
            };
            Search.prototype._pullItems = function () {
                var deferred = $.Deferred();
                $.get(App.Routes.WebApi.Users.get()).done(function (response, statusText, xhr) {
                    deferred.resolve(response, statusText, xhr);
                }).fail(function (xhr, statusText, errorThrown) {
                    deferred.reject(xhr, statusText, errorThrown);
                });
                return deferred;
            };
            Search.prototype._loadItems = function (items) {
                var itemsMapping = {
                    key: function (data) {
                        return ko.utils.unwrapObservable(data.id);
                    },
                    create: function (options) {
                        return new ViewModels.Users.SearchResult(options.data);
                    },
                    ignore: [
                        'pageSize', 
                        'pageNumber'
                    ]
                };
                ko.mapping.fromJS(items, itemsMapping, this.items);
            };
            return Search;
        })();
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
