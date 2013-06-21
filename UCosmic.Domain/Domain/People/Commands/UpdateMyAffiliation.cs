using System;
using System.Linq;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class UpdateMyAffiliation
    {
        public IPrincipal Principal { get; protected internal set; }
        public int Id { get; protected internal set; }
        public int PersonId { get; set; }
        public int EstablishmentId { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsClaimingStudent { get; set; }
        public bool IsClaimingEmployee { get; set; }
        public int? CampusId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }
        public int? FacultyRankId { get; set; }

        public UpdateMyAffiliation(IPrincipal principal, int id)
        {
            Principal = principal;
            Id = id;
        }
    }

    public class ValidateUpdateAffliliationCommand : AbstractValidator<UpdateMyAffiliation>
    {
        public ValidateUpdateAffliliationCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal.Identity.Name)
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyPrincipalIdentityName.FailMessage)
                .MustFindUserByName(entities)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)
            ;

            RuleFor(x => x.EstablishmentId)
                // establishment id must exist in database
                .MustFindEstablishmentById(entities)
                    .WithMessage(MustFindEstablishmentById.FailMessageFormat, x => x.EstablishmentId)
            ;

            RuleFor(x => x.IsClaimingStudent)
                // cannot claim student unless affiliation establishment is an academic institution
                .MustNotBeClaimingStudentAffiliationForNonInstitutions(entities, x => x.EstablishmentId)
                    .WithMessage(MustNotBeClaimingStudentAffiliationForNonInstitutions<object>.FailMessageFormat, x => x.EstablishmentId)
            ;

            RuleFor(x => x.PersonId)
                // person id must exist in database
                .MustFindPersonById(entities)
                .WithMessage(MustFindPersonById.FailMessageFormat, x => x.PersonId);

            // cannot create a duplicate affiliation
            //.MustNotBePersonAffiliatedWithEstablishment(entities, x => x.EstablishmentId)
            //    .WithMessage(MustNotBePersonAffiliatedWithEstablishment<object>.FailMessageFormat, x => x.PersonId, x => x.EstablishmentId)
            //    .MustNotBePersonAffiliatedWithDepartment(entities,
            //                                              establishmentId => establishmentId.EstablishmentId,
            //                                              campusId => campusId.CampusId,
            //                                              collegeId => collegeId.CollegeId,
            //                                              departmentId => departmentId.DepartmentId)
            //        .WithMessage(MustNotBePersonAffiliatedWithDepartment<object>.FailMessageFormat, x => x.PersonId, x => x.EstablishmentId)
            //;
        }
    }

    public class HandleUpdateAffliliationCommand : IHandleCommands<UpdateMyAffiliation>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateAffliliationCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateMyAffiliation command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var affiliation = _entities.Get<Affiliation>().SingleOrDefault(a => a.RevisionId == command.Id);
            if (affiliation == null) { throw new Exception("Affiliation Not Found."); }



            var existingAffiliation = _entities.Get<Affiliation>().SingleOrDefault(x =>
                x.PersonId == command.PersonId &&
                x.EstablishmentId == command.EstablishmentId &&
                x.CampusId == command.CampusId &&
                x.CollegeId == command.CollegeId &&
                x.DepartmentId == command.DepartmentId);

            if ((existingAffiliation != null) && (existingAffiliation.RevisionId != command.Id))
            {
                var establishment = _entities.Get<Establishment>()
                             .SingleOrDefault(e => e.RevisionId == existingAffiliation.CampusId);
                string campusName = (establishment == null) ? null : establishment.OfficialName;

                establishment = _entities.Get<Establishment>()
                             .SingleOrDefault(e => e.RevisionId == existingAffiliation.CollegeId);
                string collegeName = (establishment == null) ? null : establishment.OfficialName;

                establishment = _entities.Get<Establishment>()
                             .SingleOrDefault(e => e.RevisionId == existingAffiliation.DepartmentId);
                string departmentName = (establishment == null) ? null : establishment.OfficialName;

                string message = String.Format(
                        "Affiliation already exists for {0} in {1},{2},{3}",
                        existingAffiliation.Person.DisplayName, campusName, collegeName, departmentName );
                throw new Exception(message);
            }

            var updatedAffiliation = new Affiliation
            {
                EstablishmentId = command.EstablishmentId,
                IsClaimingStudent = command.IsClaimingStudent,
                IsClaimingEmployee = command.IsClaimingEmployee,
                IsPrimary = command.IsPrimary,
                CampusId = command.CampusId,
                CollegeId = command.CollegeId,
                DepartmentId = command.DepartmentId,
                FacultyRankId = command.FacultyRankId
            };

            if (!updatedAffiliation.Equals(affiliation))
            {
                affiliation.EstablishmentId = updatedAffiliation.EstablishmentId;
                affiliation.IsClaimingStudent = updatedAffiliation.IsClaimingStudent;
                affiliation.IsClaimingEmployee = updatedAffiliation.IsClaimingEmployee;
                affiliation.IsPrimary = updatedAffiliation.IsPrimary;
                affiliation.CampusId = updatedAffiliation.CampusId;
                affiliation.CollegeId = updatedAffiliation.CollegeId;
                affiliation.DepartmentId = updatedAffiliation.DepartmentId;
                affiliation.FacultyRankId = command.FacultyRankId;

                _entities.Update(affiliation);
                _unitOfWork.SaveChanges();
            }
        }
    }
}
