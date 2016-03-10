/// <reference path="../../scripts/typings/lodash.d.ts" />
/// <reference path="../typediff/mytypes.d.ts" />
var Students;
(function (Students) {
    var Term = (function () {
        function Term(name, start_date, end_date) {
            this.name = name;
            this.start_date = start_date;
            this.end_date = end_date;
        }
        return Term;
    })();
    Students.Term = Term;
    var Level = (function () {
        function Level(establishment_id, name, rank) {
            this.establishment_id = establishment_id;
            this.name = name;
            this.rank = rank;
        }
        return Level;
    })();
    Students.Level = Level;
    var Student = (function () {
        function Student(external_id, level_id) {
            this.external_id = external_id;
            this.level_id = level_id;
        }
        return Student;
    })();
    Students.Student = Student;
    var Mobility = (function () {
        function Mobility(student_id, status, gender, immigration_status, level_id, term_id, country, country_id, program_id, establishment, establishment_id) {
            this.student_id = student_id;
            this.status = status;
            this.gender = gender;
            this.immigration_status = immigration_status;
            this.level_id = level_id;
            this.term_id = term_id;
            this.country = country;
            this.country_id = country_id;
            this.program_id = program_id;
            this.establishment = establishment;
            this.establishment_id = establishment_id;
        }
        return Mobility;
    })();
    Students.Mobility = Mobility;
    var Excel = (function () {
        function Excel(options) {
            this.establishment = options.establishment;
            this.status = options.status;
            this.gender = options.gender;
            this.immigration_status = options.immigration_status;
            this.level = options.level;
            this.term = options.term;
            this.country = options.country;
            this.program = options.program;
            this.affiliation = options.affiliation;
            this.student_affiliation = options.student_affiliation;
            this.foreign_affiliation = options.foreign_affiliation;
            this.student_external_id = options.student_external_id;
        }
        return Excel;
    })();
    Students.Excel = Excel;
    var Request_Azure = (function () {
        function Request_Azure(country, uCosmicStudentAffiliation, uCosmicForiegnAffiliation, uCosmicAffiliation) {
            this.uCosmicAffiliation = uCosmicAffiliation;
            this.country = country;
            this.uCosmicStudentAffiliation = uCosmicStudentAffiliation;
            this.uCosmicForiegnAffiliation = uCosmicForiegnAffiliation;
        }
        return Request_Azure;
    })();
    Students.Request_Azure = Request_Azure;
})(Students || (Students = {}));
