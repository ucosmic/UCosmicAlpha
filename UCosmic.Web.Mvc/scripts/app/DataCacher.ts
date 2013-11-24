/// <reference path="../typings/jquery/jquery.d.ts" />

module App {
    export class DataCacher<T> {
        constructor(public loader: () => JQueryPromise<T>) { }

        cached: T;
        private _promise: JQueryDeferred<T> = $.Deferred();
        private _isLoading = false;
        ready(): JQueryPromise<T> {
            if (!this._isLoading) {
                this._isLoading = true;
                this.loader()
                    .done((data: T): void => {
                        this.cached = data;
                        this._promise.resolve(this.cached);
                    })
                    .fail((xhr: JQueryXHR): void => {
                        this._promise.reject();
                    });
            }
            return this._promise;
        }

        reload(): JQueryPromise<T> {
            this._promise = $.Deferred();
            this.cached = undefined;
            this._isLoading = false;
            return this.ready();
        }
    }

}