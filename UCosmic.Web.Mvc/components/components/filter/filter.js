/// <reference path="../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../typediff/mytypes.d.ts" />
Polymer({
    is: "is-filter",
    behaviors: [Polymer.NeonAnimationRunnerBehavior],
    properties: {
        nav_list: {
            type: Object,
            notify: true,
        },
        animationConfig: {
            value: function () {
                return {
                    'open': {
                        name: 'scale-up-animation',
                        node: this.$.filter,
                        transformOrigin: '100% 0%'
                    },
                    'close': {
                        name: 'scale-down-animation',
                        node: this.$.filter,
                        transformOrigin: '100% 0%'
                    }
                };
            }
        },
        _showing: {
            type: Boolean,
            value: false
        },
        filter_closed: {
            type: Boolean,
            value: false,
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
            this.$.filter_container.style.zIndex = '-1';
        }
    },
    attached: function () {
    },
    change_page: function () {
        this.toggle_nav();
    },
    created: function () {
    },
    toggle: function () {
        this.$.filter.style.visibility = 'visible';
        this.$.filter_container.style.zIndex = '1';
        if (this._showing) {
            this._showing = false;
            this.playAnimation('close');
            this.filter_closed = true;
        }
        else {
            this._showing = true;
            this.playAnimation('open');
            this.filter_closed = false;
        }
    }
});
