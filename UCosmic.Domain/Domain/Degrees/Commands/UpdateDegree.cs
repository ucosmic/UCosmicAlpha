using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Security.Principal;
using FluentValidation;

namespace UCosmic.Domain.Degrees
{
    public class UpdateDegree
    {
        public IPrincipal Principal { get; protected set; }
        public int Id { get; protected set; }
        public string Title { get; protected set; }
        public int? YearAwarded { get; set; }
        public int? InstitutionId { get; set; }
        public DateTime UpdatedOn { get; protected set; }
        public bool NoCommit { get; set; }

        public UpdateDegree(IPrincipal principal, int id, DateTime updatedOn)
        {
            if (principal == null) { throw new ArgumentNullException("principal"); }
            Principal = principal;
            Id = id;
            UpdatedOn = updatedOn;
        }
    }

    public class ValidateUpdateDegreeCommand : AbstractValidator<UpdateDegree>
    {
        public ValidateUpdateDegreeCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .MustOwnDegree(entities, x => x.Id)
                .WithMessage(MustOwnDegree<object>.FailMessageFormat, x => x.Principal.Identity.Name, x => x.Id);

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage(MustBePositivePrimaryKey.FailMessageFormat, x => "Degree id", x => x.Id)

                // id must exist in the database
                .MustFindDegreeById(entities)
                .WithMessage(MustFindDegreeById.FailMessageFormat, x => x.Id);
        }
    }

    public class HandleUpdateMyDegreeCommand : IHandleCommands<UpdateDegree>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;


        public HandleUpdateMyDegreeCommand(ICommandEntities entities,
                                             IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateDegree command)
        {
            if (command == null) throw new ArgumentNullException("command");

            /* Retrieve the degree to update. */
            var target = _entities.Get<Degree>().Single(a => a.RevisionId == command.Id);


            /* Update fields */
            //target.ModeText = command.ModeText;
            //target.Number = command.Number;
            target.UpdatedOnUtc = command.UpdatedOn.ToUniversalTime();
            target.UpdatedByPrincipal = command.Principal.Identity.Name;

            throw new NotImplementedException();

            /* Update degree values (for this mode) */
            //var updateDegreeValuesCommand = new UpdateDegreeValues(command.Principal,
            //                                                           targetDegreeValues.RevisionId,
            //                                                           command.UpdatedOn)
            //{
            //    Title = command.Values.Title,
            //    Content = command.Values.Content,
            //    StartsOn = command.Values.StartsOn,
            //    EndsOn = command.Values.EndsOn,
            //    Mode = command.ModeText.AsEnum<DegreeMode>(),
            //    WasExternallyFunded = command.Values.WasExternallyFunded,
            //    WasInternallyFunded = command.Values.WasInternallyFunded,
            //    Locations = command.Values.Locations ?? new Collection<DegreeLocation>(),
            //    Types = command.Values.Types ?? new Collection<DegreeType>(),
            //    Tags = command.Values.Tags ?? new Collection<DegreeTag>(),
            //    Documents = command.Values.Documents ?? new Collection<DegreeDocument>(),
            //    NoCommit = true
            //};

            //_updateDegreeValues.Handle(updateDegreeValuesCommand);

            _entities.Update(target);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
