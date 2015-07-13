/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
Polymer({
    is: "is-page-student-new",
    properties: {
        styledomain: {
            type: String,
            notify: true,
        },
        tenant_id: {
            type: String,
            notify: true,
        },
        firebase_token: {
            type: String,
            notify: true,
        },
        my_fire: {
            type: Object,
            readOnly: true,
            notify: true,
            value: new Firebase("https://UCosmic.firebaseio.com")
        },
        controller: {
            type: Object,
            readOnly: true,
            notify: true,
            value: function () {
                return this;
            },
        }
    },
    attached: function () {
        if (this.firebase_token) {
            this.my_fire.authWithCustomToken(this.firebase_token, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                }
                else {
                    console.log("Login Succeeded!", authData);
                }
            });
        }
        this.$.file_input.addEventListener('change', this.handleFile, false);
    },
    handleFile: function (e) {
        var _this = document.getElementById("new_student_page");
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
            var reader = new FileReader();
            var name = f.name;
            reader.onload = function (e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, { type: 'binary' });
                var sheet = workbook.Sheets[workbook.SheetNames[0]];
                _this.end_col = sheet["!ref"].substr(3, 1);
                _this.end_row = sheet["!ref"].substr(4);
                var my_array = new Array();
                var worker = new Worker('/components/resources/js/student_in_out_excel.js');
                worker.postMessage({ 'sheet': JSON.stringify(sheet), 'my_array': JSON.stringify(my_array), 'tenant_id': _this.tenant_id.toString() });
            };
            reader.readAsBinaryString(f);
        }
    },
});
