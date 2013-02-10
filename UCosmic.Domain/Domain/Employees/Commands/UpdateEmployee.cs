using System;
using System.Linq;
using System.Linq.Expressions;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.Employees
{
    public class UpdateEmployee
    {
        public int Id { get; set; }
        public int? FacultyRankId { get; set; }
        public string JobTitles { get; set; }
        public string AdministrativeAppointments { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateEmployeeCommand : AbstractValidator<UpdateEmployee>
    {
        public ValidateUpdateEmployeeCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Id)
                .MustFindEmployeeById(entities)
                    .WithMessage(MustFindEmployeeById.FailMessageFormat, x => x.Id)
            ;
        }
    }

    public class HandleUpdateEmployeeCommand : IHandleCommands<UpdateEmployee>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateEmployeeCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateEmployee command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var employee = _entities.Get<Employee>()
                .EagerLoad(_entities, new Expression<Func<Employee, object>>[]
                {
                    x => x.FacultyRank,
                })
                .SingleOrDefault(p => p.Id == command.Id);
            if (employee == null) // employee should never be null thanks to validator
                throw new InvalidOperationException(string.Format(
                    "Employee '{0}' does not exist", command.Id));

            // only mutate when state is modified
            var changed = (command.JobTitles != employee.JobTitles) ||
                (command.AdministrativeAppointments != employee.AdministrativeAppointments) ||
                (command.FacultyRankId.HasValue && employee.FacultyRank == null) ||
                (!command.FacultyRankId.HasValue && employee.FacultyRank != null) ||
                (command.FacultyRankId.HasValue && employee.FacultyRank != null
                    && command.FacultyRankId.Value != employee.FacultyRank.Id)
            ;
            if (!changed) return;

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = System.Threading.Thread.CurrentPrincipal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.Id,
                    command.FacultyRankId,
                    command.JobTitles,
                    command.AdministrativeAppointments,
                }),
                PreviousState = employee.ToJsonAudit(),
            };

            // update values
            EmployeeFacultyRank facultyRank = null;
            if (command.FacultyRankId.HasValue)
                facultyRank = _entities.Get<EmployeeFacultyRank>()
                    .SingleOrDefault(x => x.Id == command.FacultyRankId.Value);

            employee.FacultyRank = facultyRank;
            employee.JobTitles = command.JobTitles;
            employee.AdministrativeAppointments = command.AdministrativeAppointments;

            // push to database
            audit.NewState = employee.ToJsonAudit();
            _entities.Create(audit);
            _entities.Update(employee);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
