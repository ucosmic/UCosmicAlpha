/// <reference path="../../scripts/typings/lodash.d.ts" />
/// <reference path="../typediff/mytypes.d.ts" />
module Students {
    interface I_Excel_Options {
        status: string;
        gender: string;
        immigration_status: string;
        level: string;
        term: string;
        establishment: string;//that created it
        country: string;
        program: string;
        affiliation: string;
        student_affiliation: string;
        foreign_affiliation: string;
        student_external_id: string; 
    }
    export class Term {
        name: string;
        start_date: Date;
        end_date: Date;
        constructor(name: string, start_date: Date, end_date: Date) {

            this.name = name;
            this.start_date = start_date;
            this.end_date = end_date;
        }
    }
    export class Level {
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
        gender: string;
        immigration_status: string;
        level_id: string;
        term_id: string;
        country: string;
        country_id: number;
        program_id: string;
        establishment: string;
        establishment_id: number;
        constructor(student_id: string, status: string, gender: string, immigration_status: string, level_id: string, term_id: string, country: string, country_id: number, program_id: string, establishment: string, establishment_id?: number) {

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
    }

    export class Excel {
        status: string;
        gender: string;
        immigration_status: string;
        level: string;
        term: string;
        establishment: string;//that created it
        country: string;
        program: string;
        program_name: string;
        affiliation: string;
        student_affiliation: string;
        foreign_affiliation: string;
        student_external_id: string; 
        constructor(options: I_Excel_Options) {
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