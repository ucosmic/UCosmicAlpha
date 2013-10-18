declare module Places.ApiModels {
    export interface Point {
        latitude: number;
        longitude: number;
        hasValue?: boolean;
    }
    export interface Box {
        northEast: Point;
        southWest: Point;
        hasValue?: boolean;
    }
    export interface Place {
        id: number;
        parentId?: number;
        officialName: string;
        center: Point;
        box: Box;
        isEarth: boolean;
        isContinent: boolean;
        isCountry: boolean;
        isAdmin1: boolean;
        isAdmin2: boolean;
        isAdmin3: boolean;
        countryCode: string;
        placeTypeEnglishName: string;
    }
    export interface Country {
        code: string;
        name: string;
        continentId?: number;
        continentCode?: string;
        continentName?: string;
        box?: Box;
    }
}