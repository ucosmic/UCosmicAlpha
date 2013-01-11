using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Employees
{
    public class CreateEmployeeModuleSettings
    {
        public ICollection<EmployeeFacultyRank> FacultyRanks { get; set; }
        public bool NotifyAdminOnUpdate { get; set; }
        public Person NotifyAdmin { get; set; }
        public string PersonalInfoAnchorText { get; set; }
        public Establishment ForEstablishment { get; set; }

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
                FacultyRanks = command.FacultyRanks,
                NotifyAdminOnUpdate = command.NotifyAdminOnUpdate,
                NotifyAdmin = command.NotifyAdmin,
                PersonalInfoAnchorText = command.PersonalInfoAnchorText,
                ForEstablishment = command.ForEstablishment,
            };

            _entities.Create(employeeModuleSettings);

            command.CreatedEmployeeModuleSettings = employeeModuleSettings;
        }
    }
}
