// Type definitions for Kendo UI

module kendo {
    declare function bind(selector: string, viewModel: any, namespace?: any): void;
    declare function bind(element: JQuery, viewModel: any, namespace?: any): void;
    declare function bind(element: Element, viewModel: any, namespace?: any): void;
    declare function culture(value: string): void;
    declare function culture(): string;
    declare function destroy(selector: string): void;
    declare function destroy(element: Element): void;
    declare function destroy(element: JQuery): void;
    declare function format(format: string, ...values: any[]): string;
    declare function htmlEncode(value: string): string;
    declare function observable(data: any): kendo.data.ObservableObject;
    declare function parseDate(value: any, format?: string, culture?: string): Date;
    declare function parseFloat(value: any, culture?: string): number;
    declare function parseInt(value: any, culture?: string): number;
    declare function render(template:(data: any) => string, data: any[]): string;
    declare function template(template: string, options?: TemplateOptions): (data: any) => string;
    declare function touchScroller(selector: string): void;
    declare function touchScroller(element: Element): void;
    declare function touchScroller(element: JQuery): void;
    declare function toString(value: number, format: string): string;
    declare function toString(value: Date, format: string): string;
    declare function unbind(selector: string): void;
    declare function unbind(element: JQuery): void;
    declare function unbind(element: Element): void;

    declare var keys: {
        INSERT: number;
        DELETE: number;
        BACKSPACE: number;
        TAB: number;
        ENTER: number;
        ESC: number;
        LEFT: number;
        UP: number;
        RIGHT: number;
        DOWN: number;
        END: number;
        HOME: number;
        SPACEBAR: number;
        PAGEUP: number;
        PAGEDOWN: number;
        F2: number;
        F10: number;
        F12: number;
    }

    declare var support: {
        touch: bool;
        pointers: bool;
        scrollbar(): number;
        hasHW3D: bool;
        hasNativeScrolling: bool;
        devicePixelRatio: number;
        placeHolder: bool;
        zoomLevel: number;
        mobileOS: {
            device: string;
            tablet: any;
            browser: string;
            name: string;
            majorVersion: string;
            minorVersion: string;
            flatVersion: number;
            appMode: bool;
        };
        browser: {
            msie: bool;
            webkit: bool;
            safari: bool;
            opera: bool;
            version: string;
        };
    }

    interface TemplateOptions {
        paramName?: string;
        useWithBlock?: bool;
    }

    class Observable {
        bind(eventName: string, handler: Function): Observable;
        one(eventName: string, handler: Function): Observable;
        trigger(eventName: string, e?: any): bool;
        unbind(eventName: string, handler?: any): Observable;
    }
}

module kendo.data {
    interface ObservableObjectEvent {
        sender?: ObservableObject;
        field?: string;
    }

    interface ObservableObjectSetEvent extends ObservableObjectEvent {
        value?: any;
        preventDefault?: Function;
    }

    class ObservableObject extends Observable{
        constructor(value?: any);
        get(name: string): any;
        parent(): ObservableObject;
        set(name: string, value: any): void;
        toJSON(): { [key: string]: any; };
        uid: string;
    }

    class Model extends ObservableObject {
        idField: string;
        _defaultId: any;
        fields: DataSourceSchemaModelFields;
        defaults: any;
        constructor(data?: any);
        dirty: bool;
        id: any;
        editable(field: string): bool;
        isNew(): bool;
        static define(options: DataSourceSchemaModelWithFieldsObject): {
            idField: string;
            fields: DataSourceSchemaModelFields;
            new (data?: any): Model;
        };
        static define(options: DataSourceSchemaModelWithFieldsArray): {
            idField: string;
            fields: DataSourceSchemaModelFields;
            new (data?: any): Model;
        };
    }

    class Node extends Model {
        children: HierarchicalDataSource;

        append(model: any): void;
        level(): number;
        load(id: any): void;
        loaded(value: bool): void;
        loaded(): bool;
        parentNode(): Node;
    }

    class HierarchicalDataSource extends DataSource {
        constructor(options?: HierarchicalDataSourceOptions);
    }

    interface HierarchicalDataSourceOptions extends DataSourceOptions {
        schema?: HierarchicalDataSourceSchema;
    }


    interface HierarchicalDataSourceSchema extends DataSourceSchemaWithOptionsModel {
        model?: HierarchicalDataSourceSchemaModel;
    }

    interface HierarchicalDataSourceSchemaModel extends DataSourceSchemaModel {
        hasChildren?: any;
        children?: any;
    }

    interface DataSourceTransport {
        parameterMap?(data: DataSourceTransportParameterMapData, type: string): any;
    }

    interface DataSourceParameterMapDataAggregate {
        field?: string;
        aggregate?: string;
    }

    interface DataSourceParameterMapDataGroup {
        aggregate?: DataSourceParameterMapDataAggregate[];
        field?: string;
        dir?: string;
    }

    interface DataSourceParameterMapDataFilter {
        field?: string;
        filters?: DataSourceParameterMapDataFilter[];
        logic?: string;
        operator?: string;
        value?: any;
    }

    interface DataSourceParameterMapDataSort {
        field?: string;
        dir?: string;
    }

    interface DataSourceTransportParameterMapData {
        aggregate?: DataSourceParameterMapDataAggregate[];
        group?: DataSourceParameterMapDataGroup[];
        filter?: DataSourceParameterMapDataFilter;
        models?: Model[];
        page?: number;
        pageSize?: number;
        skip?: number;
        sort?: DataSourceParameterMapDataSort[];
        take?: number;
    }

    interface DataSourceSchema {
        model?: any;
    }

    interface DataSourceSchemaWithOptionsModel extends DataSourceSchema {
        model?: DataSourceSchemaModel;
    }

    interface DataSourceSchemaWithConstructorModel extends DataSourceSchema {
        model?: {
            idField: string;
            fields: DataSourceSchemaModelFields;
            new (data?: any): Model;
        };
    }

    interface DataSourceSchemaModel {
        id?: string;
        fields?: any;
    }

    interface DataSourceSchemaModelWithFieldsArray extends DataSourceSchemaModel {
        fields?: DataSourceSchemaModelField[];
    }

    interface DataSourceSchemaModelWithFieldsObject extends DataSourceSchemaModel {
        fields?: DataSourceSchemaModelFields;
    }

    interface DataSourceSchemaModelFields {
        [index: string]: DataSourceSchemaModelField;
    }

    interface DataSourceSchemaModelField {
        field?: string;
        defaultValue?: any;
        editable?: bool;
        nullable?: bool;
        parse?: Function;
        type?: string;
        validation?: DataSourceSchemaModelFieldValidation;
    }

    interface DataSourceSchemaModelFieldValidation {
        required?: bool;
        min?: any;
        max?: any;
    }

    class ObservableArray extends Observable {
        constructor(array?: any[]);
        length: number;
        join(separator: string): string;
        parent(): ObservableObject;
        pop(): ObservableObject;
        push(...items: any[]): number;
        slice(begin: number, end?: number): any[];
        splice(start: number): any[];
        splice(start: number, deleteCount: number, ...items: any[]): any[];
        shift(): any;
        toJSON(): any[];
        unshift(...items: any[]): number;
    }

    class DataSource extends Observable{
        constructor(options?: DataSourceOptions);
        options: DataSourceOptions;
        add(model: Object): kendo.data.Model;
        add(model: kendo.data.Model): kendo.data.Model;
        aggregate(val: any): void;
        aggregate(): any;
        aggregates(): any;
        at(index: number): kendo.data.ObservableObject;
        cancelChanges(model?: kendo.data.Model): void;
        data(): kendo.data.ObservableArray;
        data(value: any): void;
        fetch(callback?: Function): void;
        filter(filters: DataSourceFilterItem): void;
        filter(filters: DataSourceFilterItem[]): void;
        filter(filters: DataSourceFilters): void;
        filter(): DataSourceFilters;
        get(id: any): kendo.data.Model;
        getByUid(uid: string): kendo.data.Model;
        group(groups: any): void;
        group(): any;
        hasChanges(): bool;
        indexOf(value: kendo.data.ObservableObject): number;
        insert(index: number, model: kendo.data.Model): kendo.data.Model;
        insert(index: number, model: Object): kendo.data.Model;
        page(): number;
        page(page: number): void;
        pageSize(): number;
        pageSize(size: number): void;
        query(options?: any): void;
        read(data?: any): void;
        remove(model: kendo.data.Model): void;
        sort(sort: DataSourceSortItem): void;
        sort(sort: DataSourceSortItem[]): void;
        sort(): DataSourceSortItem[];
        sync(): void;
        total(): number;
        totalPages(): number;
        view(): kendo.data.ObservableArray;
    }

    interface DataSourceAggregateItem {
        field?: string;
        aggregate?: string;
    }

    interface DataSourceFilter {
    }

    interface DataSourceFilterItem extends DataSourceFilter {
        operator?: string;
        field?: string;
        value?: any;
    }

    interface DataSourceFilters extends DataSourceFilter {
        logic?: string;
        filters?: DataSourceFilter[];
    }

    interface DataSourceGroupItemAggregate {
        field?: string;
        aggregate?: string;
    }

    interface DataSourceGroupItem {
        field?: string;
        dir?: string;
        aggregates?: DataSourceGroupItemAggregate[];
    }

    interface DataSourceSchema {
        aggregates?: any;
        data?: any;
        errors?: any;
        groups?: any;
        parse?: Function;
        total?: any;
        type?: string;
    }

    interface DataSourceSortItem {
        field?: string;
        dir?: string;
    }

    interface DataSourceTransportCreate {
        cache?: bool;
        contentType?: string;
        data?: any;
        dataType?: string;
        type?: string;
        url?: any;
    }

    interface DataSourceTransportDestroy {
        cache?: bool;
        contentType?: string;
        data?: any;
        dataType?: string;
        type?: string;
        url?: any;
    }

    interface DataSourceTransportRead {
        cache?: bool;
        contentType?: string;
        data?: any;
        dataType?: string;
        type?: string;
        url?: any;
    }

    interface DataSourceTransportUpdate {
        cache?: bool;
        contentType?: string;
        data?: any;
        dataType?: string;
        type?: string;
        url?: any;
    }

    interface DataSourceTransport {
        create?: any;
        destroy?: any;
        read?: any;
        update?: any;
    }

    interface DataSourceTransportWithObjectOperations extends DataSourceTransport {
        create?: DataSourceTransportCreate;
        destroy?: DataSourceTransportDestroy;
        read?: DataSourceTransportRead;
        update?: DataSourceTransportUpdate;
    }

    interface DataSourceTransportWithFunctionOperations extends DataSourceTransport {
        create?: (options: DataSourceTransportOptions) => void;
        destroy?: (options: DataSourceTransportOptions) => void;
        read?: (options: DataSourceTransportReadOptions) => void;
        update?: (options: DataSourceTransportOptions) => void;
    }

    interface DataSourceTransportOptions {
        success: (data?: any) => void;
        error: (error?: any) => void;
        data: any;
    }

    interface DataSourceTransportReadOptionsData {
        sort?: DataSourceSortItem[];
        filter?: DataSourceFilters;
        take?: number;
        skip?: number;
    }

    interface DataSourceTransportReadOptions extends DataSourceTransportOptions {
        data: DataSourceTransportReadOptionsData;
    }

    interface DataSourceTransportBatchOptionsData {
        models: any[];
    }

    interface DataSourceTransportBatchOptions extends DataSourceTransportOptions {
        data: DataSourceTransportBatchOptionsData;
    }

    interface DataSourceOptions {
        aggregate?: DataSourceAggregateItem[];
        autoSync?: bool;
        batch?: bool;
        data?: any;
        filter?: any;
        group?: DataSourceGroupItem[];
        page?: number;
        pageSize?: number;
        schema?: DataSourceSchema;
        serverAggregates?: bool;
        serverFiltering?: bool;
        serverGrouping?: bool;
        serverPaging?: bool;
        serverSorting?: bool;
        sort?: any;
        transport?: DataSourceTransport;
        type?: string;
        change? (e: DataSourceChangeEvent): void;
        error?(e: DataSourceEvent): void;
        sync?(e: DataSourceEvent): void;
        requestStart?(e: DataSourceRequestStartEvent): void;
        requestEnd?(e: DataSourceRequestEndEvent): void;
    }

    interface DataSourceEvent {
        sender?: DataSource;
    }

    interface DataSourceChangeEvent extends DataSourceEvent {
        field?: string;
        value?: Model;
        action?: string;
        index?: number;
        items?: Model[];
    }

    interface DataSourceRequestStartEvent extends DataSourceEvent {
    }

    interface DataSourceRequestEndEvent extends DataSourceEvent {
        response?: any;
        type?: string;
    }
}

module kendo.ui {
    declare function progress(container: JQuery, toggle: bool);

    class Widget extends Observable {
        destroy(): void;
    }

    class Draggable extends kendo.ui.Widget{
        element: JQuery;
        currentTarget: JQuery;
        constructor(element: Element, options?: DraggableOptions);
        options: DraggableOptions;
    }

    interface DraggableEvent extends JQueryEventObject {
        sender?: Draggable;
    }

    class DropTarget extends kendo.ui.Widget{
        element: JQuery;
        constructor(element: Element, options?: DropTargetOptions);
        options: DropTargetOptions;
        destroyGroup(): void;
    }

    interface DropTargetOptions {
        group?: string;
        dragenter?(e: DropTargetDragenterEvent): void;
        dragleave?(e: DropTargetDragleaveEvent): void;
        drop?(e: DropTargetDropEvent): void;
    }

    interface DropTargetEvent extends JQueryEventObject {
        sender?: DropTarget;
    }

    interface DropTargetDragenterEvent extends DropTargetEvent {
        draggable?: kendo.ui.Draggable;
    }

    interface DropTargetDragleaveEvent extends DropTargetEvent {
        draggable?: kendo.ui.Draggable;
    }

    interface DropTargetDropEvent extends DropTargetEvent {
        draggable?: kendo.ui.Draggable;
    }

    class DropTargetArea extends kendo.ui.Widget{
        element: JQuery;
        constructor(element: Element, options?: DropTargetAreaOptions);
        options: DropTargetAreaOptions;
    }

    interface DropTargetAreaOptions {
        group?: string;
        filter?: string;
        dragenter?(e: DropTargetAreaDragenterEvent): void;
        dragleave?(e: DropTargetAreaDragleaveEvent): void;
        drop?(e: DropTargetAreaDropEvent): void;
    }

    interface DropTargetAreaEvent extends JQueryEventObject {
        sender: DropTargetArea;
    }

    interface DropTargetAreaDragenterEvent extends DropTargetAreaEvent {
        draggable?: JQuery;
    }

    interface DropTargetAreaDragleaveEvent extends DropTargetAreaEvent {
        draggable?: JQuery;
    }

    interface DropTargetAreaDropEvent extends DropTargetAreaEvent {
        draggable?: kendo.ui.Draggable;
        dropTarget?: JQuery;
    }

    interface DraggableOptions {
        axis?: string;
        cursorOffset?: any;
        distance?: number;
        group?: string;
        hint?: Function;
        drag?(e: DraggableEvent): void;
        dragcancel?(e: DraggableEvent): void;
        dragend?(e: DraggableEvent): void;
        dragstart?(e: DraggableEvent): void;
    }

    interface GridColumnEditorOptions {
        field?: string;
        format?: string;
        model?: kendo.data.Model;
        values?: any[];
    }

    interface GridColumn {
        editor?(container: JQuery, options: GridColumnEditorOptions): void;
    }
}

module kendo.mobile.ui {
    class Widget extends kendo.ui.Widget {
    }

    interface TouchAxis {
        location?: number;
        startLocation?: number;
        client?: number;
        delta?: number;
        velocity?: number;
    }

    interface TouchEventOptions {
        target?: JQuery;
        x?: TouchAxis;
        y?: TouchAxis;
    }

    interface Point {
        x?: number;
        y?: number;
    }
}

module kendo.ui {
    class AutoComplete extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: AutoCompleteOptions);
        options: AutoCompleteOptions;
        dataSource: kendo.data.DataSource;
        close(): void;
        dataItem(index: number): any;
        destroy(): void;
        enable(enable: bool): void;
        refresh(): void;
        search(word: string): void;
        select(li: JQuery): void;
        setDataSource(dataSource: kendo.data.DataSource): void;
        suggest(value: string): void;
        value(): string;
        value(value: string): void;
    }

    interface AutoCompleteAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface AutoCompleteAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface AutoCompleteAnimation {
        close?: AutoCompleteAnimationClose;
        open?: AutoCompleteAnimationOpen;
    }

    interface AutoCompleteOptions {
        animation?: AutoCompleteAnimation;
        dataSource?: any;
        dataTextField?: string;
        delay?: number;
        enable?: bool;
        filter?: string;
        height?: number;
        highlightFirst?: bool;
        ignoreCase?: bool;
        minLength?: number;
        placeholder?: string;
        separator?: string;
        suggest?: bool;
        template?: any;
        change?(e: AutoCompleteEvent): void;
        close?(e: AutoCompleteEvent): void;
        dataBound?(e: AutoCompleteEvent): void;
        open?(e: AutoCompleteEvent): void;
        select?(e: AutoCompleteSelectEvent): void;
    }

    interface AutoCompleteEvent {
        sender: AutoComplete;
    }

    interface AutoCompleteSelectEvent extends AutoCompleteEvent {
        item?: JQuery;
    }


    class Calendar extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: CalendarOptions);
        options: CalendarOptions;
        destroy(): void;
        max(): Date;
        max(value: any): void;
        min(): Date;
        min(value: any): void;
        navigate(value: Date, view: string): void;
        navigateDown(value: Date): void;
        navigateToFuture(): void;
        navigateToPast(): void;
        navigateUp(): void;
        value(): Date;
        value(value: any): void;
        current(): Date;
        view(): any;
    }

    interface CalendarMonth {
        content?: string;
        empty?: string;
    }

    interface CalendarOptions {
        culture?: string;
        dates?: any;
        depth?: string;
        footer?: string;
        format?: string;
        max?: Date;
        min?: Date;
        month?: CalendarMonth;
        start?: string;
        value?: Date;
        change?(e: CalendarEvent): void;
        navigate?(e: CalendarEvent): void;
    }

    interface CalendarEvent {
        sender: Calendar;
    }


    class ColorPalette extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ColorPaletteOptions);
        options: ColorPaletteOptions;
        value(): string;
        value(color: string): void;
        color(): void;
        enable(): void;
    }

    interface ColorPaletteTileSize {
        width?: number;
        height?: number;
    }

    interface ColorPaletteOptions {
        palette?: any;
        columns?: number;
        tileSize?: ColorPaletteTileSize;
        value?: string;
        change?(e: ColorPaletteEvent): void;
    }

    interface ColorPaletteEvent {
        sender: ColorPalette;
    }


    class ColorPicker extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ColorPickerOptions);
        options: ColorPickerOptions;
        close(): void;
        open(): void;
        toggle(): void;
        value(): string;
        value(color: string): void;
        color(): void;
        enable(color: string): void;
    }

    interface ColorPickerTileSize {
        width?: number;
        height?: number;
    }

    interface ColorPickerOptions {
        buttons?: bool;
        columns?: number;
        tileSize?: ColorPickerTileSize;
        messages?: any;
        palette?: string;
        opacity?: bool;
        preview?: bool;
        toolIcon?: string;
        value?: string;
        change?(e: ColorPickerEvent): void;
        select?(e: ColorPickerEvent): void;
        open?(e: ColorPickerEvent): void;
        close?(e: ColorPickerEvent): void;
    }

    interface ColorPickerEvent {
        sender: ColorPicker;
    }


    class ComboBox extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ComboBoxOptions);
        options: ComboBoxOptions;
        dataSource: kendo.data.DataSource;
        close(): void;
        dataItem(index: number): any;
        destroy(): void;
        enable(enable: bool): void;
        open(): void;
        refresh(): void;
        search(word: string): void;
        select(li: any): number;
        setDataSource(dataSource: kendo.data.DataSource): void;
        suggest(value: string): void;
        text(): string;
        text(text: string): void;
        toggle(toggle: bool): void;
        value(): string;
        value(value: string): void;
    }

    interface ComboBoxAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface ComboBoxAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface ComboBoxAnimation {
        close?: ComboBoxAnimationClose;
        open?: ComboBoxAnimationOpen;
    }

    interface ComboBoxOptions {
        animation?: ComboBoxAnimation;
        autoBind?: bool;
        cascadeFrom?: string;
        dataSource?: any;
        dataTextField?: string;
        dataValueField?: string;
        delay?: number;
        enable?: bool;
        filter?: string;
        height?: number;
        highlightFirst?: bool;
        ignoreCase?: string;
        index?: number;
        minLength?: number;
        placeholder?: string;
        suggest?: bool;
        template?: string;
        text?: string;
        value?: string;
        change?(e: ComboBoxEvent): void;
        close?(e: ComboBoxEvent): void;
        dataBound?(e: ComboBoxEvent): void;
        open?(e: ComboBoxEvent): void;
        select?(e: ComboBoxSelectEvent): void;
        cascade?(e: ComboBoxEvent): void;
    }

    interface ComboBoxEvent {
        sender: ComboBox;
    }

    interface ComboBoxSelectEvent extends ComboBoxEvent {
        item?: JQuery;
    }


    class DatePicker extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: DatePickerOptions);
        options: DatePickerOptions;
        close(): void;
        destroy(): void;
        enable(enable: bool): void;
        max(): Date;
        max(value: any): void;
        min(): Date;
        min(value: any): void;
        open(): void;
        value(): Date;
        value(value: any): void;
    }

    interface DatePickerAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface DatePickerAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface DatePickerAnimation {
        close?: DatePickerAnimationClose;
        open?: DatePickerAnimationOpen;
    }

    interface DatePickerMonth {
        content?: string;
        empty?: string;
    }

    interface DatePickerOptions {
        animation?: DatePickerAnimation;
        culture?: string;
        dates?: any;
        depth?: string;
        footer?: string;
        format?: string;
        max?: Date;
        min?: Date;
        month?: DatePickerMonth;
        parseFormats?: any;
        start?: string;
        value?: Date;
        change?(e: DatePickerEvent): void;
        close?(e: DatePickerEvent): void;
        open?(e: DatePickerEvent): void;
    }

    interface DatePickerEvent {
        sender: DatePicker;
    }


    class DateTimePicker extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: DateTimePickerOptions);
        options: DateTimePickerOptions;
        close(view: string): void;
        destroy(): void;
        enable(enable: bool): void;
        max(): Date;
        max(value: any): void;
        min(): Date;
        min(value: any): void;
        open(view: string): void;
        toggle(view: string): void;
        value(): Date;
        value(value: any): void;
    }

    interface DateTimePickerAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface DateTimePickerAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface DateTimePickerAnimation {
        close?: DateTimePickerAnimationClose;
        open?: DateTimePickerAnimationOpen;
    }

    interface DateTimePickerMonth {
        content?: string;
        empty?: string;
    }

    interface DateTimePickerOptions {
        animation?: DateTimePickerAnimation;
        culture?: string;
        dates?: any;
        depth?: string;
        footer?: string;
        format?: string;
        interval?: number;
        max?: Date;
        min?: Date;
        month?: DateTimePickerMonth;
        parseFormats?: any;
        start?: string;
        timeFormat?: string;
        value?: Date;
        change?(e: DateTimePickerEvent): void;
        close?(e: DateTimePickerCloseEvent): void;
        open?(e: DateTimePickerOpenEvent): void;
    }

    interface DateTimePickerEvent {
        sender: DateTimePicker;
    }

    interface DateTimePickerCloseEvent extends DateTimePickerEvent {
        view?: string;
    }

    interface DateTimePickerOpenEvent extends DateTimePickerEvent {
        view?: string;
    }


    class DropDownList extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: DropDownListOptions);
        options: DropDownListOptions;
        dataSource: kendo.data.DataSource;
        close(): void;
        dataItem(index: number): any;
        destroy(): void;
        enable(enable: bool): void;
        open(): void;
        refresh(): void;
        search(word: string): void;
        select(li: any): number;
        setDataSource(dataSource: kendo.data.DataSource): void;
        text(): string;
        text(text: string): void;
        toggle(toggle: bool): void;
        value(): string;
        value(value: string): void;
    }

    interface DropDownListAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface DropDownListAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface DropDownListAnimation {
        close?: DropDownListAnimationClose;
        open?: DropDownListAnimationOpen;
    }

    interface DropDownListOptions {
        animation?: DropDownListAnimation;
        autoBind?: bool;
        cascadeFrom?: string;
        dataSource?: any;
        dataTextField?: string;
        dataValueField?: string;
        delay?: number;
        enable?: bool;
        height?: number;
        ignoreCase?: string;
        index?: number;
        optionLabel?: any;
        template?: any;
        text?: string;
        value?: string;
        change?(e: DropDownListEvent): void;
        close?(e: DropDownListEvent): void;
        dataBound?(e: DropDownListEvent): void;
        open?(e: DropDownListEvent): void;
        select?(e: DropDownListSelectEvent): void;
        cascade?(e: DropDownListEvent): void;
    }

    interface DropDownListEvent {
        sender: DropDownList;
    }

    interface DropDownListSelectEvent extends DropDownListEvent {
        item?: JQuery;
    }


    class Editor extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: EditorOptions);
        options: EditorOptions;
        createRange(document?: Document): Range;
        destroy(): void;
        encodedValue(): void;
        exec(name: string, params: EditorExecParams): void;
        focus(): void;
        getRange(): Range;
        getSelection(): Selection;
        paste(html: string): void;
        selectedHtml(): string;
        selectRange(range: Range): void;
        update(): void;
        value(): string;
        value(value: string): void;
    }

    interface EditorImageBrowserMessages {
        uploadFile?: string;
        orderBy?: string;
        orderByName?: string;
        orderBySize?: string;
        directoryNotFound?: string;
        emptyFolder?: string;
        deleteFile?: string;
        invalidFileType?: string;
        overwriteFile?: string;
    }

    interface EditorImageBrowserSchemaModelFieldsName {
        field?: string;
        parse?: Function;
    }

    interface EditorImageBrowserSchemaModelFieldsSize {
        field?: string;
        parse?: Function;
    }

    interface EditorImageBrowserSchemaModelFieldsType {
        parse?: Function;
        field?: string;
    }

    interface EditorImageBrowserSchemaModelFields {
        name?: EditorImageBrowserSchemaModelFieldsName;
        type?: EditorImageBrowserSchemaModelFieldsType;
        size?: EditorImageBrowserSchemaModelFieldsSize;
    }

    interface EditorImageBrowserSchemaModel {
        id?: string;
        fields?: EditorImageBrowserSchemaModelFields;
    }

    interface EditorImageBrowserSchema {
    }

    interface EditorImageBrowserTransportCreate {
        contentType?: string;
        data?: any;
        dataType?: string;
        type?: string;
        url?: any;
    }

    interface EditorImageBrowserTransportDestroy {
        contentType?: string;
        data?: any;
        dataType?: string;
        type?: string;
        url?: any;
    }

    interface EditorImageBrowserTransportRead {
        contentType?: string;
        data?: any;
        dataType?: string;
        type?: string;
        url?: any;
    }

    interface EditorImageBrowserTransport {
        read?: EditorImageBrowserTransportRead;
        thumbnailUrl?: any;
        uploadUrl?: string;
        imageUrl?: any;
        destroy?: EditorImageBrowserTransportDestroy;
        create?: EditorImageBrowserTransportCreate;
    }

    interface EditorImageBrowser {
        fileTypes?: string;
        path?: string;
        transport?: EditorImageBrowserTransport;
        schema?: EditorImageBrowserSchema;
        messages?: EditorImageBrowserMessages;
    }

    interface EditorToolItem {
        text?: string;
        value?: string;
    }

    interface EditorTool {
        name?: string;
        tooltip?: string;
        exec?: Function;
        items?: EditorToolItem[];
        template?: string;
    }

    interface EditorExecParams {
        value?: any;
    }

    interface EditorOptions {
        encoded?: bool;
        messages?: any;
        stylesheets?: any;
        tools?: EditorTool[];
        imageBrowser?: EditorImageBrowser;
        change?(e: EditorEvent): void;
        execute?(e: EditorExecuteEvent): void;
        keydown?(e: EditorEvent): void;
        keyup?(e: EditorEvent): void;
        paste?(e: EditorPasteEvent): void;
        select?(e: EditorEvent): void;
    }

    interface EditorEvent {
        sender: Editor;
    }

    interface EditorExecuteEvent extends EditorEvent {
        name?: string;
        command?: any;
    }

    interface EditorPasteEvent extends EditorEvent {
        html?: any;
    }


    class FlatColorPicker extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: FlatColorPickerOptions);
        options: FlatColorPickerOptions;
        focus(): void;
        value(): string;
        value(color: string): void;
        color(): void;
        enable(): void;
    }

    interface FlatColorPickerOptions {
        opacity?: bool;
        buttons?: bool;
        value?: string;
        preview?: bool;
        messages?: any;
        change?(e: FlatColorPickerEvent): void;
    }

    interface FlatColorPickerEvent {
        sender: FlatColorPicker;
    }


    class Grid extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: GridOptions);
        options: GridOptions;
        dataSource: kendo.data.DataSource;
        addRow(): void;
        cancelChanges(): void;
        cancelRow(): void;
        cellIndex(cell: any): void;
        clearSelection(): void;
        closeCell(): void;
        collapseGroup(group: any): void;
        collapseRow(row: any): void;
        dataItem(tr: any): void;
        destroy(): void;
        editCell(cell: any): void;
        editRow(row: any): void;
        expandGroup(group: any): void;
        expandRow(row: any): void;
        hideColumn(column: any): void;
        refresh(): void;
        removeRow(row: any): void;
        reorderColumn(destIndex: number, column: any): void;
        saveChanges(): void;
        saveRow(): void;
        select(): JQuery;
        select(items: any): void;
        setDataSource(dataSource: kendo.data.DataSource): void;
        showColumn(column: any): void;
    }

    interface GridColumnMenuMessages {
        columns?: string;
        filter?: string;
        sortAscending?: string;
        sortDescending?: string;
    }

    interface GridColumnMenu {
        columns?: bool;
        filterable?: bool;
        sortable?: bool;
        messages?: GridColumnMenuMessages;
    }

    interface GridColumnCommandItem {
        name?: string;
        text?: string;
        className?: string;
        click?: Function;
    }

    interface GridColumnFilterable {
        ui?: any;
    }

    interface GridColumn {
        attributes?: any;
        command?: GridColumnCommandItem[];
        encoded?: bool;
        field?: string;
        filterable?: GridColumnFilterable;
        format?: string;
        headerAttributes?: any;
        headerTemplate?: string;
        hidden?: bool;
        sortable?: bool;
        template?: string;
        aggregates?: any;
        groupHeaderTemplate?: string;
        groupFooterTemplate?: string;
        footerTemplate?: string;
        title?: string;
        width?: string;
        values?: any;
        menu?: bool;
    }

    interface GridEditable {
        confirmation?: any;
        createAt?: string;
        destroy?: bool;
        mode?: string;
        template?: string;
        update?: bool;
    }

    interface GridFilterableMessages {
        and?: string;
        clear?: string;
        filter?: string;
        info?: string;
        isFalse?: string;
        isTrue?: string;
        or?: string;
        selectValue?: string;
    }

    interface GridFilterableOperatorsDate {
        eq?: string;
        neq?: string;
        gte?: string;
        gt?: string;
        lte?: string;
        lt?: string;
    }

    interface GridFilterableOperatorsEnums {
        eq?: string;
        neq?: string;
    }

    interface GridFilterableOperatorsNumber {
        eq?: string;
        neq?: string;
        gte?: string;
        gt?: string;
        lte?: string;
        lt?: string;
    }

    interface GridFilterableOperatorsString {
        eq?: string;
        neq?: string;
        startswith?: string;
        contains?: string;
        doesnotcontain?: string;
        endswith?: string;
    }

    interface GridFilterableOperators {
        string?: GridFilterableOperatorsString;
        number?: GridFilterableOperatorsNumber;
        date?: GridFilterableOperatorsDate;
        enums?: GridFilterableOperatorsEnums;
    }

    interface GridFilterable {
        extra?: bool;
        messages?: GridFilterableMessages;
        operators?: GridFilterableOperators;
    }

    interface GridGroupableMessages {
        empty?: string;
    }

    interface GridGroupable {
        messages?: GridGroupableMessages;
    }

    interface GridPageableMessages {
        display?: string;
        empty?: string;
        page?: string;
        of?: string;
        itemsPerPage?: string;
        first?: string;
        previous?: string;
        next?: string;
        last?: string;
        refresh?: string;
    }

    interface GridPageable {
        pageSize?: number;
        previousNext?: bool;
        numeric?: bool;
        buttonCount?: number;
        input?: bool;
        pageSizes?: any;
        refresh?: bool;
        info?: bool;
        messages?: GridPageableMessages;
    }

    interface GridScrollable {
        virtual?: bool;
    }

    interface GridSortable {
        allowUnsort?: bool;
        mode?: string;
    }

    interface GridToolbarItem {
        name?: string;
        template?: string;
        text?: string;
    }

    interface GridOptions {
        altRowTemplate?: Function;
        autoBind?: bool;
        columns?: GridColumn[];
        columnMenu?: GridColumnMenu;
        dataSource?: any;
        detailTemplate?: Function;
        editable?: GridEditable;
        filterable?: GridFilterable;
        reorderable?: bool;
        resizable?: bool;
        groupable?: GridGroupable;
        height?: any;
        navigatable?: bool;
        pageable?: GridPageable;
        rowTemplate?: Function;
        scrollable?: GridScrollable;
        selectable?: string;
        sortable?: GridSortable;
        toolbar?: GridToolbarItem[];
        cancel?(e: GridCancelEvent): void;
        change?(e: GridEvent): void;
        columnHide?(e: GridColumnHideEvent): void;
        columnReorder?(e: GridColumnReorderEvent): void;
        columnResize?(e: GridColumnResizeEvent): void;
        columnShow?(e: GridColumnShowEvent): void;
        dataBound?(e: GridEvent): void;
        dataBinding?(e: GridEvent): void;
        detailCollapse?(e: GridDetailCollapseEvent): void;
        detailExpand?(e: GridDetailExpandEvent): void;
        detailInit?(e: GridDetailInitEvent): void;
        edit?(e: GridEditEvent): void;
        filterMenuInit?(e: GridFilterMenuInitEvent): void;
        columnMenuInit?(e: GridColumnMenuInitEvent): void;
        remove?(e: GridRemoveEvent): void;
        save?(e: GridSaveEvent): void;
        saveChanges?(e: GridEvent): void;
    }

    interface GridEvent {
        sender: Grid;
    }

    interface GridCancelEvent extends GridEvent {
        container?: JQuery;
        model?: kendo.data.Model;
        preventDefault?: Function;
    }

    interface GridColumnHideEvent extends GridEvent {
        column?: any;
    }

    interface GridColumnReorderEvent extends GridEvent {
        column?: any;
        newIndex?: number;
        oldIndex?: number;
    }

    interface GridColumnResizeEvent extends GridEvent {
        column?: any;
        oldWidth?: number;
        newWidth?: number;
    }

    interface GridColumnShowEvent extends GridEvent {
        column?: any;
    }

    interface GridDetailCollapseEvent extends GridEvent {
        masterRow?: JQuery;
        detailRow?: JQuery;
    }

    interface GridDetailExpandEvent extends GridEvent {
        masterRow?: JQuery;
        detailRow?: JQuery;
    }

    interface GridDetailInitEvent extends GridEvent {
        masterRow?: JQuery;
        detailRow?: JQuery;
        detailCell?: JQuery;
        data?: kendo.data.ObservableObject;
    }

    interface GridEditEvent extends GridEvent {
        container?: JQuery;
        model?: kendo.data.Model;
    }

    interface GridFilterMenuInitEvent extends GridEvent {
        field?: any;
        container?: JQuery;
    }

    interface GridColumnMenuInitEvent extends GridEvent {
        field?: any;
        container?: JQuery;
    }

    interface GridRemoveEvent extends GridEvent {
        row?: JQuery;
        model?: kendo.data.Model;
    }

    interface GridSaveEvent extends GridEvent {
        values?: any;
        container?: JQuery;
        model?: kendo.data.Model;
    }


    class ListView extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ListViewOptions);
        options: ListViewOptions;
        dataSource: kendo.data.DataSource;
        add(): void;
        cancel(): void;
        clearSelection(): void;
        destroy(): void;
        edit(item: any): void;
        refresh(): void;
        remove(item: any): void;
        save(): void;
        select(): JQuery;
        select(items: any): void;
        setDataSource(dataSource: kendo.data.DataSource): void;
    }

    interface ListViewOptions {
        autoBind?: bool;
        dataSource?: any;
        editTemplate?: Function;
        navigatable?: bool;
        selectable?: string;
        template?: Function;
        altTemplate?: Function;
        cancel?(e: ListViewCancelEvent): void;
        change?(e: ListViewEvent): void;
        dataBound?(e: ListViewEvent): void;
        dataBinding?(e: ListViewEvent): void;
        edit?(e: ListViewEditEvent): void;
        remove?(e: ListViewRemoveEvent): void;
    }

    interface ListViewEvent {
        sender: ListView;
    }

    interface ListViewCancelEvent extends ListViewEvent {
        container?: JQuery;
        model?: kendo.data.Model;
        preventDefault?: Function;
    }

    interface ListViewEditEvent extends ListViewEvent {
        item?: JQuery;
        model?: kendo.data.Model;
    }

    interface ListViewRemoveEvent extends ListViewEvent {
        item?: JQuery;
        model?: kendo.data.Model;
    }


    class Menu extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: MenuOptions);
        options: MenuOptions;
        append(item: string, referenceItem: string): kendo.ui.Menu;
        close(element: string): kendo.ui.Menu;
        destroy(): void;
        enable(element: string, enable: bool): kendo.ui.Menu;
        insertAfter(item: string, referenceItem: string): kendo.ui.Menu;
        insertBefore(item: string, referenceItem: string): kendo.ui.Menu;
        open(element: string): kendo.ui.Menu;
        remove(element: string): kendo.ui.Menu;
    }

    interface MenuAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface MenuAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface MenuAnimation {
        close?: MenuAnimationClose;
        open?: MenuAnimationOpen;
    }

    interface MenuOptions {
        animation?: MenuAnimation;
        closeOnClick?: bool;
        direction?: string;
        hoverDelay?: number;
        openOnClick?: bool;
        orientation?: string;
        popupCollision?: string;
        close?(e: MenuCloseEvent): void;
        open?(e: MenuOpenEvent): void;
        select?(e: MenuSelectEvent): void;
    }

    interface MenuEvent {
        sender: Menu;
    }

    interface MenuCloseEvent extends MenuEvent {
        item?: Element;
    }

    interface MenuOpenEvent extends MenuEvent {
        item?: Element;
    }

    interface MenuSelectEvent extends MenuEvent {
        item?: Element;
    }


    class MultiSelect extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: MultiSelectOptions);
        options: MultiSelectOptions;
        dataSource: kendo.data.DataSource;
        close(): void;
        dataItems(): any;
        destroy(): void;
        enable(enable: bool): void;
        open(): void;
        refresh(): void;
        search(word: string): void;
        setDataSource(dataSource: kendo.data.DataSource): void;
        toggle(toggle: bool): void;
        value(): any;
        value(value: any): void;
    }

    interface MultiSelectAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface MultiSelectAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface MultiSelectAnimation {
        close?: MultiSelectAnimationClose;
        open?: MultiSelectAnimationOpen;
    }

    interface MultiSelectOptions {
        animation?: MultiSelectAnimation;
        autoBind?: bool;
        dataSource?: any;
        dataTextField?: string;
        dataValueField?: string;
        delay?: number;
        enable?: bool;
        filter?: string;
        height?: number;
        highlightFirst?: bool;
        ignoreCase?: string;
        minLength?: number;
        maxSelectedItems?: number;
        placeholder?: string;
        itemTemplate?: string;
        tagTemplate?: string;
        value?: any;
        change?(e: MultiSelectEvent): void;
        close?(e: MultiSelectEvent): void;
        dataBound?(e: MultiSelectEvent): void;
        open?(e: MultiSelectEvent): void;
        select?(e: MultiSelectSelectEvent): void;
    }

    interface MultiSelectEvent {
        sender: MultiSelect;
    }

    interface MultiSelectSelectEvent extends MultiSelectEvent {
        item?: JQuery;
    }


    class NumericTextBox extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: NumericTextBoxOptions);
        options: NumericTextBoxOptions;
        destroy(): void;
        enable(enable: bool): void;
        focus(): void;
        max(): number;
        max(value: any): void;
        min(): number;
        min(value: any): void;
        step(): number;
        step(value: any): void;
        value(): number;
        value(value: any): void;
    }

    interface NumericTextBoxOptions {
        culture?: string;
        decimals?: number;
        downArrowText?: string;
        format?: string;
        max?: number;
        min?: number;
        placeholder?: string;
        spinners?: bool;
        step?: number;
        upArrowText?: string;
        value?: number;
        change?(e: NumericTextBoxEvent): void;
        spin?(e: NumericTextBoxEvent): void;
    }

    interface NumericTextBoxEvent {
        sender: NumericTextBox;
    }


    class Pager extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: PagerOptions);
        options: PagerOptions;
        dataSource: kendo.data.DataSource;
        totalPages(): void;
        pageSize(): void;
        page(): void;
        refresh(): void;
        destroy(): void;
    }

    interface PagerMessages {
        display?: string;
        empty?: string;
        page?: string;
        of?: string;
        itemsPerPage?: string;
        first?: string;
        previous?: string;
        next?: string;
        last?: string;
        refresh?: string;
    }

    interface PagerOptions {
        autoBind?: bool;
        buttonCount?: number;
        dataSource?: any;
        selectTemplate?: string;
        linkTemplate?: string;
        info?: bool;
        input?: bool;
        numeric?: bool;
        pageSizes?: any;
        previousNext?: bool;
        refresh?: bool;
        messages?: PagerMessages;
        change?(e: PagerEvent): void;
    }

    interface PagerEvent {
        sender: Pager;
    }


    class PanelBar extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: PanelBarOptions);
        options: PanelBarOptions;
        append(item: string, referenceItem: string): kendo.ui.PanelBar;
        collapse(element: string, useAnimation: bool): kendo.ui.PanelBar;
        destroy(): void;
        enable(element: any, enable: bool): void;
        expand(element: string, useAnimation: bool): kendo.ui.PanelBar;
        insertAfter(item: string, referenceItem: string): void;
        insertBefore(item: string, referenceItem: string): kendo.ui.PanelBar;
        reload(element: string): void;
        remove(element: any): void;
        select(element: any): void;
    }

    interface PanelBarAnimationCollapse {
        duration?: number;
        effects?: string;
    }

    interface PanelBarAnimationExpand {
        duration?: number;
        effects?: string;
        show?: bool;
    }

    interface PanelBarAnimation {
        collapse?: PanelBarAnimationCollapse;
        expand?: PanelBarAnimationExpand;
    }

    interface PanelBarOptions {
        animation?: PanelBarAnimation;
        expandMode?: string;
        activate?(e: PanelBarActivateEvent): void;
        collapse?(e: PanelBarCollapseEvent): void;
        contentLoad?(e: PanelBarContentLoadEvent): void;
        error?(e: PanelBarErrorEvent): void;
        expand?(e: PanelBarExpandEvent): void;
        select?(e: PanelBarSelectEvent): void;
    }

    interface PanelBarEvent {
        sender: PanelBar;
    }

    interface PanelBarActivateEvent extends PanelBarEvent {
        item?: Element;
    }

    interface PanelBarCollapseEvent extends PanelBarEvent {
        item?: Element;
    }

    interface PanelBarContentLoadEvent extends PanelBarEvent {
        item?: Element;
        contentElement?: Element;
    }

    interface PanelBarErrorEvent extends PanelBarEvent {
        xhr?: JQueryXHR;
        status?: string;
    }

    interface PanelBarExpandEvent extends PanelBarEvent {
        item?: Element;
    }

    interface PanelBarSelectEvent extends PanelBarEvent {
        item?: Element;
    }


    class RangeSlider extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: RangeSliderOptions);
        options: RangeSliderOptions;
        destroy(): void;
        enable(enable: bool): void;
        value(): void;
        value(value: number): void;
    }

    interface RangeSliderTooltip {
        enabled?: bool;
        format?: string;
        template?: string;
    }

    interface RangeSliderOptions {
        largeStep?: number;
        max?: number;
        min?: number;
        orientation?: string;
        selectionEnd?: number;
        selectionStart?: number;
        smallStep?: number;
        tickPlacement?: string;
        tooltip?: RangeSliderTooltip;
        change?(e: RangeSliderChangeEvent): void;
        slide?(e: RangeSliderSlideEvent): void;
    }

    interface RangeSliderEvent {
        sender: RangeSlider;
    }

    interface RangeSliderChangeEvent extends RangeSliderEvent {
        value?: number;
    }

    interface RangeSliderSlideEvent extends RangeSliderEvent {
        value?: number;
    }


    class Slider extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: SliderOptions);
        options: SliderOptions;
        destroy(): void;
        enable(enable: bool): void;
        value(): void;
        value(value: string): void;
    }

    interface SliderTooltip {
        enabled?: bool;
        format?: string;
        template?: string;
    }

    interface SliderOptions {
        decreaseButtonTitle?: string;
        increaseButtonTitle?: string;
        largeStep?: number;
        max?: number;
        min?: number;
        orientation?: string;
        showButtons?: bool;
        smallStep?: number;
        tickPlacement?: string;
        tooltip?: SliderTooltip;
        value?: number;
        change?(e: SliderChangeEvent): void;
        slide?(e: SliderSlideEvent): void;
    }

    interface SliderEvent {
        sender: Slider;
    }

    interface SliderChangeEvent extends SliderEvent {
        value?: number;
    }

    interface SliderSlideEvent extends SliderEvent {
        value?: number;
    }


    class Splitter extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: SplitterOptions);
        options: SplitterOptions;
        ajaxRequest(pane: any, url: string, data: any): void;
        collapse(pane: any): void;
        destroy(): void;
        expand(pane: any): void;
        max(pane: any, value: string): void;
        min(pane: any, value: string): void;
        size(pane: any, value: string): void;
        toggle(pane: any, expand: bool): void;
    }

    interface SplitterPane {
        collapsed?: bool;
        collapsible?: bool;
        contentUrl?: string;
        max?: string;
        min?: string;
        resizable?: bool;
        scrollable?: bool;
        size?: string;
    }

    interface SplitterOptions {
        orientation?: string;
        panes?: SplitterPane[];
        collapse?(e: SplitterCollapseEvent): void;
        contentLoad?(e: SplitterContentLoadEvent): void;
        expand?(e: SplitterExpandEvent): void;
        layoutChange?(e: SplitterEvent): void;
        resize?(e: SplitterEvent): void;
    }

    interface SplitterEvent {
        sender: Splitter;
    }

    interface SplitterCollapseEvent extends SplitterEvent {
        pane?: Element;
    }

    interface SplitterContentLoadEvent extends SplitterEvent {
        pane?: Element;
    }

    interface SplitterExpandEvent extends SplitterEvent {
        pane?: Element;
    }


    class TabStrip extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: TabStripOptions);
        options: TabStripOptions;
        activateTab(item: string): bool;
        append(tab: string): kendo.ui.TabStrip;
        contentElement(itemIndex: number): Element;
        contentHolder(itemIndex: number): Element;
        deactivateTab(item: string): void;
        destroy(): void;
        disable(element: string): kendo.ui.TabStrip;
        enable(element: string, enable?: bool): kendo.ui.TabStrip;
        insertAfter(item: string, referenceTab: string): kendo.ui.TabStrip;
        insertBefore(item: string, referenceTab: string): kendo.ui.TabStrip;
        reload(element: string): kendo.ui.TabStrip;
        remove(element: string): kendo.ui.TabStrip;
        select(): JQuery;
        select(element: any): void;
    }

    interface TabStripAnimationClose {
        duration?: number;
        effects?: string;
    }

    interface TabStripAnimationOpen {
        duration?: number;
        effects?: string;
        show?: bool;
    }

    interface TabStripAnimation {
        close?: TabStripAnimationClose;
        open?: TabStripAnimationOpen;
    }

    interface TabStripOptions {
        animation?: TabStripAnimation;
        collapsible?: bool;
        dataContentField?: string;
        dataContentUrlField?: string;
        dataImageUrlField?: string;
        dataSpriteCssClass?: string;
        dataTextField?: string;
        dataUrlField?: string;
        activate?(e: TabStripActivateEvent): void;
        contentLoad?(e: TabStripContentLoadEvent): void;
        error?(e: TabStripErrorEvent): void;
        select?(e: TabStripSelectEvent): void;
    }

    interface TabStripEvent {
        sender: TabStrip;
    }

    interface TabStripActivateEvent extends TabStripEvent {
        item?: Element;
        contentElement?: Element;
    }

    interface TabStripContentLoadEvent extends TabStripEvent {
        item?: Element;
        contentElement?: Element;
    }

    interface TabStripErrorEvent extends TabStripEvent {
        xhr?: JQueryXHR;
        status?: string;
    }

    interface TabStripSelectEvent extends TabStripEvent {
        item?: Element;
        contentElement?: Element;
    }


    class TimePicker extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: TimePickerOptions);
        options: TimePickerOptions;
        close(): void;
        destroy(): void;
        enable(enable: bool): void;
        max(): Date;
        max(value: any): void;
        min(): Date;
        min(value: any): void;
        open(): void;
        value(): Date;
        value(value: any): void;
    }

    interface TimePickerAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface TimePickerAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface TimePickerAnimation {
        close?: TimePickerAnimationClose;
        open?: TimePickerAnimationOpen;
    }

    interface TimePickerOptions {
        animation?: TimePickerAnimation;
        culture?: string;
        dates?: any;
        format?: string;
        interval?: number;
        max?: Date;
        min?: Date;
        parseFormats?: any;
        value?: Date;
        change?(e: TimePickerEvent): void;
        close?(e: TimePickerEvent): void;
        open?(e: TimePickerEvent): void;
    }

    interface TimePickerEvent {
        sender: TimePicker;
    }


    class Tooltip extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: TooltipOptions);
        options: TooltipOptions;
        show(element: JQuery): void;
        hide(): void;
        target(): JQuery;
    }

    interface TooltipAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface TooltipAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface TooltipAnimation {
        close?: TooltipAnimationClose;
        open?: TooltipAnimationOpen;
    }

    interface TooltipContent {
        url?: string;
    }

    interface TooltipOptions {
        autoHide?: bool;
        animation?: TooltipAnimation;
        content?: TooltipContent;
        callout?: bool;
        filter?: string;
        iframe?: bool;
        height?: number;
        width?: number;
        position?: string;
        showAfter?: number;
        showOn?: string;
        contentLoad?(e: TooltipEvent): void;
        show?(e: TooltipEvent): void;
        hide?(e: TooltipEvent): void;
        requestStart?(e: TooltipRequestStartEvent): void;
        error?(e: TooltipErrorEvent): void;
    }

    interface TooltipEvent {
        sender: Tooltip;
    }

    interface TooltipRequestStartEvent extends TooltipEvent {
        target?: JQuery;
        options?: any;
    }

    interface TooltipErrorEvent extends TooltipEvent {
        xhr?: JQueryXHR;
        status?: string;
    }


    class Touch extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: TouchOptions);
        options: TouchOptions;
        destroy(): void;
    }

    interface TouchOptions {
        global?: bool;
        multiTouch?: bool;
        enableSwipe?: bool;
        minXDelta?: number;
        maxYDelta?: number;
        maxDuration?: number;
        minHold?: number;
        doubleTapTimeout?: number;
        touchstart?(e: TouchTouchstartEvent): void;
        dragstart?(e: TouchDragstartEvent): void;
        drag?(e: TouchDragEvent): void;
        dragend?(e: TouchDragendEvent): void;
        tap?(e: TouchTapEvent): void;
        doubletap?(e: TouchDoubletapEvent): void;
        hold?(e: TouchHoldEvent): void;
        swipe?(e: TouchSwipeEvent): void;
        gesturestart?(e: TouchGesturestartEvent): void;
        gesturechange?(e: TouchGesturechangeEvent): void;
        gestureend?(e: TouchGestureendEvent): void;
    }

    interface TouchEvent {
        sender: Touch;
    }

    interface TouchTouchstartEvent extends TouchEvent {
        touch?: kendo.mobile.ui.TouchEventOptions;
        event?: JQueryEventObject;
    }

    interface TouchDragstartEvent extends TouchEvent {
        touch?: kendo.mobile.ui.TouchEventOptions;
        event?: JQueryEventObject;
    }

    interface TouchDragEvent extends TouchEvent {
        touch?: kendo.mobile.ui.TouchEventOptions;
        event?: JQueryEventObject;
    }

    interface TouchDragendEvent extends TouchEvent {
        touch?: kendo.mobile.ui.TouchEventOptions;
        event?: JQueryEventObject;
    }

    interface TouchTapEvent extends TouchEvent {
        touch?: kendo.mobile.ui.TouchEventOptions;
        event?: JQueryEventObject;
    }

    interface TouchDoubletapEvent extends TouchEvent {
        touch?: kendo.mobile.ui.TouchEventOptions;
        event?: JQueryEventObject;
    }

    interface TouchHoldEvent extends TouchEvent {
        touch?: kendo.mobile.ui.TouchEventOptions;
        event?: JQueryEventObject;
    }

    interface TouchSwipeEvent extends TouchEvent {
        touch?: kendo.mobile.ui.TouchEventOptions;
        event?: JQueryEventObject;
    }

    interface TouchGesturestartEvent extends TouchEvent {
        touches?: any;
        event?: JQueryEventObject;
        distance?: number;
        center?: kendo.mobile.ui.Point;
    }

    interface TouchGesturechangeEvent extends TouchEvent {
        touches?: any;
        event?: JQueryEventObject;
        distance?: number;
        center?: kendo.mobile.ui.Point;
    }

    interface TouchGestureendEvent extends TouchEvent {
        touches?: any;
        event?: JQueryEventObject;
        distance?: number;
        center?: kendo.mobile.ui.Point;
    }


    class TreeView extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: TreeViewOptions);
        options: TreeViewOptions;
        dataSource: kendo.data.DataSource;
        append(nodeData: any, parentNode?: Element): void;
        collapse(nodes: string): void;
        dataItem(node: any): void;
        destroy(): void;
        detach(node: string): JQuery;
        enable(nodes: string, enable?: bool): void;
        expand(nodes: string): void;
        findByText(text: string): JQuery;
        findByUid(text: string): JQuery;
        insertAfter(nodeData: any, referenceNode: Element): void;
        insertBefore(nodeData: any, referenceNode: Element): void;
        parent(node: Element): void;
        remove(node: string): void;
        select(): JQuery;
        select(node?: any): void;
        setDataSource(dataSource: kendo.data.HierarchicalDataSource): void;
        text(): string;
        text(node: string, newText: string): void;
        toggle(node: string): void;
    }

    interface TreeViewAnimationCollapse {
        duration?: number;
        effects?: string;
    }

    interface TreeViewAnimationExpand {
        duration?: number;
        effects?: string;
        show?: bool;
    }

    interface TreeViewAnimation {
        collapse?: TreeViewAnimationCollapse;
        expand?: TreeViewAnimationExpand;
    }

    interface TreeViewCheckboxes {
        name?: string;
        checkChildren?: bool;
        template?: any;
    }

    interface TreeViewOptions {
        animation?: TreeViewAnimation;
        checkboxes?: TreeViewCheckboxes;
        dataImageUrlField?: string;
        dataSource?: any;
        dataSpriteCssClassField?: string;
        dataTextField?: any;
        dataUrlField?: string;
        dragAndDrop?: bool;
        loadOnDemand?: bool;
        template?: any;
        collapse?(e: TreeViewCollapseEvent): void;
        dataBound?(e: TreeViewDataBoundEvent): void;
        drag?(e: TreeViewDragEvent): void;
        dragend?(e: TreeViewDragendEvent): void;
        dragstart?(e: TreeViewDragstartEvent): void;
        drop?(e: TreeViewDropEvent): void;
        expand?(e: TreeViewExpandEvent): void;
        select?(e: TreeViewSelectEvent): void;
        navigate?(e: TreeViewNavigateEvent): void;
    }

    interface TreeViewEvent {
        sender: TreeView;
    }

    interface TreeViewCollapseEvent extends TreeViewEvent {
        node?: Element;
    }

    interface TreeViewDataBoundEvent extends TreeViewEvent {
        node?: JQuery;
    }

    interface TreeViewDragEvent extends TreeViewEvent {
        sourceNode?: Element;
        dropTarget?: Element;
        pageX?: number;
        pageY?: number;
        statusClass?: string;
        setStatusClass?: Function;
    }

    interface TreeViewDragendEvent extends TreeViewEvent {
        sourceNode?: Element;
        destinationNode?: Element;
        dropPosition?: string;
    }

    interface TreeViewDragstartEvent extends TreeViewEvent {
        sourceNode?: Element;
    }

    interface TreeViewDropEvent extends TreeViewEvent {
        sourceNode?: Element;
        destinationNode?: Element;
        valid?: bool;
        setValid?: Function;
        dropTarget?: Element;
        dropPosition?: string;
    }

    interface TreeViewExpandEvent extends TreeViewEvent {
        node?: Element;
    }

    interface TreeViewSelectEvent extends TreeViewEvent {
        node?: Element;
    }

    interface TreeViewNavigateEvent extends TreeViewEvent {
        node?: Element;
    }


    class Upload extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: UploadOptions);
        options: UploadOptions;
        destroy(): void;
        disable(): void;
        enable(enable: bool): void;
        toggle(enable: bool): void;
    }

    interface UploadAsync {
        autoUpload?: bool;
        batch?: bool;
        removeField?: string;
        removeUrl?: string;
        removeVerb?: string;
        saveField?: string;
        saveUrl?: string;
    }

    interface UploadLocalization {
        cancel?: string;
        dropFilesHere?: string;
        remove?: string;
        retry?: string;
        select?: string;
        statusFailed?: string;
        statusUploaded?: string;
        statusUploading?: string;
        uploadSelectedFiles?: string;
    }

    interface UploadOptions {
        async?: UploadAsync;
        enabled?: bool;
        localization?: UploadLocalization;
        multiple?: bool;
        showFileList?: bool;
        cancel?(e: UploadCancelEvent): void;
        complete?(e: UploadEvent): void;
        error?(e: UploadErrorEvent): void;
        progress?(e: UploadProgressEvent): void;
        remove?(e: UploadRemoveEvent): void;
        select?(e: UploadSelectEvent): void;
        success?(e: UploadSuccessEvent): void;
        upload?(e: UploadUploadEvent): void;
    }

    interface UploadEvent {
        sender: Upload;
    }

    interface UploadCancelEvent extends UploadEvent {
        files?: any;
    }

    interface UploadErrorEvent extends UploadEvent {
        files?: any;
        operation?: string;
        XMLHttpRequest?: any;
    }

    interface UploadProgressEvent extends UploadEvent {
        files?: any;
        percentComplete?: number;
    }

    interface UploadRemoveEvent extends UploadEvent {
        files?: any;
        data?: any;
    }

    interface UploadSelectEvent extends UploadEvent {
        e?: any;
        files?: any;
        preventDefault: Function;
    }

    interface UploadSuccessEvent extends UploadEvent {
        files?: any;
        operation?: string;
        response?: string;
        XMLHttpRequest?: any;
    }

    interface UploadUploadEvent extends UploadEvent {
        files?: any;
        data?: any;
        preventDefault: Function;
        isDefaultPrevented: () => bool;
    }


    class Validator extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ValidatorOptions);
        options: ValidatorOptions;
        errors(): any;
        validate(): bool;
        validateInput(input: Element): bool;
    }

    interface ValidatorOptions {
        messages?: any;
        rules?: any;
        validateOnBlur?: bool;
    }

    interface ValidatorEvent {
        sender: Validator;
    }


    class Window extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: WindowOptions);
        options: WindowOptions;
        center(): kendo.ui.Window;
        close(): kendo.ui.Window;
        content(): kendo.ui.Window;
        content(content: string): void;
        destroy(): void;
        maximize(): kendo.ui.Window;
        minimize(): kendo.ui.Window;
        open(): kendo.ui.Window;
        refresh(options: WindowRefreshOptions): kendo.ui.Window;
        restore(): kendo.ui.Window;
        setOptions(): void;
        title(): kendo.ui.Window;
        title(text: string): void;
        toFront(): kendo.ui.Window;
        toggleMaximization(): kendo.ui.Window;
    }

    interface WindowAnimationClose {
        effects?: string;
        duration?: number;
    }

    interface WindowAnimationOpen {
        effects?: string;
        duration?: number;
    }

    interface WindowAnimation {
        close?: WindowAnimationClose;
        open?: WindowAnimationOpen;
    }

    interface WindowContent {
        template?: string;
    }

    interface WindowRefreshOptions {
        url?: string;
        data?: any;
        type?: string;
        template?: string;
        iframe?: bool;
    }

    interface WindowOptions {
        actions?: any;
        animation?: WindowAnimation;
        appendTo?: any;
        content?: WindowContent;
        draggable?: bool;
        iframe?: bool;
        maxHeight?: number;
        maxWidth?: number;
        minHeight?: number;
        minWidth?: number;
        modal?: bool;
        resizable?: bool;
        title?: any;
        visible?: bool;
        width?: number;
        height?: number;
        activate?(e: WindowEvent): void;
        close?(e: WindowEvent): void;
        deactivate?(e: WindowEvent): void;
        dragend?(e: WindowEvent): void;
        dragstart?(e: WindowEvent): void;
        error?(e: WindowErrorEvent): void;
        open?(e: WindowEvent): void;
        refresh?(e: WindowEvent): void;
        resize?(e: WindowEvent): void;
    }

    interface WindowEvent {
        sender: Window;
    }

    interface WindowErrorEvent extends WindowEvent {
        xhr?: JQueryXHR;
        status?: string;
    }


}
module kendo.dataviz.ui {
    class Chart extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ChartOptions);
        options: ChartOptions;
        dataSource: kendo.data.DataSource;
        destroy(): void;
        refresh(): void;
        setDataSource(dataSource: kendo.data.DataSource): void;
        svg(): string;
    }

    interface ChartCategoryAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface ChartCategoryAxisItemCrosshairTooltip {
        background?: string;
        border?: ChartCategoryAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface ChartCategoryAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: ChartCategoryAxisItemCrosshairTooltip;
    }

    interface ChartCategoryAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartCategoryAxisItemLabels {
        background?: string;
        border?: ChartCategoryAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
        culture?: string;
        dateFormats?: any;
    }

    interface ChartCategoryAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartCategoryAxisItemMajorGridLines {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartCategoryAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface ChartCategoryAxisItemMinorGridLines {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartCategoryAxisItemMinorTicks {
        size?: number;
        visible?: bool;
    }

    interface ChartCategoryAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface ChartCategoryAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartCategoryAxisItemTitle {
        background?: string;
        border?: ChartCategoryAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface ChartCategoryAxisItem {
        axisCrossingValue?: any;
        categories?: any;
        color?: string;
        field?: string;
        justified?: bool;
        labels?: ChartCategoryAxisItemLabels;
        line?: ChartCategoryAxisItemLine;
        majorGridLines?: ChartCategoryAxisItemMajorGridLines;
        majorTicks?: ChartCategoryAxisItemMajorTicks;
        minorGridLines?: ChartCategoryAxisItemMinorGridLines;
        minorTicks?: ChartCategoryAxisItemMinorTicks;
        name?: string;
        pane?: string;
        plotBands?: ChartCategoryAxisItemPlotBand[];
        reverse?: bool;
        title?: ChartCategoryAxisItemTitle;
        type?: string;
        autoBaseUnitSteps?: any;
        baseUnit?: string;
        baseUnitStep?: any;
        max?: any;
        min?: any;
        roundToBaseUnit?: bool;
        weekStartDay?: number;
        maxDateGroups?: number;
        visible?: bool;
        crosshair?: ChartCategoryAxisItemCrosshair;
    }

    interface ChartChartAreaBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartChartArea {
        background?: string;
        opacity?: number;
        border?: ChartChartAreaBorder;
        height?: number;
        margin?: any;
        width?: number;
    }

    interface ChartLegendBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartLegendLabels {
        color?: string;
        font?: string;
        template?: string;
    }

    interface ChartLegend {
        background?: string;
        border?: ChartLegendBorder;
        labels?: ChartLegendLabels;
        margin?: any;
        offsetX?: number;
        offsetY?: number;
        padding?: any;
        position?: string;
        visible?: bool;
    }

    interface ChartPaneBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartPaneTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartPaneTitle {
        background?: string;
        border?: ChartPaneTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        position?: string;
        text?: string;
        visible?: bool;
    }

    interface ChartPane {
        name?: string;
        margin?: any;
        padding?: any;
        background?: string;
        border?: ChartPaneBorder;
        height?: number;
        title?: ChartPaneTitle;
    }

    interface ChartPlotAreaBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartPlotArea {
        background?: string;
        opacity?: number;
        border?: ChartPlotAreaBorder;
        margin?: any;
    }

    interface ChartSeriesItemBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartSeriesItemConnectors {
        color?: string;
        padding?: number;
        width?: number;
    }

    interface ChartSeriesItemHighlightBorder {
        width?: number;
        color?: string;
        opacity?: number;
    }

    interface ChartSeriesItemHighlightLine {
        width?: number;
        color?: string;
        opacity?: number;
    }

    interface ChartSeriesItemHighlight {
        border?: ChartSeriesItemHighlightBorder;
        color?: string;
        line?: ChartSeriesItemHighlightLine;
        opacity?: number;
    }

    interface ChartSeriesItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartSeriesItemLabels {
        align?: string;
        background?: string;
        border?: ChartSeriesItemLabelsBorder;
        color?: string;
        distance?: number;
        font?: string;
        format?: string;
        margin?: any;
        padding?: any;
        position?: string;
        template?: any;
        visible?: bool;
    }

    interface ChartSeriesItemLine {
        color?: string;
        opacity?: number;
        width?: string;
    }

    interface ChartSeriesItemMarkersBorder {
        color?: string;
        width?: number;
    }

    interface ChartSeriesItemMarkers {
        background?: string;
        border?: ChartSeriesItemMarkersBorder;
        size?: number;
        type?: string;
        visible?: bool;
    }

    interface ChartSeriesItemNegativeValues {
        color?: string;
        visible?: bool;
    }

    interface ChartSeriesItemOverlay {
        gradient?: string;
    }

    interface ChartSeriesItemTargetBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartSeriesItemTargetLine {
        width?: any;
    }

    interface ChartSeriesItemTarget {
        line?: ChartSeriesItemTargetLine;
        color?: string;
        border?: ChartSeriesItemTargetBorder;
    }

    interface ChartSeriesItemTooltipBorder {
        color?: string;
        width?: number;
    }

    interface ChartSeriesItemTooltip {
        background?: string;
        border?: ChartSeriesItemTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface ChartSeriesItem {
        type?: string;
        dashType?: string;
        data?: any;
        explodeField?: string;
        highField?: string;
        holeSize?: number;
        field?: string;
        groupNameTemplate?: string;
        name?: string;
        highlight?: ChartSeriesItemHighlight;
        aggregate?: string;
        axis?: string;
        border?: ChartSeriesItemBorder;
        categoryField?: string;
        closeField?: string;
        color?: string;
        colorField?: string;
        connectors?: ChartSeriesItemConnectors;
        downColor?: string;
        downColorField?: string;
        gap?: number;
        labels?: ChartSeriesItemLabels;
        line?: ChartSeriesItemLine;
        lowField?: string;
        margin?: number;
        markers?: ChartSeriesItemMarkers;
        maxSize?: number;
        minSize?: number;
        missingValues?: string;
        negativeColor?: string;
        negativeValues?: ChartSeriesItemNegativeValues;
        opacity?: number;
        openField?: string;
        overlay?: ChartSeriesItemOverlay;
        padding?: number;
        size?: number;
        startAngle?: number;
        sizeField?: string;
        spacing?: number;
        stack?: any;
        tooltip?: ChartSeriesItemTooltip;
        visibleInLegendField?: string;
        width?: number;
        xAxis?: string;
        xField?: string;
        yAxis?: string;
        yField?: string;
        currentField?: string;
        targetField?: string;
        target?: ChartSeriesItemTarget;
    }

    interface ChartSeriesDefaultsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartSeriesDefaultsLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartSeriesDefaultsLabels {
        background?: string;
        border?: ChartSeriesDefaultsLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface ChartSeriesDefaultsTooltipBorder {
        color?: string;
        width?: number;
    }

    interface ChartSeriesDefaultsTooltip {
        background?: string;
        border?: ChartSeriesDefaultsTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface ChartSeriesDefaults {
        area?: any;
        candlestick?: any;
        ohlc?: any;
        bar?: any;
        border?: ChartSeriesDefaultsBorder;
        bubble?: any;
        column?: any;
        donut?: any;
        gap?: number;
        labels?: ChartSeriesDefaultsLabels;
        line?: any;
        overlay?: any;
        pie?: any;
        scatter?: any;
        scatterLine?: any;
        spacing?: number;
        stack?: bool;
        tooltip?: ChartSeriesDefaultsTooltip;
        verticalArea?: any;
        verticalLine?: any;
    }

    interface ChartTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartTitle {
        align?: string;
        background?: string;
        border?: ChartTitleBorder;
        font?: string;
        margin?: any;
        padding?: any;
        position?: string;
        text?: string;
        visible?: bool;
    }

    interface ChartTooltipBorder {
        color?: string;
        width?: number;
    }

    interface ChartTooltip {
        background?: string;
        border?: ChartTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
        shared?: bool;
        sharedTemplate?: string;
    }

    interface ChartValueAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface ChartValueAxisItemCrosshairTooltip {
        background?: string;
        border?: ChartValueAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface ChartValueAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: ChartValueAxisItemCrosshairTooltip;
    }

    interface ChartValueAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartValueAxisItemLabels {
        background?: string;
        border?: ChartValueAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
    }

    interface ChartValueAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartValueAxisItemMajorGridLines {
        color?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartValueAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface ChartValueAxisItemMinorGridLines {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartValueAxisItemMinorTicks {
        size?: number;
        visible?: bool;
    }

    interface ChartValueAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface ChartValueAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartValueAxisItemTitle {
        background?: string;
        border?: ChartValueAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        padding?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface ChartValueAxisItem {
        axisCrossingValue?: any;
        color?: string;
        labels?: ChartValueAxisItemLabels;
        line?: ChartValueAxisItemLine;
        majorGridLines?: ChartValueAxisItemMajorGridLines;
        majorTicks?: ChartValueAxisItemMajorTicks;
        majorUnit?: number;
        max?: number;
        min?: number;
        minorGridLines?: ChartValueAxisItemMinorGridLines;
        minorTicks?: ChartValueAxisItemMinorTicks;
        minorUnit?: number;
        name?: any;
        narrowRange?: bool;
        pane?: string;
        plotBands?: ChartValueAxisItemPlotBand[];
        reverse?: bool;
        title?: ChartValueAxisItemTitle;
        visible?: bool;
        crosshair?: ChartValueAxisItemCrosshair;
    }

    interface ChartXAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface ChartXAxisItemCrosshairTooltip {
        background?: string;
        border?: ChartXAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface ChartXAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: ChartXAxisItemCrosshairTooltip;
    }

    interface ChartXAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartXAxisItemLabels {
        background?: string;
        border?: ChartXAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
        culture?: string;
        dateFormats?: any;
    }

    interface ChartXAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartXAxisItemMajorGridLines {
        color?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartXAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface ChartXAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface ChartXAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartXAxisItemTitle {
        background?: string;
        border?: ChartXAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        padding?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface ChartXAxisItem {
        color?: string;
        type?: string;
        axisCrossingValue?: any;
        baseUnit?: string;
        labels?: ChartXAxisItemLabels;
        majorUnit?: number;
        max?: any;
        min?: any;
        minorUnit?: number;
        line?: ChartXAxisItemLine;
        majorGridLines?: ChartXAxisItemMajorGridLines;
        majorTicks?: ChartXAxisItemMajorTicks;
        name?: any;
        narrowRange?: bool;
        pane?: string;
        plotBands?: ChartXAxisItemPlotBand[];
        reverse?: bool;
        title?: ChartXAxisItemTitle;
        visible?: bool;
        crosshair?: ChartXAxisItemCrosshair;
    }

    interface ChartYAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface ChartYAxisItemCrosshairTooltip {
        background?: string;
        border?: ChartYAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface ChartYAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: ChartYAxisItemCrosshairTooltip;
    }

    interface ChartYAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartYAxisItemLabels {
        background?: string;
        border?: ChartYAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
        culture?: string;
        dateFormats?: any;
    }

    interface ChartYAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartYAxisItemMajorGridLines {
        color?: string;
        visible?: bool;
        width?: number;
    }

    interface ChartYAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface ChartYAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface ChartYAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface ChartYAxisItemTitle {
        background?: string;
        border?: ChartYAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        padding?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface ChartYAxisItem {
        type?: string;
        axisCrossingValue?: any;
        baseUnit?: string;
        color?: string;
        labels?: ChartYAxisItemLabels;
        majorUnit?: number;
        max?: any;
        min?: any;
        minorUnit?: number;
        line?: ChartYAxisItemLine;
        majorGridLines?: ChartYAxisItemMajorGridLines;
        majorTicks?: ChartYAxisItemMajorTicks;
        name?: any;
        narrowRange?: bool;
        pane?: string;
        plotBands?: ChartYAxisItemPlotBand[];
        reverse?: bool;
        title?: ChartYAxisItemTitle;
        visible?: bool;
        crosshair?: ChartYAxisItemCrosshair;
    }

    interface ChartSeriesClickEventSeries {
        type?: any;
        name?: any;
        data?: any;
    }

    interface ChartSeriesHoverEventSeries {
        type?: any;
        name?: any;
        data?: any;
    }

    interface ChartOptions {
        axisDefaults?: any;
        categoryAxis?: ChartCategoryAxisItem[];
        chartArea?: ChartChartArea;
        dataSource?: any;
        autoBind?: bool;
        legend?: ChartLegend;
        panes?: ChartPane[];
        plotArea?: ChartPlotArea;
        series?: ChartSeriesItem[];
        seriesColors?: any;
        seriesDefaults?: ChartSeriesDefaults;
        theme?: string;
        title?: ChartTitle;
        tooltip?: ChartTooltip;
        transitions?: bool;
        valueAxis?: ChartValueAxisItem[];
        xAxis?: ChartXAxisItem[];
        yAxis?: ChartYAxisItem[];
        axisLabelClick?(e: ChartAxisLabelClickEvent): void;
        dataBound?(e: ChartEvent): void;
        dragStart?(e: ChartDragStartEvent): void;
        drag?(e: ChartDragEvent): void;
        dragEnd?(e: ChartDragEndEvent): void;
        plotAreaClick?(e: ChartPlotAreaClickEvent): void;
        seriesClick?(e: ChartSeriesClickEvent): void;
        seriesHover?(e: ChartSeriesHoverEvent): void;
        zoomStart?(e: ChartZoomStartEvent): void;
        zoom?(e: ChartZoomEvent): void;
        zoomEnd?(e: ChartZoomEndEvent): void;
        selectStart?(e: ChartSelectStartEvent): void;
        select?(e: ChartSelectEvent): void;
        selectEnd?(e: ChartSelectEndEvent): void;
    }

    interface ChartEvent {
        sender: Chart;
    }

    interface ChartAxisLabelClickEvent extends ChartEvent {
        axis?: any;
        value?: any;
        text?: any;
        index?: any;
        dataItem?: any;
        element?: any;
    }

    interface ChartDragStartEvent extends ChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface ChartDragEvent extends ChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface ChartDragEndEvent extends ChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface ChartPlotAreaClickEvent extends ChartEvent {
        value?: any;
        category?: any;
        element?: any;
        x?: any;
        y?: any;
    }

    interface ChartSeriesClickEvent extends ChartEvent {
        value?: any;
        category?: any;
        series?: ChartSeriesClickEventSeries;
        dataItem?: any;
        element?: any;
    }

    interface ChartSeriesHoverEvent extends ChartEvent {
        value?: any;
        category?: any;
        series?: ChartSeriesHoverEventSeries;
        dataItem?: any;
        element?: any;
    }

    interface ChartZoomStartEvent extends ChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface ChartZoomEvent extends ChartEvent {
        axisRanges?: any;
        delta?: number;
        originalEvent?: any;
    }

    interface ChartZoomEndEvent extends ChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface ChartSelectStartEvent extends ChartEvent {
        from?: any;
        to?: any;
    }

    interface ChartSelectEvent extends ChartEvent {
        from?: any;
        to?: any;
    }

    interface ChartSelectEndEvent extends ChartEvent {
        from?: any;
        to?: any;
    }


    class LinearGauge extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: LinearGaugeOptions);
        options: LinearGaugeOptions;
        destroy(): void;
        redraw(): void;
        svg(): void;
        value(): void;
    }

    interface LinearGaugeGaugeAreaBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface LinearGaugeGaugeArea {
        background?: any;
        border?: LinearGaugeGaugeAreaBorder;
        height?: number;
        margin?: any;
        width?: number;
    }

    interface LinearGaugePointerBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface LinearGaugePointerTrackBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface LinearGaugePointerTrack {
        border?: LinearGaugePointerTrackBorder;
        color?: string;
        opacity?: number;
        size?: number;
        visible?: bool;
    }

    interface LinearGaugePointer {
        border?: LinearGaugePointerBorder;
        color?: string;
        margin?: any;
        opacity?: number;
        shape?: string;
        size?: number;
        track?: LinearGaugePointerTrack;
        value?: number;
    }

    interface LinearGaugeScaleLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface LinearGaugeScaleLabels {
        background?: string;
        border?: LinearGaugeScaleLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface LinearGaugeScaleLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface LinearGaugeScaleMajorTicks {
        color?: string;
        size?: number;
        visible?: bool;
        width?: number;
    }

    interface LinearGaugeScaleMinorTicks {
        color?: string;
        size?: number;
        visible?: bool;
        width?: number;
    }

    interface LinearGaugeScaleRange {
        from?: number;
        to?: number;
        opacity?: number;
        color?: string;
    }

    interface LinearGaugeScale {
        line?: LinearGaugeScaleLine;
        labels?: LinearGaugeScaleLabels;
        majorTicks?: LinearGaugeScaleMajorTicks;
        majorUnit?: number;
        max?: number;
        min?: number;
        minorTicks?: LinearGaugeScaleMinorTicks;
        minorUnit?: number;
        mirror?: bool;
        ranges?: LinearGaugeScaleRange[];
        reverse?: bool;
        vertical?: bool;
    }

    interface LinearGaugeOptions {
        gaugeArea?: LinearGaugeGaugeArea;
        pointer?: LinearGaugePointer;
        scale?: LinearGaugeScale;
        transitions?: bool;
    }

    interface LinearGaugeEvent {
        sender: LinearGauge;
    }


    class RadialGauge extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: RadialGaugeOptions);
        options: RadialGaugeOptions;
        destroy(): void;
        redraw(): void;
        svg(): void;
        value(): void;
    }

    interface RadialGaugeGaugeAreaBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface RadialGaugeGaugeArea {
        background?: any;
        border?: RadialGaugeGaugeAreaBorder;
        height?: number;
        margin?: any;
        width?: number;
    }

    interface RadialGaugePointerCap {
        color?: string;
        size?: number;
    }

    interface RadialGaugePointer {
        cap?: RadialGaugePointerCap;
        color?: string;
        value?: number;
    }

    interface RadialGaugeScaleLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface RadialGaugeScaleLabels {
        background?: string;
        border?: RadialGaugeScaleLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        padding?: any;
        position?: string;
        template?: any;
        visible?: bool;
    }

    interface RadialGaugeScaleMajorTicks {
        color?: string;
        size?: number;
        visible?: bool;
        width?: number;
    }

    interface RadialGaugeScaleMinorTicks {
        color?: string;
        size?: number;
        visible?: bool;
        width?: number;
    }

    interface RadialGaugeScaleRange {
        from?: number;
        to?: number;
        opacity?: number;
        color?: string;
    }

    interface RadialGaugeScale {
        endAngle?: number;
        labels?: RadialGaugeScaleLabels;
        majorTicks?: RadialGaugeScaleMajorTicks;
        majorUnit?: number;
        max?: number;
        min?: number;
        minorTicks?: RadialGaugeScaleMinorTicks;
        minorUnit?: number;
        ranges?: RadialGaugeScaleRange[];
        reverse?: bool;
        startAngle?: number;
    }

    interface RadialGaugeOptions {
        gaugeArea?: RadialGaugeGaugeArea;
        pointer?: RadialGaugePointer;
        rangeSize?: number;
        rangeDistance?: number;
        scale?: RadialGaugeScale;
        transitions?: bool;
    }

    interface RadialGaugeEvent {
        sender: RadialGauge;
    }


    class Sparkline extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: SparklineOptions);
        options: SparklineOptions;
        dataSource: kendo.data.DataSource;
        destroy(): void;
        refresh(): void;
        setDataSource(dataSource: kendo.data.DataSource): void;
        svg(): string;
    }

    interface SparklineCategoryAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface SparklineCategoryAxisItemCrosshairTooltip {
        background?: string;
        border?: SparklineCategoryAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface SparklineCategoryAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: SparklineCategoryAxisItemCrosshairTooltip;
    }

    interface SparklineCategoryAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineCategoryAxisItemLabels {
        background?: string;
        border?: SparklineCategoryAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
        culture?: string;
        dateFormats?: any;
    }

    interface SparklineCategoryAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface SparklineCategoryAxisItemMajorGridLines {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface SparklineCategoryAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface SparklineCategoryAxisItemMinorGridLines {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface SparklineCategoryAxisItemMinorTicks {
        size?: number;
        visible?: bool;
    }

    interface SparklineCategoryAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface SparklineCategoryAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineCategoryAxisItemTitle {
        background?: string;
        border?: SparklineCategoryAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface SparklineCategoryAxisItem {
        axisCrossingValue?: any;
        categories?: any;
        color?: string;
        field?: string;
        justified?: bool;
        labels?: SparklineCategoryAxisItemLabels;
        line?: SparklineCategoryAxisItemLine;
        majorGridLines?: SparklineCategoryAxisItemMajorGridLines;
        majorTicks?: SparklineCategoryAxisItemMajorTicks;
        minorGridLines?: SparklineCategoryAxisItemMinorGridLines;
        minorTicks?: SparklineCategoryAxisItemMinorTicks;
        name?: string;
        plotBands?: SparklineCategoryAxisItemPlotBand[];
        reverse?: bool;
        title?: SparklineCategoryAxisItemTitle;
        type?: string;
        autoBaseUnitSteps?: any;
        baseUnit?: string;
        baseUnitStep?: any;
        max?: any;
        min?: any;
        roundToBaseUnit?: bool;
        weekStartDay?: number;
        maxDateGroups?: number;
        visible?: bool;
        crosshair?: SparklineCategoryAxisItemCrosshair;
    }

    interface SparklineChartAreaBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineChartArea {
        background?: string;
        opacity?: number;
        border?: SparklineChartAreaBorder;
        height?: number;
        margin?: any;
        width?: number;
    }

    interface SparklinePlotAreaBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklinePlotArea {
        background?: string;
        opacity?: number;
        border?: SparklinePlotAreaBorder;
        margin?: any;
    }

    interface SparklineSeriesItemBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineSeriesItemConnectors {
        color?: string;
        padding?: number;
        width?: number;
    }

    interface SparklineSeriesItemHighlightBorder {
        width?: number;
        color?: string;
        opacity?: number;
    }

    interface SparklineSeriesItemHighlight {
        border?: SparklineSeriesItemHighlightBorder;
        color?: string;
        opacity?: number;
    }

    interface SparklineSeriesItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineSeriesItemLabels {
        align?: string;
        background?: string;
        border?: SparklineSeriesItemLabelsBorder;
        color?: string;
        distance?: number;
        font?: string;
        format?: string;
        margin?: any;
        padding?: any;
        position?: string;
        template?: any;
        visible?: bool;
    }

    interface SparklineSeriesItemLine {
        color?: string;
        opacity?: number;
        width?: string;
    }

    interface SparklineSeriesItemMarkersBorder {
        color?: string;
        width?: number;
    }

    interface SparklineSeriesItemMarkers {
        background?: string;
        border?: SparklineSeriesItemMarkersBorder;
        size?: number;
        type?: string;
        visible?: bool;
    }

    interface SparklineSeriesItemOverlay {
        gradient?: string;
    }

    interface SparklineSeriesItemTargetBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineSeriesItemTargetLine {
        width?: any;
    }

    interface SparklineSeriesItemTarget {
        line?: SparklineSeriesItemTargetLine;
        color?: string;
        border?: SparklineSeriesItemTargetBorder;
    }

    interface SparklineSeriesItemTooltipBorder {
        color?: string;
        width?: number;
    }

    interface SparklineSeriesItemTooltip {
        background?: string;
        border?: SparklineSeriesItemTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface SparklineSeriesItem {
        type?: string;
        dashType?: string;
        data?: any;
        explodeField?: string;
        currentField?: string;
        targetField?: string;
        field?: string;
        groupNameTemplate?: string;
        name?: string;
        highlight?: SparklineSeriesItemHighlight;
        aggregate?: string;
        axis?: string;
        border?: SparklineSeriesItemBorder;
        categoryField?: string;
        color?: string;
        colorField?: string;
        connectors?: SparklineSeriesItemConnectors;
        gap?: number;
        labels?: SparklineSeriesItemLabels;
        line?: SparklineSeriesItemLine;
        markers?: SparklineSeriesItemMarkers;
        missingValues?: string;
        negativeColor?: string;
        opacity?: number;
        overlay?: SparklineSeriesItemOverlay;
        padding?: number;
        size?: number;
        startAngle?: number;
        spacing?: number;
        stack?: any;
        tooltip?: SparklineSeriesItemTooltip;
        width?: number;
        target?: SparklineSeriesItemTarget;
    }

    interface SparklineSeriesDefaultsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineSeriesDefaultsLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineSeriesDefaultsLabels {
        background?: string;
        border?: SparklineSeriesDefaultsLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface SparklineSeriesDefaultsTooltipBorder {
        color?: string;
        width?: number;
    }

    interface SparklineSeriesDefaultsTooltip {
        background?: string;
        border?: SparklineSeriesDefaultsTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface SparklineSeriesDefaults {
        area?: any;
        bar?: any;
        border?: SparklineSeriesDefaultsBorder;
        column?: any;
        gap?: number;
        labels?: SparklineSeriesDefaultsLabels;
        line?: any;
        overlay?: any;
        pie?: any;
        spacing?: number;
        stack?: bool;
        tooltip?: SparklineSeriesDefaultsTooltip;
    }

    interface SparklineTooltipBorder {
        color?: string;
        width?: number;
    }

    interface SparklineTooltip {
        background?: string;
        border?: SparklineTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
        shared?: bool;
        sharedTemplate?: string;
    }

    interface SparklineValueAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface SparklineValueAxisItemCrosshairTooltip {
        background?: string;
        border?: SparklineValueAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface SparklineValueAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: SparklineValueAxisItemCrosshairTooltip;
    }

    interface SparklineValueAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineValueAxisItemLabels {
        background?: string;
        border?: SparklineValueAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
    }

    interface SparklineValueAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface SparklineValueAxisItemMajorGridLines {
        color?: string;
        visible?: bool;
        width?: number;
    }

    interface SparklineValueAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface SparklineValueAxisItemMinorGridLines {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface SparklineValueAxisItemMinorTicks {
        size?: number;
        visible?: bool;
    }

    interface SparklineValueAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface SparklineValueAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface SparklineValueAxisItemTitle {
        background?: string;
        border?: SparklineValueAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        padding?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface SparklineValueAxisItem {
        axisCrossingValue?: any;
        color?: string;
        labels?: SparklineValueAxisItemLabels;
        line?: SparklineValueAxisItemLine;
        majorGridLines?: SparklineValueAxisItemMajorGridLines;
        majorTicks?: SparklineValueAxisItemMajorTicks;
        majorUnit?: number;
        max?: number;
        min?: number;
        minorGridLines?: SparklineValueAxisItemMinorGridLines;
        minorTicks?: SparklineValueAxisItemMinorTicks;
        minorUnit?: number;
        name?: any;
        narrowRange?: bool;
        plotBands?: SparklineValueAxisItemPlotBand[];
        reverse?: bool;
        title?: SparklineValueAxisItemTitle;
        visible?: bool;
        crosshair?: SparklineValueAxisItemCrosshair;
    }

    interface SparklineSeriesClickEventSeries {
        type?: any;
        name?: any;
        data?: any;
    }

    interface SparklineSeriesHoverEventSeries {
        type?: any;
        name?: any;
        data?: any;
    }

    interface SparklineOptions {
        axisDefaults?: any;
        categoryAxis?: SparklineCategoryAxisItem[];
        chartArea?: SparklineChartArea;
        data?: any;
        dataSource?: any;
        autoBind?: bool;
        plotArea?: SparklinePlotArea;
        pointWidth?: number;
        series?: SparklineSeriesItem[];
        seriesColors?: any;
        seriesDefaults?: SparklineSeriesDefaults;
        theme?: string;
        tooltip?: SparklineTooltip;
        transitions?: bool;
        type?: string;
        valueAxis?: SparklineValueAxisItem[];
        axisLabelClick?(e: SparklineAxisLabelClickEvent): void;
        dataBound?(e: SparklineEvent): void;
        dragStart?(e: SparklineDragStartEvent): void;
        drag?(e: SparklineDragEvent): void;
        dragEnd?(e: SparklineDragEndEvent): void;
        plotAreaClick?(e: SparklinePlotAreaClickEvent): void;
        seriesClick?(e: SparklineSeriesClickEvent): void;
        seriesHover?(e: SparklineSeriesHoverEvent): void;
        zoomStart?(e: SparklineZoomStartEvent): void;
        zoom?(e: SparklineZoomEvent): void;
        zoomEnd?(e: SparklineZoomEndEvent): void;
    }

    interface SparklineEvent {
        sender: Sparkline;
    }

    interface SparklineAxisLabelClickEvent extends SparklineEvent {
        axis?: any;
        value?: any;
        text?: any;
        index?: any;
        dataItem?: any;
        element?: any;
    }

    interface SparklineDragStartEvent extends SparklineEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface SparklineDragEvent extends SparklineEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface SparklineDragEndEvent extends SparklineEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface SparklinePlotAreaClickEvent extends SparklineEvent {
        value?: any;
        category?: any;
        element?: any;
        x?: any;
        y?: any;
    }

    interface SparklineSeriesClickEvent extends SparklineEvent {
        value?: any;
        category?: any;
        series?: SparklineSeriesClickEventSeries;
        dataItem?: any;
        element?: any;
    }

    interface SparklineSeriesHoverEvent extends SparklineEvent {
        value?: any;
        category?: any;
        series?: SparklineSeriesHoverEventSeries;
        dataItem?: any;
        element?: any;
    }

    interface SparklineZoomStartEvent extends SparklineEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface SparklineZoomEvent extends SparklineEvent {
        axisRanges?: any;
        delta?: number;
        originalEvent?: any;
    }

    interface SparklineZoomEndEvent extends SparklineEvent {
        axisRanges?: any;
        originalEvent?: any;
    }


    class StockChart extends kendo.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: StockChartOptions);
        options: StockChartOptions;
        dataSource: kendo.data.DataSource;
    }

    interface StockChartCategoryAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface StockChartCategoryAxisItemCrosshairTooltip {
        background?: string;
        border?: StockChartCategoryAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface StockChartCategoryAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: StockChartCategoryAxisItemCrosshairTooltip;
    }

    interface StockChartCategoryAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartCategoryAxisItemLabels {
        background?: string;
        border?: StockChartCategoryAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
        culture?: string;
        dateFormats?: any;
    }

    interface StockChartCategoryAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartCategoryAxisItemMajorGridLines {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartCategoryAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface StockChartCategoryAxisItemMinorGridLines {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartCategoryAxisItemMinorTicks {
        size?: number;
        visible?: bool;
    }

    interface StockChartCategoryAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface StockChartCategoryAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartCategoryAxisItemTitle {
        background?: string;
        border?: StockChartCategoryAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface StockChartCategoryAxisItem {
        axisCrossingValue?: any;
        categories?: any;
        color?: string;
        field?: string;
        justified?: bool;
        labels?: StockChartCategoryAxisItemLabels;
        line?: StockChartCategoryAxisItemLine;
        majorGridLines?: StockChartCategoryAxisItemMajorGridLines;
        majorTicks?: StockChartCategoryAxisItemMajorTicks;
        minorGridLines?: StockChartCategoryAxisItemMinorGridLines;
        minorTicks?: StockChartCategoryAxisItemMinorTicks;
        name?: string;
        pane?: string;
        plotBands?: StockChartCategoryAxisItemPlotBand[];
        reverse?: bool;
        title?: StockChartCategoryAxisItemTitle;
        type?: string;
        autoBaseUnitSteps?: any;
        baseUnit?: string;
        baseUnitStep?: any;
        max?: any;
        min?: any;
        roundToBaseUnit?: bool;
        weekStartDay?: number;
        maxDateGroups?: number;
        visible?: bool;
        crosshair?: StockChartCategoryAxisItemCrosshair;
    }

    interface StockChartChartAreaBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartChartArea {
        background?: string;
        opacity?: number;
        border?: StockChartChartAreaBorder;
        height?: number;
        margin?: any;
        width?: number;
    }

    interface StockChartLegendBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartLegendLabels {
        color?: string;
        font?: string;
        template?: string;
    }

    interface StockChartLegend {
        background?: string;
        border?: StockChartLegendBorder;
        labels?: StockChartLegendLabels;
        margin?: any;
        offsetX?: number;
        offsetY?: number;
        padding?: any;
        position?: string;
        visible?: bool;
    }

    interface StockChartNavigatorHint {
        visible?: bool;
        template?: any;
        format?: string;
    }

    interface StockChartNavigatorSelect {
        from?: Date;
        to?: Date;
    }

    interface StockChartNavigatorSeriesItemBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartNavigatorSeriesItemHighlightBorder {
        width?: number;
        color?: string;
        opacity?: number;
    }

    interface StockChartNavigatorSeriesItemHighlightLine {
        width?: number;
        color?: string;
        opacity?: number;
    }

    interface StockChartNavigatorSeriesItemHighlight {
        border?: StockChartNavigatorSeriesItemHighlightBorder;
        color?: string;
        line?: StockChartNavigatorSeriesItemHighlightLine;
        opacity?: number;
    }

    interface StockChartNavigatorSeriesItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartNavigatorSeriesItemLabels {
        background?: string;
        border?: StockChartNavigatorSeriesItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        padding?: any;
        position?: string;
        template?: any;
        visible?: bool;
    }

    interface StockChartNavigatorSeriesItemLine {
        color?: string;
        opacity?: number;
        width?: string;
    }

    interface StockChartNavigatorSeriesItemMarkersBorder {
        color?: string;
        width?: number;
    }

    interface StockChartNavigatorSeriesItemMarkers {
        background?: string;
        border?: StockChartNavigatorSeriesItemMarkersBorder;
        size?: number;
        type?: string;
        visible?: bool;
    }

    interface StockChartNavigatorSeriesItemOverlay {
        gradient?: string;
    }

    interface StockChartNavigatorSeriesItemTooltipBorder {
        color?: string;
        width?: number;
    }

    interface StockChartNavigatorSeriesItemTooltip {
        background?: string;
        border?: StockChartNavigatorSeriesItemTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface StockChartNavigatorSeriesItem {
        type?: string;
        dashType?: string;
        data?: any;
        highField?: string;
        field?: string;
        groupNameTemplate?: string;
        name?: string;
        highlight?: StockChartNavigatorSeriesItemHighlight;
        aggregate?: string;
        axis?: string;
        border?: StockChartNavigatorSeriesItemBorder;
        closeField?: string;
        color?: string;
        colorField?: string;
        downColor?: string;
        downColorField?: string;
        gap?: number;
        labels?: StockChartNavigatorSeriesItemLabels;
        line?: StockChartNavigatorSeriesItemLine;
        lowField?: string;
        markers?: StockChartNavigatorSeriesItemMarkers;
        missingValues?: string;
        opacity?: number;
        openField?: string;
        overlay?: StockChartNavigatorSeriesItemOverlay;
        spacing?: number;
        stack?: any;
        tooltip?: StockChartNavigatorSeriesItemTooltip;
        width?: number;
    }

    interface StockChartNavigator {
        dataSource?: any;
        autoBind?: bool;
        dateField?: string;
        visible?: bool;
        series?: StockChartNavigatorSeriesItem[];
        select?: StockChartNavigatorSelect;
        hint?: StockChartNavigatorHint;
    }

    interface StockChartPaneBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartPaneTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartPaneTitle {
        background?: string;
        border?: StockChartPaneTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        position?: string;
        text?: string;
        visible?: bool;
    }

    interface StockChartPane {
        name?: string;
        margin?: any;
        padding?: any;
        background?: string;
        border?: StockChartPaneBorder;
        height?: number;
        title?: StockChartPaneTitle;
    }

    interface StockChartPlotAreaBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartPlotArea {
        background?: string;
        opacity?: number;
        border?: StockChartPlotAreaBorder;
        margin?: any;
    }

    interface StockChartSeriesItemBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartSeriesItemHighlightBorder {
        width?: number;
        color?: string;
        opacity?: number;
    }

    interface StockChartSeriesItemHighlightLine {
        width?: number;
        color?: string;
        opacity?: number;
    }

    interface StockChartSeriesItemHighlight {
        border?: StockChartSeriesItemHighlightBorder;
        color?: string;
        line?: StockChartSeriesItemHighlightLine;
        opacity?: number;
    }

    interface StockChartSeriesItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartSeriesItemLabels {
        background?: string;
        border?: StockChartSeriesItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        padding?: any;
        position?: string;
        template?: any;
        visible?: bool;
    }

    interface StockChartSeriesItemLine {
        color?: string;
        opacity?: number;
        width?: string;
    }

    interface StockChartSeriesItemMarkersBorder {
        color?: string;
        width?: number;
    }

    interface StockChartSeriesItemMarkers {
        background?: string;
        border?: StockChartSeriesItemMarkersBorder;
        size?: number;
        type?: string;
        visible?: bool;
    }

    interface StockChartSeriesItemOverlay {
        gradient?: string;
    }

    interface StockChartSeriesItemTargetBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartSeriesItemTargetLine {
        width?: any;
    }

    interface StockChartSeriesItemTarget {
        line?: StockChartSeriesItemTargetLine;
        color?: string;
        border?: StockChartSeriesItemTargetBorder;
    }

    interface StockChartSeriesItemTooltipBorder {
        color?: string;
        width?: number;
    }

    interface StockChartSeriesItemTooltip {
        background?: string;
        border?: StockChartSeriesItemTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface StockChartSeriesItem {
        type?: string;
        dashType?: string;
        data?: any;
        highField?: string;
        field?: string;
        currentField?: string;
        targetField?: string;
        groupNameTemplate?: string;
        name?: string;
        highlight?: StockChartSeriesItemHighlight;
        aggregate?: string;
        axis?: string;
        border?: StockChartSeriesItemBorder;
        closeField?: string;
        color?: string;
        colorField?: string;
        downColor?: string;
        downColorField?: string;
        gap?: number;
        labels?: StockChartSeriesItemLabels;
        line?: StockChartSeriesItemLine;
        lowField?: string;
        markers?: StockChartSeriesItemMarkers;
        missingValues?: string;
        negativeColor?: string;
        opacity?: number;
        openField?: string;
        overlay?: StockChartSeriesItemOverlay;
        spacing?: number;
        stack?: any;
        tooltip?: StockChartSeriesItemTooltip;
        width?: number;
        target?: StockChartSeriesItemTarget;
    }

    interface StockChartSeriesDefaultsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartSeriesDefaultsLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartSeriesDefaultsLabels {
        background?: string;
        border?: StockChartSeriesDefaultsLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface StockChartSeriesDefaultsTooltipBorder {
        color?: string;
        width?: number;
    }

    interface StockChartSeriesDefaultsTooltip {
        background?: string;
        border?: StockChartSeriesDefaultsTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface StockChartSeriesDefaults {
        area?: any;
        candlestick?: any;
        ohlc?: any;
        border?: StockChartSeriesDefaultsBorder;
        column?: any;
        gap?: number;
        labels?: StockChartSeriesDefaultsLabels;
        line?: any;
        overlay?: any;
        pie?: any;
        spacing?: number;
        stack?: bool;
        tooltip?: StockChartSeriesDefaultsTooltip;
    }

    interface StockChartTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartTitle {
        align?: string;
        background?: string;
        border?: StockChartTitleBorder;
        font?: string;
        margin?: any;
        padding?: any;
        position?: string;
        text?: string;
        visible?: bool;
    }

    interface StockChartTooltipBorder {
        color?: string;
        width?: number;
    }

    interface StockChartTooltip {
        background?: string;
        border?: StockChartTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
        shared?: bool;
        sharedTemplate?: string;
    }

    interface StockChartValueAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface StockChartValueAxisItemCrosshairTooltip {
        background?: string;
        border?: StockChartValueAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface StockChartValueAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: StockChartValueAxisItemCrosshairTooltip;
    }

    interface StockChartValueAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartValueAxisItemLabels {
        background?: string;
        border?: StockChartValueAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
    }

    interface StockChartValueAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartValueAxisItemMajorGridLines {
        color?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartValueAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface StockChartValueAxisItemMinorGridLines {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartValueAxisItemMinorTicks {
        size?: number;
        visible?: bool;
    }

    interface StockChartValueAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface StockChartValueAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartValueAxisItemTitle {
        background?: string;
        border?: StockChartValueAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        padding?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface StockChartValueAxisItem {
        axisCrossingValue?: any;
        color?: string;
        labels?: StockChartValueAxisItemLabels;
        line?: StockChartValueAxisItemLine;
        majorGridLines?: StockChartValueAxisItemMajorGridLines;
        majorTicks?: StockChartValueAxisItemMajorTicks;
        majorUnit?: number;
        max?: number;
        min?: number;
        minorGridLines?: StockChartValueAxisItemMinorGridLines;
        minorTicks?: StockChartValueAxisItemMinorTicks;
        minorUnit?: number;
        name?: any;
        narrowRange?: bool;
        pane?: string;
        plotBands?: StockChartValueAxisItemPlotBand[];
        reverse?: bool;
        title?: StockChartValueAxisItemTitle;
        visible?: bool;
        crosshair?: StockChartValueAxisItemCrosshair;
    }

    interface StockChartXAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface StockChartXAxisItemCrosshairTooltip {
        background?: string;
        border?: StockChartXAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface StockChartXAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: StockChartXAxisItemCrosshairTooltip;
    }

    interface StockChartXAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartXAxisItemLabels {
        background?: string;
        border?: StockChartXAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
        culture?: string;
        dateFormats?: any;
    }

    interface StockChartXAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartXAxisItemMajorGridLines {
        color?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartXAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface StockChartXAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface StockChartXAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartXAxisItemTitle {
        background?: string;
        border?: StockChartXAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        padding?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface StockChartXAxisItem {
        color?: string;
        type?: string;
        axisCrossingValue?: any;
        baseUnit?: string;
        labels?: StockChartXAxisItemLabels;
        majorUnit?: number;
        max?: any;
        min?: any;
        minorUnit?: number;
        line?: StockChartXAxisItemLine;
        majorGridLines?: StockChartXAxisItemMajorGridLines;
        majorTicks?: StockChartXAxisItemMajorTicks;
        name?: any;
        narrowRange?: bool;
        pane?: string;
        plotBands?: StockChartXAxisItemPlotBand[];
        reverse?: bool;
        title?: StockChartXAxisItemTitle;
        visible?: bool;
        crosshair?: StockChartXAxisItemCrosshair;
    }

    interface StockChartYAxisItemCrosshairTooltipBorder {
        color?: string;
        width?: number;
    }

    interface StockChartYAxisItemCrosshairTooltip {
        background?: string;
        border?: StockChartYAxisItemCrosshairTooltipBorder;
        color?: string;
        font?: string;
        format?: string;
        padding?: any;
        template?: any;
        visible?: bool;
    }

    interface StockChartYAxisItemCrosshair {
        color?: string;
        width?: number;
        opacity?: number;
        dashType?: number;
        visible?: bool;
        tooltip?: StockChartYAxisItemCrosshairTooltip;
    }

    interface StockChartYAxisItemLabelsBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartYAxisItemLabels {
        background?: string;
        border?: StockChartYAxisItemLabelsBorder;
        color?: string;
        font?: string;
        format?: string;
        margin?: any;
        mirror?: bool;
        padding?: any;
        rotation?: number;
        skip?: number;
        step?: number;
        template?: any;
        visible?: bool;
        culture?: string;
        dateFormats?: any;
    }

    interface StockChartYAxisItemLine {
        color?: string;
        dashType?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartYAxisItemMajorGridLines {
        color?: string;
        visible?: bool;
        width?: number;
    }

    interface StockChartYAxisItemMajorTicks {
        size?: number;
        visible?: bool;
    }

    interface StockChartYAxisItemPlotBand {
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
    }

    interface StockChartYAxisItemTitleBorder {
        color?: string;
        dashType?: string;
        width?: number;
    }

    interface StockChartYAxisItemTitle {
        background?: string;
        border?: StockChartYAxisItemTitleBorder;
        color?: string;
        font?: string;
        margin?: any;
        padding?: any;
        position?: string;
        rotation?: number;
        text?: string;
        visible?: bool;
    }

    interface StockChartYAxisItem {
        type?: string;
        axisCrossingValue?: any;
        baseUnit?: string;
        color?: string;
        labels?: StockChartYAxisItemLabels;
        majorUnit?: number;
        max?: any;
        min?: any;
        minorUnit?: number;
        line?: StockChartYAxisItemLine;
        majorGridLines?: StockChartYAxisItemMajorGridLines;
        majorTicks?: StockChartYAxisItemMajorTicks;
        name?: any;
        narrowRange?: bool;
        pane?: string;
        plotBands?: StockChartYAxisItemPlotBand[];
        reverse?: bool;
        title?: StockChartYAxisItemTitle;
        visible?: bool;
        crosshair?: StockChartYAxisItemCrosshair;
    }

    interface StockChartSeriesClickEventSeries {
        type?: any;
        name?: any;
        data?: any;
    }

    interface StockChartSeriesHoverEventSeries {
        type?: any;
        name?: any;
        data?: any;
    }

    interface StockChartOptions {
        dateField?: string;
        navigator?: StockChartNavigator;
        axisDefaults?: any;
        categoryAxis?: StockChartCategoryAxisItem[];
        chartArea?: StockChartChartArea;
        dataSource?: any;
        autoBind?: bool;
        legend?: StockChartLegend;
        panes?: StockChartPane[];
        plotArea?: StockChartPlotArea;
        series?: StockChartSeriesItem[];
        seriesColors?: any;
        seriesDefaults?: StockChartSeriesDefaults;
        theme?: string;
        title?: StockChartTitle;
        tooltip?: StockChartTooltip;
        transitions?: bool;
        valueAxis?: StockChartValueAxisItem[];
        xAxis?: StockChartXAxisItem[];
        yAxis?: StockChartYAxisItem[];
        axisLabelClick?(e: StockChartAxisLabelClickEvent): void;
        dataBound?(e: StockChartEvent): void;
        dragStart?(e: StockChartDragStartEvent): void;
        drag?(e: StockChartDragEvent): void;
        dragEnd?(e: StockChartDragEndEvent): void;
        plotAreaClick?(e: StockChartPlotAreaClickEvent): void;
        seriesClick?(e: StockChartSeriesClickEvent): void;
        seriesHover?(e: StockChartSeriesHoverEvent): void;
        zoomStart?(e: StockChartZoomStartEvent): void;
        zoom?(e: StockChartZoomEvent): void;
        zoomEnd?(e: StockChartZoomEndEvent): void;
        selectStart?(e: StockChartSelectStartEvent): void;
        select?(e: StockChartSelectEvent): void;
        selectEnd?(e: StockChartSelectEndEvent): void;
    }

    interface StockChartEvent {
        sender: StockChart;
    }

    interface StockChartAxisLabelClickEvent extends StockChartEvent {
        axis?: any;
        value?: any;
        text?: any;
        index?: any;
        dataItem?: any;
        element?: any;
    }

    interface StockChartDragStartEvent extends StockChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface StockChartDragEvent extends StockChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface StockChartDragEndEvent extends StockChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface StockChartPlotAreaClickEvent extends StockChartEvent {
        value?: any;
        category?: any;
        element?: any;
        x?: any;
        y?: any;
    }

    interface StockChartSeriesClickEvent extends StockChartEvent {
        value?: any;
        category?: any;
        series?: StockChartSeriesClickEventSeries;
        dataItem?: any;
        element?: any;
    }

    interface StockChartSeriesHoverEvent extends StockChartEvent {
        value?: any;
        category?: any;
        series?: StockChartSeriesHoverEventSeries;
        dataItem?: any;
        element?: any;
    }

    interface StockChartZoomStartEvent extends StockChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface StockChartZoomEvent extends StockChartEvent {
        axisRanges?: any;
        delta?: number;
        originalEvent?: any;
    }

    interface StockChartZoomEndEvent extends StockChartEvent {
        axisRanges?: any;
        originalEvent?: any;
    }

    interface StockChartSelectStartEvent extends StockChartEvent {
        from?: any;
        to?: any;
    }

    interface StockChartSelectEvent extends StockChartEvent {
        from?: any;
        to?: any;
    }

    interface StockChartSelectEndEvent extends StockChartEvent {
        from?: any;
        to?: any;
    }


}
module FX {
    class FX  {
        options: FXOptions;
        kendoAnimate(duration: number, reverse: bool, complete: Function, show: bool, hide: bool): void;
        kendoStop(gotoEnd: bool): void;
        kendoAddClass(classes: string, options: FXKendoAddClassOptions): void;
        kendoRemoveClass(classes: string, options: FXKendoRemoveClassOptions): void;
        kendoToggleClass(classes: string, options: FXKendoToggleClassOptions, toggle: bool): void;
    }

    interface FXKendoAddClassOptions {
        duration?: number;
        exclusive?: string;
        ease?: string;
    }

    interface FXKendoRemoveClassOptions {
        duration?: number;
        exclusive?: string;
        ease?: string;
    }

    interface FXKendoToggleClassOptions {
        duration?: number;
        exclusive?: string;
        ease?: string;
    }

    interface FXOptions {
    }

    interface FXEvent {
        sender: FX;
    }


}
module kendo {
    class Layout extends Observable {
        options: LayoutOptions;
        showIn(container: string, view: kendo.View): void;
    }

    interface LayoutOptions {
    }

    interface LayoutEvent {
        sender: Layout;
    }


    class Router extends Observable {
        options: RouterOptions;
        start(): void;
        Example(): void;
        route(route: string, callback: Function): void;
        navigate(route: string, silent: bool): void;
        destroy(): void;
    }

    interface RouterOptions {
        change?(e: RouterChangeEvent): void;
        routeMissing?(e: RouterRouteMissingEvent): void;
    }

    interface RouterEvent {
        sender: Router;
    }

    interface RouterChangeEvent extends RouterEvent {
        url?: string;
    }

    interface RouterRouteMissingEvent extends RouterEvent {
        url?: string;
    }


    class View extends Observable {
        constructor(options?: ViewOptions);
        options: ViewOptions;
        destroy(): void;
        render(container: JQuery): JQuery;
    }

    interface ViewOptions {
        tagName?: string;
        hide?(e: ViewEvent): void;
        init?(e: ViewEvent): void;
        show?(e: ViewEvent): void;
    }

    interface ViewEvent {
        sender: View;
    }


}
module kendo.mobile.ui {
    class ActionSheet extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ActionSheetOptions);
        options: ActionSheetOptions;
        close(): void;
        destroy(): void;
        open(target: JQuery, context: any): void;
    }

    interface ActionSheetPopup {
        direction?: any;
        height?: any;
        width?: any;
    }

    interface ActionSheetOptions {
        cancel?: string;
        popup?: ActionSheetPopup;
        open?(e: ActionSheetOpenEvent): void;
    }

    interface ActionSheetEvent {
        sender: ActionSheet;
    }

    interface ActionSheetOpenEvent extends ActionSheetEvent {
        target?: JQuery;
        context?: JQuery;
    }


    class BackButton extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: BackButtonOptions);
        options: BackButtonOptions;
        destroy(): void;
    }

    interface BackButtonOptions {
        click?(e: BackButtonClickEvent): void;
    }

    interface BackButtonEvent {
        sender: BackButton;
    }

    interface BackButtonClickEvent extends BackButtonEvent {
        target?: JQuery;
        button?: JQuery;
    }


    class Button extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ButtonOptions);
        options: ButtonOptions;
        destroy(): void;
    }

    interface ButtonOptions {
        icon?: string;
        click?(e: ButtonClickEvent): void;
    }

    interface ButtonEvent {
        sender: Button;
    }

    interface ButtonClickEvent extends ButtonEvent {
        target?: JQuery;
        button?: JQuery;
    }


    class ButtonGroup extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ButtonGroupOptions);
        options: ButtonGroupOptions;
        current(): void;
        destroy(): JQuery;
        select(li: any): void;
    }

    interface ButtonGroupOptions {
        index?: number;
        selectOn?: string;
        select?(e: ButtonGroupEvent): void;
    }

    interface ButtonGroupEvent {
        sender: ButtonGroup;
    }


    class DetailButton extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: DetailButtonOptions);
        options: DetailButtonOptions;
        destroy(): void;
    }

    interface DetailButtonOptions {
        click?(e: DetailButtonClickEvent): void;
    }

    interface DetailButtonEvent {
        sender: DetailButton;
    }

    interface DetailButtonClickEvent extends DetailButtonEvent {
        target?: JQuery;
        button?: JQuery;
    }


    class Layout extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: LayoutOptions);
        options: LayoutOptions;
    }

    interface LayoutOptions {
        id?: string;
        platform?: string;
        hide?(e: LayoutHideEvent): void;
        init?(e: LayoutInitEvent): void;
        show?(e: LayoutShowEvent): void;
    }

    interface LayoutEvent {
        sender: Layout;
    }

    interface LayoutHideEvent extends LayoutEvent {
        layout?: JQuery;
        view?: JQuery;
    }

    interface LayoutInitEvent extends LayoutEvent {
        layout?: JQuery;
    }

    interface LayoutShowEvent extends LayoutEvent {
        layout?: JQuery;
        view?: JQuery;
    }


    class ListView extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ListViewOptions);
        options: ListViewOptions;
        dataSource: kendo.data.DataSource;
        destroy(): void;
        items(): JQuery;
        refresh(): void;
        setDataSource(dataSource: kendo.data.DataSource): void;
        stopEndlessScrolling(): void;
        stopLoadMore(): void;
    }

    interface ListViewFilterable {
        placeholder?: string;
        autoFilter?: bool;
        field?: string;
        ignoreCase?: bool;
        operator?: string;
    }

    interface ListViewOptions {
        appendOnRefresh?: bool;
        autoBind?: bool;
        dataSource?: any;
        endlessScroll?: bool;
        endlessScrollParameters?: Function;
        fixedHeaders?: bool;
        headerTemplate?: string;
        loadMore?: bool;
        loadMoreText?: string;
        loadMoreParameters?: Function;
        pullTemplate?: string;
        pullToRefresh?: bool;
        pullParameters?: Function;
        refreshTemplate?: string;
        releaseTemplate?: string;
        scrollTreshold?: string;
        style?: string;
        template?: string;
        type?: string;
        filterable?: ListViewFilterable;
        click?(e: ListViewClickEvent): void;
        dataBound?(e: ListViewEvent): void;
        dataBinding?(e: ListViewEvent): void;
        lastPageReached?(e: ListViewEvent): void;
    }

    interface ListViewEvent {
        sender: ListView;
    }

    interface ListViewClickEvent extends ListViewEvent {
        item?: JQuery;
        target?: JQuery;
        dataItem?: any;
        button?: kendo.mobile.ui.Button;
    }


    class Loader extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: LoaderOptions);
        options: LoaderOptions;
        hide(): void;
        show(): void;
    }

    interface LoaderOptions {
    }

    interface LoaderEvent {
        sender: Loader;
    }


    class ModalView extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ModalViewOptions);
        options: ModalViewOptions;
        close(): void;
        destroy(): void;
        open(target: JQuery): void;
    }

    interface ModalViewOptions {
        height?: number;
        modal?: bool;
        width?: number;
        open?(e: ModalViewOpenEvent): void;
    }

    interface ModalViewEvent {
        sender: ModalView;
    }

    interface ModalViewOpenEvent extends ModalViewEvent {
        target?: JQuery;
    }


    class NavBar extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: NavBarOptions);
        options: NavBarOptions;
        destroy(): void;
        title(value: string): void;
    }

    interface NavBarOptions {
    }

    interface NavBarEvent {
        sender: NavBar;
    }


    class Pane extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: PaneOptions);
        options: PaneOptions;
        destroy(): void;
        hideLoading(): void;
        navigate(url: string, transition: string): void;
        showLoading(): void;
        view(): kendo.mobile.ui.View;
    }

    interface PaneOptions {
        initial?: string;
        layout?: string;
        loading?: string;
        transition?: string;
        navigate?(e: PaneNavigateEvent): void;
        viewShow?(e: PaneViewShowEvent): void;
    }

    interface PaneEvent {
        sender: Pane;
    }

    interface PaneNavigateEvent extends PaneEvent {
        url?: JQuery;
    }

    interface PaneViewShowEvent extends PaneEvent {
        view?: kendo.mobile.ui.View;
    }


    class PopOver extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: PopOverOptions);
        options: PopOverOptions;
        close(): void;
        destroy(): void;
        open(target: JQuery): void;
    }

    interface PopOverPane {
        initial?: string;
        layout?: string;
        loading?: string;
        transition?: string;
    }

    interface PopOverPopup {
        height?: any;
        width?: any;
    }

    interface PopOverOptions {
        pane?: PopOverPane;
        popup?: PopOverPopup;
        close?(e: PopOverEvent): void;
        open?(e: PopOverOpenEvent): void;
    }

    interface PopOverEvent {
        sender: PopOver;
    }

    interface PopOverOpenEvent extends PopOverEvent {
        target?: JQuery;
    }


    class ScrollView extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ScrollViewOptions);
        options: ScrollViewOptions;
        content(content: any): void;
        destroy(): void;
        refresh(): void;
        scrollTo(page: number, instant: bool): void;
    }

    interface ScrollViewOptions {
        bounceVelocityThreshold?: number;
        duration?: number;
        page?: number;
        velocityThreshold?: number;
        change?(e: ScrollViewChangeEvent): void;
    }

    interface ScrollViewEvent {
        sender: ScrollView;
    }

    interface ScrollViewChangeEvent extends ScrollViewEvent {
        page?: JQuery;
    }


    class Scroller extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ScrollerOptions);
        options: ScrollerOptions;
        destroy(): void;
        pullHandled(): void;
        reset(): void;
        scrollHeight(): void;
        scrollTo(x: number, y: number): void;
        scrollWidth(): void;
    }

    interface ScrollerOptions {
        zoom?: bool;
        elastic?: bool;
        pullOffset?: number;
        pullTemplate?: string;
        pullToRefresh?: bool;
        refreshTemplate?: string;
        releaseTemplate?: string;
        pull?(e: ScrollerEvent): void;
        resize?(e: ScrollerEvent): void;
        scroll?(e: ScrollerScrollEvent): void;
    }

    interface ScrollerEvent {
        sender: Scroller;
    }

    interface ScrollerScrollEvent extends ScrollerEvent {
        scrollTop?: number;
        scrollLeft?: number;
    }


    class SplitView extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: SplitViewOptions);
        options: SplitViewOptions;
        destroy(): void;
    }

    interface SplitViewOptions {
        style?: string;
        init?(e: SplitViewInitEvent): void;
        show?(e: SplitViewShowEvent): void;
    }

    interface SplitViewEvent {
        sender: SplitView;
    }

    interface SplitViewInitEvent extends SplitViewEvent {
        view?: JQuery;
    }

    interface SplitViewShowEvent extends SplitViewEvent {
        view?: JQuery;
    }


    class Swipe extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: SwipeOptions);
        options: SwipeOptions;
    }

    interface SwipeOptions {
    }

    interface SwipeEvent {
        sender: Swipe;
    }


    class Switch extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: SwitchOptions);
        options: SwitchOptions;
        check(): bool;
        check(check: bool): void;
        destroy(): void;
        toggle(): void;
    }

    interface SwitchOptions {
        checked?: bool;
        offLabel?: string;
        onLabel?: string;
        change?(e: SwitchChangeEvent): void;
    }

    interface SwitchEvent {
        sender: Switch;
    }

    interface SwitchChangeEvent extends SwitchEvent {
        checked?: any;
    }


    class TabStrip extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: TabStripOptions);
        options: TabStripOptions;
        currentItem(): JQuery;
        destroy(): void;
        switchTo(url: string): void;
        clear(): void;
    }

    interface TabStripOptions {
        selectedIndex?: number;
        select?(e: TabStripSelectEvent): void;
    }

    interface TabStripEvent {
        sender: TabStrip;
    }

    interface TabStripSelectEvent extends TabStripEvent {
        item?: JQuery;
    }


    class View extends kendo.mobile.ui.Widget {
        element: JQuery;
        wrapper: JQuery;
        constructor(element: Element, options?: ViewOptions);
        options: ViewOptions;
        destroy(): void;
        contentElement(): void;
    }

    interface ViewOptions {
        model?: string;
        reload?: bool;
        stretch?: bool;
        title?: string;
        zoom?: bool;
        beforeShow?(e: ViewBeforeShowEvent): void;
        hide?(e: ViewHideEvent): void;
        init?(e: ViewInitEvent): void;
        show?(e: ViewShowEvent): void;
    }

    interface ViewEvent {
        sender: View;
    }

    interface ViewBeforeShowEvent extends ViewEvent {
        view?: JQuery;
    }

    interface ViewHideEvent extends ViewEvent {
        view?: JQuery;
    }

    interface ViewInitEvent extends ViewEvent {
        view?: JQuery;
    }

    interface ViewShowEvent extends ViewEvent {
        view?: JQuery;
    }


}
module kendo.mobile {
    class Application extends Observable {
        constructor(options?: ApplicationOptions);
        options: ApplicationOptions;
        hideLoading(): void;
        navigate(url: string, transition: string): void;
        scroller(): kendo.mobile.ui.Scroller;
        showLoading(): void;
        view(): kendo.mobile.ui.View;
    }

    interface ApplicationOptions {
        hideAddressBar?: bool;
        updateDocumentTitle?: bool;
        initial?: string;
        layout?: string;
        loading?: string;
        platform?: string;
        transition?: string;
    }

    interface ApplicationEvent {
        sender: Application;
    }


}

interface JQueryXHR {
}

interface JQueryEventObject {
}

interface JQuery {

    kendoDraggable(): JQuery;
    kendoDraggable(options: kendo.ui.DraggableOptions): JQuery;

    kendoDropTarget(): JQuery;
    kendoDropTarget(options: kendo.ui.DropTargetOptions): JQuery;

    kendoDropTargetArea(): JQuery;
    kendoDropTargetArea(options: kendo.ui.DropTargetAreaOptions): JQuery;

    kendoAutoComplete(): JQuery;
    kendoAutoComplete(options: kendo.ui.AutoCompleteOptions): JQuery;

    kendoCalendar(): JQuery;
    kendoCalendar(options: kendo.ui.CalendarOptions): JQuery;

    kendoChart(): JQuery;
    kendoChart(options: kendo.dataviz.ui.ChartOptions): JQuery;

    kendoColorPalette(): JQuery;
    kendoColorPalette(options: kendo.ui.ColorPaletteOptions): JQuery;

    kendoColorPicker(): JQuery;
    kendoColorPicker(options: kendo.ui.ColorPickerOptions): JQuery;

    kendoComboBox(): JQuery;
    kendoComboBox(options: kendo.ui.ComboBoxOptions): JQuery;

    kendoDatePicker(): JQuery;
    kendoDatePicker(options: kendo.ui.DatePickerOptions): JQuery;

    kendoDateTimePicker(): JQuery;
    kendoDateTimePicker(options: kendo.ui.DateTimePickerOptions): JQuery;

    kendoDropDownList(): JQuery;
    kendoDropDownList(options: kendo.ui.DropDownListOptions): JQuery;

    kendoEditor(): JQuery;
    kendoEditor(options: kendo.ui.EditorOptions): JQuery;

    kendoFlatColorPicker(): JQuery;
    kendoFlatColorPicker(options: kendo.ui.FlatColorPickerOptions): JQuery;

    kendoGrid(): JQuery;
    kendoGrid(options: kendo.ui.GridOptions): JQuery;

    kendoLinearGauge(): JQuery;
    kendoLinearGauge(options: kendo.dataviz.ui.LinearGaugeOptions): JQuery;

    kendoListView(): JQuery;
    kendoListView(options: kendo.ui.ListViewOptions): JQuery;

    kendoMenu(): JQuery;
    kendoMenu(options: kendo.ui.MenuOptions): JQuery;

    kendoMobileActionSheet(): JQuery;
    kendoMobileActionSheet(options: kendo.mobile.ui.ActionSheetOptions): JQuery;

    kendoMobileBackButton(): JQuery;
    kendoMobileBackButton(options: kendo.mobile.ui.BackButtonOptions): JQuery;

    kendoMobileButton(): JQuery;
    kendoMobileButton(options: kendo.mobile.ui.ButtonOptions): JQuery;

    kendoMobileButtonGroup(): JQuery;
    kendoMobileButtonGroup(options: kendo.mobile.ui.ButtonGroupOptions): JQuery;

    kendoMobileDetailButton(): JQuery;
    kendoMobileDetailButton(options: kendo.mobile.ui.DetailButtonOptions): JQuery;

    kendoMobileLayout(): JQuery;
    kendoMobileLayout(options: kendo.mobile.ui.LayoutOptions): JQuery;

    kendoMobileListView(): JQuery;
    kendoMobileListView(options: kendo.mobile.ui.ListViewOptions): JQuery;

    kendoMobileLoader(): JQuery;
    kendoMobileLoader(options: kendo.mobile.ui.LoaderOptions): JQuery;

    kendoMobileModalView(): JQuery;
    kendoMobileModalView(options: kendo.mobile.ui.ModalViewOptions): JQuery;

    kendoMobileNavBar(): JQuery;
    kendoMobileNavBar(options: kendo.mobile.ui.NavBarOptions): JQuery;

    kendoMobilePane(): JQuery;
    kendoMobilePane(options: kendo.mobile.ui.PaneOptions): JQuery;

    kendoMobilePopOver(): JQuery;
    kendoMobilePopOver(options: kendo.mobile.ui.PopOverOptions): JQuery;

    kendoMobileScrollView(): JQuery;
    kendoMobileScrollView(options: kendo.mobile.ui.ScrollViewOptions): JQuery;

    kendoMobileScroller(): JQuery;
    kendoMobileScroller(options: kendo.mobile.ui.ScrollerOptions): JQuery;

    kendoMobileSplitView(): JQuery;
    kendoMobileSplitView(options: kendo.mobile.ui.SplitViewOptions): JQuery;

    kendoMobileSwipe(): JQuery;
    kendoMobileSwipe(options: kendo.mobile.ui.SwipeOptions): JQuery;

    kendoMobileSwitch(): JQuery;
    kendoMobileSwitch(options: kendo.mobile.ui.SwitchOptions): JQuery;

    kendoMobileTabStrip(): JQuery;
    kendoMobileTabStrip(options: kendo.mobile.ui.TabStripOptions): JQuery;

    kendoMobileView(): JQuery;
    kendoMobileView(options: kendo.mobile.ui.ViewOptions): JQuery;

    kendoMultiSelect(): JQuery;
    kendoMultiSelect(options: kendo.ui.MultiSelectOptions): JQuery;

    kendoNumericTextBox(): JQuery;
    kendoNumericTextBox(options: kendo.ui.NumericTextBoxOptions): JQuery;

    kendoPager(): JQuery;
    kendoPager(options: kendo.ui.PagerOptions): JQuery;

    kendoPanelBar(): JQuery;
    kendoPanelBar(options: kendo.ui.PanelBarOptions): JQuery;

    kendoRadialGauge(): JQuery;
    kendoRadialGauge(options: kendo.dataviz.ui.RadialGaugeOptions): JQuery;

    kendoRangeSlider(): JQuery;
    kendoRangeSlider(options: kendo.ui.RangeSliderOptions): JQuery;

    kendoSlider(): JQuery;
    kendoSlider(options: kendo.ui.SliderOptions): JQuery;

    kendoSparkline(): JQuery;
    kendoSparkline(options: kendo.dataviz.ui.SparklineOptions): JQuery;

    kendoSplitter(): JQuery;
    kendoSplitter(options: kendo.ui.SplitterOptions): JQuery;

    kendoStockChart(): JQuery;
    kendoStockChart(options: kendo.dataviz.ui.StockChartOptions): JQuery;

    kendoTabStrip(): JQuery;
    kendoTabStrip(options: kendo.ui.TabStripOptions): JQuery;

    kendoTimePicker(): JQuery;
    kendoTimePicker(options: kendo.ui.TimePickerOptions): JQuery;

    kendoTooltip(): JQuery;
    kendoTooltip(options: kendo.ui.TooltipOptions): JQuery;

    kendoTouch(): JQuery;
    kendoTouch(options: kendo.ui.TouchOptions): JQuery;

    kendoTreeView(): JQuery;
    kendoTreeView(options: kendo.ui.TreeViewOptions): JQuery;

    kendoUpload(): JQuery;
    kendoUpload(options: kendo.ui.UploadOptions): JQuery;

    kendoValidator(): JQuery;
    kendoValidator(options: kendo.ui.ValidatorOptions): JQuery;

    kendoWindow(): JQuery;
    kendoWindow(options: kendo.ui.WindowOptions): JQuery;

}
