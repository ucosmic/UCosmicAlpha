declare module People.ApiRoutes {

    export interface People {
        Affiliations: Affiliations;
        ExternalUrls: ExternalUrls;
    }

    export interface Affiliations {
        single(establishmentId: number, personId?: number): string;
        plural(personId?: number): string;
    }

    export interface ExternalUrls {
        single(personId: number, urlId: number): string;
        plural(personId: number): string;
    }
}
