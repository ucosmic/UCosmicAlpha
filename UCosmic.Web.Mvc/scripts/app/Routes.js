var App;
(function (App) {
    (function (Routes) {
        Routes.applicationPath = '/';
        function hasTrailingSlash(value) {
            return value.lastIndexOf('/') == value.length - 1;
        }
        (function (WebApi) {
            WebApi.urlPrefix = 'api';
            function makeUrl(relativeUrl) {
                var apiPrefix = WebApi.urlPrefix;
                if(!hasTrailingSlash(apiPrefix)) {
                    apiPrefix = apiPrefix + '/';
                }
                var url = Routes.applicationPath + apiPrefix + relativeUrl;
                if(!hasTrailingSlash(url)) {
                    url = url + '/';
                }
                return url;
            }
            (function (Identity) {
                function signIn() {
                    return makeUrl('sign-in');
                }
                Identity.signIn = signIn;
                function signOut() {
                    return makeUrl('sign-out');
                }
                Identity.signOut = signOut;
            })(WebApi.Identity || (WebApi.Identity = {}));
            var Identity = WebApi.Identity;
            (function (Languages) {
                function get() {
                    return makeUrl('languages');
                }
                Languages.get = get;
            })(WebApi.Languages || (WebApi.Languages = {}));
            var Languages = WebApi.Languages;
            (function (Countries) {
                function get() {
                    return makeUrl('countries');
                }
                Countries.get = get;
            })(WebApi.Countries || (WebApi.Countries = {}));
            var Countries = WebApi.Countries;
            (function (Establishments) {
                function get(establishmentId) {
                    var url = 'establishments';
                    if(establishmentId) {
                        url += '/' + establishmentId;
                    }
                    return makeUrl(url);
                }
                Establishments.get = get;
                var Names = (function () {
                    function Names() { }
                    Names.get = function get(establishmentId, establishmentNameId) {
                        var url = 'establishments/' + establishmentId + '/names';
                        if(establishmentNameId) {
                            url += '/' + establishmentNameId;
                        }
                        return makeUrl(url);
                    }
                    Names.post = function post(establishmentId) {
                        return Names.get(establishmentId);
                    }
                    Names.put = function put(establishmentId, establishmentNameId) {
                        return makeUrl('establishments/' + establishmentId + '/names/' + establishmentNameId);
                    }
                    Names.del = function del(establishmentId, establishmentNameId) {
                        return Names.put(establishmentId, establishmentNameId);
                    }
                    Names.validateText = function validateText(establishmentId, establishmentNameId) {
                        return makeUrl('establishments/' + establishmentId + '/names/' + establishmentNameId + '/validate-text');
                    }
                    return Names;
                })();
                Establishments.Names = Names;                
                var Urls = (function () {
                    function Urls() { }
                    Urls.get = function get(establishmentId, establishmentUrlId) {
                        var url = 'establishments/' + establishmentId + '/urls';
                        if(establishmentUrlId) {
                            url += '/' + establishmentUrlId;
                        }
                        return makeUrl(url);
                    }
                    Urls.post = function post(establishmentId) {
                        return Urls.get(establishmentId);
                    }
                    Urls.put = function put(establishmentId, establishmentUrlId) {
                        return makeUrl('establishments/' + establishmentId + '/urls/' + establishmentUrlId);
                    }
                    Urls.del = function del(establishmentId, establishmentUrlId) {
                        return Urls.put(establishmentId, establishmentUrlId);
                    }
                    Urls.validateValue = function validateValue(establishmentId, establishmentUrlId) {
                        return makeUrl('establishments/' + establishmentId + '/urls/' + establishmentUrlId + '/validate-value');
                    }
                    return Urls;
                })();
                Establishments.Urls = Urls;                
                var Locations = (function () {
                    function Locations() { }
                    Locations.get = function get(establishmentId) {
                        var url = 'establishments/' + establishmentId + '/location';
                        return makeUrl(url);
                    }
                    return Locations;
                })();
                Establishments.Locations = Locations;                
            })(WebApi.Establishments || (WebApi.Establishments = {}));
            var Establishments = WebApi.Establishments;
        })(Routes.WebApi || (Routes.WebApi = {}));
        var WebApi = Routes.WebApi;
    })(App.Routes || (App.Routes = {}));
    var Routes = App.Routes;
})(App || (App = {}));
