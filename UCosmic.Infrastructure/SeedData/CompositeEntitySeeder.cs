namespace UCosmic.SeedData
{
    public class CompositeEntitySeeder : ISeedData
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly CoreSqlSeeder _coreSqlSeeder;
        //private readonly LanguageEntitySeeder _languageEntitySeeder;
        //private readonly LanguageSqlSeeder _languageSqlSeeder;
        //private readonly PlaceByGeoPlanetEntitySeeder _placeByGeoPlanetEntitySeeder;
        private readonly RoleEntitySeeder _roleEntitySeeder;
        private readonly EstablishmentEntitySeeder _establishmentEntitySeeder;
        private readonly EmailTemplateEntitySeeder _emailTemplateEntitySeeder;
        private readonly PersonEntitySeeder _personEntitySeeder;
        private readonly UserEntitySeeder _userEntitySeeder;
        private readonly MemberEntitySeeder _memberEntitySeeder;
        private readonly InstitutionalAgreementEntitySeeder _institutionalAgreementEntitySeeder;
        private readonly InstitutionalAgreementSettingsEntitySeeder _institutionalAgreementSettingsEntitySeeder;
        private readonly EmployeeEntitySeeder _employeeEntitySeeder;
        private readonly AffiliationEntitySeeder _affiliationEntitySeeder;

        public CompositeEntitySeeder(IUnitOfWork unitOfWork
            , CoreSqlSeeder coreSqlSeeder
            //, LanguageEntitySeeder languageEntitySeeder
            //, LanguageSqlSeeder languageSqlSeeder
            //, PlaceByGeoPlanetEntitySeeder placeByGeoPlanetEntitySeeder
            , RoleEntitySeeder roleEntitySeeder
            , EstablishmentEntitySeeder establishmentEntitySeeder
            , EmailTemplateEntitySeeder emailTemplateEntitySeeder
            , PersonEntitySeeder personEntitySeeder
            , UserEntitySeeder userEntitySeeder
            , MemberEntitySeeder memberEntitySeeder
            , InstitutionalAgreementEntitySeeder institutionalAgreementEntitySeeder
            , InstitutionalAgreementSettingsEntitySeeder institutionalAgreementSettingsEntitySeeder
            , EmployeeEntitySeeder employeeEntitySeeder
            , AffiliationEntitySeeder affiliationEntitySeeder
        )
        {
            _unitOfWork = unitOfWork;
            _coreSqlSeeder = coreSqlSeeder;
            //_languageSqlSeeder = languageSqlSeeder;
            //_languageEntitySeeder = languageEntitySeeder;
            //_placeByGeoPlanetEntitySeeder = placeByGeoPlanetEntitySeeder;
            _roleEntitySeeder = roleEntitySeeder;
            _establishmentEntitySeeder = establishmentEntitySeeder;
            _employeeEntitySeeder = employeeEntitySeeder; 
            _emailTemplateEntitySeeder = emailTemplateEntitySeeder;
            _personEntitySeeder = personEntitySeeder;
            _userEntitySeeder = userEntitySeeder;
            _memberEntitySeeder = memberEntitySeeder;
            _institutionalAgreementEntitySeeder = institutionalAgreementEntitySeeder;
            _institutionalAgreementSettingsEntitySeeder = institutionalAgreementSettingsEntitySeeder;
            _affiliationEntitySeeder = affiliationEntitySeeder;
        }

        public void Seed()
        {
            //_languageEntitySeeder.Seed();
            //_languageSqlSeeder.Seed();
            //_placeByGeoPlanetEntitySeeder.Seed();
            _coreSqlSeeder.Seed();

            /* Note these lines are order dependent. */
            _roleEntitySeeder.Seed();
            _establishmentEntitySeeder.Seed();

            /* This needs to be here in order to seed the FacultyRanks so that Persons will get
                created with a FacultyRank.  We may need to move this in the future if any
                Employee domain entity requires references to Users, Persons or Members. */
            _employeeEntitySeeder.Seed();
            _emailTemplateEntitySeeder.Seed();
            _personEntitySeeder.Seed();
            _userEntitySeeder.Seed();
            _memberEntitySeeder.Seed();
            _institutionalAgreementEntitySeeder.Seed();
            _institutionalAgreementSettingsEntitySeeder.Seed();
            _affiliationEntitySeeder.Seed();

            _unitOfWork.SaveChanges();
        }
    }
}
