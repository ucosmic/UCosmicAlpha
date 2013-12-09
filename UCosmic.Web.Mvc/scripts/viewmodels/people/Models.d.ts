declare module People.ApiModels {

    export interface Affiliation {
        affiliationId: number;
        personId: number;
        establishmentId: number;
        isDefault: boolean;
        jobTitles: string;
        facultyRank?: Employees.ApiModels.EmployeeSettingsFacultyRank;
        establishments: AffiliatedEstablishment[];
    }

    export interface AffiliatedEstablishment {
        establishmentId: number;
        displayName: string;
        type: string;
        category: string;
    }

    export interface AffiliationPut {
        establishmentId?: number;
        facultyRankId?: number;
        jobTitles?: string;
    }
}

declare module People.KoModels {

    export interface Affiliation {
        affiliationId: KnockoutObservable<number>;
        personId: KnockoutObservable<number>;
        establishmentId: KnockoutObservable<number>;
        isDefault: KnockoutObservable<boolean>;
        jobTitles: KnockoutObservable<string>;
        facultyRank?: KnockoutObservable<Employees.KoModels.EmployeeSettingsFacultyRank>;
        establishments: KnockoutObservableArray<AffiliatedEstablishment>;
    }

    export interface AffiliatedEstablishment {
        establishmentId: KnockoutObservable<number>;
        displayName: KnockoutObservable<string>;
        type: KnockoutObservable<string>;
        category: KnockoutObservable<string>;
    }
}

