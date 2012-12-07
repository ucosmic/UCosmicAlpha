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
            var Identity = (function () {
                function Identity() { }
                Identity.signIn = function signIn() {
                    return makeUrl('sign-in');
                }
                Identity.signOut = function signOut() {
                    return makeUrl('sign-out');
                }
                return Identity;
            })();
            WebApi.Identity = Identity;            
            var Countries = (function () {
                function Countries() { }
                Countries.get = function get() {
                    return makeUrl('countries');
                }
                return Countries;
            })();
            WebApi.Countries = Countries;            
            var Languages = (function () {
                function Languages() { }
                Languages.get = function get() {
                    return makeUrl('languages');
                }
                return Languages;
            })();
            WebApi.Languages = Languages;            
            var Establishments = (function () {
                function Establishments() { }
                Establishments.get = function get() {
                    return makeUrl('establishments');
                }
                return Establishments;
            })();
            WebApi.Establishments = Establishments;            
            var EstablishmentNames = (function () {
                function EstablishmentNames() { }
                EstablishmentNames.get = function get(establishmentId, establishmentNameId) {
                    var url = 'establishments/' + establishmentId + '/names';
                    if(establishmentNameId) {
                        url += '/' + establishmentNameId;
                    }
                    return makeUrl(url);
                }
                EstablishmentNames.post = function post(establishmentId) {
                    return EstablishmentNames.get(establishmentId);
                }
                EstablishmentNames.put = function put(establishmentId, establishmentNameId) {
                    return makeUrl('establishments/' + establishmentId + '/names/' + establishmentNameId);
                }
                EstablishmentNames.del = function del(establishmentId, establishmentNameId) {
                    return EstablishmentNames.put(establishmentId, establishmentNameId);
                }
                EstablishmentNames.validateText = function validateText(establishmentId, establishmentNameId) {
                    return makeUrl('establishments/' + establishmentId + '/names/' + establishmentNameId + '/validate-text');
                }
                return EstablishmentNames;
            })();
            WebApi.EstablishmentNames = EstablishmentNames;            
            var EstablishmentUrls = (function () {
                function EstablishmentUrls() { }
                EstablishmentUrls.get = function get(establishmentId, establishmentUrlId) {
                    var url = 'establishments/' + establishmentId + '/urls';
                    if(establishmentUrlId) {
                        url += '/' + establishmentUrlId;
                    }
                    return makeUrl(url);
                }
                EstablishmentUrls.post = function post(establishmentId) {
                    return EstablishmentUrls.get(establishmentId);
                }
                EstablishmentUrls.put = function put(establishmentId, establishmentUrlId) {
                    return makeUrl('establishments/' + establishmentId + '/urls/' + establishmentUrlId);
                }
                EstablishmentUrls.del = function del(establishmentId, establishmentUrlId) {
                    return EstablishmentUrls.put(establishmentId, establishmentUrlId);
                }
                EstablishmentUrls.validateValue = function validateValue(establishmentId, establishmentUrlId) {
                    return makeUrl('establishments/' + establishmentId + '/urls/' + establishmentUrlId + '/validate-value');
                }
                return EstablishmentUrls;
            })();
            WebApi.EstablishmentUrls = EstablishmentUrls;            
        })(Routes.WebApi || (Routes.WebApi = {}));
        var WebApi = Routes.WebApi;

    })(App.Routes || (App.Routes = {}));
    var Routes = App.Routes;

})(App || (App = {}));

