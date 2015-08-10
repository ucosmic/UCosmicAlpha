/// <reference path="../../typediff/mytypes.d.ts" />
Polymer({
    is: 'is-columns_shown',
    behaviors: [Polymer.NeonAnimationRunnerBehavior],
    properties: {

        columns: {
            type: Array,
            notify: true,
            observer: 'columns_changed'
        }
        , columns_count: {
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
                        , transformOrigin: '0% 0%'// + (this.$.filter.clientWidth - 20)
                    },
                    'close': {
                        // provided by neon-animation-animations/fade-out-animation.html
                        name: 'scale-down-animation',
                        node: this.$.filter
                        , transformOrigin: '0% 0%'
                    }
                }
            }
        }
        , _showing: {
            type: Boolean,
            value: false
        }
        , text: {
            type: String
            , notify: true
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
            this.$.column_container.style.zIndex = '-1';
        }
    },

    attached: function () {
    },
    
    created: function () {
    },
    columns_changed: function (new_value, old_value) {
        if (new_value) {
            this.columns_count = _.filter(new_value, function(value: any, index){
                return value.is_shown
            }).length;
        }
    },
    toggle: function (close) {
        //this.$.filter.style.right = (this.$.filter.clientWidth - 20) + 'px';
        //this._showing = true;
        //var close_menu = (event) => {
        //    this.toggle_nav();
        //}
        this.$.filter.style.visibility = 'visible';
        this.$.column_container.style.zIndex = '1';
        if (this._showing) {
            //this.$.filter.style.visibility = 'visible';
            //this.$.column_container.style.zIndex = '1';
            //document.body.removeEventListener('click',
            //    close_menu,false);
            this._showing = false;
            this.playAnimation('close');
        } else if (close !== true) {
            //this.$.filter.style.visibility = 'visible';
            //this.$.column_container.style.zIndex = '1';
            //document.body.addEventListener('click',
            //    close_menu,false);
            this._showing = true;
            this.playAnimation('open');
        }
    }
    , remove_column: function (event) {

        var column = this.querySelector("#columns").indexForElement(event.target);
        this.columns[column].is_shown = false;
        this.columns = JSON.parse(JSON.stringify(this.columns));//used json object copy to notify view
        //this.columns_changed(this.columns);
    }
    , add_column: function (event) {

        var column = this.querySelector("#columns").indexForElement(event.target);
        //this.columns.pop(column);
        this.columns[column].is_shown = true;
        this.columns = JSON.parse(JSON.stringify(this.columns));//used json object copy to notify view
        //this.columns_changed(this.columns);
    }
    
}); 