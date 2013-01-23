/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="iemployee.ts" />

module DataContext {
	export class EmployeeWebService extends IEmployee {

		constructor(inId: number) {
			super(inId);
		}

		/*override*/ Get(inObj: any, callback: (cbParmObj: any, cbParmData: any) => void ): void {
			$.getJSON(this.BaseUrl + "/" + this.Id.toString(),
				 function (data) {
				 	callback(inObj, data);
				 });
		}

		/*override*/ Post(inObj: Object, callback: (cbParmObj: Object) => any): void { }

		/*override*/ Put(inObj: Object, callback: (cbParmObj: Object) => any): void {
			$.ajax({
				data: callback( inObj ),
				type: "PUT",
				url: this.BaseUrl + "/" + this.Id.toString()
			});
		}

		/*override*/ Delete() { }

		/*override*/ GetSalutations( inObj: Object, callback: (cbParmObj: Object, cbParmSalutations: string[]) => void ) : void {
		    	$.getJSON(this.BaseUrl + "/" + this.Id.toString() + "/salutations/",
		    		 function (data) {
		    		 	callback(inObj, data);
		    		 });
		    }
			
		/*override*/ GetFacultyRanks( inObj: Object, callback: (cbParmObj: Object, cbParmFacultyRanks: EmployeeFacultyRank[]) => void ) : void {
		    	$.getJSON(this.BaseUrl + "/" + this.Id.toString() + "/facultyranks/",
		    		 function (data) {
		    		 	callback(inObj, data);
		    		 });
		    }

	}
}