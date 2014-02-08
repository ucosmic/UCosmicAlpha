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
        Degrees: Degrees;
        GeographicExpertise: GeographicExpertise;
        LanguageExpertise: LanguageExpertise;
    }

    export interface Activities {
        edit(activityId: number): string;
        byPerson(personId: number): string;
        detail(activityId: number): string;
    }

    export interface Degrees {
        detail(personId: number): string;
    }

    export interface GeographicExpertise {
        detail(personId: number): string;
    }

    export interface LanguageExpertise {
        detail(personId: number): string;
    }
}