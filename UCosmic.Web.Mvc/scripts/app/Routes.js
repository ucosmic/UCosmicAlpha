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
                (function (Users) {
                    function get(id) {
                        var url = 'users';
                        if(id) {
                            url += '/' + id;
                        }
                        return makeUrl(url);
                    }
                    Users.get = get;
                    function post() {
                        return makeUrl('users');
                    }
                    Users.post = post;
                    function validateName(id) {
                        id = id ? id : 0;
                        var url = 'users/' + id + '/validate-name';
                        return makeUrl(url);
                    }
                    Users.validateName = validateName;
                    (function (Roles) {
                        function get(userId) {
                            var url = 'users/' + userId + '/roles';
                            return makeUrl(url);
                        }
                        Roles.get = get;
                        function put(userId, roleId) {
                            var url = 'users/' + userId + '/roles/' + roleId;
                            return makeUrl(url);
                        }
                        Roles.put = put;
                        function del(userId, roleId) {
                            return put(userId, roleId);
                        }
                        Roles.del = del;
                        function validateGrant(userId, roleId) {
                            var url = 'users/' + userId + '/roles/' + roleId + '/validate-grant';
                            return makeUrl(url);
                        }
                        Roles.validateGrant = validateGrant;
                        function validateRevoke(userId, roleId) {
                            var url = 'users/' + userId + '/roles/' + roleId + '/validate-revoke';
                            return makeUrl(url);
                        }
                        Roles.validateRevoke = validateRevoke;
                    })(Users.Roles || (Users.Roles = {}));
                    var Roles = Users.Roles;
                })(Identity.Users || (Identity.Users = {}));
                var Users = Identity.Users;
                (function (Roles) {
                    function get(roleId) {
                        var url = 'roles';
                        if(roleId) {
                            url += '/' + roleId;
                        }
                        return makeUrl(url);
                    }
                    Roles.get = get;
                })(Identity.Roles || (Identity.Roles = {}));
                var Roles = Identity.Roles;
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
                function get(placeId) {
                    var url = 'places';
                    if(placeId) {
                        url += '/' + placeId;
                    }
                    return makeUrl(url);
                }
                Places.get = get;
                (function (ByCoordinates) {
                    function get(latitude, longitude) {
                        var url = 'places/by-coordinates/' + latitude + '/' + longitude;
                        return makeUrl(url);
                    }
                    ByCoordinates.get = get;
                })(Places.ByCoordinates || (Places.ByCoordinates = {}));
                var ByCoordinates = Places.ByCoordinates;
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
                function post() {
                    return makeUrl('establishments');
                }
                Establishments.post = post;
                function put(establishmentId) {
                    return get(establishmentId);
                }
                Establishments.put = put;
                function validateCeebCode(establishmentId) {
                    return makeUrl('establishments/' + establishmentId + '/validate-ceeb-code');
                }
                Establishments.validateCeebCode = validateCeebCode;
                function validateUCosmicCode(establishmentId) {
                    return makeUrl('establishments/' + establishmentId + '/validate-ucosmic-code');
                }
                Establishments.validateUCosmicCode = validateUCosmicCode;
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
                    Locations.put = function put(establishmentId) {
                        return Locations.get(establishmentId);
                    }
                    return Locations;
                })();
                Establishments.Locations = Locations;                
                var Categories = (function () {
                    function Categories() { }
                    Categories.get = function get(id) {
                        var url = 'establishment-categories';
                        if(id) {
                            url += '/' + id;
                        }
                        return makeUrl(url);
                    }
                    return Categories;
                })();
                Establishments.Categories = Categories;                
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
                    (function (Photo) {
                        function get(params) {
                            var url = post();
                            if(params) {
                                url += '?' + $.param(params);
                            }
                            return url;
                        }
                        Photo.get = get;
                        function post() {
                            return makeUrl('my/profile/photo');
                        }
                        Photo.post = post;
                        function del() {
                            return post();
                        }
                        Photo.del = del;
                        function kendoRemove() {
                            return makeUrl('my/profile/photo/kendo-remove');
                        }
                        Photo.kendoRemove = kendoRemove;
                    })(Profile.Photo || (Profile.Photo = {}));
                    var Photo = Profile.Photo;
                })(My.Profile || (My.Profile = {}));
                var Profile = My.Profile;
            })(WebApi.My || (WebApi.My = {}));
            var My = WebApi.My;
            (function (People) {
                (function (Photo) {
                                                            function get(id, arg1, arg2, arg3) {
                        if(arguments.length === 4 || (arguments.length === 3 && typeof arguments[2] === 'number')) {
                            return getByMaxSides(id, arg1, arg2, arg3);
                        }
                        return getByMaxSide(id, arg1, arg2);
                    }
                    Photo.get = get;
                    function getByMaxSide(id, maxSide, refresh) {
                        var url = initializeGetUrl(id);
                        if(maxSide) {
                            url += 'maxSide=' + maxSide + '&';
                        }
                        url = finalizeGetUrl(url, refresh);
                        return url;
                    }
                    function getByMaxSides(id, maxWidth, maxHeight, refresh) {
                        var url = initializeGetUrl(id);
                        if(maxWidth) {
                            url += 'maxWidth=' + maxWidth + '&';
                        }
                        if(maxHeight) {
                            url += 'maxHeight=' + maxHeight + '&';
                        }
                        url = finalizeGetUrl(url, refresh);
                        return url;
                    }
                    function initializeGetUrl(id) {
                        var url = makeUrl('people/' + id + '/photo/');
                        url += '?';
                        return url;
                    }
                    function finalizeGetUrl(url, refresh) {
                        if(refresh) {
                            url += 'refresh=' + new Date().toUTCString() + '&';
                        }
                        if(url.lastIndexOf('&') === url.length - 1) {
                            url = url.substr(0, url.length - 1);
                        }
                        if(url.lastIndexOf('?') === url.length - 1) {
                            url = url.substr(0, url.length - 1);
                        }
                        return url;
                    }
                })(People.Photo || (People.Photo = {}));
                var Photo = People.Photo;
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
                    var ActivityTypes = (function () {
                        function ActivityTypes() { }
                        ActivityTypes.get = function get() {
                            return makeUrl('my/employee-module-settings/activity-types');
                        }
                        return ActivityTypes;
                    })();
                    ModuleSettings.ActivityTypes = ActivityTypes;                    
                })(Employees.ModuleSettings || (Employees.ModuleSettings = {}));
                var ModuleSettings = Employees.ModuleSettings;
            })(WebApi.Employees || (WebApi.Employees = {}));
            var Employees = WebApi.Employees;
            (function (Activities) {
                function get() {
                    return makeUrl('activities/page');
                }
                Activities.get = get;
                function getDocProxy() {
                    return makeUrl('activities/docproxy');
                }
                Activities.getDocProxy = getDocProxy;
                var Locations = (function () {
                    function Locations() { }
                    Locations.get = function get() {
                        return makeUrl('activities/locations');
                    }
                    return Locations;
                })();
                Activities.Locations = Locations;                
                var Delete = (function () {
                    function Delete() { }
                    Delete.get = function get() {
                        return makeUrl('activities/delete');
                    }
                    return Delete;
                })();
                Activities.Delete = Delete;                
            })(WebApi.Activities || (WebApi.Activities = {}));
            var Activities = WebApi.Activities;
            (function (Activity) {
                function get() {
                    return makeUrl('activity');
                }
                Activity.get = get;
                function uploadDocument() {
                    return makeUrl('activity/upload');
                }
                Activity.uploadDocument = uploadDocument;
                function validateUploadFileTypeByExtension(activityId) {
                    return makeUrl('activity/' + activityId.toString() + '/validate-upload-filetype');
                }
                Activity.validateUploadFileTypeByExtension = validateUploadFileTypeByExtension;
                function getDocuments(activityValuesId) {
                    return makeUrl('activity/' + activityValuesId.toString() + '/documents');
                }
                Activity.getDocuments = getDocuments;
                function deleteDocument(activityDocumentId) {
                    return makeUrl('activity/' + activityDocumentId.toString() + '/document');
                }
                Activity.deleteDocument = deleteDocument;
            })(WebApi.Activity || (WebApi.Activity = {}));
            var Activity = WebApi.Activity;
        })(Routes.WebApi || (Routes.WebApi = {}));
        var WebApi = Routes.WebApi;
        (function (Mvc) {
            function makeUrl(relativeUrl) {
                var url = Routes.applicationPath + relativeUrl;
                if(!hasTrailingSlash(url)) {
                    url = url + '/';
                }
                return url;
            }
            (function (Establishments) {
                function show(establishmentId) {
                    return makeUrl('establishments/' + establishmentId);
                }
                Establishments.show = show;
                function created(location) {
                    var url = makeUrl('establishments/created');
                    url += '?location=' + location;
                    return url;
                }
                Establishments.created = created;
            })(Mvc.Establishments || (Mvc.Establishments = {}));
            var Establishments = Mvc.Establishments;
            (function (Identity) {
                (function (Users) {
                    function created(location) {
                        var url = makeUrl('users/created');
                        url += '?location=' + location;
                        return url;
                    }
                    Users.created = created;
                })(Identity.Users || (Identity.Users = {}));
                var Users = Identity.Users;
            })(Mvc.Identity || (Mvc.Identity = {}));
            var Identity = Mvc.Identity;
        })(Routes.Mvc || (Routes.Mvc = {}));
        var Mvc = Routes.Mvc;
    })(App.Routes || (App.Routes = {}));
    var Routes = App.Routes;
})(App || (App = {}));
