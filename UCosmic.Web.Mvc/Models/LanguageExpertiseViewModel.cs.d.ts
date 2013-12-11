declare module server {

	interface LanguageExpertiseViewModel{
		Id: Number;
		PersonId: Number;
		LanguageId: Object;
		Dialect: String;
		Other: String;
		LanguageName: String;
		Speaking: Object;
		Listening: Object;
		Reading: Object;
		Writing: Object;
}
	interface LanguageExpertiseItemViewModel{
		Meaning: String;
		Proficiency: Number;
		Description: String;
}
}
