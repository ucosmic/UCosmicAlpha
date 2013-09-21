using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Degrees
{
    public class DeleteDegree
    {
        public DeleteDegree(IPrincipal principal, int degreeId, int? personId = null)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            DegreeId = degreeId;
            PersonId = personId;
        }

        public IPrincipal Principal { get; private set; }
        public int DegreeId { get; private set; }
        public int? PersonId { get; private set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateDeleteDegreeCommand : AbstractValidator<DeleteDegree>
    {
        public ValidateDeleteDegreeCommand(IProcessQueries queryProcessor)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustFindUserByPrincipal(queryProcessor)
            ;

            RuleFor(x => x.DegreeId)
                // id must exist in the database
                .MustFindDegreeById(queryProcessor)
                    .WithMessage(MustFindDegreeById.FailMessageFormat, x => x.DegreeId)
            ;

            // only admins can delete degrees for other people (PersonId.HasValue)
            When(x => x.PersonId.HasValue, () =>
            {
                RuleFor(x => x.PersonId.Value)
                    .MustFindPersonById(queryProcessor)
                        .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId)

                    .MustBeTenantPersonId(queryProcessor, x => x.Principal)
                        .WithMessage(MustBeTenantPersonId<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.GetType().Name, x => x.PersonId)
                ;

                RuleFor(x => x.Principal)
                    .MustBeInAnyRole(RoleName.EmployeeProfileManager)
                        .WithMessage(MustBeInAnyRole.FailMessageFormat,
                                x => x.Principal.Identity.Name, x => x.GetType().Name)

                    .MustControlDegree(queryProcessor, x => x.DegreeId)
                        .WithMessage(MustControlDegree<object>.FailMessageFormat,
                                x => x.Principal.Identity.Name, x => x.DegreeId)
                    ;
            });

            // normal users can only delete degrees for themselves (!PersonId.HasValue)
            When(x => !x.PersonId.HasValue, () =>
                RuleFor(x => x.Principal)
                    .MustOwnDegree(queryProcessor, x => x.DegreeId)
                        .WithMessage(MustOwnDegree<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.DegreeId)
            );

        }
    }

    public class HandleDeleteDegreeCommand : IHandleCommands<DeleteDegree>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleDeleteDegreeCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(DeleteDegree command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<Degree>().Single(x => x.RevisionId == command.DegreeId);

            _entities.Purge(entity);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }

            // TBD
            // log audit
            //var audit = new CommandEvent
            //{
            //    RaisedBy = User.Name,
            //    Name = command.GetType().FullName,
            //    Value = JsonConvert.SerializeObject(new { command.Id }),
            //    PreviousState = activityDocument.ToJsonAudit(),
            //};
            //_entities.Create(audit);

            //_eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
