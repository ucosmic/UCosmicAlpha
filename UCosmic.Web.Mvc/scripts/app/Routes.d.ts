/// <reference path="../viewmodels/establishments/Routes.d.ts" />
/// <reference path="../viewmodels/employees/Routes.d.ts" />
/// <reference path="../viewmodels/people/Routes.d.ts" />

import EstablishmentsRoot = Establishments;
import EmployeesRoot = Employees;
import PeopleRoot = People;

declare module Routes {
    module Api {
        export var Establishments: EstablishmentsRoot.ApiRoutes.Establishments;
        export var Employees: EmployeesRoot.ApiRoutes.Employees;
        export var People: PeopleRoot.ApiRoutes.People;
    }

    module Mvc {
        export var Employees: EmployeesRoot.MvcRoutes.Employees;
    }
}