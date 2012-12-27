module ViewModels.Places {

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