using System;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class AddNewEstablishmentTypes : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformAddNewEstablishmentTypesWork : IPerformWork<AddNewEstablishmentTypes>
    {
        private readonly ICommandEntities _entities;

        public PerformAddNewEstablishmentTypesWork(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Perform(AddNewEstablishmentTypes job)
        {
            //var establishmentCategories = _entities.Get<EstablishmentCategory>().ToArray();

            var establishmentType = _entities.Get<EstablishmentType>().SingleOrDefault(x => x.CategoryCode == EstablishmentCategoryCode.Inst && x.EnglishName == "Institute");
            if (establishmentType != null) return;

            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Inst,
                EnglishName = "Institute",
                EnglishPluralName = "Institutes",
            });
            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Inst,
                EnglishName = "School",
                EnglishPluralName = "Schools",
            });
            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Inst,
                EnglishName = "Academy",
                EnglishPluralName = "Academies",
            });
            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Inst,
                EnglishName = "Centre / Center",
                EnglishPluralName = "Centres / Centers",
            });
            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Corp,
                EnglishName = "Foundation",
                EnglishPluralName = "Foundations",
            });
            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Corp,
                EnglishName = "Other Non-Governmental Organization",
                EnglishPluralName = "Other Non-Governmental Organizations",
            });
            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Govt,
                EnglishName = "Ministry",
                EnglishPluralName = "Ministries",
            });
            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Govt,
                EnglishName = "Secretariat",
                EnglishPluralName = "Secretariats",
            });
            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Govt,
                EnglishName = "Department",
                EnglishPluralName = "Departments",
            });
            _entities.Create(new EstablishmentType
            {
                CategoryCode = EstablishmentCategoryCode.Govt,
                EnglishName = "Other Governmental Organization",
                EnglishPluralName = "Non-Governmental Organizations",
            });

            _entities.SaveChanges();
        }
    }
}
