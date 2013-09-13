using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Employees
{
    public class UpdateEmployeeModuleSettings
    {
        public int Id { get; protected set; }
        public ICollection<EmployeeFacultyRank> EmployeeFacultyRanks { get; set; }
        public bool? NotifyAdminOnUpdate { get; set; }
        public ICollection<Person> NotifyAdmins { get; set; }
        public string PersonalInfoAnchorText { get; set; }
        public Establishment Establishment { get; set; }
        public ICollection<EmployeeActivityType> EmployeeActivityTypes { get; set; }
        public bool? OfferCountry { get; set; }
        public bool? OfferActivityType { get; set; }
        public bool? OfferFundingQuestions { get; set; }
        public string InternationalPedigreeTitle { get; set; }


        internal bool NoCommit { get; set; }

        public UpdateEmployeeModuleSettings(int id)
        {
            Id = id;
        }
    }

    public class ValidateUpdateEmployeeModuleSettingsCommand : AbstractValidator<UpdateEmployeeModuleSettings>
    {
        public ValidateUpdateEmployeeModuleSettingsCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            //RuleFor(x => x.Id)
            //    .MustFindEmployeeById(entities)
            //        .WithMessage(MustFindEmployeeById.FailMessageFormat, x => x.Id)
            //;
        }
    }

    public class HandleUpdateEmployeeModuleSettingsCommand : IHandleCommands<UpdateEmployeeModuleSettings>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateEmployeeModuleSettingsCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateEmployeeModuleSettings command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var settings = _entities.Get<EmployeeModuleSettings>().SingleOrDefault(p => p.Id == command.Id);
            if (settings == null)
            {
                throw new InvalidOperationException(string.Format(
                    "EmployeeModuleSettings '{0}' does not exist", command.Id));
            }

            if (command.EmployeeFacultyRanks != null)
            {
                settings.FacultyRanks = command.EmployeeFacultyRanks;
            }
            if (command.NotifyAdminOnUpdate.HasValue)
            {
                settings.NotifyAdminOnUpdate = command.NotifyAdminOnUpdate.Value;
            }
            if (command.NotifyAdmins != null)
            {
                settings.NotifyAdmins = command.NotifyAdmins;
            }
            if (command.PersonalInfoAnchorText != null)
            {
                settings.PersonalInfoAnchorText = command.PersonalInfoAnchorText;
            }
            if (command.Establishment != null)
            {
                settings.Establishment = command.Establishment;
            }
            if (command.EmployeeActivityTypes != null)
            {
                settings.ActivityTypes = command.EmployeeActivityTypes;
            }
            if (command.OfferCountry.HasValue)
            {
                settings.OfferCountry = command.OfferCountry.Value;
            }
            if (command.OfferActivityType.HasValue)
            {
                settings.OfferActivityType = command.OfferActivityType.Value;
            }
            if (command.OfferFundingQuestions.HasValue)
            {
                settings.OfferFundingQuestions = command.OfferFundingQuestions.Value;
            }
            if (command.InternationalPedigreeTitle != null)
            {
                settings.InternationalPedigreeTitle = command.InternationalPedigreeTitle;
            }


            _entities.Update(settings);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
