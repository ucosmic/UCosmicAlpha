declare module App {
    export interface PageOf<T> {
        pageSize: number;
        pageNumber: number;
        itemTotal: number;
        items: T[];
    }
}