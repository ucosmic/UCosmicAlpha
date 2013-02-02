using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Employees
{
    public class CreateEmployeeModuleSettings
    {
        public ICollection<EmployeeFacultyRank> EmployeeFacultyRanks { get; set; }
        public bool NotifyAdminOnUpdate { get; set; }
        public int NotifyAdminPersonId { get; set; }
        public string PersonalInfoAnchorText { get; set; }
        public int ForEstablishmentId { get; set; }

        public EmployeeModuleSettings CreatedEmployeeModuleSettings { get; set; }
    }

    public class ValidateCreateEmployeeModuleSettingsCommand : AbstractValidator<CreateEmployeeModuleSettings>
    {
        public ValidateCreateEmployeeModuleSettingsCommand(IQueryEntities entities)
        {
            /* TODO */
        }
    }

    public class HandleCreateEmployeeModuleSettingsCommand : IHandleCommands<CreateEmployeeModuleSettings>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateEmployeeModuleSettingsCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateEmployeeModuleSettings command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var employeeModuleSettings = new EmployeeModuleSettings()
            {
                FacultyRanks = command.EmployeeFacultyRanks,
                NotifyAdminOnUpdate = command.NotifyAdminOnUpdate,
                NotifyAdmins = new[] { _entities.Get<Person>().SingleOrDefault(x => x.RevisionId == command.NotifyAdminPersonId) },
                PersonalInfoAnchorText = command.PersonalInfoAnchorText,
                Establishment = _entities.Get<Establishment>().SingleOrDefault(x => x.RevisionId == command.ForEstablishmentId)
            };

            _entities.Create(employeeModuleSettings);

            command.CreatedEmployeeModuleSettings = employeeModuleSettings;
        }
    }
}
