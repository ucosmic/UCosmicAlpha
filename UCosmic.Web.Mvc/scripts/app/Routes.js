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
                function getChildren(establishmentId) {
                    return makeUrl('establishments/{0}/children'.format(establishmentId));
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
                    var url = 'agreements/{0}'.format(agreementId.toString());
                    return makeUrl(url);
                }
                Agreements.put = put;
                function post() {
                    return makeUrl('agreements');
                }
                Agreements.post = post;
                (function (Participants) {
                    function get(agreementId, establishmentId) {
                        var url = 'agreements/{0}/participants'.format(agreementId);
                        if(establishmentId) {
                            url += '/' + establishmentId;
                        }
                        return makeUrl(url);
                    }
                    Participants.get = get;
                })(Agreements.Participants || (Agreements.Participants = {}));
                var Participants = Agreements.Participants;
                (function (Contacts) {
                    function get(agreementId, contactId) {
                        var url = 'agreements/{0}/contacts'.format(agreementId);
                        if(contactId) {
                            url += '/' + contactId;
                        }
                        return makeUrl(url);
                    }
                    Contacts.get = get;
                    function post(agreementId) {
                        return get(agreementId);
                    }
                    Contacts.post = post;
                    function put(agreementId, contactId) {
                        var url = 'agreements/{0}/contacts/{1}'.format(agreementId, contactId);
                        return makeUrl(url);
                    }
                    Contacts.put = put;
                    function del(agreementId, contactId) {
                        return put(agreementId, contactId);
                    }
                    Contacts.del = del;
                })(Agreements.Contacts || (Agreements.Contacts = {}));
                var Contacts = Agreements.Contacts;
                (function (Files) {
                    function get(agreementId, fileId) {
                        var url = 'agreements/{0}/files'.format(agreementId);
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
                        var url = 'agreements/{0}/files/{1}'.format(agreementId, fileId);
                        return makeUrl(url);
                    }
                    Files.put = put;
                    function del(agreementId, fileId) {
                        return put(agreementId, fileId);
                    }
                    Files.del = del;
                    (function (Validate) {
                        function post() {
                            return makeUrl('agreements/files/validate');
                        }
                        Validate.post = post;
                    })(Files.Validate || (Files.Validate = {}));
                    var Validate = Files.Validate;
                    (function (Content) {
                        function view(agreementId, fileId) {
                            var url = Files.get(agreementId, fileId);
                            url += '/content';
                            return makeUrl(url);
                        }
                        Content.view = view;
                        function download(agreementId, fileId) {
                            var url = Files.get(agreementId, fileId);
                            url += '/download';
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
                (function (UmbrellaOptions) {
                    function get(agreementId) {
                        var url = 'agreements/0/umbrellas';
                        if(agreementId) {
                            url = url.replace('0', agreementId.toString());
                        }
                        return makeUrl(url);
                    }
                    UmbrellaOptions.get = get;
                })(Agreements.UmbrellaOptions || (Agreements.UmbrellaOptions = {}));
                var UmbrellaOptions = Agreements.UmbrellaOptions;
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
                })(My.Profile || (My.Profile = {}));
                var Profile = My.Profile;
                (function (Affiliations) {
                    function get(affiliationId) {
                        var url = 'my/affiliations';
                        if(affiliationId) {
                            url += '/' + affiliationId;
                        }
                        return makeUrl(url);
                    }
                    Affiliations.get = get;
                    function getDefault() {
                        return makeUrl('my/affiliations/default');
                    }
                    Affiliations.getDefault = getDefault;
                    function post() {
                        return get();
                    }
                    Affiliations.post = post;
                    function put(affiliationId) {
                        return get(affiliationId);
                    }
                    Affiliations.put = put;
                    function del(affiliationId) {
                        return get(affiliationId);
                    }
                    Affiliations.del = del;
                })(My.Affiliations || (My.Affiliations = {}));
                var Affiliations = My.Affiliations;
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
                        return makeUrl('my/photo');
                    }
                    Photo.post = post;
                    function validate() {
                        return makeUrl('my/photo/validate');
                    }
                    Photo.validate = validate;
                    function del() {
                        return post();
                    }
                    Photo.del = del;
                })(My.Photo || (My.Photo = {}));
                var Photo = My.Photo;
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
            (function (FacultyStaff) {
                function getSummary() {
                    return makeUrl('faculty-staff/summary');
                }
                FacultyStaff.getSummary = getSummary;
            })(WebApi.FacultyStaff || (WebApi.FacultyStaff = {}));
            var FacultyStaff = WebApi.FacultyStaff;
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
                    function validateUpload() {
                        return makeUrl('activities/documents/validate-upload');
                    }
                    Documents.validateUpload = validateUpload;
                    (function (Thumbnail) {
                        function get(activityId, documentId, params) {
                            var url = makeUrl('activities/' + activityId + '/documents/' + documentId + '/thumbnail');
                            if(params) {
                                url += '?' + $.param(params);
                            }
                            return url;
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
                    function post() {
                        return makeUrl('activity-country-counts');
                    }
                    CountryCounts.post = post;
                })(Activities.CountryCounts || (Activities.CountryCounts = {}));
                var CountryCounts = Activities.CountryCounts;
            })(WebApi.Activities || (WebApi.Activities = {}));
            var Activities = WebApi.Activities;
            (function (GeographicExpertise) {
                function get(expertiseId) {
                    var url = 'geographic-expertise';
                    if(expertiseId) {
                        url += '/' + expertiseId;
                    }
                    return makeUrl(url);
                }
                GeographicExpertise.get = get;
                function post() {
                    return get();
                }
                GeographicExpertise.post = post;
                function put(expertiseId) {
                    return get(expertiseId);
                }
                GeographicExpertise.put = put;
                function del(expertiseId) {
                    return get(expertiseId);
                }
                GeographicExpertise.del = del;
            })(WebApi.GeographicExpertise || (WebApi.GeographicExpertise = {}));
            var GeographicExpertise = WebApi.GeographicExpertise;
            (function (LanguageExpertise) {
                function get(expertiseId) {
                    var url = 'language-expertise';
                    if(expertiseId) {
                        url += '/' + expertiseId;
                    }
                    return makeUrl(url);
                }
                LanguageExpertise.get = get;
                function getProficiencies() {
                    return makeUrl('language-expertise/proficiencies');
                }
                LanguageExpertise.getProficiencies = getProficiencies;
                function post() {
                    return get();
                }
                LanguageExpertise.post = post;
                function put(expertiseId) {
                    return get(expertiseId);
                }
                LanguageExpertise.put = put;
                function del(expertiseId) {
                    return get(expertiseId);
                }
                LanguageExpertise.del = del;
            })(WebApi.LanguageExpertise || (WebApi.LanguageExpertise = {}));
            var LanguageExpertise = WebApi.LanguageExpertise;
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
                    var url = 'degrees';
                    if(degreeId) {
                        url += '/' + degreeId;
                    }
                    return makeUrl(url);
                }
                Degrees.get = get;
                function post() {
                    return get();
                }
                Degrees.post = post;
                function put(degreeId) {
                    return get(degreeId);
                }
                Degrees.put = put;
                function del(degreeId) {
                    return get(degreeId);
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
                function del(fileGuid) {
                    var url = 'uploads/{0}'.format(fileGuid);
                    return makeUrl(url);
                }
                Uploads.del = del;
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
                        return makeUrl('my/activities/{0}'.format(activityId));
                    }
                    Profile.activityEdit = activityEdit;
                    function internationalAffiliationEdit(affiliationId) {
                        return makeUrl('my/international-affiliations/{0}'.format(affiliationId));
                    }
                    Profile.internationalAffiliationEdit = internationalAffiliationEdit;
                })(My.Profile || (My.Profile = {}));
                var Profile = My.Profile;
                (function (Degrees) {
                    function formatUrl(resource) {
                        return 'my/degrees/{0}'.format(resource);
                    }
                    function create() {
                        return makeUrl(formatUrl('new'));
                    }
                    Degrees.create = create;
                    function edit(degreeId) {
                        return makeUrl(formatUrl(degreeId));
                    }
                    Degrees.edit = edit;
                })(My.Degrees || (My.Degrees = {}));
                var Degrees = My.Degrees;
                (function (GeographicExpertise) {
                    function formatUrl(resource) {
                        return 'my/geographic-expertise/{0}'.format(resource);
                    }
                    function create() {
                        return makeUrl(formatUrl('new'));
                    }
                    GeographicExpertise.create = create;
                    function edit(expertiseId) {
                        return makeUrl(formatUrl(expertiseId));
                    }
                    GeographicExpertise.edit = edit;
                })(My.GeographicExpertise || (My.GeographicExpertise = {}));
                var GeographicExpertise = My.GeographicExpertise;
                (function (LanguageExpertise) {
                    function formatUrl(resource) {
                        return 'my/language-expertise/{0}'.format(resource);
                    }
                    function create() {
                        return makeUrl(formatUrl('new'));
                    }
                    LanguageExpertise.create = create;
                    function edit(expertiseId) {
                        return makeUrl(formatUrl(expertiseId));
                    }
                    LanguageExpertise.edit = edit;
                })(My.LanguageExpertise || (My.LanguageExpertise = {}));
                var LanguageExpertise = My.LanguageExpertise;
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
