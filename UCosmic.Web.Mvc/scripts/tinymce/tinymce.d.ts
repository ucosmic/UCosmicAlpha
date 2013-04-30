interface TinyMceStatic
{
    init(parm?: any): void;
    dom: any;
    get: any;
    execCommand: any;
    getInstanceById(instanceId: string);
}


declare var tinyMCE: TinyMceStatic;