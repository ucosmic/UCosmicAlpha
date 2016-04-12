module.exports = function (opts) {
    resetResults(function () {
        //console.log('test')
        opts.rawDataRef.on('child_added', function (snap) {
            //console.log('test2')
            var data = snap.val();
            var groupRef = getGroupRef(data);
            //console.log('test6')
            groupRef.child('count').transaction(increment);

            var value = data[opts.fields[1]] || data[opts.fields[0]] || 'none';
            var totalRef = groupRef.child(opts.fields[0]);
            totalRef.transaction(function (total) {
                total && Array.isArray(total) ? total.push(value) : total = [value];
                return total;
            });
            //opts.fields.forEach(function (field) {
            //    var value = data[field] || 0;
            //    var totalRef = groupRef.child(field);
            //    totalRef.transaction(function (total) {
            //        //console.log(Array.isArray(total));
            //        total && Array.isArray(total) ? total.push(value) : total = [value];
            //        //return total + value;
            //        return total;
            //    });
            //});
        });

        opts.rawDataRef.on('child_removed', function (snap) {
            var data = snap.val();
            var groupRef = getGroupRef(data);
            groupRef.child('count').transaction(decrement);
            opts.fields.forEach(function (field) {
                var value = data[field] || 0;
                var totalRef = groupRef.child(field);
                totalRef.transaction(function (total) {
                    return total - value;//this won't happen in students...
                });
            });
        });
    })

    function getGroupRef(data) {
        //console.log('test4')
        var group = opts.groupFunction(data);
        //console.log('test6')
        return opts.resultsRef.child(group);
    }

    function resetResults(callback) {
        //console.log('test5')
        opts.resultsRef.set({}, callback);
    }

    function increment(value) {
        return value + 1;
    }

    function decrement(value) {
        return value - 1;
    }
}