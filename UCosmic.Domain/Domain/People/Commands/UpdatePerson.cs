using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;

// TODO: affst
namespace UCosmic.Domain.People
{
    public class UpdatePerson
    {
        public UpdatePerson(IPrincipal principal, int id)
        {
            Principal = principal;
            Id = id;
        }

        public class Affiliation
        {
            public int EstablishmentId { get; set; }
            public string JobTitles { get; set; }
            public bool IsDefault { get; set; }
            public bool IsAcknowledged { get; set; }
            public bool IsClaimingStudent { get; set; }
            public bool IsClaimingEmployee { get; set; }
            public bool IsClaimingInternationalOffice { get; set; }
            public bool IsClaimingAdministrator { get; set; }
            public bool IsClaimingFaculty { get; set; }
            public bool IsClaimingStaff { get; set; }
            public int? CampusId { get; set; }
            public int? CollegeId { get; set; }
            public int? DepartmentId { get; set; }
            public int? FacultyRankId { get; set; }
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
        public bool IsActive { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }
        public ICollection<Affiliation> Affiliations { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdatePersonCommand : AbstractValidator<UpdatePerson>
    {
        public ValidateUpdatePersonCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // person id must exist in database
            RuleFor(x => x.Id)
                .MustFindPersonById(entities)
                    .WithMessage(MustFindPersonById.FailMessageFormat, x => x.Id)
            ;

            // when first and last name are not provided, display name cannot be empty
            When(x => string.IsNullOrWhiteSpace(x.FirstName) || string.IsNullOrWhiteSpace(x.LastName), () =>
                RuleFor(x => x.DisplayName)
                    // display name cannot be empty
                    .NotEmpty().WithMessage(MustNotHaveEmptyDisplayName.FailMessageImpossibleToGeneate)
            );
        }
    }

    public class HandleUpdatePersonCommand : IHandleCommands<UpdatePerson>
    {
        private readonly ICommandEntities _entities;
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateMyAffiliation> _createMyAffiliation;
        private readonly IHandleCommands<UpdateMyAffiliation> _updateMyAffiliation;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdatePersonCommand(ICommandEntities entities
                , IProcessQueries queryProcessor
                , IHandleCommands<CreateMyAffiliation> createMyAffiliation
                , IHandleCommands<UpdateMyAffiliation> updateMyAffiliation
                , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _queryProcessor = queryProcessor;
            _createMyAffiliation = createMyAffiliation;
            _updateMyAffiliation = updateMyAffiliation;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdatePerson command)
        {
            Handle2(command);
        }

        private bool CompareAffiliation(UpdatePerson.Affiliation a, Affiliation b)
        {
            return (a.EstablishmentId == b.EstablishmentId) &&
                (a.JobTitles == b.JobTitles) &&
                (a.IsDefault == b.IsDefault) &&
                (a.IsAcknowledged == b.IsAcknowledged) &&
                (a.IsClaimingStudent == b.IsClaimingStudent) &&
                (a.IsClaimingEmployee == b.IsClaimingEmployee) &&
                (a.IsClaimingInternationalOffice == b.IsClaimingInternationalOffice) &&
                (a.IsClaimingAdministrator == b.IsClaimingAdministrator) &&
                (a.IsClaimingFaculty == b.IsClaimingFaculty) &&
                (a.IsClaimingStaff == b.IsClaimingStaff) &&
                (a.CampusId == b.CampusId) &&
                (a.CollegeId == b.CollegeId) &&
                (a.DepartmentId == b.DepartmentId) &&
                (a.FacultyRankId == b.FacultyRankId);
        }

        private bool CompareAffiliations(ICollection<UpdatePerson.Affiliation> aList, ICollection<Affiliation> bList)
        {
            if ((aList == null) && (bList == null)) return true;
            if ((aList== null)) return false;
            if ((bList == null)) return false;
            if (aList.Count != bList.Count) return false;

            for (var i = 0; i < aList.Count; i += 1)
            {
                var a = aList.ElementAt(i);
                var b = bList.ElementAt(i);
                if (!CompareAffiliation(a,b)) return false;
            }

            return true;
        }

        private void Handle2(UpdatePerson command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.User
                })
                .Single(p => p.RevisionId == command.Id);

            // only mutate when state is modified
            if (
                command.IsActive == person.IsActive &&
                command.IsDisplayNameDerived == person.IsDisplayNameDerived &&
                command.DisplayName == person.DisplayName &&
                command.Salutation == person.Salutation &&
                command.FirstName == person.FirstName &&
                command.MiddleName == person.MiddleName &&
                command.LastName == person.LastName &&
                command.Suffix == person.Suffix &&
                command.Gender == person.Gender &&
                CompareAffiliations(command.Affiliations, person.Affiliations)
               )
                return;

            // log audit
            var personAudit = new CommandEvent
            {
                RaisedBy = System.Threading.Thread.CurrentPrincipal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.Id,
                    command.IsActive,
                    command.IsDisplayNameDerived,
                    command.DisplayName,
                    command.Salutation,
                    command.FirstName,
                    command.MiddleName,
                    command.LastName,
                    command.Suffix,
                    command.Gender,
                    command.Affiliations
                }),
                PreviousState = person.ToJsonAudit(),
            };

            // update values
            person.IsActive = command.IsActive;
            person.Salutation = command.Salutation;
            person.FirstName = command.FirstName;
            person.MiddleName = command.MiddleName;
            person.LastName = command.LastName;
            person.Suffix = command.Suffix;
            person.Gender = command.Gender;
            if (string.IsNullOrWhiteSpace(command.DisplayName))
            {
                person.DisplayName = _queryProcessor.Execute(new GenerateDisplayName
                {
                    Salutation = command.Salutation,
                    FirstName = command.FirstName,
                    MiddleName = command.MiddleName,
                    LastName = command.LastName,
                    Suffix = command.Suffix,
                });
                person.IsDisplayNameDerived = true;
            }
            else
            {
                person.DisplayName = command.DisplayName;
                person.IsDisplayNameDerived = command.IsDisplayNameDerived;
            }


            // update affiliations
            if (command.Affiliations != null)
            {
                foreach (var update in command.Affiliations)
                {
                    /* Update and add */
                    Affiliation existing = person.Affiliations.FirstOrDefault(a => 
                        (a.EstablishmentId == update.EstablishmentId) &&
                        (a.CampusId == update.CampusId) &&
                        (a.CollegeId == update.CollegeId) &&
                        (a.DepartmentId == update.DepartmentId));
                        
                    if (existing == null)
                    {
                        /* Create */
                        var createCommand = new CreateMyAffiliation(new GenericPrincipal(new GenericIdentity(person.User.Name), new string[0]))
                        {
                            EstablishmentId = update.EstablishmentId,
                            IsClaimingStudent = update.IsClaimingStudent,
                            IsClaimingEmployee = update.IsClaimingEmployee,
                            CampusId = update.CampusId,
                            CollegeId = update.CollegeId,
                            DepartmentId = update.DepartmentId,
                            FacultyRankId = update.FacultyRankId,
                        };

                        _createMyAffiliation.Handle(createCommand);
                        _unitOfWork.SaveChanges();
                    }
                    else
                    {
                        /* Update */
                        var updateCommand = new UpdateMyAffiliation(command.Principal,
                                                                    existing.RevisionId,
                                                                    command.Id,
                                                                    existing.EstablishmentId)
                        {
                            IsClaimingStudent = update.IsClaimingStudent,
                            IsClaimingEmployee = update.IsClaimingEmployee,
                            CampusId = update.CampusId,
                            CollegeId = update.CollegeId,
                            DepartmentId = update.DepartmentId,
                            FacultyRankId = update.FacultyRankId,
                        };

                        _updateMyAffiliation.Handle(updateCommand);
                        _unitOfWork.SaveChanges();
                    }
                }

                /* Delete */
#if false
                /* TBD - Although this seems like the right action to take, it does
                    in fact delete the default establishment.  Going to take this out for now. */

                foreach (var existing in person.Affiliations.ToList())
                {
                    UpdatePerson.Affiliation update = command.Affiliations.FirstOrDefault(a => 
                       (a.EstablishmentId == existing.EstablishmentId) &&
                       (a.CampusId == existing.CampusId) &&
                       (a.CollegeId == existing.CollegeId) &&
                       (a.DepartmentId == existing.DepartmentId));
             
                    if (update == null)
                    {
                        var deleteCommand = new DeleteMyAffiliation(command.Principal, existing.RevisionId);
                        _deleteMyAffiliation.Handle(deleteCommand);
                        _unitOfWork.SaveChanges();
                    }
                }
#endif
            }

            // push to database
            personAudit.NewState = person.ToJsonAudit();
            _entities.Create(personAudit);
            _entities.Update(person);
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }

        //// rather than handle all of these cases, i broke these out into separate commands.
        //// updateperson only deals with scalars on the person entity.
        //// createemployee and updateemployee only work with those aggregates.
        //// there is also a deleteemployee which encapsulates that operation.
        //// to combine all of the ops that are needed by the user profile screen
        //// i also created an updatemyprofile command.
        //// this command takes all of the scalars from the UI form and then reuses
        //// updateperson, createemployee, updateemployee, and deleteemployee.
        //private void Handle1(UpdatePerson command)
        //{
        //    if (command == null) { throw new ArgumentNullException("command"); }

        //    var person = _entities.Get<Person>()
        //        .SingleOrDefault(p => p.RevisionId == command.RevisionId);
        //    if (person == null) // person should never be null thanks to validator
        //        throw new InvalidOperationException(string.Format(
        //            "Person '{0}' does not exist", command.RevisionId));

        //    // log audit
        //    var personAudit = new CommandEvent
        //    {
        //        RaisedBy = command.FirstName + " " + command.LastName,
        //        Name = command.GetType().FullName,
        //        Value = JsonConvert.SerializeObject(new
        //        {
        //            Id = command.RevisionId,
        //            command.IsActive,
        //            command.IsDisplayNameDerived,
        //            command.DisplayName,
        //            command.Salutation,
        //            command.FirstName,
        //            command.MiddleName,
        //            command.LastName,
        //            command.Suffix,
        //            command.Gender,
        //            //command.Picture,
        //        }),
        //        PreviousState = person.ToJsonAudit(),
        //    };


        //    bool personChanged = false;

        //    if (person.IsActive != command.IsActive)
        //    { person.IsActive = command.IsActive; personChanged = true; }
        //    if (person.IsDisplayNameDerived != command.IsDisplayNameDerived)
        //    { person.IsDisplayNameDerived = command.IsDisplayNameDerived; personChanged = true; }
        //    if (person.DisplayName != command.DisplayName)
        //    { person.DisplayName = command.DisplayName; personChanged = true; }
        //    if (person.Salutation != command.Salutation)
        //    { person.Salutation = command.Salutation; personChanged = true; }
        //    if (person.FirstName != command.FirstName)
        //    { person.FirstName = command.FirstName; personChanged = true; }
        //    if (person.MiddleName != command.MiddleName)
        //    { person.MiddleName = command.MiddleName; personChanged = true; }
        //    if (person.LastName != command.LastName)
        //    { person.LastName = command.LastName; personChanged = true; }
        //    if (person.Suffix != command.Suffix)
        //    { person.Suffix = command.Suffix; personChanged = true; }
        //    if (person.Gender != command.Gender)
        //    { person.Gender = command.Gender; personChanged = true; }

        //    /* TODO: Move to UpdateEmployee */
        //    //{
        //    //    Affiliation primaryAffiliation = person.Affiliations.SingleOrDefault(x => x.IsPrimary);
        //    //    if (primaryAffiliation != null)
        //    //    {
        //    //        string workingTitle = (command.WorkingTitle != null) ? command.WorkingTitle.Trim() : null;
        //    //        primaryAffiliation.JobTitles = (!String.IsNullOrEmpty(command.WorkingTitle)) ? workingTitle : null;
        //    //        changed = true;
        //    //    }
        //    //}

        //    /* TODO: Handle these properties. Maybe as separate command? */
        //    //person.Picture = command.Picture;
        //    //person.Affiliations = command.Affiliations;
        //    //{
        //    //    if (person.Emails.Count != command.Emails.Count)
        //    //        { changed |= true; }
        //    //    else
        //    //    {
        //    //        IEnumerator<EmailAddress> pEnumerator = person.Emails.GetEnumerator();
        //    //        IEnumerator<EmailAddress> cEnumerator = command.Emails.GetEnumerator();
        //    //        for (int i = 0; i < person.Emails.Count; i += 1)
        //    //        {
        //    //            pEnumerator.MoveNext();
        //    //            cEnumerator.MoveNext();

        //    //            if ((pEnumerator.Current.Value != cEnumerator.Current.Value) ||
        //    //                (pEnumerator.Current.IsDefault != cEnumerator.Current.IsDefault) ||
        //    //                (pEnumerator.Current.IsConfirmed != cEnumerator.Current.IsConfirmed))
        //    //            {
        //    //                pEnumerator.Current.Value = cEnumerator.Current.Value;
        //    //                pEnumerator.Current.IsDefault = cEnumerator.Current.IsDefault;
        //    //                pEnumerator.Current.IsConfirmed = cEnumerator.Current.IsConfirmed;
        //    //                changed |= true;
        //    //            }
        //    //        }
        //    //    }
        //    //}

        //    Employee employee = null;

        //    if (command.EmployeeId != null)
        //    {
        //        employee = _entities.Get<Employee>()
        //                 .SingleOrDefault(p => p.Id == command.EmployeeId);
        //    }

        //    CommandEvent employeeAudit = null;

        //    if (employee != null)
        //    {
        //        employeeAudit = new CommandEvent
        //        {
        //            RaisedBy = command.FirstName + " " + command.LastName,
        //            Name = command.GetType().FullName,
        //            Value = JsonConvert.SerializeObject(new
        //            {
        //                Id = command.RevisionId,
        //                command.EmployeeFacultyRankId,
        //                command.EmployeeAdministrativeAppointments,
        //                command.EmployeeJobTitles
        //            }),
        //            PreviousState = employee.ToJsonAudit(),
        //        };
        //    }

        //    bool employeeChanged = false;

        //    /* If all employee properties are null, remove entity */
        //    EmployeeFacultyRank employeeFacultyRank = null;
        //    if (command.EmployeeFacultyRankId.HasValue)
        //        employeeFacultyRank = _entities.Get<EmployeeFacultyRank>().Single(x => x.Id == command.EmployeeFacultyRankId.Value);
        //    if ((employee != null) &&
        //        ((employeeFacultyRank == null) || (employeeFacultyRank.Rank == null)) &&
        //        (command.EmployeeAdministrativeAppointments == null) &&
        //        (command.EmployeeJobTitles == null))
        //    {
        //        _entities.Purge(employee);
        //        person.Employee = null;
        //        employee = null; // so Update is not called
        //        employeeChanged = true;
        //    }
        //    else
        //    {
        //        if (employee == null)
        //        {
        //            CreateEmployee createEmployeeCommand = new CreateEmployee
        //            {
        //                //FacultyRank = (command.EmployeeFacultyRank != null) ?
        //                //    _entities.Get<EmployeeFacultyRank>().SingleOrDefault(r => r.Id == command.EmployeeFacultyRank.Id) :
        //                //    null,
        //                FacultyRankId = command.EmployeeFacultyRankId,
        //                AdministrativeAppointments = command.EmployeeAdministrativeAppointments,
        //                JobTitles = command.EmployeeJobTitles,
        //                PersonId = person.RevisionId,
        //                NoCommit = true,
        //            };

        //            _createEmployee.Handle(createEmployeeCommand);
        //            employeeChanged = true;
        //        }
        //        else
        //        {
        //            if ((command.EmployeeFacultyRankId.HasValue) &&
        //               ((employee.FacultyRank == null) || (command.EmployeeFacultyRankId.Value != employee.FacultyRank.Id)))
        //            {
        //                employee.FacultyRank = _entities.Get<EmployeeFacultyRank>()
        //                                                .SingleOrDefault(r => r.Id == command.EmployeeFacultyRankId.Value);
        //                employeeChanged = true;
        //            }

        //            if (command.EmployeeAdministrativeAppointments != employee.AdministrativeAppointments)
        //            {
        //                employee.AdministrativeAppointments = command.EmployeeAdministrativeAppointments;
        //                employeeChanged = true;
        //            }

        //            if (command.EmployeeJobTitles != employee.JobTitles)
        //            {
        //                employee.JobTitles = command.EmployeeJobTitles;
        //                employeeChanged = true;
        //            }
        //        }
        //    }

        //    // update
        //    if (personChanged)
        //    {
        //        personAudit.NewState = person.ToJsonAudit();
        //        _entities.Create(personAudit);
        //        _entities.Update(person);
        //    }

        //    if (employeeChanged)
        //    {
        //        if (employee != null)
        //        {
        //            if (employeeAudit != null)
        //                {
        //                    employeeAudit.NewState = employee.ToJsonAudit();
        //                    _entities.Create(employeeAudit);
        //                }

        //            _entities.Update(employee);
        //        }
        //    }
            
        //    if (personChanged || employeeChanged )
        //    {
        //        _unitOfWork.SaveChanges();
        //        //if (personChanged) { _eventProcessor.Raise(new PersonChanged()); }
        //        //if (employeeChanged) { _eventProcessor.Raise(new EmployeeChanged()); }
        //    }
        //}
    }
}
 