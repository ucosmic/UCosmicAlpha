//using System;
//using System.Linq;
//using System.Security.Principal;
//using FluentValidation;
//using UCosmic.Domain.Identity;

//namespace UCosmic.Domain.People
//{
//    // todo: when should we ever really delete a person? instead, disassociate them
//    public class DeletePerson
//    {
//        public DeletePerson(IPrincipal principal, int id)
//        {
//            Principal = principal;
//            Id = id;
//        }

//        public IPrincipal Principal { get; private set; }
//        public int Id { get; private set; }
//    }

//    public class ValidateDeletePersonCommand : AbstractValidator<DeletePerson>
//    {
//        public ValidateDeletePersonCommand(IQueryEntities entities, IProcessQueries queryProcessor)
//        {
//            CascadeMode = CascadeMode.StopOnFirstFailure;

//            RuleFor(x => x.Principal)
//                .NotNull()
//                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
//                .MustNotHaveEmptyIdentityName()
//                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
//                .MustFindUserByPrincipal(entities)
//                .MustNotBeSamePerson(entities, x => x.Id)
//                    .WithMessage(MustNotBeSamePerson<object>.FailMessageFormat, x => x.Principal.Identity.Name)
//                .MustBeInAnyRole(RoleName.EmployeeProfileManager)
//            ;

//            RuleFor(x => x.Id)
//                .MustBeTenantPersonId(queryProcessor, x => x.Principal)
//                    .WithMessage(MustBeTenantPersonId<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.Id)
//            ;
//        }
//    }

//    public class HandleDeletePersonCommand : IHandleCommands<DeletePerson>
//    {
//        private readonly ICommandEntities _entities;
//        private readonly IUnitOfWork _unitOfWork;

//        public HandleDeletePersonCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
//        {
//            _entities = entities;
//            _unitOfWork = unitOfWork;
//        }

//        public void Handle(DeletePerson command)
//        {
//            if (command == null) throw new ArgumentNullException("command");

//            var person = _entities.Get<Person>().SingleOrDefault(a => a.RevisionId == command.Id);
//            if (person == null) { throw new Exception("Person not found."); }

//            _entities.Purge(person);

//            _unitOfWork.SaveChanges();
//        }
//    }
//}
