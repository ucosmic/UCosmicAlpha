
var paginate = {
    pagination_utility: function () {
        return {

            //moveForward: function () {
            //    this.loading();
            //    this.nextPage(this.loaded);
            //},

            //moveBackward: function () {
            //    this.loading();
            //    this.paginator.prevPage(this.loaded);
            //},

            //loading: function () {
            //    //$('button').prop('disabled', true);
            //},

            //loaded: function (vals) {
            //    //console.log('loaded', vals);
            //    //var messages = map(vals, function (v, k) {
            //    //    return v.color + ' ' + v.shape + '<br />';
            //    //});
            //    //$('#prev').prop('disabled', this.isFirstPage());
            //    //$('#next').prop('disabled', this.isLastPage());
            //    //$('div').html(messages.length ? messages.join("\n") : '-no records-');
            //},

            pagination: function () {
                return {
                    pageNumber: 0,
                    lastPageNumber: null,
                    currentSet: {},
                    init: function (ref, limit) {
                        this.ref = ref;
                        this.pageNumber = 0;
                        this.limit = limit;
                        this.lastPageNumber = null;
                        this.currentSet = {};
                    },
                    nextPage: function (callback) {
                        if (this.isLastPage()) {
                            callback(this.currentSet);
                        }
                        else {
                            var lastKey = this.getLastKey(this.currentSet);
                            // if there is no last key, we need to use undefined as priority
                            var pri = lastKey ? null : undefined;
                            this.ref.startAt(pri, lastKey)
                                .limit(this.limit + (lastKey ? 1 : 0))
                                .once('value', this._process.bind(this, {
                                cb: callback,
                                dir: 'next',
                                key: lastKey
                            }));
                        }
                    },

                    prevPage: function (callback) {
                        console.log('prevPage', this.isFirstPage(), this.pageNumber);
                        if (this.isFirstPage()) {
                            callback(this.currentSet);
                        }
                        else {
                            var firstKey = this.getFirstKey(this.currentSet);
                            // if there is no last key, we need to use undefined as priority
                            this.ref.endAt(null, firstKey)
                                .limit(this.limit + 1)
                                .once('value', this._process.bind(this, {
                                cb: callback,
                                dir: 'prev',
                                key: firstKey
                            }));
                        }
                    },

                    isFirstPage: function () {
                        return this.pageNumber === 1;
                    },

                    isLastPage: function () {
                        return this.pageNumber === this.lastPageNumber;
                    },

                    _process: function (opts, snap) {
                        var vals = snap.val(), len = this.size(vals);
                        console.log('_process', opts, len, this.pageNumber, vals);
                        if (len < this.limit) {
                            // if the next page returned some results, it becomes the last page
                            // otherwise this one is
                            this.lastPageNumber = this.pageNumber + (len > 0 ? 1 : 0);
                        }
                        if (len === 0) {
                            // we don't know if this is the last page until
                            // we try to fetch the next, so if the next is empty
                            // then do not advance
                            opts.cb(this.currentSet);
                        }
                        else {
                            if (opts.dir === 'next') {
                                this.pageNumber++;
                                if (opts.key) {
                                    this.dropFirst(vals);
                                }
                            } else {
                                this.pageNumber--;
                                if (opts.key) {
                                    this.dropLast(vals);
                                }
                            }
                            this.currentSet = vals;
                            opts.cb(vals);
                        }

                    },

                    getLastKey: function (obj) {
                        var key;
                        if (obj) {
                            //key = _.findLast(obj, function (x) {
                            //    return true;
                            //});
                            this.each(obj, function (v, k) {
                                key = k;
                            });
                        }
                        return key;
                    },

                    getFirstKey: function (obj) {
                        var key;
                        if (obj) {
                            //key = _.find(obj, function (x) {
                            //    return true;
                            //});
                            this.each(obj, function (v, k) {
                                key = k;
                                return true;
                            });
                        }
                        return key;
                    },

                    dropFirst: function (obj) {
                        if (obj) {
                            delete obj[this.getFirstKey(obj)];
                        }
                        return obj;
                    },

                    dropLast: function (obj) {
                        if (obj) {
                            delete obj[this.getLastKey(obj)];
                        }
                        return obj;
                    },

                    map: function (obj, cb) {
                        var out = [];
                        this.each(obj, function (v, k) {
                            out.push(cb(v, k));
                        });

                        //_.forEach(obj, function (v,k) {
                        //    out.push(cb(v, k));
                        //});

                        return out;
                    },

                    each: function (obj, cb) {
                        if (obj) {
                            for (var k in obj) {
                                if (obj.hasOwnProperty(k)) {
                                    var res = cb(obj[k], k);
                                    if (res === true) {
                                        break;
                                    }
                                }
                            }
                        }
                    },

                    size: function (obj) {
                        var i = 0;
                        this.each(obj, function () {
                            i++;
                        });
                        return i;
                    },
                };
            }
        }
    }
}

