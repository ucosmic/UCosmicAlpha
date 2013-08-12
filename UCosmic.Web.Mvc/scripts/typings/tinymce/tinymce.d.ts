interface TinyMceStatic
{
    init(parm?: any): void;
    DOM: any;
    get: any;
    execCommand: any;
    getInstanceById(instanceId: string);
}

declare var tinyMCE: TinyMceStatic;

// TODO: this is wrong of course, but gets knockout binding handler to compile.
declare module tinymce.dom {
    export class Event {
        static add(arg1?: any, arg2?: any, arg3?: any);
    }
}

