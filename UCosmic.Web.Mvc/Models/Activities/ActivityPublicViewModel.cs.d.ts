declare module server {

	interface ActivityPublicViewModel{
		Mode: Object;
		ActivityId: Number;
		Title: String;
		Content: Object;
		StartsOn: Object;
		EndsOn: Object;
		StartsFormat: String;
		EndsFormat: String;
		OnGoing: Object;
		IsExternallyFunded: Object;
		IsInternallyFunded: Object;
		Types: Array;
		Places: Array;
		Tags: Array;
		Documents: Array;
		Person: Object;
}
}
