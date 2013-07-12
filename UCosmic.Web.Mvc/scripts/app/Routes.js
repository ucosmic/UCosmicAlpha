var App;
(function (App) {
    (function (Routes) {
        Routes.applicationPath = '/';
        function hasTrailingSlash(value) {
            return value.lastIndexOf('/') == value.length - 1;
        }
        function hasTrailingQM(value) {
            return value.lastIndexOf('?') == value.length - 1;
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
            function makeUrlWithParams(relativeUrl) {
                var apiPrefix = WebApi.urlPrefix;
                if(!hasTrailingSlash(apiPrefix)) {
                    apiPrefix = apiPrefix + '/';
                }
                var url = Routes.applicationPath + apiPrefix + relativeUrl;
                if(!hasTrailingSlash(url)) {
                    url = url + '?';
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
                    function del(id) {
                        var url = 'users/' + id;
                        return makeUrl(url);
                    }
                    Users.del = del;
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
            (function (LanguageProficiency) {
                function get() {
                    return makeUrl('language-proficiency');
                }
                LanguageProficiency.get = get;
            })(WebApi.LanguageProficiency || (WebApi.LanguageProficiency = {}));
            var LanguageProficiency = WebApi.LanguageProficiency;
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
                function getChildren(establishmentId, sort) {
                    var url = 'establishments/' + establishmentId + '/children';
                    return makeUrlWithParams(url) + "sort=" + sort;
                }
                Establishments.getChildren = getChildren;
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
                function validateParentId(establishmentId) {
                    return makeUrl('establishments/' + establishmentId + '/validate-parent-id');
                }
                Establishments.validateParentId = validateParentId;
                var Names = (function () {
                    function Names() { }
                    Names.get = function get(establishmentId, establishmentNameId) {
                        var url = 'establishments/' + establishmentId + '/names';
                        if(establishmentNameId) {
                            url += '/' + establishmentNameId;
                        }
                        return makeUrl(url);
                    };
                    Names.post = function post(establishmentId) {
                        return Names.get(establishmentId);
                    };
                    Names.put = function put(establishmentId, establishmentNameId) {
                        return makeUrl('establishments/' + establishmentId + '/names/' + establishmentNameId);
                    };
                    Names.del = function del(establishmentId, establishmentNameId) {
                        return Names.put(establishmentId, establishmentNameId);
                    };
                    Names.validateText = function validateText(establishmentId, establishmentNameId) {
                        return makeUrl('establishments/' + establishmentId + '/names/' + establishmentNameId + '/validate-text');
                    };
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
                    };
                    Urls.post = function post(establishmentId) {
                        return Urls.get(establishmentId);
                    };
                    Urls.put = function put(establishmentId, establishmentUrlId) {
                        return makeUrl('establishments/' + establishmentId + '/urls/' + establishmentUrlId);
                    };
                    Urls.del = function del(establishmentId, establishmentUrlId) {
                        return Urls.put(establishmentId, establishmentUrlId);
                    };
                    Urls.validateValue = function validateValue(establishmentId, establishmentUrlId) {
                        return makeUrl('establishments/' + establishmentId + '/urls/' + establishmentUrlId + '/validate-value');
                    };
                    return Urls;
                })();
                Establishments.Urls = Urls;                
                var Locations = (function () {
                    function Locations() { }
                    Locations.get = function get(establishmentId) {
                        var url = 'establishments/' + establishmentId + '/location';
                        return makeUrl(url);
                    };
                    Locations.put = function put(establishmentId) {
                        return Locations.get(establishmentId);
                    };
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
                    };
                    return Categories;
                })();
                Establishments.Categories = Categories;                
            })(WebApi.Establishments || (WebApi.Establishments = {}));
            var Establishments = WebApi.Establishments;
            (function (Agreements) {
                function get(agreementId) {
                    return makeUrl('agreements/' + agreementId);
                }
                Agreements.get = get;
                function put(agreementId) {
                    return get(agreementId);
                }
                Agreements.put = put;
                (function (Participants) {
                    function get(agreementId) {
                        var url = 'agreements/0/participants';
                        if(agreementId) {
                            url = url.replace('0', agreementId.toString());
                        }
                        return makeUrl(url);
                    }
                    Participants.get = get;
                })(Agreements.Participants || (Agreements.Participants = {}));
                var Participants = Agreements.Participants;
                (function (Participant) {
                    function get(establishmentId, agreementId) {
                        var url = 'agreements/0/participant/';
                        if(agreementId) {
                            url = url.replace('0', agreementId.toString());
                        }
                        url += establishmentId;
                        return makeUrl(url);
                    }
                    Participant.get = get;
                })(Agreements.Participant || (Agreements.Participant = {}));
                var Participant = Agreements.Participant;
                (function (Contacts) {
                    function get(agreementId) {
                        var url = 'agreements/0/contacts';
                        if(agreementId) {
                            url = url.replace('0', agreementId.toString());
                        }
                        return makeUrl(url);
                    }
                    Contacts.get = get;
                })(Agreements.Contacts || (Agreements.Contacts = {}));
                var Contacts = Agreements.Contacts;
                (function (Files) {
                    function get(agreementId, fileId) {
                        var url = 'agreements/' + agreementId + '/files';
                        if(fileId) {
                            url += '/' + fileId;
                        }
                        return makeUrl(url);
                    }
                    Files.get = get;
                    function post(agreementId) {
                        return get(agreementId);
                    }
                    Files.post = post;
                    function put(agreementId, fileId) {
                        return get(agreementId, fileId);
                    }
                    Files.put = put;
                    function del(agreementId, fileId) {
                        return get(agreementId, fileId);
                    }
                    Files.del = del;
                    (function (Content) {
                        function view(agreementId, fileId) {
                            var url = Files.get(agreementId, fileId);
                            url += 'content';
                            return makeUrl(url);
                        }
                        Content.view = view;
                        function download(agreementId, fileId) {
                            var url = Files.get(agreementId, fileId);
                            url += 'download';
                            return makeUrl(url);
                        }
                        Content.download = download;
                    })(Files.Content || (Files.Content = {}));
                    var Content = Files.Content;
                })(Agreements.Files || (Agreements.Files = {}));
                var Files = Agreements.Files;
                (function (Settings) {
                    function get() {
                        return makeUrl('agreements/settings');
                    }
                    Settings.get = get;
                })(Agreements.Settings || (Agreements.Settings = {}));
                var Settings = Agreements.Settings;
            })(WebApi.Agreements || (WebApi.Agreements = {}));
            var Agreements = WebApi.Agreements;
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
                    (function (Affiliation) {
                        function base() {
                            return makeUrl('my/profile/affiliation');
                        }
                        Affiliation.base = base;
                        function get() {
                            return base();
                        }
                        Affiliation.get = get;
                        function post() {
                            return base();
                        }
                        Affiliation.post = post;
                        function put() {
                            return base();
                        }
                        Affiliation.put = put;
                        function del() {
                            return base();
                        }
                        Affiliation.del = del;
                    })(Profile.Affiliation || (Profile.Affiliation = {}));
                    var Affiliation = Profile.Affiliation;
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
                function get(personId) {
                    var url = 'people';
                    if(personId) {
                        url += '/' + personId;
                    }
                    return makeUrl(url);
                }
                People.get = get;
                function del(personId) {
                    var url = 'people/' + personId;
                    url = makeUrl(url);
                    return url;
                }
                People.del = del;
                (function (Photo) {
                    function get(personId, params) {
                        var url = 'people/' + personId + '/photo';
                        url = makeUrl(url);
                        if(params) {
                            url += '?' + $.param(params);
                        }
                        return url;
                    }
                    Photo.get = get;
                })(People.Photo || (People.Photo = {}));
                var Photo = People.Photo;
                (function (Names) {
                    var Salutations = (function () {
                        function Salutations() { }
                        Salutations.get = function get() {
                            return makeUrl('person-names/salutations');
                        };
                        return Salutations;
                    })();
                    Names.Salutations = Salutations;                    
                    var Suffixes = (function () {
                        function Suffixes() { }
                        Suffixes.get = function get() {
                            return makeUrl('person-names/suffixes');
                        };
                        return Suffixes;
                    })();
                    Names.Suffixes = Suffixes;                    
                    var DeriveDisplayName = (function () {
                        function DeriveDisplayName() { }
                        DeriveDisplayName.get = function get() {
                            return makeUrl('person-names/derive-display-name');
                        };
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
                        };
                        return FacultyRanks;
                    })();
                    ModuleSettings.FacultyRanks = FacultyRanks;                    
                    var ActivityTypes = (function () {
                        function ActivityTypes() { }
                        ActivityTypes.get = function get() {
                            return makeUrl('my/employee-module-settings/activity-types');
                        };
                        return ActivityTypes;
                    })();
                    ModuleSettings.ActivityTypes = ActivityTypes;                    
                })(Employees.ModuleSettings || (Employees.ModuleSettings = {}));
                var ModuleSettings = Employees.ModuleSettings;
            })(WebApi.Employees || (WebApi.Employees = {}));
            var Employees = WebApi.Employees;
            (function (Activities) {
                function get(activityId) {
                    var url = makeUrl('activities');
                    if(activityId) {
                        url += '/' + activityId;
                    }
                    return url;
                }
                Activities.get = get;
                function post() {
                    return makeUrl('activities');
                }
                Activities.post = post;
                function getEdit(activityId) {
                    return makeUrl('activities/' + activityId + "/edit");
                }
                Activities.getEdit = getEdit;
                function getEditState(activityId) {
                    return makeUrl('activities/' + activityId + "/edit-state");
                }
                Activities.getEditState = getEditState;
                function put(activityId) {
                    return makeUrl('activities/' + activityId);
                }
                Activities.put = put;
                function putEdit(activityId) {
                    return makeUrl('activities/' + activityId + "/edit");
                }
                Activities.putEdit = putEdit;
                function del(activityId) {
                    return makeUrl('activities/' + activityId);
                }
                Activities.del = del;
                (function (Documents) {
                    function get(activityId, documentId, activityMode) {
                        var url = makeUrl('activities/' + activityId + '/documents');
                        if(documentId) {
                            url += '/' + documentId;
                        } else if(activityId) {
                            url += '/?activityMode=' + activityMode;
                        }
                        return url;
                    }
                    Documents.get = get;
                    function post(activityId, activityMode) {
                        var url = makeUrl('activities/' + activityId + '/documents/');
                        url += '?activityMode=' + activityMode;
                        return url;
                    }
                    Documents.post = post;
                    function put(activityId, documentId) {
                        return makeUrl('activities/' + activityId + '/documents/' + documentId);
                    }
                    Documents.put = put;
                    function del(activityId, documentId) {
                        return makeUrl('activities/' + activityId + '/documents/' + documentId);
                    }
                    Documents.del = del;
                    function rename(activityId, documentId) {
                        return makeUrl('activities/' + activityId + '/documents/' + documentId + "/title");
                    }
                    Documents.rename = rename;
                    function validateFileExtensions(activityId) {
                        return makeUrl('activities/' + activityId + '/documents/validate-upload-filetype');
                    }
                    Documents.validateFileExtensions = validateFileExtensions;
                    (function (Thumbnail) {
                        function get(activityId, documentId) {
                            return makeUrl('activities/' + activityId + '/documents/' + documentId + '/thumbnail');
                        }
                        Thumbnail.get = get;
                    })(Documents.Thumbnail || (Documents.Thumbnail = {}));
                    var Thumbnail = Documents.Thumbnail;
                })(Activities.Documents || (Activities.Documents = {}));
                var Documents = Activities.Documents;
                (function (Locations) {
                    function get() {
                        return makeUrl('activity-locations');
                    }
                    Locations.get = get;
                })(Activities.Locations || (Activities.Locations = {}));
                var Locations = Activities.Locations;
                (function (CountryCounts) {
                    function get() {
                        return makeUrl('activity-country-counts');
                    }
                    CountryCounts.get = get;
                })(Activities.CountryCounts || (Activities.CountryCounts = {}));
                var CountryCounts = Activities.CountryCounts;
            })(WebApi.Activities || (WebApi.Activities = {}));
            var Activities = WebApi.Activities;
            (function (GeographicExpertises) {
                function get(expertiseId) {
                    var url = makeUrl('geographic-expertises');
                    if(expertiseId) {
                        url += expertiseId;
                    }
                    return url;
                }
                GeographicExpertises.get = get;
                function post() {
                    return makeUrl('geographic-expertises');
                }
                GeographicExpertises.post = post;
                function put(expertiseId) {
                    return makeUrl('geographic-expertises/' + expertiseId);
                }
                GeographicExpertises.put = put;
                function del(expertiseId) {
                    return makeUrl('geographic-expertises/' + expertiseId);
                }
                GeographicExpertises.del = del;
            })(WebApi.GeographicExpertises || (WebApi.GeographicExpertises = {}));
            var GeographicExpertises = WebApi.GeographicExpertises;
            (function (LanguageExpertises) {
                function get(expertiseId) {
                    var url = makeUrl('language-expertises');
                    if(expertiseId) {
                        url += expertiseId;
                    }
                    return url;
                }
                LanguageExpertises.get = get;
                function getProficiencies() {
                    return makeUrl('language-expertises/proficiencies');
                }
                LanguageExpertises.getProficiencies = getProficiencies;
                function post() {
                    return makeUrl('language-expertises');
                }
                LanguageExpertises.post = post;
                function put(expertiseId) {
                    return makeUrl('language-expertises/' + expertiseId);
                }
                LanguageExpertises.put = put;
                function del(expertiseId) {
                    return makeUrl('language-expertises/' + expertiseId);
                }
                LanguageExpertises.del = del;
            })(WebApi.LanguageExpertises || (WebApi.LanguageExpertises = {}));
            var LanguageExpertises = WebApi.LanguageExpertises;
            (function (InternationalAffiliations) {
                function get(affiliationId) {
                    var url = makeUrl('international-affiliations');
                    if(affiliationId) {
                        url += affiliationId;
                    }
                    return url;
                }
                InternationalAffiliations.get = get;
                function post() {
                    return makeUrl('international-affiliations');
                }
                InternationalAffiliations.post = post;
                function put(affiliationId) {
                    return makeUrl('international-affiliations/' + affiliationId);
                }
                InternationalAffiliations.put = put;
                function del(affiliationId) {
                    return makeUrl('international-affiliations/' + affiliationId);
                }
                InternationalAffiliations.del = del;
            })(WebApi.InternationalAffiliations || (WebApi.InternationalAffiliations = {}));
            var InternationalAffiliations = WebApi.InternationalAffiliations;
            (function (Degrees) {
                function get(degreeId) {
                    var url = makeUrl('degrees');
                    if(degreeId) {
                        url += '/' + degreeId;
                    }
                    return url;
                }
                Degrees.get = get;
                function post() {
                    return makeUrl('degrees');
                }
                Degrees.post = post;
                function put(degreeId) {
                    return makeUrl('degrees/' + degreeId);
                }
                Degrees.put = put;
                function del(degreeId) {
                    return makeUrl('degrees/' + degreeId);
                }
                Degrees.del = del;
            })(WebApi.Degrees || (WebApi.Degrees = {}));
            var Degrees = WebApi.Degrees;
            (function (Affiliations) {
                function get(affiliationId) {
                    var url = makeUrl('affiliations');
                    if(affiliationId) {
                        url += '/' + affiliationId;
                    }
                    return url;
                }
                Affiliations.get = get;
                function post() {
                    return makeUrl('affiliations');
                }
                Affiliations.post = post;
                function put(affiliationId) {
                    return makeUrl('affiliations/' + affiliationId);
                }
                Affiliations.put = put;
                function del(affiliationId) {
                    return makeUrl('affiliations/' + affiliationId);
                }
                Affiliations.del = del;
            })(WebApi.Affiliations || (WebApi.Affiliations = {}));
            var Affiliations = WebApi.Affiliations;
            (function (Uploads) {
                function post() {
                    return makeUrl('uploads');
                }
                Uploads.post = post;
            })(WebApi.Uploads || (WebApi.Uploads = {}));
            var Uploads = WebApi.Uploads;
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
            function makeUrlWithParams(relativeUrl) {
                var url = Routes.applicationPath + relativeUrl;
                if(!hasTrailingQM(url)) {
                    url = url + '?';
                }
                return url;
            }
            (function (Establishments) {
                function show(establishmentId) {
                    return makeUrl('establishments/' + establishmentId);
                }
                Establishments.show = show;
                function created(params) {
                    var url = makeUrl('establishments/created');
                    if(params) {
                        url += '?' + $.param(params);
                    }
                    return url;
                }
                Establishments.created = created;
            })(Mvc.Establishments || (Mvc.Establishments = {}));
            var Establishments = Mvc.Establishments;
            (function (Shared) {
                function show(SharedId) {
                    return makeUrl('Shared/' + SharedId);
                }
                Shared.show = show;
                function created(params) {
                    var url = makeUrl('Shared/created');
                    if(params) {
                        url += '?' + $.param(params);
                    }
                    return url;
                }
                Shared.created = created;
            })(Mvc.Shared || (Mvc.Shared = {}));
            var Shared = Mvc.Shared;
            (function (Identity) {
                (function (Users) {
                    function created(params) {
                        var url = makeUrl('users/created');
                        if(params) {
                            url += '?' + $.param(params);
                        }
                        return url;
                    }
                    Users.created = created;
                })(Identity.Users || (Identity.Users = {}));
                var Users = Identity.Users;
            })(Mvc.Identity || (Mvc.Identity = {}));
            var Identity = Mvc.Identity;
            (function (My) {
                (function (Profile) {
                    function get(tab) {
                        var url = makeUrl('my/profile');
                        return url;
                    }
                    Profile.get = get;
                    function post(startEditing, startTabName) {
                        var url = makeUrlWithParams('my/profile') + "startEditing=" + startEditing + "&startTabName=" + startTabName;
                        return url;
                    }
                    Profile.post = post;
                    function activityEdit(activityId) {
                        var url = makeUrl('my/activity/');
                        return url + activityId;
                    }
                    Profile.activityEdit = activityEdit;
                    function geographicExpertiseEdit(expertiseId) {
                        var url = makeUrl('my/geographic-expertise/');
                        return url + expertiseId;
                    }
                    Profile.geographicExpertiseEdit = geographicExpertiseEdit;
                    function languageExpertiseEdit(expertiseId) {
                        var url = makeUrl('my/language-expertise/');
                        return url + expertiseId;
                    }
                    Profile.languageExpertiseEdit = languageExpertiseEdit;
                    function internationalAffiliationEdit(affiliationId) {
                        var url = makeUrl('my/international-affiliation/');
                        return url + affiliationId;
                    }
                    Profile.internationalAffiliationEdit = internationalAffiliationEdit;
                    function degreeEdit(degreeId) {
                        var url = makeUrl('my/degree/');
                        return url + degreeId;
                    }
                    Profile.degreeEdit = degreeEdit;
                    function affiliationEdit(affiliationId) {
                        var url = makeUrl('my/affiliation/');
                        return url + affiliationId;
                    }
                    Profile.affiliationEdit = affiliationEdit;
                })(My.Profile || (My.Profile = {}));
                var Profile = My.Profile;
            })(Mvc.My || (Mvc.My = {}));
            var My = Mvc.My;
        })(Routes.Mvc || (Routes.Mvc = {}));
        var Mvc = Routes.Mvc;
        (function (Content) {
            function makeUrl(relativeUrl) {
                var url = Routes.applicationPath + relativeUrl;
                if(!hasTrailingSlash(url)) {
                    url = url + '/';
                }
                return url;
            }
            function styles(relativePath) {
                var url = 'styles';
                url = makeUrl(url);
                url += relativePath;
                return url;
            }
            Content.styles = styles;
        })(Routes.Content || (Routes.Content = {}));
        var Content = Routes.Content;
    })(App.Routes || (App.Routes = {}));
    var Routes = App.Routes;
})(App || (App = {}));
