using System;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

namespace UCosmic.Domain.Establishments
{
    public class UpdateEstablishmentUrl
    {
        public UpdateEstablishmentUrl(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; set; }
        public string Value { get; set; }
        public bool IsOfficialUrl { get; set; }
        public bool IsFormerUrl { get; set; }
        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateEstablishmentUrlCommand : AbstractValidator<UpdateEstablishmentUrl>
    {
        private readonly IQueryEntities _entities;
        private EstablishmentUrl _establishmentUrl;
        private EstablishmentUrl _duplicate;

        public ValidateUpdateEstablishmentUrlCommand(IQueryEntities entities)
        {
            _entities = entities;

            RuleFor(x => x.Id)
                // id must be within valid range
                .GreaterThanOrEqualTo(1)
                .WithMessage("Establishment URL id '{0}' is not valid.", x => x.Id)

                // id must exist in the database
                .Must(Exist)
                .WithMessage("Establishment URL with id '{0}' does not exist", x => x.Id)
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
            _establishmentUrl = _entities.Query<EstablishmentUrl>()
                .SingleOrDefault(y => y.RevisionId == id)
            ;
            return _establishmentUrl != null;
        }

        private bool NotBeDuplicate(UpdateEstablishmentUrl command, string value)
        {
            _duplicate =
                _entities.Query<EstablishmentUrl>().FirstOrDefault(
                    x =>
                    x.RevisionId != command.Id &&
                    x.Value.Equals(value, StringComparison.OrdinalIgnoreCase));
            return _duplicate == null;
        }
    }

    public class HandleUpdateEstablishmentUrlCommand : IHandleCommands<UpdateEstablishmentUrl>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProcessEvents _eventProcessor;

        public HandleUpdateEstablishmentUrlCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(UpdateEstablishmentUrl command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // load target
            var establishmentUrl = _entities.Get<EstablishmentUrl>()
                .EagerLoad(_entities, new Expression<Func<EstablishmentUrl, object>>[]
                {
                    x => x.ForEstablishment.Urls,
                })
                .Single(x => x.RevisionId == command.Id);

            // only mutate when state is modified
            if (command.Value == establishmentUrl.Value &&
                command.IsFormerUrl == establishmentUrl.IsFormerUrl &&
                command.IsOfficialUrl == establishmentUrl.IsOfficialUrl)
                return;

            // update previous official URL and owner when changing official URL
            if (!establishmentUrl.IsOfficialUrl && command.IsOfficialUrl)
            {
                var establishment = establishmentUrl.ForEstablishment;
                var officialUrl = establishment.Urls.Single(x => x.IsOfficialUrl);
                var changeCommand = new UpdateEstablishmentUrl(command.Principal)
                {
                    Id = officialUrl.RevisionId,
                    Value = officialUrl.Value,
                    IsFormerUrl = officialUrl.IsFormerUrl,
                    IsOfficialUrl = false,
                    NoCommit = true,
                };
                Handle(changeCommand);
                establishment.WebsiteUrl = command.Value;
                _entities.Update(establishment);
            }

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.Id,
                    command.Value,
                    command.IsFormerUrl,
                    command.IsOfficialUrl,
                }),
                PreviousState = establishmentUrl.ToJsonAudit(),
            };

            // update scalars
            establishmentUrl.Value = command.Value;
            establishmentUrl.IsFormerUrl = command.IsFormerUrl;
            establishmentUrl.IsOfficialUrl = command.IsOfficialUrl;

            audit.NewState = establishmentUrl.ToJsonAudit();
            _entities.Create(audit);
            _entities.Update(establishmentUrl);

            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
                _eventProcessor.Raise(new EstablishmentChanged());
            }
        }
    }
}
