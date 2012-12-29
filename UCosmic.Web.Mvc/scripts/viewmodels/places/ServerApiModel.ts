module ViewModels.Places {

    export interface IServerCountryApiModel {
        code: string;
        name: string;
    }

    export class ServerCountryApiModel implements IServerCountryApiModel {
        
        constructor (public code: string, public name: string) {
        }
    }

    export interface IServerPointModel {
        latitude: number;
        longitude: number;
        hasValue: bool;
    }

    export interface IServerBoxModel {
        northEast: IServerPointModel;
        southWest: IServerPointModel;
        hasValue: bool;
    }
}