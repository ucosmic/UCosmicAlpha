var Activities;
(function (Activities) {
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
    (function (ViewModels) {
        var ActivityList = (function () {
            function ActivityList() {
            }
            ActivityList.prototype.load = function () {
                var _this = this;
                var deferred = $.Deferred();

                var itemsUrl = $('#activities_api').text();
                var params = { pageSize: 500, pageNumber: 1 };
                itemsUrl = '{0}?{1}'.format(itemsUrl, $.param(params));

                $.ajax({
                    url: itemsUrl,
                    cache: false
                }).done(function (data) {
                    var mapping = {
                        items: {
                            create: function (options) {
                                return new ActivityListItem(options.data, options.parent);
                            }
                        }
                    };

                    ko.mapping.fromJS(data, mapping, _this);

                    deferred.resolve();
                });

                return deferred;
            };
            ActivityList.iconMaxSide = 64;
            return ActivityList;
        })();
        ViewModels.ActivityList = ActivityList;

        var ActivityListItem = (function () {
            function ActivityListItem(data, owner) {
                var _this = this;
                this.mode = ko.observable();
                //#region Computeds
                this.editUrl = ko.computed(function () {
                    var activityId = _this.activityId();
                    return $('#activity_edit').text().format(activityId);
                });
                this.titleText = ko.computed(function () {
                    var title = _this.title();
                    return title || '[Untitled Activity #{0}]'.format(_this.activityId());
                });
                this.isDraft = ko.computed(function () {
                    var mode = _this.mode();
                    if (!mode)
                        return false;
                    return mode == ViewModels.ActivityMode.draft;
                });
                this.isPublished = ko.computed(function () {
                    var mode = _this.mode();
                    if (!mode)
                        return false;
                    return mode == ViewModels.ActivityMode.published;
                });
                this.datesText = ko.computed(function () {
                    return _this._computeDatesText();
                });
                this._owner = owner;

                if (data.types && data.types.length)
                    data.types = Enumerable.From(data.types).OrderBy(function (x) {
                        return x.rank;
                    }).ToArray();

                var mapping = {};
                ko.mapping.fromJS(data, mapping, this);
            }
            //#endregion
            ActivityListItem.prototype.typeText = function (index) {
                var types = this.types();
                var typeText = types[index].text();
                if (index < types.length - 1)
                    typeText = "{0}; ".format(typeText);
                return typeText;
            };

            ActivityListItem.prototype.placeText = function (index) {
                var places = this.places();
                var placeText = places[index].placeName();
                if (index < places.length - 1)
                    placeText = "{0}, ".format(placeText);
                return placeText;
            };

            ActivityListItem.prototype.typeIcon = function (typeId) {
                var src = $('#type_icon_api').text().format(typeId);
                return src;
            };

            ActivityListItem.prototype.documentIcon = function (documentId) {
                var src = $('#document_icon_api').text().format(this.activityId(), documentId);
                var params = { maxSide: ActivityList.iconMaxSide };
                return '{0}?{1}'.format(src, $.param(params));
            };

            ActivityListItem.prototype._computeDatesText = function () {
                var startsOnIso = this.startsOn();
                var endsOnIso = this.endsOn();
                var startsFormat = this.startsFormat() || 'M/D/YYYY';
                var endsFormat = this.endsFormat() || this.startsFormat() || 'M/D/YYYY';
                startsFormat = startsFormat.toUpperCase();
                endsFormat = endsFormat.toUpperCase();
                var onGoing = this.onGoing();
                var datesText;

                if (!startsOnIso) {
                    if (endsOnIso) {
                        datesText = moment(endsOnIso).format(endsFormat);
                    } else if (onGoing) {
                        datesText = '(Ongoing)';
                    }
                } else {
                    datesText = moment(startsOnIso).format(startsFormat);
                    if (onGoing) {
                        datesText = '{0} (Ongoing)'.format(datesText);
                    } else if (endsOnIso) {
                        datesText = '{0} - {1}'.format(datesText, moment(endsOnIso).format(endsFormat));
                    }
                }

                return datesText;
            };

            ActivityListItem.prototype.purge = function () {
                var _this = this;
                var $dialog = $('#confirmActivityDeleteDialog');
                $dialog.dialog({
                    dialogClass: 'jquery-ui no-close',
                    closeOnEscape: false,
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: function () {
                                var $buttons = $dialog.parents('.ui-dialog').find('button');
                                $.each($buttons, function () {
                                    $(this).attr('disabled', 'disabled');
                                });
                                $dialog.find('.spinner').css('visibility', '');

                                $.ajax({
                                    type: 'DELETE',
                                    url: $('#activity_api').text().format(_this.activityId())
                                }).done(function () {
                                    $dialog.dialog('close');
                                    _this._owner.items.remove(_this);
                                }).fail(function (xhr) {
                                    App.Failures.message(xhr, 'while trying to delete your activity', true);
                                }).always(function () {
                                    $.each($buttons, function () {
                                        $(this).removeAttr('disabled');
                                    });
                                    $dialog.find('.spinner').css('visibility', 'hidden');
                                });
                            }
                        },
                        {
                            text: 'No, cancel delete',
                            click: function () {
                                $dialog.dialog('close');
                            },
                            'data-css-link': true
                        }
                    ]
                });
            };
            return ActivityListItem;
        })();
        ViewModels.ActivityListItem = ActivityListItem;
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
//# sourceMappingURL=Activities.js.map
