/// <reference path="../../scripts/typings/lodash.d.ts" />
/// <reference path="../typediff/mytypes.d.ts" />
module Students {
    interface I_Excel_Options {
        mobility_status: string;
        mobility_level: string;
        mobility_term: string;
        mobility_establishment: string;//that created it
        mobility_country: string;
        mobility_program: string;
        mobility_affiliation: string;
        mobility_sub_affiliation: string;
        mobility_foreign_affiliation: string;
        mobility_student: string;
        student: string;
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
        mobility_status: string;
        mobility_level: string;
        mobility_term: string;
        mobility_establishment: string;//that created it
        mobility_country: string;
        mobility_program: string;
        mobility_affiliation: string;
        mobility_sub_affiliation: string;
        mobility_foreign_affiliation: string;
        mobility_student: string;
        student: string;
        student_external_id: string; 
        constructor(options: I_Excel_Options) {

            this.student = options.student;
            this.mobility_establishment = options.mobility_establishment;
            this.mobility_status = options.mobility_status;
            this.mobility_level = options.mobility_level;
            this.mobility_term = options.mobility_term;
            this.mobility_country = options.mobility_country;
            this.mobility_program = options.mobility_program;
            this.mobility_affiliation = options.mobility_affiliation;
            this.mobility_sub_affiliation = options.mobility_sub_affiliation;
            this.mobility_foreign_affiliation = options.mobility_foreign_affiliation;
            this.mobility_student = options.mobility_student; 
            this.student_external_id = options.student_external_id;

        }
    }
    //export class Excel {
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
    //    constructor(options: I_Excel_Options) {

    //        this.student = options.student;
    //        this.student_establishment = options.student_establishment;
    //        this.external_id = options.external_id;
    //        this.status = options.status;
    //        this.establishment_official_name = options.establishment_official_name;
    //        this.level = options.level;
    //        this.level_establishment = options.level_establishment;
    //        this.level_name = options.level_name;
    //        this.rank = options.rank;
    //        this.term = options.term;
    //        this.term_establishment = options.term_establishment;
    //        this.term_name = options.term_name;
    //        this.start_date = options.start_date;
    //        this.end_date = options.end_date;
    //        this.country_official_name = options.country_official_name;
    //        this.program = options.program;
    //        this.program_name = options.program_name;
    //        this.program_establishment = options.program_establishment;
    //        this.program_is_standard = options.program_is_standard;
    //        this.student_establishment_official_name = options.student_establishment_official_name;
    //        this.foreign_establishment_official_name = options.foreign_establishment_official_name;
    //    }
    //}

    //export class Excel_Merged extends Excel {

    //    country: number;
    //    establishment: number;
    //    student_establishment: number;
    //    foreign_establishment: number;
    //    constructor(options: I_Excel_Merged_Options)
    //    {
    //        super(options);

    //        this.country = options.country;
    //        this.establishment = options.establishment;
    //        this.student_establishment = options.student_establishment;
    //        this.foreign_establishment = options.foreign_establishment;
    //    }
    //}
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