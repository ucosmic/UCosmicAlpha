using System;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class UpdateMyAffiliation
    {
        public IPrincipal Principal { get; set; }
        public int EstablishmentId { get; set; }
        public string JobTitles { get; set; }
        public bool IsClaimingStudent { get; set; }
        public bool IsClaimingEmployee { get; set; }
        public bool IsClaimingInternationalOffice { get; set; }
        public bool IsClaimingAdministrator { get; set; }
        public bool IsClaimingFaculty { get; set; }
        public bool IsClaimingStaff { get; set; }
        public int ChangeCount { get; internal set; }
        public bool ChangedState { get { return ChangeCount > 0; } }
    }

    public class ValidateUpdateMyAffiliationCommand : AbstractValidator<UpdateMyAffiliation>
    {
        public ValidateUpdateMyAffiliationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.EstablishmentId)
                // establishment id must exist in database
                .MustFindEstablishmentById(entities)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId)
            ;

            RuleFor(x => x.Principal)
                // principal cannot be null
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
            ;

            RuleFor(x => x.Principal.Identity.Name)
                // principal.identity.name cannot be null or empty
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyPrincipalIdentityName.FailMessage)

                // principal.identity.name must match User.Name entity property
                .MustFindUserByName(entities)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)

                // must find affiliation for principal and establishment id
                .MustBeUserAffiliatedWithEstablishment(entities, x => x.EstablishmentId)
                    .WithMessage(MustBeUserAffiliatedWithEstablishment<object>.FailMessageFormat,
                        x => x.Principal.Identity.Name, x => x.EstablishmentId)
            ;
        }
    }

    public class HandleUpdateMyAffiliationCommand : IHandleCommands<UpdateMyAffiliation>
    {
        private readonly ICommandEntities _entities;

        public HandleUpdateMyAffiliationCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(UpdateMyAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // get the affiliation
            var affiliation = _entities.Get<Affiliation>().ByUserNameAndEstablishmentId(
                command.Principal.Identity.Name, command.EstablishmentId);

            if (affiliation == null)
                throw new InvalidOperationException(string.Format(
                    "Affiliation could not be found between user '{0}' and establishment '{1}'.", 
                        command.Principal.Identity.Name, command.EstablishmentId));

            // update fields
            if (!affiliation.IsAcknowledged) command.ChangeCount++;
            affiliation.IsAcknowledged = true;

            if (affiliation.JobTitles != command.JobTitles) command.ChangeCount++;
            affiliation.JobTitles = command.JobTitles;

            if (affiliation.IsClaimingStudent != command.IsClaimingStudent) command.ChangeCount++;
            affiliation.IsClaimingStudent = command.IsClaimingStudent;

            if (affiliation.IsClaimingEmployee != command.IsClaimingEmployee) command.ChangeCount++;
            affiliation.IsClaimingEmployee = command.IsClaimingEmployee;

            if (affiliation.IsClaimingInternationalOffice != command.IsClaimingInternationalOffice) command.ChangeCount++;
            affiliation.IsClaimingInternationalOffice = command.IsClaimingInternationalOffice;

            if (affiliation.IsClaimingAdministrator != command.IsClaimingAdministrator) command.ChangeCount++;
            affiliation.IsClaimingAdministrator = command.IsClaimingAdministrator;

            if (affiliation.IsClaimingFaculty != command.IsClaimingFaculty) command.ChangeCount++;
            affiliation.IsClaimingFaculty = command.IsClaimingFaculty;

            if (affiliation.IsClaimingStaff != command.IsClaimingStaff) command.ChangeCount++;
            affiliation.IsClaimingStaff = command.IsClaimingStaff;

            // store
            if (command.ChangeCount > 0) _entities.Update(affiliation);
        }
    }
}
