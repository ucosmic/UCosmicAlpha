var Activities;
(function (Activities) {
    (function (ViewModels) {
        (function (ActivityMode) {
            ActivityMode[ActivityMode["draft"] = 1] = "draft";
            ActivityMode[ActivityMode["published"] = 2] = "published";
        })(ViewModels.ActivityMode || (ViewModels.ActivityMode = {}));
        var ActivityMode = ViewModels.ActivityMode;
        (function (ActivityTagDomainType) {
            ActivityTagDomainType[ActivityTagDomainType["custom"] = 1] = "custom";
            ActivityTagDomainType[ActivityTagDomainType["place"] = 2] = "place";
            ActivityTagDomainType[ActivityTagDomainType["establishment"] = 3] = "establishment";
        })(ViewModels.ActivityTagDomainType || (ViewModels.ActivityTagDomainType = {}));
        var ActivityTagDomainType = ViewModels.ActivityTagDomainType;
    })(Activities.ViewModels || (Activities.ViewModels = {}));
    var ViewModels = Activities.ViewModels;
})(Activities || (Activities = {}));
//# sourceMappingURL=ActivityEnums.js.map
