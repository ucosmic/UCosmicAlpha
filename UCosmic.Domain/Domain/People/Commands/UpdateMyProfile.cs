using System;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class UpdateMyProfile
    {
        public UpdateMyProfile(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }

        /* Person */
        public bool IsActive { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }

        /* Employee */
        public int? FacultyRankId { get; set; }
        public string JobTitles { get; set; }
        public string AdministrativeAppointments { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateMyProfileCommand : AbstractValidator<UpdateMyProfile>
    {
        public ValidateUpdateMyProfileCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal.Identity.Name)
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyPrincipalIdentityName.FailMessage)
                .MustFindUserByName(entities)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)
            ;
        }
    }

    public class HandleUpdateMyProfileCommand : IHandleCommands<UpdateMyProfile>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdatePerson> _updatePerson;
        private readonly IHandleCommands<CreateEmployee> _createEmployee;
        private readonly IHandleCommands<UpdateEmployee> _updateEmployee;
        private readonly IHandleCommands<DeleteEmployee> _deleteEmployee;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateMyProfileCommand(ICommandEntities entities
            , IHandleCommands<UpdatePerson> updatePerson
            , IHandleCommands<CreateEmployee> createEmployee
            , IHandleCommands<UpdateEmployee> updateEmployee
            , IHandleCommands<DeleteEmployee> deleteEmployee
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _updatePerson = updatePerson;
            _createEmployee = createEmployee;
            _updateEmployee = updateEmployee;
            _deleteEmployee = deleteEmployee;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateMyProfile command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.Employee,
                })
                .ByUserName(command.Principal.Identity.Name);
            if (person == null) // person should never be null thanks to validator
                throw new InvalidOperationException(string.Format(
                    "User '{0}' does not exist", command.Principal.Identity.Name));

            // delegate to other commands
            _updatePerson.Handle(new UpdatePerson(person.RevisionId)
            {
                NoCommit = true,
                IsActive = command.IsActive,
                IsDisplayNameDerived = command.IsDisplayNameDerived,
                DisplayName = command.DisplayName,
                Salutation = command.Salutation,
                FirstName = command.FirstName,
                MiddleName = command.MiddleName,
                LastName = command.LastName,
                Suffix = command.Suffix,
                Gender = command.Gender,
            });

            var hasEmployee = person.Employee != null;
            var shouldHaveEmployee = command.FacultyRankId.HasValue ||
                                     !string.IsNullOrWhiteSpace(command.JobTitles) ||
                                     !string.IsNullOrWhiteSpace(command.AdministrativeAppointments);

            // create employee
            if (!hasEmployee && shouldHaveEmployee)
            {
                _createEmployee.Handle(new CreateEmployee
                {
                    NoCommit = true,
                    PersonId = person.RevisionId,
                    FacultyRankId = command.FacultyRankId,
                    JobTitles = command.JobTitles,
                    AdministrativeAppointments = command.AdministrativeAppointments,
                });
            }

            // update employee
            if (hasEmployee && shouldHaveEmployee)
            {
                _updateEmployee.Handle(new UpdateEmployee
                {
                    NoCommit = true,
                    Id = person.Employee.Id,
                    FacultyRankId = command.FacultyRankId,
                    JobTitles = command.JobTitles,
                    AdministrativeAppointments = command.AdministrativeAppointments,
                });
            }

            // delete employee
            if (hasEmployee && !shouldHaveEmployee)
            {
                _deleteEmployee.Handle(new DeleteEmployee(command.Principal, person.Employee.Id)
                {
                    NoCommit = true,
                });
            }

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
 