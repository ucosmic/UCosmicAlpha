declare module Employees.ApiRoutes {

    export interface Employees {
        Activities: Activities;
        Settings: Settings;
        places(tenantId: any): string;
    }

    export interface Activities {
        counts(tenantId: any): string;
    }

    export interface Settings {
        byPerson(personId?: number): string;
        icon(domain: string, iconName: string): string;
        ActivityTypes: SettingsActivityTypes;
    }

    export interface SettingsActivityTypes {
        icon(typeId: number): string;
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