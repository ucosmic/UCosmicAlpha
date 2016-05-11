/// <reference path="rx/rx.all.d.ts" />

//interface ZeptoCollection {
//    fadeIn: any;
//    fadeOut: any;
//    length: number;
//    getScript: any;
//}
interface JQuery {
    wysiwyg: any;
    vTicker: any;
}
interface HTMLElement {
    attached: any;
}

interface ArrayConstructor {
    move: any;
}
interface HTMLElement {
    message: any;
    type: string;
    fadeOutDelay: string;
    bindToElement: any;
}

interface capitaliseFirstLetter {
    (myString: string): any;
}

interface Document {
    timeline: any;
}

//interface EventTarget {
//    result: any;
//}
//interface Element {
//    style: any;
//}

interface Window {
    chrome: string;
    mozIndexedDB: any;
    webkitIndexedDB: any;
}

declare module _ {
    interface LoDashStatic {
        insert: any;
        sum: any;
        slice: any;
        uniqBy: any;
    }

    interface LoDashObjectWrapper<T> {
        reverse: any;
    }
}
declare module Rx {
    export module DOM {
        function click(element: Element): Observable<{}>;
        function keyup(element: Element): Observable<{}>;
    }
}
//interface HTMLElement {
//    value: any;
//}

declare var Polymer: any;
//declare var require: any;
declare var EventSource: any;
declare var next: any;
declare var CoreStyle: any;
declare var Animation: any;
declare var XLSX: any;
declare var Firebase: any;
declare var is_animations: any;
declare var loki: any;
declare var PouchDB: any;
declare var LokiIndexedAdapter: any;