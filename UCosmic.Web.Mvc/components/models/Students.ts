/// <reference path="../../scripts/typings/lodash.d.ts" />
/// <reference path="../typediff/mytypes.d.ts" />
module Students {
    interface I_Excel_Options {
        status: string;
        level: string;
        term: string;
        //term_start: string;
        //term_end: string;
        establishment: string;//that created it
        country: string;
        program: string;
        //program_name: string;
        affiliation: string;
        student_affiliation: string;
        foreign_affiliation: string;
        student_external_id: string; 
    }
    //interface I_Excel_Options {
    //    student: string;
    //    student_establishment: string;
    //    external_id: string;
    //    status: string;
    //    level: string;
    //    level_establishment: string;
    //    level_name: string;
    //    rank: number;
    //    term: string;
    //    term_establishment: string
    //    term_name: string;
    //    start_date: string;
    //    end_date: string;
    //    establishment_official_name: string;
    //    foreign_establishment_official_name: string;
    //    student_establishment_official_name: string;
    //    country_official_name: string;
    //    program: string;
    //    program_establishment: string;
    //    program_is_standard: boolean;
    //    program_name: string;
    //}

    //interface I_Excel_Merged_Options extends I_Excel_Options {
    //    country: number;
    //    establishment: number;
    //    student_establishment: number; 
    //    foreign_establishment: number;
    //}
    export class Term {
        //_id: string;
        name: string;
        start_date: Date;
        end_date: Date;
        constructor(name: string, start_date: Date, end_date: Date) {

            this.name = name;
            this.start_date = start_date;
            this.end_date = end_date;
        }
    }
    //export class Term_Link {
    //    //_id: string;
    //    student_id: string;
    //    term_id: string;
    //    constructor(student_id: string, term_id: string) {

    //        this.student_id = student_id;
    //        this.term_id = term_id;
    //    }
    //}
    //export class Affiliations {
    //    //_id: string;
    //    student_id: string;
    //    establishment_id: string;
    //    constructor(student_id: string, establishment_id: string) {

    //        this.student_id = student_id;
    //        this.establishment_id = establishment_id;
    //    }
    //}

    export class Level {
        //_id: string;
        establishment_id: string;
        name: string;
        rank: string;
        constructor(establishment_id: string, name: string, rank: string) {

            this.establishment_id = establishment_id;
            this.name = name;
            this.rank = rank;
        }
    }

    export class Student {
        //_id: string;
        external_id: string;
        level_id: string;
        constructor(external_id: string, level_id: string) {

            this.external_id = external_id;
            this.level_id = level_id;
        }
    }

    export class Mobility {
        student_id: string;
        status: string;
        level_id: string;
        term_id: string;
        country: string;
        country_id: number;
        program_id: string;
        establishment: string;
        establishment_id: number;
        constructor(student_id: string, status: string, level_id: string, term_id: string, country: string, country_id: number, program_id: string, establishment: string, establishment_id?: number) {

            this.student_id = student_id;
            this.status = status;
            this.level_id = level_id;
            this.term_id = term_id;
            this.country = country;
            this.country_id = country_id;
            this.program_id = program_id;
            this.establishment = establishment;
            this.establishment_id = establishment_id;
        }
    }

    export class Excel { 
        status: string;
        level: string;
        term: string;
        //term_start: string;
        //term_end: string;
        establishment: string;//that created it
        country: string;
        program: string;
        program_name: string;
        affiliation: string;
        student_affiliation: string;
        foreign_affiliation: string;
        student_external_id: string; 
        constructor(options: I_Excel_Options) {

            //this.student = options.student;
            this.establishment = options.establishment;
            this.status = options.status;
            this.level = options.level;
            this.term = options.term;
            //this.term_start = options.term_start;
            //this.term_end = options.term_end;
            this.country = options.country;
            this.program = options.program;
            //this.program_name = options.program_name;
            this.affiliation = options.affiliation;
            this.student_affiliation = options.student_affiliation;
            this.foreign_affiliation = options.foreign_affiliation;
            //this.student = options.student; 
            this.student_external_id = options.student_external_id;

        }
    }
    export class Request_Azure {
        uCosmicAffiliation: string;
        country: string;
        uCosmicStudentAffiliation: string;
        uCosmicForiegnAffiliation: string;
        constructor(country: string, uCosmicStudentAffiliation?: string, uCosmicForiegnAffiliation?: string, uCosmicAffiliation?: string) {
            this.uCosmicAffiliation = uCosmicAffiliation;
            this.country = country;
            this.uCosmicStudentAffiliation = uCosmicStudentAffiliation;
            this.uCosmicForiegnAffiliation = uCosmicForiegnAffiliation;
        }
    }
    
}

//export module Student;