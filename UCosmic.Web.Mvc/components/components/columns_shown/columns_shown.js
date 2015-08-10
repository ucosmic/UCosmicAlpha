/// <reference path="../../typediff/mytypes.d.ts" />
Polymer({
    is: 'is-columns_shown',
    behaviors: [Polymer.NeonAnimationRunnerBehavior],
    properties: {
        columns: {
            type: Array,
            notify: true,
            observer: 'columns_changed'
        },
        columns_count: {
            type: Number,
            notify: true,
        },
        animationConfig: {
            value: function () {
                return {
                    'open': {
                        name: 'scale-up-animation',
                        node: this.$.filter,
                        transformOrigin: '0% 0%'
                    },
                    'close': {
                        name: 'scale-down-animation',
                        node: this.$.filter,
                        transformOrigin: '0% 0%'
                    }
                };
            }
        },
        _showing: {
            type: Boolean,
            value: false
        },
        text: {
            type: String,
            notify: true
        }
    },
    listeners: {
        'neon-animation-finish': '_onAnimationFinish'
    },
    is_login: "",
    _onAnimationFinish: function () {
        if (this._showing) {
        }
        else {
            this.$.filter.style.visibility = 'hidden';
            this.$.column_container.style.zIndex = '-1';
        }
    },
    attached: function () {
    },
    created: function () {
    },
    columns_changed: function (new_value, old_value) {
        if (new_value) {
            this.columns_count = _.filter(new_value, function (value, index) {
                return value.is_shown;
            }).length;
        }
    },
    toggle: function (close) {
        this.$.filter.style.visibility = 'visible';
        this.$.column_container.style.zIndex = '1';
        if (this._showing) {
            this._showing = false;
            this.playAnimation('close');
        }
        else if (close !== true) {
            this._showing = true;
            this.playAnimation('open');
        }
    },
    remove_column: function (event) {
        var column = this.querySelector("#columns").indexForElement(event.target);
        this.columns[column].is_shown = false;
        this.columns = JSON.parse(JSON.stringify(this.columns));
    },
    add_column: function (event) {
        var column = this.querySelector("#columns").indexForElement(event.target);
        this.columns[column].is_shown = true;
        this.columns = JSON.parse(JSON.stringify(this.columns));
    }
});
