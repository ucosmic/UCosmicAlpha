module ViewModels.Countries {
    export interface IServerApiModel {
        code: string;
        name: string;
    }

    export class ServerApiModel implements IServerApiModel {
        
        constructor (public code: string, public name: string) {
        }
    }
}