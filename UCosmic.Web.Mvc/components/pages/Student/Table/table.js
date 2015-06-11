/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
/// <reference path="../../../models/students.ts" />
var Student_Table = Students;
Polymer('is-page-student-table', {
    fire: null,
    fire_students: null,
    fire_students_students: null,
    fire_establishments: null,
    fire_students_terms: null,
    fire_students_levels: null,
    fire_students_programs: null,
    fire_students_mobilities: null,
    fire_students_mobilities_join: null,
    fire_countries: null,
    establishment_list: [],
    country_list: [],
    term_list: [],
    level_list: [],
    program_list: [],
    root: null,
    ready: function () {
        var _this = this;
        this.root = this;
        this.fire = new Firebase("https://UCosmic.firebaseio.com");
        this.fire_students = new Firebase("https://UCosmic.firebaseio.com/Students");
        this.fire_students_students = new Firebase("https://UCosmic.firebaseio.com/Students/Students");
        this.fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities");
        this.fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms");
        this.fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        this.fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels");
        this.fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");
        this.fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        this.fire_students_levels.on("value", function (snapshot) {
            _this.level_list = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_students_programs.on("value", function (snapshot) {
            _this.program_list = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_students_terms.on("value", function (snapshot) {
            _this.term_list = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_establishments.on("value", function (snapshot) {
            _this.establishment_list = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_countries.on("value", function (snapshot) {
            _this.country_list = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    },
    domReady: function () {
        if (this.firebase_token) {
            this.fire.authWithCustomToken(this.firebase_token, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                }
                else {
                    console.log("Login Succeeded!", authData);
                }
            });
        }
    },
    test2: function (_this) {
        _this = this;
        var norm = new Firebase.util.NormalizedCollection(_this.fire_students_mobilities, [_this.fire_establishments, 'Establishments', 'Mobilities.establishment'], [_this.fire_students_students, 'Students', 'Mobilities.student'], [_this.fire_students_levels, 'Levels', 'Mobilities.level'], [_this.fire_students_terms, 'Terms', 'Mobilities.term'], [_this.fire_countries, 'Countries', 'Mobilities.country'], [_this.fire_students_programs, 'Programs', 'Mobilities.program']);
        norm.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status');
        var ref = norm.ref();
        ref.on("value", function (snapshot) {
            console.log(snapshot.val());
            setTimeout(function () {
                var list = Firebase.getAsArray(norm.ref());
            }, 1);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        return (ref);
    },
    ajax_error: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            console.log(response.detail.response);
        }
        else {
            console.log(response.detail.response.error);
        }
    },
});
