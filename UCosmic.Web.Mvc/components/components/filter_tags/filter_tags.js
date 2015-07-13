/// <reference path="../../typediff/mytypes.d.ts" />
Polymer({
    is: 'is-filter_tags',
    behaviors: [Polymer.NeonAnimationRunnerBehavior],
    properties: {
        tags: {
            type: Array,
            notify: true,
            observer: 'tags_changed'
        },
        tags_count: {
            type: Number,
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
    tags_changed: function (new_value, old_value) {
        if (new_value) {
            this.tags_count = new_value.length;
        }
    },
    toggle: function (close) {
        if (this._showing) {
            this.$.filter.style.visibility = 'visible';
            this.$.filter_container.style.zIndex = '1';
            this._showing = false;
            this.playAnimation('close');
        }
        else if (close !== true) {
            this.$.filter.style.visibility = 'visible';
            this.$.filter_container.style.zIndex = '1';
            this._showing = true;
            this.playAnimation('open');
        }
    },
    remove_tag: function (event) {
        var tag = this.querySelector("#tags").itemForElement(event.target);
        this.tags = JSON.parse(JSON.stringify(_.pull(this.tags, tag)));
    }
});
