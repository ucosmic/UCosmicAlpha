declare module google {
    declare function load(visualization: string, version: string, packages: any): void;
    declare function setOnLoadCallback(handler: any): void;

    declare module visualization {
        declare function GeoChart(id: string): any;
    }

    declare module maps {
        declare module visualization {
            declare function arrayToDataTable(data: any): any;
        }
    }
}