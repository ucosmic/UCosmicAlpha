using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.Establishments
{
    public class CreateEstablishmentUrl
    {
        public CreateEstablishmentUrl(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; internal set; }
        public int OwnerId { get; set; }
        public string Value { get; set; }
        public bool IsOfficialUrl { get; set; }
        public bool IsFormerUrl { get; set; }

        internal bool NoCommit { get; set; }
        internal EstablishmentUrl CreatedEntity { get; set; }
    }

    public class ValidateCreateEstablishmentUrlCommand : AbstractValidator<CreateEstablishmentUrl>
    {
        public ValidateCreateEstablishmentUrlCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // owner id must exist in the database when in valid range
            When(x => x.OwnerId > 0, () =>
                RuleFor(x => x.OwnerId)
                    .MustFindEstablishmentById(entities)
                        .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.OwnerId)
            );

            // value of the establishment URL is required, has max length, follows format, and must be unique
            RuleFor(x => x.Value)
                .NotEmpty()
                    .WithMessage(MustNotBeEmpty.FailMessageFormat, x => "Establishment URL")
                .Length(1, EstablishmentUrlConstraints.ValueMaxLength)
                    .WithMessage(MustNotExceedStringLength.FailMessageFormat,
                        x => "Establishment URL", x => EstablishmentUrlConstraints.ValueMaxLength, x => x.Value.Length)
                .MustNotContainUrlProtocol()
                    .WithMessage(MustNotContainUrlProtocol.FailMessage)
                .MustBeWellFormedUrl()
                    .WithMessage(MustBeWellFormedUrl.FailMessageFormat, x => x.Value)
                .MustBeUniqueEstablishmentUrlValue(entities)
                    .WithMessage(MustBeUniqueEstablishmentUrlValue<object>.FailMessageFormat, x => x.Value)
            ;

            // when the establishment URL is official, it cannot be former / defunct
            When(x => x.IsOfficialUrl, () =>
                RuleFor(x => x.IsFormerUrl).Equal(false)
                    .WithMessage(MustNotBeFormerEstablishmentUrlWhenIsOfficial.FailMessage)
            );
        }
    }

    public class HandleCreateEstablishmentUrlCommand: IHandleCommands<CreateEstablishmentUrl>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<UpdateEstablishmentUrl> _updateHandler;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleCreateEstablishmentUrlCommand(ICommandEntities entities
            , IHandleCommands<UpdateEstablishmentUrl> updateHandler
            , IUnitOfWork unitOfWork
            , IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _updateHandler = updateHandler;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(CreateEstablishmentUrl command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load owner
            var establishment = _entities.Get<Establishment>()
                .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                {
                    x => x.Urls,
                })
                .Single(x => x.RevisionId == command.OwnerId)
            ;

            // update previous official URL and owner when changing official URL
            if (command.IsOfficialUrl)
            {
                var officialUrl = establishment.Urls.SingleOrDefault(x => x.IsOfficialUrl);
                if (officialUrl != null)
                {
                    var changeCommand = new UpdateEstablishmentUrl(command.Principal)
                    {
                        Id = officialUrl.RevisionId,
                        Value = officialUrl.Value,
                        IsFormerUrl = officialUrl.IsFormerUrl,
                        IsOfficialUrl = false,
                        NoCommit = true,
                    };
                    _updateHandler.Handle(changeCommand);
                }
                establishment.WebsiteUrl = command.Value;
            }

            // create new establishment URL
            var establishmentUrl = new EstablishmentUrl
            {
                Value = command.Value,
                IsOfficialUrl = command.IsOfficialUrl,
                IsFormerUrl = command.IsFormerUrl,
            };
            establishment.Urls.Add(establishmentUrl);
            establishmentUrl.ForEstablishment = establishment;

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.OwnerId,
                    command.Value,
                    command.IsFormerUrl,
                    command.IsOfficialUrl,
                }),
                NewState = establishmentUrl.ToJsonAudit(),
            };
            _entities.Create(audit);
            _entities.Update(establishment);
            command.CreatedEntity = establishmentUrl;
            if (command.NoCommit) return;

            _unitOfWork.SaveChanges();
            command.Id = establishmentUrl.RevisionId;
            _eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
