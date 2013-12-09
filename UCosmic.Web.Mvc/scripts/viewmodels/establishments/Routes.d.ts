declare module Establishments.ApiRoutes {

    export interface Establishments {
        single(establishmentId: number): string;
        children(parentId: number): string;
        offspring(ancestorId: number): string;
    }
}
