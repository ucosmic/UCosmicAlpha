declare module Languages.ApiModels {

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

}

