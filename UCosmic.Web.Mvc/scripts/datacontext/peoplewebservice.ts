/// <reference path="../jquery/jquery-1.8.d.ts" />
/// <reference path="people.ts" />
/// <reference path="../app/Routes.ts" />

module DataContext {
	export class PeopleWebService extends People {

		constructor(inId: number) {
			super(inId);
		}

		/*override*/ Get(): JQueryDeferred {
			var deferred: JQueryDeferred = $.Deferred();
			$.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString(),
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
                     url: this.GetBaseUrl() + "/" + this.GetId().toString() });
			return deferred;
		}

		/*override*/ GetSalutations(): JQueryDeferred {
			var deferred: JQueryDeferred = $.Deferred();
			//$.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString() + "/salutations/",
			$.getJSON(App.Routes.WebApi.People.Names.Salutations.get(),
				 function (data, textStatus, jqXHR) {
						deferred.resolve(data);
				 } );
			return deferred;
		}

		/*override*/ GetSuffixes(): JQueryDeferred {
			var deferred: JQueryDeferred = $.Deferred();
			//$.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString() + "/suffixes/",
			$.getJSON(App.Routes.WebApi.People.Names.Suffixes.get(),
				 function (data, textStatus, jqXHR) {
						deferred.resolve(data);
				 } );
			return deferred;
		}
		
		/*override*/ GetFacultyRanks(): JQueryDeferred {
			var deferred: JQueryDeferred = $.Deferred();
		  $.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString() + "/facultyranks/",
		    	function (data, textStatus, jqXHR) {
		    	deferred.resolve(data);
		    	});
			return deferred;
		}

	}
}