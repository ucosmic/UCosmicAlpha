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
            (function (Places) {
                function getByFilterArgs(args) {
                    var url = makeUrl('places');
                    url = url.substr(0, url.length - 1);
                    url += '?';
                    if(args.parentId) {
                        url += 'parentId=' + args.parentId + '&';
                    }
                    if(args.isContinent) {
                        url += 'isContinent=' + args.isContinent + '&';
                    }
                    if(args.isCountry) {
                        url += 'isCountry=' + args.isCountry + '&';
                    }
                    if(args.isAdmin1) {
                        url += 'isAdmin1=' + args.isAdmin1 + '&';
                    }
                    if(args.isAdmin2) {
                        url += 'isAdmin2=' + args.isAdmin2 + '&';
                    }
                    if(args.isAdmin3) {
                        url += 'isAdmin3=' + args.isAdmin3 + '&';
                    }
                    if(url.lastIndexOf('&') === url.length - 1) {
                        url = url.substr(0, url.length - 1);
                    }
                    return url;
                }
                function getByLatLng(latitude, longitude) {
                    var url = 'places/by-coordinates/' + latitude + '/' + longitude;
                    return makeUrl(url);
                }
                                                function get(arg1, arg2) {
                    if(!arg2 || typeof arg2 !== 'number') {
                        return getByFilterArgs(arg1);
                    } else {
                        return getByLatLng(arg1, arg2);
                    }
                }
                Places.get = get;
            })(WebApi.Places || (WebApi.Places = {}));
            var Places = WebApi.Places;
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
            (function (My) {
                (function (Profile) {
                    function get() {
                        return makeUrl('my/profile');
                    }
                    Profile.get = get;
                    function put() {
                        return get();
                    }
                    Profile.put = put;
                    var Photo = (function () {
                        function Photo() { }
                        Photo.get = function get(maxSide, maxWidth, maxHeight, refresh) {
                            var url = makeUrl('my/profile/photo');
                            url += '?';
                            if(maxSide) {
                                url += 'maxSide=' + maxSide + '&';
                            }
                            if(maxWidth) {
                                url += 'maxWidth=' + maxWidth + '&';
                            }
                            if(maxHeight) {
                                url += 'maxHeight=' + maxHeight + '&';
                            }
                            if(refresh) {
                                url += 'refresh=' + refresh.toISOString() + '&';
                            }
                            if(url.lastIndexOf('&') === url.length - 1) {
                                url = url.substr(0, url.length - 1);
                            }
                            return url;
                        }
                        Photo.post = function post() {
                            return makeUrl('my/profile/photo');
                        }
                        Photo.del = function del() {
                            return Photo.post();
                        }
                        return Photo;
                    })();
                    Profile.Photo = Photo;                    
                })(My.Profile || (My.Profile = {}));
                var Profile = My.Profile;
            })(WebApi.My || (WebApi.My = {}));
            var My = WebApi.My;
            (function (People) {
                (function (Names) {
                    var Salutations = (function () {
                        function Salutations() { }
                        Salutations.get = function get() {
                            return makeUrl('person-names/salutations');
                        }
                        return Salutations;
                    })();
                    Names.Salutations = Salutations;                    
                    var Suffixes = (function () {
                        function Suffixes() { }
                        Suffixes.get = function get() {
                            return makeUrl('person-names/suffixes');
                        }
                        return Suffixes;
                    })();
                    Names.Suffixes = Suffixes;                    
                    var DeriveDisplayName = (function () {
                        function DeriveDisplayName() { }
                        DeriveDisplayName.get = function get() {
                            return makeUrl('person-names/derive-display-name');
                        }
                        return DeriveDisplayName;
                    })();
                    Names.DeriveDisplayName = DeriveDisplayName;                    
                })(People.Names || (People.Names = {}));
                var Names = People.Names;
            })(WebApi.People || (WebApi.People = {}));
            var People = WebApi.People;
            (function (Employees) {
                (function (ModuleSettings) {
                    var FacultyRanks = (function () {
                        function FacultyRanks() { }
                        FacultyRanks.get = function get() {
                            return makeUrl('my/employee-module-settings/faculty-ranks');
                        }
                        return FacultyRanks;
                    })();
                    ModuleSettings.FacultyRanks = FacultyRanks;                    
                })(Employees.ModuleSettings || (Employees.ModuleSettings = {}));
                var ModuleSettings = Employees.ModuleSettings;
            })(WebApi.Employees || (WebApi.Employees = {}));
            var Employees = WebApi.Employees;
        })(Routes.WebApi || (Routes.WebApi = {}));
        var WebApi = Routes.WebApi;
    })(App.Routes || (App.Routes = {}));
    var Routes = App.Routes;
})(App || (App = {}));
