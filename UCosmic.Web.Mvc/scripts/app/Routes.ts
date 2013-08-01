/// <reference path="../jquery/jquery-1.8.d.ts" />
interface String {
    format(...args: any[]): string;
}

module App.Routes {

    if (!String.prototype.format) {
        String.prototype.format = function () {
            var formatted = this;
            for (var i = 0; i < arguments.length; i++) {
                var regexp = new RegExp('\\{' + i + '\\}', 'gi');
                formatted = formatted.replace(regexp, arguments[i]);
            }
            return formatted;
        };
    }
    export var applicationPath: string = '/';

    function hasTrailingSlash(value: string): bool {
        return value.lastIndexOf('/') == value.length - 1;
    }

    function hasTrailingQM(value: string): bool {
        return value.lastIndexOf('?') == value.length - 1;
    }

    export module WebApi {

        export var urlPrefix: string = 'api';

        function makeUrl(relativeUrl: string): string {
            var apiPrefix: string = WebApi.urlPrefix;
            if (!hasTrailingSlash(apiPrefix)) apiPrefix = apiPrefix + '/';
            var url = Routes.applicationPath + apiPrefix + relativeUrl;
            if (!hasTrailingSlash(url)) url = url + '/';
            return url;
        }

        function makeUrlWithParams(relativeUrl: string): string {
            var apiPrefix: string = WebApi.urlPrefix;
            if (!hasTrailingSlash(apiPrefix)) apiPrefix = apiPrefix + '/';
            var url = Routes.applicationPath + apiPrefix + relativeUrl;
            if (!hasTrailingSlash(url)) url = url + '?';
            return url;
        }

        export module Identity {

            export function signIn(): string {
                return makeUrl('sign-in');
            }

            export function signOut(): string {
                return makeUrl('sign-out');
            }

            export module Users {
                export function get (id?: number) {
                    var url = 'users';
                    if (id) url += '/' + id;
                    return makeUrl(url);
                }

                export function post() {
                    return makeUrl('users');
                }

                export function validateName(id?: number) {
                    id = id ? id : 0;
                    var url = 'users/' + id + '/validate-name';
                    return makeUrl(url);
                }

                export function del(id: number) {
                    var url = 'users/' + id;
                    return makeUrl(url);
                }

                export module Roles {
                    export function get (userId: number): string {
                        var url = 'users/' + userId + '/roles';
                        return makeUrl(url);
                    }

                    export function put(userId: number, roleId: number): string {
                        var url = 'users/' + userId + '/roles/' + roleId;
                        return makeUrl(url);
                    }

                    export function del(userId: number, roleId: number): string {
                        return put(userId, roleId);
                    }

                    export function validateGrant(userId: number, roleId: number) {
                        var url = 'users/' + userId + '/roles/' + roleId + '/validate-grant';
                        return makeUrl(url);
                    }

                    export function validateRevoke(userId: number, roleId: number) {
                        var url = 'users/' + userId + '/roles/' + roleId + '/validate-revoke';
                        return makeUrl(url);
                    }
                }
            }

            export module Roles {
                export function get (roleId?: number): string {
                    var url = 'roles';
                    if (roleId) url += '/' + roleId;
                    return makeUrl(url);
                }
            }
        }

        export module Languages {

            export function get (): string {
                return makeUrl('languages');
            }
        }

        export module LanguageProficiency {

            export function get (): string {
                return makeUrl('language-proficiency');
            }
        }

        export module Countries {

            export function get (): string {
                return makeUrl('countries');
            }
        }

        export module Places {

            export function get (placeId?: number): string {
                var url = 'places';
                if (placeId) url += '/' + placeId;
                return makeUrl(url);
            }

            export module ByCoordinates {
                export function get (latitude: number, longitude: number): string {
                    var url = 'places/by-coordinates/' + latitude + '/' + longitude;
                    return makeUrl(url);
                }
            }
        }

        export module Establishments {

            export function get (establishmentId?: number): string {
                var url = 'establishments';
                if (establishmentId) url += '/' + establishmentId;
                return makeUrl(url);
            }

            export function getUniversities(): string {
                var url = 'establishments/universities';
                return makeUrl(url);
            }

            export function getChildren(establishmentId: number, sort: bool): string {
                var url = 'establishments/' + establishmentId + '/children';
                return makeUrlWithParams(url) + "sort=" + sort;
            }

            export function post(): string {
                return makeUrl('establishments');
            }

            export function put(establishmentId: number): string {
                return get(establishmentId);
            }

            export function validateCeebCode(establishmentId: number): string {
                return makeUrl('establishments/' + establishmentId + '/validate-ceeb-code');
            }

            export function validateUCosmicCode(establishmentId: number): string {
                return makeUrl('establishments/' + establishmentId + '/validate-ucosmic-code');
            }

            export function validateParentId(establishmentId: number): string {
                return makeUrl('establishments/' + establishmentId + '/validate-parent-id');
            }

            export class Names {

                static get (establishmentId: number, establishmentNameId?: number): string {
                    var url = 'establishments/' + establishmentId + '/names';
                    if (establishmentNameId) url += '/' + establishmentNameId;
                    return makeUrl(url);
                }

                static post(establishmentId: number): string {
                    return Names.get(establishmentId);
                }

                static put(establishmentId: number, establishmentNameId: number): string {
                    return makeUrl('establishments/' + establishmentId + '/names/'
                        + establishmentNameId);
                }

                static del(establishmentId: number, establishmentNameId: number): string {
                    return Names.put(establishmentId, establishmentNameId);
                }

                static validateText(establishmentId: number, establishmentNameId: number): string {
                    return makeUrl('establishments/' + establishmentId + '/names/'
                        + establishmentNameId + '/validate-text');
                }
            }

            export class Urls {

                static get (establishmentId: number, establishmentUrlId?: number): string {
                    var url = 'establishments/' + establishmentId + '/urls';
                    if (establishmentUrlId) url += '/' + establishmentUrlId;
                    return makeUrl(url);
                }

                static post(establishmentId: number): string {
                    return Urls.get(establishmentId);
                }

                static put(establishmentId: number, establishmentUrlId: number): string {
                    return makeUrl('establishments/' + establishmentId + '/urls/'
                        + establishmentUrlId);
                }

                static del(establishmentId: number, establishmentUrlId: number): string {
                    return Urls.put(establishmentId, establishmentUrlId);
                }

                static validateValue(establishmentId: number, establishmentUrlId: number): string {
                    return makeUrl('establishments/' + establishmentId + '/urls/'
                        + establishmentUrlId + '/validate-value');
                }
            }

            export class Locations {

                static get (establishmentId: number): string {
                    var url = 'establishments/' + establishmentId + '/location';
                    return makeUrl(url);
                }

                static put(establishmentId: number): string {
                    return get(establishmentId);
                }
            }

            export class Categories {

                static get (id?: number): string {
                    var url = 'establishment-categories';
                    if (id) url += '/' + id;
                    return makeUrl(url);
                }
            }
        }

        export module Agreements {

            export function get (agreementId: number): string {
                return makeUrl('agreements/' + agreementId);
            }

            export function put(agreementId: number): string {
                var url = 'agreements/{0}'.format(agreementId.toString());

                return makeUrl(url);
            }

            export function post() {
                return makeUrl('agreements');
            }

            export module Participants {

                export function get (agreementId?: number): string {
                    var url = 'agreements/0/participants';
                    if (agreementId) url = url.replace('0', agreementId.toString())
                    return makeUrl(url);
                }
            }

            export module Participant {
                export function get (establishmentId: number, agreementId?: number): string {
                    var url = 'agreements/0/participant/';
                    if (agreementId) url = url.replace('0', agreementId.toString())
                    url += establishmentId;
                    return makeUrl(url);
                }
            }

            export module Contacts {
                export function get (agreementId: number): string {
                    var url = 'agreements/0/contacts';
                    if (agreementId) url = url.replace('0', agreementId.toString())
                    return makeUrl(url);
                }
                export function post (agreementId: number): string {
                    var url = 'agreements/0/contacts';
                    if (agreementId) url = url.replace('0', agreementId.toString())
                    return makeUrl(url);
                }
                export function put(agreementId: number, id: number) {
                    var url = 'agreements/{0}/contacts/{1}'.format(agreementId.toString(), id.toString());

                    return makeUrl(url);
                }
            }

            export module Files {
                export function get (agreementId: number): string {
                    var url = 'agreements/0/files';
                    if (agreementId) url = url.replace('0', agreementId.toString())
                    return makeUrl(url);
                }
                export function del(agreementId: number, id: number) {
                    var url = 'agreements/{0}/files/{1}'.format(agreementId.toString(), id.toString());
                    
                    return makeUrl(url);
                }
                export function post(agreementId: number) {
                    var url = 'agreements/{0}/files'.format(agreementId.toString());
                    return makeUrl(url);
                }
                export function put(agreementId: number, id: number) {
                    var url = 'agreements/{0}/files/{1}'.format(agreementId.toString(), id.toString());

                    return makeUrl(url);
                }

                export module Validate {
                    export function post() {
                        return makeUrl('agreements/files/validate');
                    }
                }

                export module Content {
                    export function view(agreementId: number, fileId: number): string {
                        var url = 'agreements/{0}/files/{1}'.format(agreementId.toString(), fileId.toString());
                        //var url = Files.get(agreementId, fileId);
                        url += '/content';
                        return makeUrl(url);
                    }
                    export function download(agreementId: number, fileId: number): string {
                        var url = 'agreements/{0}/files/{1}'.format(agreementId.toString(), fileId.toString());
                        //var url = Files.get(agreementId, fileId);
                        url += '/download';
                        return makeUrl(url);
                    }
                }
            }

            export module Settings {
                export function get (): string {
                    return makeUrl('agreements/settings');
                }
            }

            export module UmbrellaOptions {
                export function get (agreementId?: number): string {
                    var url = 'agreements/0/umbrellas';
                    if (agreementId) url = url.replace('0', agreementId.toString());
                    return makeUrl(url);
                }
            }
        }

        export module My {
            export module Profile {
                export function get (): string {
                    return makeUrl('my/profile');
                }
                export function put(): string {
                    return get();
                }
                export module Affiliation {
                    export function base(): string {
                        return makeUrl('my/profile/affiliation');
                    }
                    export function get (): string {
                        return base();
                    }
                    export function post(): string {
                        return base();
                    }
                    export function put(): string {
                        return base();
                    }
                    export function del(): string {
                        return base();
                    }
                }
                export module Photo {
                    export function get (params?: any): string {
                        var url = post();
                        if (params) url += '?' + $.param(params);
                        return url;
                    }
                    export function post() {
                        return makeUrl('my/profile/photo');
                    }
                    export function validate() {
                        return makeUrl('my/profile/photo/validate');
                    }
                    export function del() {
                        return post();
                    }
                    export function kendoRemove() {
                        return makeUrl('my/profile/photo/kendo-remove');
                    }
                }
            }
        }

        export module People {

            export function get(personId?: number): string {
                var url = 'people';
                if (personId) url += '/' + personId;
                return makeUrl(url);
            }

            export function del(personId: number): string {
                var url = 'people/' + personId;
                url = makeUrl(url);
                return url;
            }

            export module Photo {
                export function get (personId: number, params?: any): string {
                    var url = 'people/' + personId + '/photo';
                    url = makeUrl(url);
                    if (params) url += '?' + $.param(params);
                    return url;
                }
            }

            export module Names {
                export class Salutations {
                    static get (): string {
                        return makeUrl('person-names/salutations');
                    }
                }
                export class Suffixes {
                    static get (): string {
                        return makeUrl('person-names/suffixes');
                    }
                }
                export class DeriveDisplayName {
                    static get (): string {
                        return makeUrl('person-names/derive-display-name');
                    }
                }
            }
        }

        export module Employees {
            export module ModuleSettings {
                export class FacultyRanks {
                    static get (): string {
                        return makeUrl('my/employee-module-settings/faculty-ranks');
                    }
                }
                export class ActivityTypes {
                    static get (): string {
                        return makeUrl('my/employee-module-settings/activity-types');
                    }
                }
            }
        }

        export module Activities {
            export function get (activityId?: number): string {
                var url = makeUrl('activities');
                if (activityId) {
                    url += '/' + activityId;
                }
                return url;
            }

            export function post(): string {
                return makeUrl('activities');
            }

            export function getEdit(activityId: number): string {
                return makeUrl('activities/' + activityId + "/edit");
            }

            export function getEditState(activityId: number): string {
                return makeUrl('activities/' + activityId + "/edit-state");
            }

            export function put(activityId: number): string {
                return makeUrl('activities/' + activityId);
            }

            export function putEdit(activityId: number): string {
                return makeUrl('activities/' + activityId + "/edit");
            }

            export function del(activityId: number): string {
                return makeUrl('activities/' + activityId);
            }

            export module Documents {
                export function get (activityId: number, documentId?: number, activityMode?: string): string {
                    var url = makeUrl('activities/' + activityId + '/documents');
                    if (documentId) {
                        url += '/' + documentId;
                    }
                    else if (activityId) {
                        url += '/?activityMode=' + activityMode;
                    }
                    return url;
                }

                export function post(activityId: number, activityMode: string): string {
                    var url = makeUrl('activities/' + activityId + '/documents/');
                    url += '?activityMode=' + activityMode;
                    return url;
                }

                export function put(activityId: number, documentId: number): string {
                    return makeUrl('activities/' + activityId + '/documents/' + documentId);
                }

                export function del(activityId: number, documentId: number): string {
                    return makeUrl('activities/' + activityId + '/documents/' + documentId);
                }

                export function rename(activityId: number, documentId: number): string {
                    return makeUrl('activities/' + activityId + '/documents/' + documentId + "/title");
                }

                export function validateUpload(): string {
                    return makeUrl('activities/documents/validate-upload');
                }

                export module Thumbnail {
                    export function get (activityId: number, documentId: number, params?: any): string {
                        var url = makeUrl('activities/' + activityId + '/documents/' + documentId + '/thumbnail');
                        if (params) url += '?' + $.param(params);
                        return url;
                    }
                }
            }

            export module Locations {
                export function get (): string {
                    return makeUrl('activity-locations');
                }
            }

            export module CountryCounts {
                export function get (): string {
                    return makeUrl('activity-country-counts');
                }
                export function post (): string {
                    return makeUrl('activity-country-counts');
                }
            }

        } // Activities

        export module GeographicExpertises {
            export function get (expertiseId?: number): string {
                var url = makeUrl('geographic-expertises');
                if (expertiseId) {
                    url += expertiseId;
                }
                return url;
            }

            export function post(): string {
                return makeUrl('geographic-expertises');
            }

            export function put(expertiseId: number): string {
                return makeUrl('geographic-expertises/' + expertiseId);
            }

            export function del(expertiseId: number): string {
                return makeUrl('geographic-expertises/' + expertiseId);
            }
        } // GeographicExpertises

        export module LanguageExpertises {
            export function get (expertiseId?: number): string {
                var url = makeUrl('language-expertises');
                if (expertiseId) {
                    url += expertiseId;
                }
                return url;
            }

            export function getProficiencies(): string {
                return makeUrl('language-expertises/proficiencies');
            }

            export function post(): string {
                return makeUrl('language-expertises');
            }

            export function put(expertiseId: number): string {
                return makeUrl('language-expertises/' + expertiseId);
            }

            export function del(expertiseId: number): string {
                return makeUrl('language-expertises/' + expertiseId);
            }
        } // LanguageExpertises

        export module InternationalAffiliations {
            export function get (affiliationId?: number): string {
                var url = makeUrl('international-affiliations');
                if (affiliationId) {
                    url += affiliationId;
                }
                return url;
            }

            export function post(): string {
                return makeUrl('international-affiliations');
            }

            export function put(affiliationId: number): string {
                return makeUrl('international-affiliations/' + affiliationId);
            }

            export function del(affiliationId: number): string {
                return makeUrl('international-affiliations/' + affiliationId);
            }
        } // InternationalAffiliations

        export module Degrees {
            export function get (degreeId?: number): string {
                var url = makeUrl('degrees');
                if (degreeId) {
                    url += '/' + degreeId;
                }
                return url;
            }

            export function post(): string {
                return makeUrl('degrees');
            }

            export function put(degreeId: number): string {
                return makeUrl('degrees/' + degreeId);
            }

            export function del(degreeId: number): string {
                return makeUrl('degrees/' + degreeId);
            }
        } // Degrees

        export module Affiliations {
            export function get (affiliationId?: number): string {
                var url = makeUrl('affiliations');
                if (affiliationId) {
                    url += '/' + affiliationId;
                }
                return url;
            }

            export function post(): string {
                return makeUrl('affiliations');
            }

            export function put(affiliationId: number): string {
                return makeUrl('affiliations/' + affiliationId);
            }

            export function del(affiliationId: number): string {
                return makeUrl('affiliations/' + affiliationId);
            }
        } // Affiliations

        export module Uploads {
            export function post(): string {
                return makeUrl('uploads');
            }
            export function del(fileGuid: string) {
                var url = 'uploads/{0}'.format(fileGuid);
                return makeUrl(url);
            }
        }
    }

    export module Mvc {

        function makeUrl(relativeUrl: string): string {
            var url = Routes.applicationPath + relativeUrl;
            if (!hasTrailingSlash(url)) url = url + '/';
            return url;
        }

        function makeUrlWithParams(relativeUrl: string): string {
            var url = Routes.applicationPath + relativeUrl;
            if (!hasTrailingQM(url)) url = url + '?';
            return url;
        }

        export module Establishments {
            export function show(establishmentId: number) {
                return makeUrl('establishments/' + establishmentId);
            }
            export function created(params?: any) {
                var url = makeUrl('establishments/created');
                if (params) url += '?' + $.param(params);
                return url;
            }
        }

        export module Shared {
            export function show(SharedId: number) {
                return makeUrl('Shared/' + SharedId);
            }
            export function created(params?: any) {
                var url = makeUrl('Shared/created');
                if (params) url += '?' + $.param(params);
                return url;
            }
        }

        export module Identity {
            export module Users {
                export function created(params?: any) {
                    var url = makeUrl('users/created');
                    if (params) url += '?' + $.param(params);
                    return url;
                }
            }
        }

        export module My {
            export module Profile {
                export function get (tab?: string) {
                    var url = makeUrl('my/profile');
                    // Workaround until we figure out how to go from ?tab to #/
                    //if (tab != null) {
                    //    url = makeUrlWithParams( 'my/profile' ) + "tab=" + tab;
                    //}
                    return url;
                }
                export function post(startEditing: bool, startTabName: string) {
                    var url = makeUrlWithParams('my/profile') + "startEditing=" + startEditing + "&startTabName=" + startTabName;
                    return url;
                }
                export function activityEdit(activityId: number) {
                    var url = 'my/activities/' + activityId;
                    return makeUrl(url);
                }
                export function geographicExpertiseEdit(expertiseId: string) {
                    var url = makeUrl('my/geographic-expertise/');
                    return url + expertiseId;
                }
                export function languageExpertiseEdit(expertiseId: string) {
                    var url = makeUrl('my/language-expertise/');
                    return url + expertiseId;
                }
                export function internationalAffiliationEdit(affiliationId: string) {
                    var url = makeUrl('my/international-affiliation/');
                    return url + affiliationId;
                }
                export function degreeEdit(degreeId: string) {
                    var url = makeUrl('my/degree/');
                    return url + degreeId;
                }
                export function affiliationEdit(affiliationId: string) {
                    var url = makeUrl('my/affiliation/');
                    return url + affiliationId;
                }
            }
        }

        //export module Params {
        //    export class ImageResizeQuality {
        //        static THUMBNAIL: string = 'thumbnail';
        //        static HIGH: string = 'high';
        //    }
        //}
    }

    export module Content {

        function makeUrl(relativeUrl: string): string {
            var url = Routes.applicationPath + relativeUrl;
            if (!hasTrailingSlash(url)) url = url + '/';
            return url;
        }

        export function styles(relativePath: string) {
            var url = 'styles';
            url = makeUrl(url);
            url += relativePath;
            return url;
        }
    }
}
