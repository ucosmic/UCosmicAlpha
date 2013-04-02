using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.Establishments
{
    public class CreateEstablishment
    {
        private string _ceebCode;
        private string _uCosmicCode;

        public CreateEstablishment(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int TypeId { get; set; }
        public CreateEstablishmentName OfficialName { get; set; }
        public CreateEstablishmentUrl OfficialUrl { get; set; }
        public UpdateEstablishmentLocation Location { get; set; }
        public string CeebCode
        {
            get { return _ceebCode; }
            set { _ceebCode = value == null ? null : value.Trim(); }
        }

        public string UCosmicCode
        {
            get { return _uCosmicCode; }
            set { _uCosmicCode = value == null ? null : value.Trim(); }
        }

        public int CreatedEstablishmentId { get; internal set; }
    }

    public class ValidateCreateEstablishmentCommand : AbstractValidator<CreateEstablishment>
    {
        public ValidateCreateEstablishmentCommand(IQueryEntities entities
            , IValidator<CreateEstablishmentName> officialNameValidator
            , IValidator<CreateEstablishmentUrl> officialUrlValidator
        )
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // text of the establishment name is required, has max length, and must be unique
            RuleFor(x => x.OfficialName)
                .NotNull()
                    .WithMessage("Establishment must have an official name.")
                .Must(x => officialNameValidator.Validate(x).IsValid)
                    .WithMessage("Establishment official name failed one or more validation rules.")
            ;

            // typeid is required
            RuleFor(x => x.TypeId)
                .MustFindEstablishmentTypeById(entities)
                    .WithMessage(MustFindEstablishmentTypeById.FailMessageFormat, x => x.TypeId)
            ;

            // validate CEEB code
            When(x => !string.IsNullOrEmpty(x.CeebCode), () =>
                RuleFor(x => x.CeebCode)
                    .Length(EstablishmentConstraints.CeebCodeLength)
                        .WithMessage(MustHaveCeebCodeLength.FailMessage)
                    .MustBeUniqueCeebCode(entities)
                        .WithMessage(MustBeUniqueCeebCode<object>.FailMessageFormat, x => x.CeebCode)
            );

            // validate UCosmic code
            When(x => !string.IsNullOrEmpty(x.UCosmicCode), () =>
                RuleFor(x => x.UCosmicCode)
                    .Length(EstablishmentConstraints.UCosmicCodeLength)
                        .WithMessage(MustHaveUCosmicCodeLength.FailMessage)
                    .MustBeUniqueUCosmicCode(entities)
                        .WithMessage(MustBeUniqueUCosmicCode<object>.FailMessageFormat, x => x.UCosmicCode)
            );

            // when the establishment name is official, it cannot be a former / defunct name
            When(x => x.OfficialUrl != null && !string.IsNullOrWhiteSpace(x.OfficialUrl.Value), () =>
                RuleFor(x => x.OfficialUrl)
                    .Must(x => officialUrlValidator.Validate(x).IsValid)
                        .WithMessage("Establishment official URL failed one or more validation rules.")
            );
        }
    }

    public class HandleCreateEstablishmentCommand: IHandleCommands<CreateEstablishment>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateEstablishmentName> _createName;
        private readonly IHandleCommands<CreateEstablishmentUrl> _createUrl;
        private readonly IHandleCommands<UpdateEstablishmentLocation> _updateLocation;
        private readonly IHandleCommands<UpdateEstablishmentHierarchy> _updateHierarchy;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleCreateEstablishmentCommand(ICommandEntities entities
            , IHandleCommands<CreateEstablishmentName> createName
            , IHandleCommands<CreateEstablishmentUrl> createUrl
            , IHandleCommands<UpdateEstablishmentLocation> updateLocation
            , IHandleCommands<UpdateEstablishmentHierarchy> updateHierarchy
            , IUnitOfWork unitOfWork
            , IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _createName = createName;
            _createUrl = createUrl;
            _updateLocation = updateLocation;
            _updateHierarchy = updateHierarchy;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(CreateEstablishment command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var hasOfficialUrl = command.OfficialUrl != null && !string.IsNullOrWhiteSpace(command.OfficialUrl.Value);
            var establishmentType = _entities.Get<EstablishmentType>()
                .Single(x => x.RevisionId == command.TypeId);

            // create initial establishment
            var establishment = new Establishment
            {
                Type = establishmentType,
                OfficialName = command.OfficialName.Text,
                WebsiteUrl = hasOfficialUrl ? command.OfficialUrl.Value : null,
                Location = new EstablishmentLocation(),
                CollegeBoardDesignatedIndicator = command.CeebCode,
                UCosmicCode = command.UCosmicCode,
            };

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    OfficialName = command.OfficialName.Text,
                    OfficialNameLanguageCode = command.OfficialName.LanguageCode,
                    OfficialUrl = hasOfficialUrl ? command.OfficialUrl.Value : null,
                    command.Location.CenterLatitude,
                    command.Location.CenterLongitude,
                    command.Location.BoxNorthEastLatitude,
                    command.Location.BoxNorthEastLongitude,
                    command.Location.BoxSouthWestLatitude,
                    command.Location.BoxSouthWestLongitude,
                    command.Location.PlaceId
                    
                }),
                NewState = establishment.ToJsonAudit(),
            };
            _entities.Create(audit);
            _entities.Create(establishment);
            _unitOfWork.SaveChanges();
            command.CreatedEstablishmentId = establishment.RevisionId;

            // create official name
            command.OfficialName.OwnerId = establishment.RevisionId;
            command.OfficialName.NoCommit = true;
            _createName.Handle(command.OfficialName);

            // create official URL
            if (hasOfficialUrl)
            {
                command.OfficialUrl.OwnerId = establishment.RevisionId;
                command.OfficialUrl.NoCommit = true;
                _createUrl.Handle(command.OfficialUrl);
            }

            // update location
            command.Location.Id = establishment.RevisionId;
            command.Location.NoCommit = true;
            _updateLocation.Handle(command.Location);

            // update hierarchy
            _updateHierarchy.Handle(new UpdateEstablishmentHierarchy(establishment));

            // commit
            _unitOfWork.SaveChanges();
            command.OfficialName.Id = command.OfficialName.CreatedEntity.RevisionId;
            if (hasOfficialUrl)
            {
                command.OfficialUrl.Id = command.OfficialUrl.CreatedEntity.RevisionId;
            }
            _eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
