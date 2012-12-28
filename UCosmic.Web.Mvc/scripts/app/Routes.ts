module App.Routes {

    export var applicationPath: string = '/';

    function hasTrailingSlash(value: string): bool {
        return value.lastIndexOf('/') == value.length - 1;
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

        export module Identity {

            export function signIn(): string {
                return makeUrl('sign-in');
            }

            export function signOut(): string {
                return makeUrl('sign-out');
            }
        }

        export module Languages {

            export function get(): string {
                return makeUrl('languages');
            }
        }

        export module Countries {

            export function get(): string {
                return makeUrl('countries');
            }
        }

        export module Establishments {

            export function get(establishmentId?: number): string {
                var url = 'establishments';
                if (establishmentId)
                    url += '/' + establishmentId;
                return makeUrl(url);
            }

            export class Names {

                static get(establishmentId: number, establishmentNameId?: number): string {
                    var url = 'establishments/' + establishmentId + '/names';
                    if (establishmentNameId)
                        url += '/' + establishmentNameId;
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

                static get(establishmentId: number, establishmentUrlId?: number): string {
                var url = 'establishments/' + establishmentId + '/urls';
                if (establishmentUrlId)
                    url += '/' + establishmentUrlId;
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

                static get(establishmentId: number): string {
                    var url = 'establishments/' + establishmentId + '/location';
                    return makeUrl(url);
                }
            }

        }
    }
}


