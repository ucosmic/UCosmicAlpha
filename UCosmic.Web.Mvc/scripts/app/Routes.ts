/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="App.ts" />

// DO NOT CREATE ANY NEW ROUTES HERE, THIS FILE IS FROZEN.
// WE NOW GENERATE ROUTES FROM SERVER_SIDE MVC ACTIONS
// USING @Url.HttpRouteUrl. SEE OTHER ROUTE FILES FOR MORE.

module App.Routes {

    export var applicationPath: string = '/';

    function hasTrailingSlash(value: string): boolean {
        return value.lastIndexOf('/') == value.length - 1;
    }

    function hasTrailingQM(value: string): boolean {
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

            export function getChildren(establishmentId: number): string {
                return makeUrl('establishments/{0}/children'.format(establishmentId));
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
                    var url = 'establishments/{0}/location'.format(establishmentId);
                    return makeUrl(url);
                }

                static put(establishmentId: number): string {
                    return Locations.get(establishmentId);
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

            export function post() {
                return makeUrl('agreements');
            }

            export function put(agreementId: number): string {
                var url = 'agreements/{0}'.format(agreementId.toString());
                return makeUrl(url);
            }

            export function del(agreementId: number): string {
                return put(agreementId);
            }

            export module Search {
                export function get(domain: string): string {
                    return makeUrl('{0}/agreements'.format(domain));
                }
            }

            export module Participants {
                export function get (agreementId: number, establishmentId?: number): string {
                    var url = 'agreements/{0}/participants'.format(agreementId);
                    if (establishmentId) url += '/' + establishmentId;
                    return makeUrl(url);
                }
                export function put (agreementId: number, establishmentId: number): string {
                    var url = 'agreements/{0}/participants/{1}'.format(agreementId, establishmentId);
                    return makeUrl(url);
                }
                export function del (agreementId: number, establishmentId: number): string {
                    return put(agreementId, establishmentId);
                }
                export function isOwner(establishmentId: number): string {
                    var url = get(0, establishmentId);
                    return url + 'is-owner/';
                }
            }

            export module Contacts {
                export function get (agreementId: number, contactId?: number): string {
                    var url = 'agreements/{0}/contacts'.format(agreementId);
                    if (contactId) url += '/' + contactId;
                    return makeUrl(url);
                }
                export function post (agreementId: number): string {
                    return get(agreementId);
                }
                export function put(agreementId: number, contactId: number) {
                    var url = 'agreements/{0}/contacts/{1}'.format(agreementId, contactId);
                    return makeUrl(url);
                }
                export function del(agreementId: number, contactId: number) {
                    return put(agreementId, contactId);
                }

                export module Phones {
                    export function post(agreementId: number, contactId: number): string {
                        var url = 'agreements/{0}/contacts/{1}/phones'.format(agreementId, contactId);
                        return makeUrl(url);
                    }
                    export function put(agreementId: number, contactId: number, phoneId: number): string {
                        var url = 'agreements/{0}/contacts/{1}/phones/{2}'.format(agreementId, contactId, phoneId);
                        return makeUrl(url);
                    }
                    export function del(agreementId: number, contactId: number, phoneId: number): string {
                        return put(agreementId, contactId, phoneId);
                    }
                }
            }

            export module Files {
                export function get (agreementId: number, fileId?: number): string {
                    var url = 'agreements/{0}/files'.format(agreementId);
                    if (fileId) url += '/' + fileId
                    return makeUrl(url);
                }
                export function post(agreementId: number) {
                    return get(agreementId);
                }
                export function put(agreementId: number, fileId: number) {
                    var url = 'agreements/{0}/files/{1}'.format(agreementId, fileId);
                    return makeUrl(url);
                }
                export function del(agreementId: number, fileId: number) {
                    return put(agreementId, fileId);
                }

                export module Validate {
                    export function post() {
                        return makeUrl('agreements/files/validate');
                    }
                }

                export module Content {
                    export function view(agreementId: number, fileId: number): string {
                        var url = Files.get(agreementId, fileId);
                        url += '/content';
                        return makeUrl(url);
                    }
                    export function download(agreementId: number, fileId: number): string {
                        var url = Files.get(agreementId, fileId);
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

            export module Photo {
                export function get (params?: any): string {
                    var url = post();
                    if (params) url += '?' + $.param(params);
                    return url;
                }
                export function post() {
                    return makeUrl('my/photo');
                }
                export function validate() {
                    return makeUrl('my/photo/validate');
                }
                export function del() {
                    return post();
                }
            }

            export module Degrees {
                export function get (degreeId?: number): string {
                    var url = 'my/degrees';
                    if (degreeId) url += '/' + degreeId;
                    return makeUrl(url);
                }
                export function post(): string {
                    return get();
                }
                export function put(degreeId: number): string {
                    return get(degreeId);
                }
                export function del(degreeId: number): string {
                    return get(degreeId);
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

        export module FacultyStaff {
            export function getActivityCount(): string {
                return makeUrl('faculty-staff/activity-count');
            }
            export function getPeopleCount(): string {
                return makeUrl('faculty-staff/people-count');
            }
            export function getActivityTrend(): string {
                return makeUrl('faculty-staff/activity-trend');
            }
            export function getPeopleTrend(): string {
                return makeUrl('faculty-staff/people-trend');
            }
            export function getDegreeCount(): string {
                return makeUrl('faculty-staff/degree-count');
            }
            export function getDegreePeopleCount(): string {
                return makeUrl('faculty-staff/degree-people-count');
            }
            export function postSearch(): string {
                return makeUrl('faculty-staff/search');
            }
        }

        export module GeographicExpertise {
            export function get (expertiseId?: number): string {
                var url = 'geographic-expertise';
                if (expertiseId) url += '/' + expertiseId;
                return makeUrl(url);
            }
            export function post(): string {
                return get();
            }
            export function put(expertiseId: number): string {
                return get(expertiseId);
            }
            export function del(expertiseId: number): string {
                return get(expertiseId);
            }
        }

        export module LanguageExpertise {
            export function get (expertiseId?: number): string {
                var url = 'language-expertise';
                if (expertiseId) url += '/' + expertiseId;
                return makeUrl(url);
            }
            export function post(): string {
                return get();
            }
            export function put(expertiseId: number): string {
                return get(expertiseId);
            }
            export function del(expertiseId: number): string {
                return get(expertiseId);
            }
            export module Proficiencies {
                export function get () {
                    return makeUrl('language-expertise/proficiencies');
                }
            }
        }

        export module InternationalAffiliations {
            export function get (affiliationId?: number): string {
                var url = 'international-affiliations';
                if (affiliationId) url += '/' + affiliationId;
                return makeUrl(url);
            }
            export function post(): string {
                return get();
            }
            export function put(affiliationId: number): string {
                return get(affiliationId);
            }
            export function del(affiliationId: number): string {
                return get(affiliationId);
            }
        }

        //export module Degrees {
        //    export function get (degreeId?: number): string {
        //        var url = 'degrees';
        //        if (degreeId) url += '/' + degreeId;
        //        return makeUrl(url);
        //    }
        //    export function post(): string {
        //        return get();
        //    }
        //    export function put(degreeId: number): string {
        //        return get(degreeId);
        //    }
        //    export function del(degreeId: number): string {
        //        return get(degreeId);
        //    }
        //}

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

        export module FacultyStaff {
            export module Institution {
                export function select(institutionId: number) {
                    return makeUrl('facultystaff/institution/' + institutionId);
                }
            }
        }

        export module My {
            export module Profile {
                export function get (tab?: string) {
                    var url = makeUrl('person');
                    // Workaround until we figure out how to go from ?tab to #/
                    //if (tab != null) {
                    //    url = makeUrlWithParams( 'person' ) + "tab=" + tab;
                    //}
                    return url;
                }
                export function post(startEditing: boolean, startTabName: string) {
                    var url = makeUrlWithParams('person') + "startEditing=" + startEditing + "&startTabName=" + startTabName;
                    return url;
                }
            }

            export module InternationalAffiliations {
                function formatUrl(resource: any): string {
                    return 'my/international-affiliations/{0}'.format(resource);
                }
                export function create() {
                    return makeUrl(formatUrl('new'));
                }
                export function edit(affiliationId: number) {
                    return makeUrl(formatUrl(affiliationId));
                }
            }

            export module Degrees {
                function formatUrl(resource: any): string {
                    return 'my/degrees/{0}'.format(resource);
                }
                export function create() {
                    return makeUrl(formatUrl('new'));
                }
                export function edit(degreeId: number) {
                    return makeUrl(formatUrl(degreeId));
                }
            }

            export module GeographicExpertise {
                function formatUrl(resource: any): string {
                    return 'my/geographic-expertise/{0}'.format(resource);
                }
                export function create() {
                    return makeUrl(formatUrl('new'));
                }
                export function edit(expertiseId: number) {
                    return makeUrl(formatUrl(expertiseId));
                }
            }

            export module LanguageExpertise {
                function formatUrl(resource: any): string {
                    return 'my/language-expertise/{0}'.format(resource);
                }
                export function create() {
                    return makeUrl(formatUrl('new'));
                }
                export function edit(expertiseId: number) {
                    return makeUrl(formatUrl(expertiseId));
                }
            }
        }
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
