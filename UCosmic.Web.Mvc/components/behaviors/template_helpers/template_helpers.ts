var template_helpers = {

    //properties: {
    //    isHighlighted: {
    //        type: Boolean,
    //        value: false,
    //        notify: true,
    //        observer: '_highlightChanged'
    //    }
    //},
    //
    //listeners: {
    //    click: '_toggleHighlight'
    //},

    //created: function() {
    //    console.log('Highlighting for ', this, 'enabled!');
    //},
    null_to_zero: function(value){
        if(!value){
            return 0;
        }else{
            return value;
        }
    }

    ,set_id: function (name, index) {
        return (name + index);
    }
    , compare: function (var_1, var_2) {
        return (var_1 == var_2)
    }
    , compare_unequal: function (var_1, var_2) {
        return (var_1 != var_2)
    }
    , concat: function (...obj:String[]) {
        var cat_string = "";
        for (var i = 0; i < obj.length; i++) {
            cat_string += obj[i];
        }
        return cat_string;
    }
    , is_all_true: function (...obj:Object[]) {
        var is_true = false;//return oposite because I need it for hidden
        for (var i = 0; i < obj.length; i++) {
            if (!obj[i]) {
                is_true = true;//opposite
            }
        }
        return is_true;
    }
    , is_all_false: function (...obj:Object[]) {
        var is_true = true;//return oposite because I need it for hidden
        for (var i = 0; i < obj.length; i++) {
            if (!obj[i]) {
                is_true = false;//opposite
            }
        }
        return is_true;
    }
//, is_false: function(...obj: Object[]) {
//    var is_true = true;
//    for (var i = 0; i < obj.length; i++){
//        if(!obj[i]){
//            is_true = false;
//        }
//    }
//    return is_true;
//}
    , is_not_true: function (var_1) {
        return (var_1 == '' || !var_1)
    }
    , is_greater_than: function (var_1, var_2) {
        return (var_1 > var_2)
    }
    , is_less_than: function (var_1, var_2) {
        return (var_1 > var_2)
    }

};




