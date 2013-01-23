module DataContext {

	export class EmployeeFacultyRank {
		employeeFacultyRankId: number;
		rank: string;
	};

	export class IEmployee{

		private _id: number;
		get Id() { return this._id; }
		set Id(inValue: number) { this._id = inValue; }

		private _baseUrl: string = "/api/person";
		get BaseUrl() { return this._baseUrl; }

		constructor(inId: number) {
			this.Id = inId;
		}

		Get(inObj: any, callback: (cbParmObj: any, cmParmData: any) => void): void { }
		Post(inObj: Object, callback: (cbParmObj: Object) => any): void { }
		Put(inObj: Object, callback: (cbParmObj: Object) => any): void { }
		Delete() { }

		GetSalutations( obj: Object, callback: (obj: Object, salutations: string[]) => void ) : void { }
		GetFacultyRanks( obj: Object, callback: (obj: Object, facultyRanks: EmployeeFacultyRank[]) => void ) : void { }
	}

}