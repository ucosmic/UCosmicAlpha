var template_helpers = {
    null_to_zero: function (value) {
        if (!value) {
            return 0;
        }
        else {
            return value;
        }
    },
    set_id: function (name, index) {
        return (name + index);
    },
    compare: function (var_1, var_2) {
        return (var_1 == var_2);
    },
    compare_unequal: function (var_1, var_2) {
        return (var_1 != var_2);
    },
    concat: function () {
        var obj = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            obj[_i - 0] = arguments[_i];
        }
        var cat_string = "";
        for (var i = 0; i < obj.length; i++) {
            cat_string += obj[i];
        }
        return cat_string;
    },
    is_all_true: function () {
        var obj = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            obj[_i - 0] = arguments[_i];
        }
        var is_true = false;
        for (var i = 0; i < obj.length; i++) {
            if (!obj[i]) {
                is_true = true;
            }
        }
        return is_true;
    },
    is_all_false: function () {
        var obj = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            obj[_i - 0] = arguments[_i];
        }
        var is_true = true;
        for (var i = 0; i < obj.length; i++) {
            if (!obj[i]) {
                is_true = false;
            }
        }
        return is_true;
    },
    is_not_true: function (var_1) {
        return (var_1 == '' || !var_1);
    },
    is_greater_than: function (var_1, var_2) {
        return (var_1 > var_2);
    },
    is_less_than: function (var_1, var_2) {
        return (var_1 > var_2);
    }
};
