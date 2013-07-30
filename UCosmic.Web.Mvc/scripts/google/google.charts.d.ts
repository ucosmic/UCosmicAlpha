declare module google {
    declare function load(visualization: string, version: string, packages: any): void;
    declare function setOnLoadCallback(handler: any): void;

    declare module visualization {
        declare function GeoChart(element: any): any;
        declare function PieChart(element: any): any;
        declare function arrayToDataTable(data: any[]): any;
    }

    declare module maps {
        declare module visualization {
            declare function arrayToDataTable(data: any): any;
        }
    }
}