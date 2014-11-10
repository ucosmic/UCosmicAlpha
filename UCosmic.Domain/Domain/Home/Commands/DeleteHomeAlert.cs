using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Home
{
    public class DeleteHomeAlert
    {
        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
        internal bool NoCommit { get; set; }

        public DeleteHomeAlert(IPrincipal principal, int id)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateDeleteHomeAlertCommand : AbstractValidator<DeleteHomeAlert>
    {
        public ValidateDeleteHomeAlertCommand(IQueryEntities entities, IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;
            RuleFor(x => x.Id)
                // agreement id must exist
                .MustFindHomeAlertById(entities)
                    .WithMessage(MustFindHomeAlertById<object>.FailMessageFormat, x => x.Id)

                // principal must own agreement
                .AlertMustBeOwnedByPrincipal(queryProcessor, x => x.Principal)
                    .WithMessage(MustBeOwnedByPrincipal<object>.FailMessageFormat, x => x.Id, x => x.Principal.Identity.Name)
                ;

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                    .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "HomeAlert id", x => x.Id)
            ;
        }
    }

    public class HandleDeleteHomeAlertCommand : IHandleCommands<DeleteHomeAlert>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleDeleteHomeAlertCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(DeleteHomeAlert command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var activity = _entities.Get<HomeAlert>().SingleOrDefault(x => x.Id == command.Id);
            if (activity == null) return;

            _entities.Purge(activity);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
