/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../typings/linq/linq.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="ActivityEnums.ts" />
/// <reference path="ServiceApiModel.d.ts" />

module Activities.ViewModels {

    export class ActivityList implements KnockoutValidationGroup {

        static iconMaxSide: number = 64;

        pageSize: number;
        pageNumber: number;
        items: KnockoutObservableArray<ActivityListItem>;

        constructor() { }

        load(): JQueryDeferred<void> {
            var deferred: JQueryDeferred<void> = $.Deferred();

            var itemsUrl = $('#activities_api').text();
            var params = { pageSize: 500, pageNumber: 1, };
            itemsUrl = '{0}?{1}'.format(itemsUrl, $.param(params));

            $.ajax({
                url: itemsUrl,
                cache: false,
            })
                .done((data: any): void => {
                    var mapping = {
                        items: {
                            create: (options: KnockoutMappingCreateOptions): ActivityListItem => {
                                return new ActivityListItem(options.data, options.parent);
                            }
                        }
                    };

                    ko.mapping.fromJS(data, mapping, this);

                    deferred.resolve();
                });

            return deferred;
        }
    }

    export class ActivityListItem {

        private _owner: ActivityList;
        activityId: KnockoutObservable<string>;
        mode: KnockoutObservable<ActivityMode> = ko.observable();
        title: KnockoutObservable<string>;
        onGoing: KnockoutObservable<boolean>;
        startsOn: KnockoutObservable<string>;
        startsFormat: KnockoutObservable<string>;
        endsOn: KnockoutObservable<string>;
        endsFormat: KnockoutObservable<string>;
        types: KnockoutObservableArray<KoModels.ActivityType>;
        places: KnockoutObservableArray<any>;
        documents: KnockoutObservableArray<any>;

        constructor(data: ApiModels.Activity, owner: ActivityList) {
            this._owner = owner;

            // make sure types are ordered by rank
            if (data.types && data.types.length)
                data.types = Enumerable.From(data.types)
                    .OrderBy(function (x: ApiModels.ActivityType): number { return x.rank; })
                    .ToArray();

            var mapping = {};
            ko.mapping.fromJS(data, mapping, this);
        }

        //#region Computeds

        editUrl: KnockoutComputed<string> = ko.computed((): string => {
            var activityId = this.activityId();
            return $('#activity_edit').text().format(activityId);
        });

        titleText: KnockoutComputed<string> = ko.computed((): string => {
            var title = this.title();
            return title || '[Untitled Activity #{0}]'.format(this.activityId());
        });

        isDraft: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var mode = this.mode();
            if (!mode) return false;
            return mode == ActivityMode.draft;
        });

        isPublished: KnockoutComputed<boolean> = ko.computed((): boolean => {
            var mode = this.mode();
            if (!mode) return false;
            return mode == ActivityMode.published;
        });

        datesText: KnockoutComputed<string> = ko.computed((): string => {
            return this._computeDatesText();
        });

        //#endregion

        typeText(index: number): string {
            var types = this.types();
            var typeText = types[index].text();
            if (index < types.length - 1)
                typeText = "{0}; ".format(typeText);
            return typeText;
        }

        placeText(index: number): string {
            var places = this.places();
            var placeText = places[index].placeName();
            if (index < places.length - 1)
                placeText = "{0}, ".format(placeText);
            return placeText;
        }

        typeIcon(typeId: number) {
            var src = $('#type_icon_api').text().format(typeId);
            return src;
        }

        documentIcon(documentId: number) {
            var src = $('#document_icon_api').text().format(this.activityId(), documentId);
            var params = { maxSide: ActivityList.iconMaxSide };
            return '{0}?{1}'.format(src, $.param(params));
        }

        private _computeDatesText(): string {
            var startsOnIso = this.startsOn();
            var endsOnIso = this.endsOn();
            var startsFormat = this.startsFormat() || 'M/D/YYYY';
            var endsFormat = this.endsFormat() || this.startsFormat() || 'M/D/YYYY';
            startsFormat = startsFormat.toUpperCase();
            endsFormat = endsFormat.toUpperCase();
            var onGoing = this.onGoing();
            var datesText;

            if (!startsOnIso) {
                if (endsOnIso) { datesText = moment(endsOnIso).format(endsFormat); }
                else if (onGoing) { datesText = '(Ongoing)'; }
            }
            else {
                datesText = moment(startsOnIso).format(startsFormat);
                if (onGoing) { datesText = '{0} (Ongoing)'.format(datesText); }
                else if (endsOnIso) {
                    datesText = '{0} - {1}'.format(datesText, moment(endsOnIso).format(endsFormat));
                }
            }

            return datesText;
        }

        purge(): void {
            var $dialog = $('#confirmActivityDeleteDialog');
            $dialog.dialog({ // open a dialog to confirm deletion of activity
                dialogClass: 'jquery-ui no-close',
                closeOnEscape: false,
                width: 'auto',
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: 'Yes, confirm delete',
                        click: (): void => {
                            var $buttons = $dialog.parents('.ui-dialog').find('button');
                            $.each($buttons, function (): void { // disable buttons
                                $(this).attr('disabled', 'disabled');
                            });
                            $dialog.find('.spinner').css('visibility', '');

                            $.ajax({ // submit delete api request
                                type: 'DELETE',
                                url: $('#activity_api').text().format(this.activityId()),
                            })
                                .done((): void => {
                                    $dialog.dialog('close');
                                    this._owner.items.remove(this);
                                })
                                .fail((xhr: JQueryXHR): void => { // display failure message
                                    App.Failures.message(xhr, 'while trying to delete your activity', true);
                                })
                                .always((): void => { // re-enable buttons
                                    $.each($buttons, function (): void {
                                        $(this).removeAttr('disabled');
                                    });
                                    $dialog.find('.spinner').css('visibility', 'hidden');
                                });
                        }
                    },
                    {
                        text: 'No, cancel delete',
                        click: (): void => {
                            $dialog.dialog('close');
                        },
                        'data-css-link': true
                    }]
            });

        }
    }
}
