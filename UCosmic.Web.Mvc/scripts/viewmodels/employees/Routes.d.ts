declare module Employees.ApiRoutes {

    export interface Employees {
        Activities: Activities;
        Settings: Settings;
        places(domain: string): string;
    }

    export interface Activities {
        counts(domain: string): string;
    }

    export interface Settings {
        icon(domain: string, iconName: string): string;
    }
}

declare module Employees.MvcRoutes {

    export interface Employees {
        Activities: Activities;
    }

    export interface Activities {
        edit(activityId: number): string;
    }
}