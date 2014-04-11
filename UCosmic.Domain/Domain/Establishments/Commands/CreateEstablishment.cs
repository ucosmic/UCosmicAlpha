using System;
using System.Linq;
using System.Net.Mail;
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
        public int? ParentId { get; set; }
        internal Establishment Parent { get; set; }
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

        //public string ExternalId { get; set; }

        public Establishment Created { get; internal set; }

        public int? Rank { get; set; }

        internal bool NoCommit { get; set; }
        internal bool NoHierarchy { get; set; }
    }

    public class ValidateCreateEstablishmentCommand : AbstractValidator<CreateEstablishment>
    {
        
        public ValidateCreateEstablishmentCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // text of the establishment name is required, has max length, and must be unique
            RuleFor(x => x.OfficialName)
                .NotNull()
                    .WithMessage("Establishment must have an official name.")
            ;

            // parent id must exist when passed
            When(x => x.ParentId.HasValue, () =>
                RuleFor(x => x.ParentId.Value)
                    .MustFindEstablishmentById(entities)
                        .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.ParentId)
            );

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
        }
    }

    public class HandleCreateEstablishmentCommand : IHandleCommands<CreateEstablishment>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateEstablishmentName> _createName;
        private readonly IHandleCommands<CreateEstablishmentUrl> _createUrl;
        private readonly IHandleCommands<UpdateEstablishmentLocation> _updateLocation;
        private readonly IHandleCommands<UpdateEstablishmentHierarchy> _updateHierarchy;
        private readonly ITriggerEvent<EstablishmentChanged> _eventTrigger;
        private readonly ISendMail _mailSender;

        public HandleCreateEstablishmentCommand(ICommandEntities entities
            , IHandleCommands<CreateEstablishmentName> createName
            , IHandleCommands<CreateEstablishmentUrl> createUrl
            , IHandleCommands<UpdateEstablishmentLocation> updateLocation
            , IHandleCommands<UpdateEstablishmentHierarchy> updateHierarchy
            , ITriggerEvent<EstablishmentChanged> eventTrigger
            , ISendMail mailSender
        )
        {
            _entities = entities;
            _createName = createName;
            _createUrl = createUrl;
            _updateLocation = updateLocation;
            _updateHierarchy = updateHierarchy;
            _eventTrigger = eventTrigger;
            _mailSender = mailSender;
        }
        private MailMessage EmailUnverified(string email, string name, string establishmentName)
        {

            var mail = new MailMessage
            {
                From = new MailAddress("cloud@ucosmic.org", "UCosmic.com"),
                Subject = "Unverified Establishment",
                Body = establishmentName,
            };
            mail.To.Add(new MailAddress(email, name));

            // reply-to address
            if (!string.IsNullOrWhiteSpace("ucosmic@ucosmic.com"))
                mail.ReplyToList.Add(new MailAddress("ucosmic@ucosmic.com", "cloud@ucosmic.org"));

            return mail;
        }

        public void Handle(CreateEstablishment command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var hasOfficialUrl = command.OfficialUrl != null && !string.IsNullOrWhiteSpace(command.OfficialUrl.Value);
            var hasLocation = command.Location != null;

            var establishmentParent = command.Parent
                ?? (command.ParentId.HasValue
                    ? _entities.Get<Establishment>().Single(x => x.RevisionId == command.ParentId)
                    : null);

            // create initial establishment
            var establishment = new Establishment
            {
                Parent = establishmentParent,
                TypeId = command.TypeId,
                OfficialName = command.OfficialName.Text,
                WebsiteUrl = hasOfficialUrl ? command.OfficialUrl.Value : null,
                Location = new EstablishmentLocation(),
                //CollegeBoardDesignatedIndicator = command.CeebCode,
                //UCosmicCode = command.UCosmicCode,
                //ExternalId = command.ExternalId,
                VerticalRank = command.Rank
            };
            if (command.Principal.IsInRole(RoleName.EstablishmentAdministrator))
            {
                establishment.CollegeBoardDesignatedIndicator = command.CeebCode;
                establishment.UCosmicCode = command.UCosmicCode;
            }
            else
            {
                establishment.IsUnverified = true;
            }

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.ParentId,
                    command.TypeId,
                    command.CeebCode,
                    command.UCosmicCode,
                    //command.ExternalId,
                    OfficialName = command.OfficialName.Text,
                    OfficialNameLanguageCode = command.OfficialName.LanguageCode,
                    OfficialUrl = hasOfficialUrl ? command.OfficialUrl.Value : null,
                    CenterLatitude = command.Location != null ? command.Location.CenterLatitude : null,
                    CenterLongitude = command.Location != null ? command.Location.CenterLongitude : null,
                    BoxNorthEastLatitude = command.Location != null ? command.Location.BoxNorthEastLatitude : null,
                    BoxNorthEastLongitude = command.Location != null ? command.Location.BoxNorthEastLongitude : null,
                    BoxSouthWestLatitude = command.Location != null ? command.Location.BoxSouthWestLatitude : null,
                    BoxSouthWestLongitude = command.Location != null ? command.Location.BoxSouthWestLongitude : null,
                    PlaceId = command.Location != null ? command.Location.PlaceId : null,
                }),
                NewState = establishment.ToJsonAudit(),
            };
            _entities.Create(audit);
            _entities.Create(establishment);
            command.Created = establishment;

            // create official name
            command.OfficialName.OwnerId = null;
            command.OfficialName.Owner = establishment;
            command.OfficialName.NoCommit = true;
            _createName.Handle(command.OfficialName);

            // create official URL
            if (hasOfficialUrl)
            {
                command.OfficialUrl.OwnerId = null;
                command.OfficialUrl.Owner = establishment;
                command.OfficialUrl.NoCommit = true;
                _createUrl.Handle(command.OfficialUrl);
            }

            // update location
            if (hasLocation)
            {
                command.Location.Id = null;
                command.Location.Entity = establishment.Location;
                command.Location.NoCommit = true;
                _updateLocation.Handle(command.Location);
            }

            // update hierarchy
            if (!command.NoHierarchy)
                _updateHierarchy.Handle(new UpdateEstablishmentHierarchy(establishment));

            // commit
            if (command.NoCommit) return;

            _entities.SaveChanges();
            command.OfficialName.Id = command.OfficialName.CreatedEntity.RevisionId;
            if (hasOfficialUrl)
            {
                command.OfficialUrl.Id = command.OfficialUrl.CreatedEntity.RevisionId;
            }

            if (establishment.IsUnverified)
            {

                var email = EmailUnverified("timtwillis@gmail.com", "Tim", establishment.OfficialName);
                _mailSender.Send(email);// remove Tim after code verification
                email = EmailUnverified("Claudia.Hernandez@suny.edu", "Claudia", establishment.OfficialName);
                _mailSender.Send(email);
                email = EmailUnverified("Rebecca.Smolar@levininstitute.org", "Rebecca", establishment.OfficialName);
                _mailSender.Send(email);
            }

            _eventTrigger.Raise(new EstablishmentChanged());
        }
    }
}
