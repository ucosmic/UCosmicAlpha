using System;
using System.Linq;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Employees
{
    public class CreateEmployee
    {
        public int PersonId { get; set; }
        public int? FacultyRankId { get; set; }
        public string JobTitles { get; set; }
        public string AdministrativeAppointments { get; set; }

        public Employee CreatedEmployee { get; internal set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateCreateEmployeeCommand : AbstractValidator<CreateEmployee>
    {
        public ValidateCreateEmployeeCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.PersonId)
                .MustFindPersonById(entities)
                    .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)
            ;
        }
    }

    public class HandleCreateEmployeeCommand : IHandleCommands<CreateEmployee>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateEmployeeCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateEmployee command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // construct the entity
            var employee = new Employee
            {
                Person = _entities.Get<Person>().SingleOrDefault( p => p.RevisionId == command.PersonId ),
                FacultyRank = (command.FacultyRankId.HasValue) ? _entities.Get<EmployeeFacultyRank>().Single(x => x.Id == command.FacultyRankId) : null,
                AdministrativeAppointments = command.AdministrativeAppointments,
                JobTitles = command.JobTitles,
            };

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = System.Threading.Thread.CurrentPrincipal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.PersonId,
                    command.FacultyRankId,
                    command.JobTitles,
                    command.AdministrativeAppointments,
                }),
                NewState = employee.ToJsonAudit(),
            };
            _entities.Create(audit);

            // store
            _entities.Create(employee);

            command.CreatedEmployee = employee;

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
