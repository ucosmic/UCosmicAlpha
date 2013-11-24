declare module People.ApiRoutes {

    export interface People {
        Affiliations: Affiliations;
    }

    export interface Affiliations {
        single(establishmentId: number, personId?: number): string;
        plural(personId?: number): string;
    }
}
