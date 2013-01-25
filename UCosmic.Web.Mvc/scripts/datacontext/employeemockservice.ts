/// <reference path="iemployee.ts" />

module DataContext {
		export class EmployeeMockService extends IEmployee {

			constructor( inId: number ) {
				super(inId);
			}
		}
}