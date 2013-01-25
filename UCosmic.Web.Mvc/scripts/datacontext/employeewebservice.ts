/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="iemployee.ts" />

module DataContext {
	export class EmployeeWebService extends IEmployee {

		constructor(inId: number) {
			super(inId);
		}

		/*override*/ Get(): JQueryDeferred {
			var deferred: JQueryDeferred = $.Deferred();
			$.getJSON(this.BaseUrl + "/" + this.Id.toString(),
				 function (data, textStatus, jqXHR) {
				 	deferred.resolve(data);
				 });
			return deferred;
		}

		/*override*/ Put(dataOut: any): JQueryDeferred {
            var deferred: JQueryDeferred = $.Deferred();
			$.ajax({ data: dataOut,
                     type: "PUT",
                     success: function (data, textStatus, jqXHR) { deferred.resolve(data) },
                     error: function (jqXHR, textStatus, errorThrown) { deferred.reject(errorThrown) },
                     url: this.BaseUrl + "/" + this.Id.toString() });
			return deferred;
		}

		/*override*/ GetSalutations(): JQueryDeferred {
			var deferred: JQueryDeferred = $.Deferred();
			$.getJSON(this.BaseUrl + "/" + this.Id.toString() + "/salutations/",
				 function (data, textStatus, jqXHR) {
						deferred.resolve(data);
				 } );
			return deferred;
		}

		/*override*/ GetFacultyRanks(): JQueryDeferred {
			var deferred: JQueryDeferred = $.Deferred();
		  $.getJSON(this.BaseUrl + "/" + this.Id.toString() + "/facultyranks/",
		    	function (data, textStatus, jqXHR) {
		    	deferred.resolve(data);
		    	});
			return deferred;
		}

	}
}