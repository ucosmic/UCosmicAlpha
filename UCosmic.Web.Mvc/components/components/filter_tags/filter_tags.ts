/// <reference path="../../typediff/mytypes.d.ts" />
Polymer({
    is: 'is-filter_tags',
    behaviors: [Polymer.NeonAnimationRunnerBehavior],
    properties: {

        tags: {
            type: Array,
            notify: true,
            observer: 'tags_changed'
        }
        , tags_count: {
            type: Number,
            notify: true,
        }
        , animationConfig: {
            value: function () {
                return {
                    'open': {
                        // provided by neon-animation/animations/scale-up-animation.html
                        name: 'scale-up-animation',
                        node: this.$.filter
                        , transformOrigin: '100% 0%'// + (this.$.filter.clientWidth - 20)
                    },
                    'close': {
                        // provided by neon-animation-animations/fade-out-animation.html
                        name: 'scale-down-animation',
                        node: this.$.filter
                        , transformOrigin: '100% 0%'
                    }
                }
            }
        }
        , _showing: {
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
            //this.$.filter.style.transform = 'scale(100,100)';
        } else {
            this.$.filter.style.visibility = 'hidden';
            this.$.filter_container.style.zIndex = '-1';
        }
    },

    attached: function () {
        //this.$.filter.style.display = 'none';
        //this.$.filter.style.width = 0;
        //this.$.filter.style.transform = 'scale(0,0)';
        //this.$.filter.style.overflow = 'hidden';
        //this.toggle_nav();
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
        //this.$.filter.style.right = (this.$.filter.clientWidth - 20) + 'px';
        //this._showing = true;
        //var close_menu = (event) => {
        //    this.toggle_nav();
        //}
        if (this._showing) {
            this.$.filter.style.visibility = 'visible';
            this.$.filter_container.style.zIndex = '1';
            //document.body.removeEventListener('click',
            //    close_menu,false);
            this._showing = false;
            this.playAnimation('close');
        } else if (close !== true) {
            this.$.filter.style.visibility = 'visible';
            this.$.filter_container.style.zIndex = '1';
            //document.body.addEventListener('click',
            //    close_menu,false);
            this._showing = true;
            this.playAnimation('open');
        }
    }
    , remove_tag: function (event) {

        var tag = this.querySelector("#tags").itemForElement(event.target);
        //this.tags.pop(tag);
        this.tags = JSON.parse(JSON.stringify(_.pull(this.tags, tag)));//used json object copy to notify view
        //this.tags_changed(this.tags);
    }
    
}); 