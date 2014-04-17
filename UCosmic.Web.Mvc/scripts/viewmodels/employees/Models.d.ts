declare module Employees.ApiModels {

    export interface EmployeesPlacesInputModel {
        countries?: boolean;
        placeIds?: number[];
        placeAgnostic?: boolean;
    }
    export interface ScalarEstablishment {
        id: number;
        parentId?: number;
        rank?: number;
        typeId: number;
        officialName: string;
        contextName?: string;
        uCosmicCode: string;
        ceebCode: string;
    }

    export interface EmployeesPlaceApiModel { // TODO: refactor name, should not have Model at end
        establishmentId: number;
        placeId?: number;
        placeName: string;
        isCountry: boolean;
        countryCode: string;
        activityIds: number[];
        activityPersonIds: number[];
        activityTypes?: EmployeeActivityTypeCount[];
        years?: EmployeeActivityYearCount[];
    }

    export interface EmployeeActivityTypeCount {
        activityTypeId: number;
        text?: string;
        rank?: number;
        hasIcon: boolean;
        iconSrc?: string;
        activityIds: number[];
        activityPersonIds: number[];
    }

    export interface EmployeeActivityYearCount {
        year: number;
        activityIds: number[];
        activityPersonIds: number[];
    }

    export interface EmployeeActivityCounts {
        personCount: number;
        activityCount: number;
        locationCount: number;
    }

    export interface EmployeeSettings {
        establishmentId?: number;
        facultyRanks?: EmployeeSettingsFacultyRank[];
    }

    export interface EmployeeSettingsFacultyRank {
        facultyRankId: number;
        establishmentId: number;
        text: string;
        rank: number;
    }
}

declare module Employees.KoModels {

    export interface EmployeeActivityCounts {
        personCount: KnockoutObservable<string>;
        activityCount: KnockoutObservable<string>;
        locationCount: KnockoutObservable<string>;
    }

    export interface EmployeeSettingsFacultyRank {
        facultyRankId: KnockoutObservable<number>;
        establishmentId: KnockoutObservable<number>;
        text: KnockoutObservable<string>;
        rank: KnockoutObservable<number>;
    }
}

