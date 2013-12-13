declare module App.ApiModels {

    export interface SearchInput {
        pageSize: number;
        pageNumber: number;
    }

    export interface SelectOption<T> {
        text: string;
        value: T;
    }
}
