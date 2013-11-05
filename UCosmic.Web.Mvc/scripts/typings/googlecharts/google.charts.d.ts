declare module google {

    function load(visualization: string, version: string, packages: any): void;
    function setOnLoadCallback(handler: Function): void;
    function setOnLoadCallback(handler: () => void): void;

    module visualization {
        //#region DataTable

        // https://developers.google.com/chart/interactive/docs/reference#DataTable
        export interface DataTableColumnDescription {
            type?: string;
            label?: string;
            id?: string;
            role?: string;
            pattern?: string;
        }

        export interface DataObjectCell {
            v?: any;
            f?: string;
            p?: any;
        }

        export interface DataObjectColumn {
            type: string;
            id?: string;
            label?: string;
            pattern?: string;
            p?: any;
        }

        export interface DataObjectRow {
            c: DataObjectCell[];
            p?: any;
        }

        export interface DataObject {
            cols: DataObjectColumn[];
            rows: DataObjectRow[];
            p: any;
        }

        export interface DataTableCellFilter {
            column: number;
        }

        export interface DataTableCellValueFilter extends DataTableCellFilter {
            value: any;
        }

        export interface DataTableCellRangeFilter extends DataTableCellFilter {
            minValue?: any;
            maxValue?: any;
        }

        export class DataTable {
            constructor(data?: any, version?: any);
            addColumn(type: string, label?: string, id?: string): number;
            addColumn(descriptionObject: DataTableColumnDescription): number;
            addRow(cellObject: DataObjectCell): number;
            addRow(cellArray?: any[]): number;
            addRows(count: number): number;
            addRows(array: DataObjectCell[][]): number;
            addRows(array: any[]): number;
            getFilteredRows(filters: DataTableCellFilter[]): number[];
            getFormattedValue(rowIndex: number, columnIndex: number);
            getNumberOfColumns(): number;
            getNumberOfRows(): number;
            removeRow(rowIndex: number): void;
            removeRows(rowIndex: number, numberOfRows: number): void;
            setColumnLabel(columnIndex: number, label: string): void;
        }

        function arrayToDataTable(data: any[]): DataTable;

        //#endregion
        //#region DataView

        export class DataView {
            constructor(data: DataTable);
            constructor(data: DataView);
            setColumns(columnIndexes: number[]): void;
        }

        //#endregion
        //#region Visualizations

        export interface VisualizationSelectionArray {
            column?: number;
            row?: number;
        }

        //#endregion
        //#region GeoChart

        //https://google-developers.appspot.com/chart/interactive/docs/gallery/geochart
        export class GeoChart {
            constructor(element: Element);
            draw(data: DataTable, options: GeoChartOptions): void;
            getSelection(): GeoChartSelection[];
            setSelection(selection: VisualizationSelectionArray[]): void;
        }
        export interface GeoChartOptions {
            backgroundColor?: any;
            colorAxis?: GeoChartColorAxis;
            datalessRegionColor?: string;
            displayMode?: string;
            enableRegionInteractivity?: boolean;
            height?: number;
            keepAspectRatio?: boolean;
            legend?: GeoChartLegend;
            region?: string;
            magnifyingGlass?: GeoChartMagnifyingGlass;
            markerOpacity?: number;
            resolution?: string;
            sizeAxis?: GeoChartAxis;
            tooltip?: GeoChartTooltip;
            width?: number;
        }
        //export interface GeoChartColor {
        //    fill?: string;
        //    stroke?: string;
        //    strokeWidth: number;
        //}
        export interface GeoChartColorAxis extends GeoChartAxis {
            minValue?: number;
            maxValue?: number;
            values?: number[];
            colors?: string[];
        }
        export interface GeoChartTextStyle {
            color?: string;
            fontName?: string;
            fontSize?: number;
            bold?: boolean;
            italic?: boolean;
        }
        export interface GeoChartLegend {
            numberFormat?: string;
            textStyle?: GeoChartTextStyle;
        }
        export interface GeoChartMagnifyingGlass {
            enable?: boolean;
            zoomFactor?: number;
        }
        export interface GeoChartAxis {
            maxSize?: number;
            maxValue?: number;
            minSize?: number;
            minValue?: number;
        }
        export interface GeoChartTooltip {
            textStyle?: GeoChartTextStyle;
            trigger?: string;
        }
        export interface GeoChartRegionClickEvent {
            region: string;
        }
        export interface GeoChartSelection {
            row: number;
        }

        //#endregion
        //#region ColumnChart

        export class ColumnChart {
            constructor(element: Element);
            draw(data: DataTable, options: ColumnChartOptions): void;
            draw(data: DataView, options: ColumnChartOptions): void;
        }

        export interface ColumnChartTextStyle {
            color?: string;
            fontName?: string;
            fontSize?: number;
            bold?: boolean;
            italic?: boolean;
        }

        export interface ColumnChartArea {
            top: any;
            left: any;
            width: any;
            height: any;
        }

        export interface ColumnChartLegend {
            alignment?: string;
            maxLines?: number;
            position?: string;
            textStyle?: ColumnChartTextStyle;
        }

        export interface ColumnChartAxis {
            baseline?: number;
            baselineColor?: string; // gpogle's documentation on this is wrong, specifies it as a number
            direction?: number;
            format?: string;
            logScale?: boolean;
            textPosition?: string;
            textStyle?: ColumnChartTextStyle;
            title?: string;
            allowContainerBoundaryTextCufoff?: boolean;
            slantedText?: boolean;
            slantedTextAngle?: number;
            maxAlternation?: number;
            maxTextLines?: number;
            minTextSpacing?: number;
            showTextEvery?: number;
            maxValue?: number;
            minValue?: number;
            viewWindowMode?: string;
        }

        export interface ColumnChartOptions {
            aggregationTarget?: string;
            axisTitlesPosition?: string;
            chartArea?: ColumnChartArea;
            colors?: string[];
            hAxis?: ColumnChartAxis;
            height?: number;
            isStacked?: boolean;
            series?: any;
            vAxis?: ColumnChartAxis;
        }

        //#endregion
        //#region Events

        module events {
            function addListener(chart: any, eventName: string, callback: Function): any;
            function addListener(chart: any, eventName: string, callback: (...args: any[]) => void): any;
        }

        //#endregion
    }
}