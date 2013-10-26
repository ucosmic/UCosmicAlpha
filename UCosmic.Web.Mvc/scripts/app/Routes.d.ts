/// <reference path="../viewmodels/employees/Routes.d.ts" />

import EmployeesRoot = Employees;

declare module Routes {
    module Api {
        export var Employees: EmployeesRoot.ApiRoutes.Employees;
    }

    module Mvc {
        export var Employees: EmployeesRoot.MvcRoutes.Employees;
    }
}