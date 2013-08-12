declare module ViewModels.My {
    export interface IServerProfileApiModel {
        hasPhoto: boolean;
        isActive: boolean;
        isDisplayNameDerived: boolean;
        personId: number;
        displayName: string;
        firstName: string;
        middleName: string;
        lastName: string;
        salutation: string;
        suffix: string;
        gender: string;
        facultyRankId: string;
        preferredTitle: string;
        affiliations: any[];
    }
}