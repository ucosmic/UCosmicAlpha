declare module server {

    interface LanguageExpertiseViewModel {
        Id: Number;
        PersonId: Number;
        LanguageId: Object;
        Dialect: String;
        Other: String;
        SpeakingProficiency: Number;
        ListeningProficiency: Number;
        ReadingProficiency: Number;
        WritingProficiency: Number;
        LanguageName: String;
        SpeakingMeaning: String;
        ReadingMeaning: String;
        ListeningMeaning: String;
        WritingMeaning: String;
        SpeakingDescription: String;
        ReadingDescription: String;
        ListeningDescription: String;
        WritingDescription: String;
    }
}
