using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.People;
using UCosmic.Domain.Places;

namespace UCosmic.Domain.Degrees
{
    public class CreateDegree
    {
        public Guid? EntityId { get; set; }
        public IPrincipal Principal { get; protected set; }
        public string Title { get; protected set; }
        public int? YearAwarded { get; set; }
        public int? InstitutionId { get; set; }
        public bool NoCommit { get; set; }
        public Degree CreatedDegree { get; protected internal set; }

        public CreateDegree(IPrincipal principal, string title)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            if (String.IsNullOrEmpty(title)) throw new ArgumentNullException("title");
            Principal = principal;
            Title = title;
        }
    }

    public class ValidateCreateDegreeCommand : AbstractValidator<CreateDegree>
    {
        public ValidateCreateDegreeCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
        }
    }

    public class HandleCreateDegreeCommand : IHandleCommands<CreateDegree>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateDegreeCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateDegree command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var person = _entities.Get<Person>().SingleOrDefault(p => p.User.Name == command.Principal.Identity.Name);
            if (person == null)
            {
                string message = string.Format("Person {0} not found.", command.Principal.Identity.Name);
                throw new Exception(message);
            }

            var degree = new Degree
            {
                PersonId = person.RevisionId,
                Title = command.Title,
                YearAwarded = command.YearAwarded,
                InstitutionId = command.InstitutionId,

                CreatedByPrincipal = command.Principal.Identity.Name,
                CreatedOnUtc = DateTime.UtcNow
            };

            if (command.EntityId.HasValue)
            {
                degree.EntityId = command.EntityId.Value;
            }

            _entities.Create(degree);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            command.CreatedDegree = degree;
        }
    }
}
