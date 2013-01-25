module DataContext {

	export class EmployeeFacultyRank {
		id: number;
		rank: string;
	};

	export class IEmployee{

		private _id: number;
		get Id() { return this._id; }
		set Id(inValue: number) { this._id = inValue; }

		private _baseUrl: string = "/api/people";
		get BaseUrl() { return this._baseUrl; }

		constructor(inId: number) {
			this.Id = inId;
		}

		Get(): JQueryDeferred { return null; }
		Post(dataOut: any): JQueryDeferred { return null; }
		Put(dataOut: any): JQueryDeferred { return null; }
		Delete(): JQueryDeferred { return null; }

		GetSalutations(): JQueryDeferred { return null; }
		GetFacultyRanks(): JQueryDeferred { return null; }
	}

}