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
    }

    public class ValidateCreateEstablishmentUrlCommand : AbstractValidator<CreateEstablishmentUrl>
    {
        private readonly IQueryEntities _entities;
        private Establishment _establishment;
        private EstablishmentUrl _duplicate;

        public ValidateCreateEstablishmentUrlCommand(IQueryEntities entities)
        {
            _entities = entities;

            RuleFor(x => x.OwnerId)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage("Establishment id '{0}' is not valid.", x => x.OwnerId)

                // id must exist in the database
                .Must(Exist)
                .WithMessage("Establishment with id '{0}' does not exist", x => x.OwnerId)
            ;

            // text of the establishment URL is required and has max length
            RuleFor(x => x.Value)
                .NotEmpty()
                    .WithMessage("Establishment URL is required.")
                .Length(1, 200)
                    .WithMessage("Establishment URL cannot exceed 200 characters. You entered {0} character{1}.",
                        x => x.Value.Length,
                        x => x.Value.Length == 1 ? "" : "s")
                .Must(NotBeDuplicate)
                    .WithMessage("The establishment URL '{0}' already exists.", x => _duplicate.Value)
                .MustNotContainUrlProtocol()
                    .WithMessage("Please enter a URL without the protocol (http:// or https://).", x => x.Value)
                .MustBeWellFormedUrl()
                    .WithMessage("The value '{0}' does not appear to be a valid URL.", x => x.Value)
            ;

            // when the establishment URL is official, it cannot be former / defunct
            When(x => x.IsOfficialUrl, () =>
                RuleFor(x => x.IsFormerUrl).Equal(false)
                .WithMessage("An official establishment URL cannot also be a former or defunct URL.")
            );
        }

        private bool Exist(int id)
        {
            _establishment = _entities.Query<Establishment>()
                .SingleOrDefault(y => y.RevisionId == id)
            ;
            return _establishment != null;
        }

        private bool NotBeDuplicate(CreateEstablishmentUrl command, string value)
        {
            _duplicate =
                _entities.Query<EstablishmentUrl>().FirstOrDefault(
                    x =>
                    x.Value.Equals(value, StringComparison.OrdinalIgnoreCase));
            return _duplicate == null;
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
            _unitOfWork.SaveChanges();
            command.Id = establishmentUrl.RevisionId;
            _eventProcessor.Raise(new EstablishmentChanged());
        }
    }
}
