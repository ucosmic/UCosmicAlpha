
var closest = {
    closest_utility: function () {
        return {
            find_closest: function(el, selector) {
                var matchesFn;

                // find vendor prefix
                ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
                    if (typeof document.body[fn] == 'function') {
                        matchesFn = fn;
                        return true;
                    }
                    return false;
                })

                // traverse parents
                var parent, child;
                while (el!==null) {
                    parent = el.parentElement;
                    child = parent.querySelector(selector);
                    if (el!==null && el[matchesFn](selector)) {
                        return el;
                    }
                    else if (parent!==null && parent[matchesFn](selector)) {
                        return parent;
                    }else if(child){
                        return child;
                    }
                    el = parent;
                }

                return null;
            }
            , find_closest_parent: function(el, selector) {
                var matchesFn;

                // find vendor prefix
                ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
                    if (typeof document.body[fn] == 'function') {
                        matchesFn = fn;
                        return true;
                    }
                    return false;
                })

                // traverse parents
                var parent, child;
                while (el!==null) {
                    parent = el.parentElement;
                    //child = parent.querySelector(selector);
                    if (parent!==null && parent[matchesFn](selector)) {
                        return parent;
                    }
                    //else if(child){
                    //    return child;
                    //}
                    el = parent;
                }

                return null;
            }
        };
    }
};