/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
module Activities.ViewModels {
    export interface iActivityPublicViewModel {
        Mode: any;
        ActivityMode: number;
        Title: string;
        Content: string
        StartsOn: Date;
        EndsOn: Date;
        StartsFormat: string;
        EndsFormat: string;
        OnGoing?: boolean;
        IsExternallyFunded?: boolean;
        IsInternallyFunded?: boolean;
        UpdatedOnUtc: Date;
        Types: iActivityTypeViewModel[];
        Places: iActivityPlaceViewModel[];
        Tags: iActivityTagViewModel[];
        Documents: iActivityDocumentViewModel[];
    }
    export interface iActivityTypeViewModel {
        ActivityId: number;
        TypeId: number;
        Text: string;
        Rank: number;
    }
    export interface iActivityPlaceViewModel {
        ActivityId: number;
        PlaceId: number;
        PlaceName: string;
    }
    export interface iActivityTagViewModel {
        ActivityId: number;
        Text: string;
        DomainType: any;
        DomainKey?: number;
    }
    export interface iActivityDocumentViewModel {
        ActivityId: number;
        DocumentId: number;
        Title: string;
        FileName: string;
        ByteCount: number;
        Size: any;
        Extension: string;
    }

    export class PublicView {
        constructor(data: iActivityPublicViewModel) {
            var mapping = {
                'StartsOn': {
                    create: function (options) {
                        var value = options.data.substr(6);
                        var myDate = new Date(parseInt(value));
                        if (myDate.getFullYear() < 1500) {
                            return "unknown";
                        }
                        return (moment(myDate)).format('M/D/YYYY');
                    }
                },
                'EndsOn': {
                    create: function (options) {
                        var value = options.data.substr(6);
                        var myDate = new Date(parseInt(value));
                        if (myDate.getFullYear() < 1500) {
                            return "unknown";
                        }
                        return (moment(myDate)).format('M/D/YYYY');
                    }
                },
                'UpdatedOnUtc': {
                    create: function (options) {
                        var value = options.data.substr(6);
                        var myDate = new Date(parseInt(value));
                        if (myDate.getFullYear() < 1500) {
                            return "unknown";
                        }
                        return (moment(myDate)).format('M/D/YYYY');
                    }
                },
                'DocumentId': {
                    create: function (options) {
                        return "/api/activities/" + options.data + "/documents";
                    }
                }
            }
            this.activity = ko.mapping.fromJS(data, mapping);
            this.isBound(true);
        }
        activity;
        isBound = ko.observable(false);
    }
}