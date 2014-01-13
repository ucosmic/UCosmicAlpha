declare module Places.ApiRoutes {

    export interface Places {
        Names: Names;
    }

    export interface Names {
        autocomplete(): string;
    }
}
