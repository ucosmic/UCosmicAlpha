using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Home;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Home
{
    public class DeleteHomeSection
    {
        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
        internal bool NoCommit { get; set; }

        public DeleteHomeSection(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeleteHomeSectionCommand : AbstractValidator<DeleteHomeSection>
    {
        public ValidateDeleteHomeSectionCommand(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
            RuleFor(x => x.Id)
                // agreement id must exist
                .MustFindHomeSectionById(entities)
                    .WithMessage(MustFindHomeSectionById<object>.FailMessageFormat, x => x.Id)

                // principal must own agreement
                .MustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.Id, x => x.Principal.Identity.Name)
                ;

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "HomeSection id", x => x.Id)
            ;
        }
    }

    public class HandleDeleteHomeSectionCommand : IHandleCommands<DeleteHomeSection>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleDeleteHomeSectionCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(DeleteHomeSection command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<HomeSection>().SingleOrDefault(x => x.Id == command.Id);
            if (activity == null) return;

            _entities.Purge(activity);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
