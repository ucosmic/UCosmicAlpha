using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Domain.InternationalAffiliation
{
    public class CreateInternationalAffiliation
    {
        public Guid? EntityId { get; set; }
        public IPrincipal Principal { get; protected set; }

        public DateTime From { get; set; }
        public DateTime? To { get; set; }
        public bool OnGoing { get; set; }
        public string Institution { get; set; }
        public string Position { get; set; }

        public bool NoCommit { get; set; }
        public InternationalAffiliation CreatedInternationalAffiliation { get; set; }

        public CreateInternationalAffiliation(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }
    }

    public class ValidateCreateAffiliationCommand : AbstractValidator<CreateInternationalAffiliation>
    {
        public ValidateCreateAffiliationCommand()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateAffiliationCommand : IHandleCommands<CreateInternationalAffiliation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateAffiliationCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateInternationalAffiliation command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var person = _entities.Get<Person>().Single(p => p.User.Name == command.Principal.Identity.Name);

            var expertise = new InternationalAffiliation
            {
                PersonId = person.RevisionId,

                From = command.From,
                To = command.To,
                OnGoing = command.OnGoing,
                Institution = command.Institution,
                Position = command.Position,
                
                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };

            if (command.EntityId.HasValue)
            {
                expertise.EntityId = command.EntityId.Value;
            }

            _entities.Create(expertise);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedInternationalAffiliation = expertise;
        }
    }
}
