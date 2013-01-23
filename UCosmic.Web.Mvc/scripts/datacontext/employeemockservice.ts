/// <reference path="iemployee.ts" />

module DataContext {
		export class EmployeeMockService extends IEmployee {

			constructor( inId: number ) {
				super(inId);
			}

		  /*override*/ GetFacultyRanks(): string[] {
			var facultyRanks: string[] = new string[];

			facultyRanks.push("Alpha");
			facultyRanks.push("Beta");
			facultyRanks.push("Gamma");
			facultyRanks.push("Delta");

			return facultyRanks;
		}

	}
}