namespace UCosmic.SeedData
{
    public class CompositeEntitySeeder : ISeedData
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly CoreSqlSeeder _coreSqlSeeder;
        //private readonly LanguageEntitySeeder _languageEntitySeeder; //
        //private readonly LanguageSqlSeeder _languageSqlSeeder; //
        //private readonly PlaceByGeoPlanetEntitySeeder _placeByGeoPlanetEntitySeeder; //
        private readonly RoleEntitySeeder _roleEntitySeeder;
        private readonly EstablishmentEntitySeeder _establishmentEntitySeeder;
        private readonly EmailTemplateEntitySeeder _emailTemplateEntitySeeder;
        private readonly PersonEntitySeeder _personEntitySeeder;
        private readonly UserEntitySeeder _userEntitySeeder;
        private readonly MemberEntitySeeder _memberEntitySeeder;
        private readonly InstitutionalAgreementEntitySeeder _institutionalAgreementEntitySeeder;
        private readonly InstitutionalAgreementSettingsEntitySeeder _institutionalAgreementSettingsEntitySeeder;
        private readonly EmployeeModuleSettingsEntitySeeder _employeeModuleSettingsEntitySeeder;
        private readonly EmployeeEntitySeeder _employeeEntitySeeder;
        private readonly AffiliationEntitySeeder _affiliationEntitySeeder;
        private readonly ActivityEntitySeeder _activityEntitySeeder;
        private readonly LoadableFileEntitySeeder _loadableFileEntitySeeder;
        private readonly ImageEntitySeeder _imageEntitySeeder;

        public CompositeEntitySeeder(IUnitOfWork unitOfWork
            , CoreSqlSeeder coreSqlSeeder
            //, LanguageEntitySeeder languageEntitySeeder // this or CoreSqlSeeder
            //, LanguageSqlSeeder languageSqlSeeder // this or CoreSqlSeeder
            //, PlaceByGeoPlanetEntitySeeder placeByGeoPlanetEntitySeeder // this or CoreSqlSeeder
            , RoleEntitySeeder roleEntitySeeder
            , EstablishmentEntitySeeder establishmentEntitySeeder
            , EmailTemplateEntitySeeder emailTemplateEntitySeeder
            , PersonEntitySeeder personEntitySeeder
            , UserEntitySeeder userEntitySeeder
            , MemberEntitySeeder memberEntitySeeder
            , InstitutionalAgreementEntitySeeder institutionalAgreementEntitySeeder
            , InstitutionalAgreementSettingsEntitySeeder institutionalAgreementSettingsEntitySeeder
            , EmployeeModuleSettingsEntitySeeder employeeModuleSettingsEntitySeeder
            , AffiliationEntitySeeder affiliationEntitySeeder
            , EmployeeEntitySeeder employeeEntitySeeder
            , ActivityEntitySeeder activityEntitySeeder
            , LoadableFileEntitySeeder loadableFileEntitySeeder
            , ImageEntitySeeder imageEntitySeeder
        )
        {
            _unitOfWork = unitOfWork;
            _coreSqlSeeder = coreSqlSeeder;
            //_languageSqlSeeder = languageSqlSeeder; // this or CoreSqlSeeder
            //_languageEntitySeeder = languageEntitySeeder; // this or CoreSqlSeeder
            //_placeByGeoPlanetEntitySeeder = placeByGeoPlanetEntitySeeder; // this or CoreSqlSeeder
            _roleEntitySeeder = roleEntitySeeder;
            _establishmentEntitySeeder = establishmentEntitySeeder;
            _employeeModuleSettingsEntitySeeder = employeeModuleSettingsEntitySeeder;
            _employeeEntitySeeder = employeeEntitySeeder; 
            _emailTemplateEntitySeeder = emailTemplateEntitySeeder;
            _personEntitySeeder = personEntitySeeder;
            _userEntitySeeder = userEntitySeeder;
            _memberEntitySeeder = memberEntitySeeder;
            _institutionalAgreementEntitySeeder = institutionalAgreementEntitySeeder;
            _institutionalAgreementSettingsEntitySeeder = institutionalAgreementSettingsEntitySeeder;
            _affiliationEntitySeeder = affiliationEntitySeeder;
            _activityEntitySeeder = activityEntitySeeder;
            _loadableFileEntitySeeder = loadableFileEntitySeeder;
            _imageEntitySeeder = imageEntitySeeder;
        }

        public void Seed()
        {
            //_languageEntitySeeder.Seed(); // this or CoreSqlSeeder
            //_languageSqlSeeder.Seed(); // this or CoreSqlSeeder
            //_placeByGeoPlanetEntitySeeder.Seed(); // this or CoreSqlSeeder
            _coreSqlSeeder.Seed();

            /* Note these lines are order dependent. */
            _roleEntitySeeder.Seed();
            _imageEntitySeeder.Seed();
            _loadableFileEntitySeeder.Seed();
            _establishmentEntitySeeder.Seed();

            _emailTemplateEntitySeeder.Seed();
            _employeeModuleSettingsEntitySeeder.Seed();
            _personEntitySeeder.Seed();
            _userEntitySeeder.Seed();
            _memberEntitySeeder.Seed();
            _institutionalAgreementEntitySeeder.Seed();
            _institutionalAgreementSettingsEntitySeeder.Seed();
            _affiliationEntitySeeder.Seed();
            _employeeEntitySeeder.Seed();
            _activityEntitySeeder.Seed();

            _unitOfWork.SaveChanges();
        }
    }
}
