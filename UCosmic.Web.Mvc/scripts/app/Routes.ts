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

        export class Identity {

            static signIn(): string {
                return makeUrl('sign-in');
            }

            static signOut(): string {
                return makeUrl('sign-out');
            }
        }

        export class Countries {

            static get(): string {
                return makeUrl('countries');
            }
        }

        export class Languages {

            static get(): string {
                return makeUrl('languages');
            }
        }

        export class Establishments {

            static get(): string {
                return makeUrl('establishments');
            }
        }
        export class EstablishmentNames {

            static get(establishmentId: number, establishmentNameId?: number): string {
                var url = 'establishments/' + establishmentId + '/names';
                if (establishmentNameId)
                    url += '/' + establishmentNameId;
                return makeUrl(url);
            }

            static post(establishmentId: number): string {
                return EstablishmentNames.get(establishmentId);
            }

            static put(establishmentId: number, establishmentNameId: number): string {
                return makeUrl('establishments/' + establishmentId + '/names/'
                    + establishmentNameId);
            }

            static del(establishmentId: number, establishmentNameId: number): string {
                return EstablishmentNames.put(establishmentId, establishmentNameId);
            }

            static validateText(establishmentId: number, establishmentNameId: number): string {
                return makeUrl('establishments/' + establishmentId + '/names/'
                    + establishmentNameId + '/validate-text');
            }
        }
        export class EstablishmentUrls {

            static get(establishmentId: number, establishmentUrlId?: number): string {
            var url = 'establishments/' + establishmentId + '/urls';
            if (establishmentUrlId)
                url += '/' + establishmentUrlId;
            return makeUrl(url);
            }

            static post(establishmentId: number): string {
                return EstablishmentUrls.get(establishmentId);
            }

            static put(establishmentId: number, establishmentUrlId: number): string {
                return makeUrl('establishments/' + establishmentId + '/urls/'
                    + establishmentUrlId);
            }

            static del(establishmentId: number, establishmentUrlId: number): string {
                return EstablishmentUrls.put(establishmentId, establishmentUrlId);
            }

            static validateValue(establishmentId: number, establishmentUrlId: number): string {
                return makeUrl('establishments/' + establishmentId + '/urls/'
                    + establishmentUrlId + '/validate-value');
            }
        }
    }
}


