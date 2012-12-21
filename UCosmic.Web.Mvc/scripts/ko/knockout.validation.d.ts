/// <reference path="knockout-2.2.d.ts" />

interface KnockoutSubscribableFunctions {
    isValidating: KnockoutObservableBool;
}

interface KnockoutStatic {
    validation: KnockoutValidation;
}

interface KnockoutValidationAsyncCallbackArgs {
    isValid: bool;
    message: string;
}

interface KnockoutValidationAsyncCallback {
    (options: bool): void;
    (options: KnockoutValidationAsyncCallbackArgs): void;
}

interface KnockoutValidation {
    rules: any;
    registerExtenders: () => void;
    group: (obj: any, options?: any) => () => string[];
}

interface KnockoutValidatable {
    isValid: bool;
    errors: any;
}