namespace UCosmic.Domain.LanguageExpertises
{
    public static class LanguageProficiency
    {
        public enum Component
        {
            Speaking,
            Listening,
            Reading,
            Writing,
            NumberOfComponents
        };

        public enum Proficiency
        {
            None,
            Elementary,
            LimitedWorking,
            GeneralProfessional,
            AdvancedProfessional,
            FunctionallyNative,
            NumberOfProficiencies
        };

        public struct ScaleEntry
        {
            public int Weight;
            public Proficiency Proficiency;
            public string Description;
        };

        public static ScaleEntry[] Scales =
        {
            new ScaleEntry { Weight = 0, Proficiency = Proficiency.None, Description  = "No Proficiency" },
            new ScaleEntry { Weight = 1, Proficiency = Proficiency.Elementary, Description  = "Elementary Proficiency" },
            new ScaleEntry { Weight = 2, Proficiency = Proficiency.LimitedWorking, Description  = "Limited Working Proficiency" },
            new ScaleEntry { Weight = 3, Proficiency = Proficiency.GeneralProfessional, Description  = "General Professional Proficiency" },
            new ScaleEntry { Weight = 4, Proficiency = Proficiency.AdvancedProfessional, Description  = "Advanced Professional Proficiency" },
            new ScaleEntry { Weight = 5, Proficiency = Proficiency.FunctionallyNative, Description = "Functionally Native Proficiency" }
        };

        public struct Meaning
        {
            public Proficiency Proficiency;
            public string Description;
        }

        public static Meaning[] ReadingMeanings =
        {
            new Meaning { Proficiency = Proficiency.None, Description = "" },
            new Meaning { Proficiency = Proficiency.Elementary, Description = "Limited understanding of words, announcements, phrases, and descriptions." },
            new Meaning { Proficiency = Proficiency.LimitedWorking, Description = "Limited comprehension, idea transfer and working (non-technical) vocabulary." },
            new Meaning { Proficiency = Proficiency.GeneralProfessional, Description = "Normal rate of speed for reading and comprehension but nuances, subtleties and idioms sometimes missed or misinterpreted." },
            new Meaning { Proficiency = Proficiency.AdvancedProfessional, Description = "Able to read fluently and accurately all styles and forms of language pertinent to professional needs, as well as “between the lines” nuance and subtlety; nearly native ability with accurate interpretations and cultural understandings." },
            new Meaning { Proficiency = Proficiency.FunctionallyNative, Description = "Is equivalent to a well-educated native reader including full comprehension of archaic, technical and/or highly colloquial writing." }
        };

        public static Meaning[] SpeakingMeanings =
        {
            new Meaning { Proficiency = Proficiency.None, Description = "" },
            new Meaning { Proficiency = Proficiency.Elementary, Description = "Limited expression of basic courtesy wants and needs." },
            new Meaning { Proficiency = Proficiency.LimitedWorking, Description = "Can satisfy basic social demands and work requirements; is at ease speaking the language but often has to be corrected with unfamiliar or local customary usages." },
            new Meaning { Proficiency = Proficiency.GeneralProfessional, Description = "Normal rate of speaking and little exchange misunderstanding; pauses in conversation are filled appropriately." },
            new Meaning { Proficiency = Proficiency.AdvancedProfessional, Description = "Able to use the language fluently and accurately on all levels normally pertinent to professional needs; speech comes effortlessly and fluidly." },
            new Meaning { Proficiency = Proficiency.FunctionallyNative, Description = "Is functionally equivalent to that of a highly articulate native speaker and reflects the cultural standards of the country where the language is natively spoken." }
        };

        public static Meaning[] ListeningMeanings =
        {
            new Meaning { Proficiency = Proficiency.None, Description = "" },
            new Meaning { Proficiency = Proficiency.Elementary, Description = "Limited understanding of basic survival needs." },
            new Meaning { Proficiency = Proficiency.LimitedWorking, Description = "Understands conversations on routine social demands and limited job requirements at normal speed with some repetition and rewording." },
            new Meaning { Proficiency = Proficiency.GeneralProfessional, Description = "Understands all of the essentials in a standard dialect including technical discussions at normal clarity and speed; able to understand sociolinguistic and cultural references." },
            new Meaning { Proficiency = Proficiency.AdvancedProfessional, Description = "Able to understand all forms and styles of speech pertinent to professional needs in all dialects along with subtleties and nuances; displays strong sensitivity to sociolinguistic and cultural references." },
            new Meaning { Proficiency = Proficiency.FunctionallyNative, Description = "Has proficiency equivalent to a well-educated native listener and complete understanding of how a native thinker creates discourse." }
        };

        public static Meaning[] WritingMeanings =
        {
            new Meaning { Proficiency = Proficiency.None, Description = "" },
            new Meaning { Proficiency = Proficiency.Elementary, Description = "Limited ability to convey basic practical needs about familiar topics." },
            new Meaning { Proficiency = Proficiency.LimitedWorking, Description = "Able to write routine social correspondence and prepare materials required for most limited work requirements; writing is generally accurate; strong in vocabulary or grammar, but generally not both." },
            new Meaning { Proficiency = Proficiency.GeneralProfessional, Description = "Able to write the language in a few prose styles pertinent to professional/educational needs, but not always able to tailor it to a particular audience; grammatical and vocabulary errors are minimal ." },
            new Meaning { Proficiency = Proficiency.AdvancedProfessional, Description = "Able to write the language precisely and accurately in a wide variety of prose styles pertinent to professional/educational needs; writing is organized, flexible, clear and consistent." },
            new Meaning { Proficiency = Proficiency.FunctionallyNative, Description = "Has writing proficiency equal to that of a well-educated native without errors of structure, spelling, style or vocabulary; can write and edit all varieties of correspondence." }
        };
    }
}
