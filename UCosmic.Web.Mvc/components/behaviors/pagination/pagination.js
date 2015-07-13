var paginate = {
    pagination_utility: function () {
        return {
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
                            this.lastPageNumber = this.pageNumber + (len > 0 ? 1 : 0);
                        }
                        if (len === 0) {
                            opts.cb(this.currentSet);
                        }
                        else {
                            if (opts.dir === 'next') {
                                this.pageNumber++;
                                if (opts.key) {
                                    this.dropFirst(vals);
                                }
                            }
                            else {
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
                            this.each(obj, function (v, k) {
                                key = k;
                            });
                        }
                        return key;
                    },
                    getFirstKey: function (obj) {
                        var key;
                        if (obj) {
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
        };
    }
};
