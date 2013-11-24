//using System;
//using System.Linq;
//using System.Security.Principal;
//using FluentValidation;
//using Newtonsoft.Json;
//using UCosmic.Domain.Audit;

//namespace UCosmic.Domain.Employees
//{
//    public class DeleteEmployee
//    {
//        public DeleteEmployee(IPrincipal principal, int id)
//        {
//            if (principal == null) throw new ArgumentNullException("principal");
//            Principal = principal;
//            Id = id;
//        }

//        public IPrincipal Principal { get; private set; }
//        public int Id { get; private set; }

//        internal bool NoCommit { get; set; }
//    }

//    public class ValidateDeleteEmployeeCommand : AbstractValidator<DeleteEmployee>
//    {
//        public ValidateDeleteEmployeeCommand(IQueryEntities entities)
//        {
//            CascadeMode = CascadeMode.StopOnFirstFailure;

//            RuleFor(x => x.Id)
//                // id must be within valid range
//                .GreaterThanOrEqualTo(1)
//                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Employee id", x => x.Id)

//                // id must exist in the database
//                .MustFindEmployeeById(entities)
//                    .WithMessage(MustFindEmployeeById.FailMessageFormat, x => x.Id)
//            ;
//        }
//    }

//    public class HandleDeleteEmployeeCommand : IHandleCommands<DeleteEmployee>
//    {
//        private readonly ICommandEntities _entities;
//        private readonly IUnitOfWork _unitOfWork;

//        public HandleDeleteEmployeeCommand(ICommandEntities entities
//            , IUnitOfWork unitOfWork
//        )
//        {
//            _entities = entities;
//            _unitOfWork = unitOfWork;
//        }

//        public void Handle(DeleteEmployee command)
//        {
//            if (command == null) throw new ArgumentNullException("command");

//            // load target
//            var employee = _entities.Get<Employee>()
//                .SingleOrDefault(x => x.Id == command.Id)
//            ;
//            if (employee == null) return; // delete idempotently

//            // log audit
//            var audit = new CommandEvent
//            {
//                RaisedBy = command.Principal.Identity.Name,
//                Name = command.GetType().FullName,
//                Value = JsonConvert.SerializeObject(new { command.Id }),
//                PreviousState = employee.ToJsonAudit(),
//            };

//            _entities.Create(audit);
//            _entities.Purge(employee);
//            if (!command.NoCommit)
//            {
//                _unitOfWork.SaveChanges();
//            }
//        }
//    }
//}
