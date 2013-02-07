using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using FluentValidation;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Employees
{
    public class CreateEmployee
    {
        public EmployeeFacultyRank FacultyRank { get; set; }
        public string AdministrativeAppointments { get; set; }
        public string JobTitles { get; set; }
        public int ForPersonId { get; set; }

        public Employee CreatedEmployee { get; set; }
    }

    public class ValidateCreateEmployeeCommand : AbstractValidator<CreateEmployee>
    {
        public ValidateCreateEmployeeCommand(IProcessQueries queryProcessor)
        {
            //CascadeMode = CascadeMode.StopOnFirstFailure;

            //RuleFor(x => x.DisplayName)
            //    // display name cannot be empty
            //    .NotEmpty()
            //        .WithMessage(MustNotHaveEmptyDisplayName.FailMessage)
            //;

            //RuleFor(x => x.UserName)
            //    // if username is present, validate that it is not attached to another person
            //    .Must(p => ValidateUser.NameMatchesNoEntity(p, queryProcessor))
            //        .WithMessage(ValidateUser.FailedBecauseNameMatchedEntity,
            //            p => p.UserName)
            //;
        }
    }

    public class HandleCreateEmployeeCommand : IHandleCommands<CreateEmployee>
    {
        private readonly ICommandEntities _entities;

        public HandleCreateEmployeeCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(CreateEmployee command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // construct the person
            var employee = new Employee
            {
                Person = _entities.Get<Person>().SingleOrDefault( p => p.RevisionId == command.ForPersonId ),
                FacultyRank = command.FacultyRank,
                AdministrativeAppointments = command.AdministrativeAppointments,
                JobTitles = command.JobTitles,
            };

            // store
            _entities.Create(employee);

            command.CreatedEmployee = employee;
        }
    }
}
