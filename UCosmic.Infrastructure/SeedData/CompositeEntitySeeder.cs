namespace UCosmic.SeedData
{
    public class CompositeEntitySeeder : ISeedData
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly CoreSqlSeeder _coreSqlSeeder;
        private readonly SensativeSqlSeeder _sensativeSqlSeeder;
        //private readonly LanguageEntitySeeder _languageEntitySeeder;
        //private readonly LanguageSqlSeeder _languageSqlSeeder;
        //private readonly CountryAndAdmin1ByGeoPlanetEntitySeeder _countryAndAdmin1ByGeoPlanetEntitySeeder;
        private readonly WaterBodiesByGeoServicesEntitySeeder _waterBodiesByGeoServicesEntitySeeder;
        private readonly RegionsByGeoServicesEntitySeeder _regionsByGeoServicesEntitySeeder;
        private readonly RoleEntitySeeder _roleEntitySeeder;
        private readonly EstablishmentEntitySeeder _establishmentEntitySeeder;
        private readonly EmailTemplateEntitySeeder _emailTemplateEntitySeeder;
        private readonly PersonEntitySeeder _personEntitySeeder;
        private readonly UserEntitySeeder _userEntitySeeder;
        private readonly MemberEntitySeeder _memberEntitySeeder;
        private readonly AgreementEntitySeeder _agreementEntitySeeder;
        private readonly AgreementSettingsEntitySeeder _agreementSettingsEntitySeeder;
        private readonly EmployeeModuleSettingsEntitySeeder _employeeModuleSettingsEntitySeeder;
        private readonly EmployeeEntitySeeder _employeeEntitySeeder;
        private readonly AffiliationEntitySeeder _myAffiliationEntitySeeder;
        private readonly ActivityEntitySeeder _activityEntitySeeder;
        private readonly DegreeEntitySeeder _degreeEntitySeeder;
        private readonly GeographicExpertiseEntitySeeder _geographicExpertiseEntitySeeder;
        private readonly LanguageExpertiseEntitySeeder _languageExpertiseEntitySeeder;
        private readonly InternationalAffiliationEntitySeeder _internationAffiliationEntitySeeder;

        public CompositeEntitySeeder(IUnitOfWork unitOfWork
            , CoreSqlSeeder coreSqlSeeder
            , SensativeSqlSeeder sensativeSqlSeeder
            //, LanguageEntitySeeder languageEntitySeeder // this or CoreSqlSeeder
            //, LanguageSqlSeeder languageSqlSeeder // this or CoreSqlSeeder
            //, CountryAndAdmin1ByGeoPlanetEntitySeeder countryAndAdmin1ByGeoPlanetEntitySeeder // this or CoreSqlSeeder
            , WaterBodiesByGeoServicesEntitySeeder waterBodiesByGeoServicesEntitySeeder // this or CoreSqlSeeder
            , RegionsByGeoServicesEntitySeeder regionsByGeoServicesEntitySeeder // this or CoreSqlSeeder
            , RoleEntitySeeder roleEntitySeeder
            , EstablishmentEntitySeeder establishmentEntitySeeder
            , EmailTemplateEntitySeeder emailTemplateEntitySeeder
            , PersonEntitySeeder personEntitySeeder
            , UserEntitySeeder userEntitySeeder
            , MemberEntitySeeder memberEntitySeeder
            , AgreementEntitySeeder agreementEntitySeeder
            , AgreementSettingsEntitySeeder agreementSettingsEntitySeeder
            , EmployeeModuleSettingsEntitySeeder employeeModuleSettingsEntitySeeder
            , AffiliationEntitySeeder myAffiliationEntitySeeder
            , EmployeeEntitySeeder employeeEntitySeeder
            , ActivityEntitySeeder activityEntitySeeder
            , DegreeEntitySeeder degreeEntitySeeder
            , GeographicExpertiseEntitySeeder geographicExpertiseEntitySeeder
            , LanguageExpertiseEntitySeeder languageExpertiseEntitySeeder
            , InternationalAffiliationEntitySeeder internationAffiliationEntitySeeder
        )
        {
            _unitOfWork = unitOfWork;
            _coreSqlSeeder = coreSqlSeeder;
            _sensativeSqlSeeder = sensativeSqlSeeder;
            //_languageSqlSeeder = languageSqlSeeder; // this or CoreSqlSeeder
            //_languageEntitySeeder = languageEntitySeeder; // this or CoreSqlSeeder
            //_countryAndAdmin1ByGeoPlanetEntitySeeder = countryAndAdmin1ByGeoPlanetEntitySeeder; // this or CoreSqlSeeder
            _waterBodiesByGeoServicesEntitySeeder = waterBodiesByGeoServicesEntitySeeder; // this or CoreSqlSeeder
            _regionsByGeoServicesEntitySeeder = regionsByGeoServicesEntitySeeder; // this or CoreSqlSeeder
            _roleEntitySeeder = roleEntitySeeder;
            _establishmentEntitySeeder = establishmentEntitySeeder;
            _employeeModuleSettingsEntitySeeder = employeeModuleSettingsEntitySeeder;
            _employeeEntitySeeder = employeeEntitySeeder;
            _emailTemplateEntitySeeder = emailTemplateEntitySeeder;
            _personEntitySeeder = personEntitySeeder;
            _userEntitySeeder = userEntitySeeder;
            _memberEntitySeeder = memberEntitySeeder;
            _agreementEntitySeeder = agreementEntitySeeder;
            _agreementSettingsEntitySeeder = agreementSettingsEntitySeeder;
            _myAffiliationEntitySeeder = myAffiliationEntitySeeder;
            _activityEntitySeeder = activityEntitySeeder;
            _degreeEntitySeeder = degreeEntitySeeder;
            _geographicExpertiseEntitySeeder = geographicExpertiseEntitySeeder;
            _languageExpertiseEntitySeeder = languageExpertiseEntitySeeder;
            _internationAffiliationEntitySeeder = internationAffiliationEntitySeeder;
        }

        public void Seed()
        {
            _coreSqlSeeder.Seed();
            //_languageEntitySeeder.Seed(); // this or CoreSqlSeeder
            //_languageSqlSeeder.Seed(); // this or CoreSqlSeeder
            //_countryAndAdmin1ByGeoPlanetEntitySeeder.Seed(); // this or CoreSqlSeeder
            _waterBodiesByGeoServicesEntitySeeder.Seed(); // this or CoreSqlSeeder
            _regionsByGeoServicesEntitySeeder.Seed(); // this or CoreSqlSeeder

            /* Note these lines are order dependent. */
            _roleEntitySeeder.Seed();
            _establishmentEntitySeeder.Seed();

            _emailTemplateEntitySeeder.Seed();
            _employeeModuleSettingsEntitySeeder.Seed();
            _personEntitySeeder.Seed();
            _userEntitySeeder.Seed();
            _memberEntitySeeder.Seed();
            _agreementEntitySeeder.Seed();
            _agreementSettingsEntitySeeder.Seed();
            _myAffiliationEntitySeeder.Seed();
            _employeeEntitySeeder.Seed();
            _activityEntitySeeder.Seed();
            _degreeEntitySeeder.Seed();
            _geographicExpertiseEntitySeeder.Seed();
            _languageExpertiseEntitySeeder.Seed();
            _internationAffiliationEntitySeeder.Seed();

            _sensativeSqlSeeder.Seed();

            _unitOfWork.SaveChanges();
        }
    }
}
