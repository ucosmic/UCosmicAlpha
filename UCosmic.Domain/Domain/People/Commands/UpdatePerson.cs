using System;
using System.Linq;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Employees;

namespace UCosmic.Domain.People
{
    public class UpdatePerson
    {
        public UpdatePerson(int revisionId)
        {
            // ReSharper disable DoNotCallOverridableMethodsInConstructor
            RevisionId = revisionId;
            IsActive = true;
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        /* Person */
        public int RevisionId { get ; set ; }
        public bool IsActive { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }
        /* Employee */
        public int? EmployeeId { get; set; }
        public EmployeeFacultyRank EmployeeFacultyRank { get; set; }
        public string EmployeeAdministrativeAppointments { get; set; }
        public string EmployeeJobTitles { get; set; }

        //public byte[] Picture { get; set; }
    }

    public class ValidateUpdatePersonCommand : AbstractValidator<UpdatePerson>
    {
        public ValidateUpdatePersonCommand(IProcessQueries queryProcessor)
        {
            //CascadeMode = CascadeMode.StopOnFirstFailure;

            //RuleFor(p => p.DisplayName)
            //    // display name cannot be empty
            //    .NotEmpty()
            //        .WithMessage(ValidatePerson.FailedBecauseDisplayNameWasEmpty)
            //;

            //RuleFor(p => p.UserName)
            //    // if username is present, validate that it is not attached to another person
            //    .Must(p => ValidateUser.NameMatchesNoEntity(p, queryProcessor))
            //        .WithMessage(ValidateUser.FailedBecauseNameMatchedEntity,
            //            p => p.UserName)
            //;
        }
    }

    public class HandleUpdatePersonCommand : IHandleCommands<UpdatePerson>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;
        //private readonly IProcessEvents _eventProcessor;
        private readonly IHandleCommands<CreateEmployee> _createEmployee;

        public HandleUpdatePersonCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            //, IProcessEvents eventProcessor
            , IHandleCommands<CreateEmployee> createEmployee
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            //_eventProcessor = eventProcessor;
            _createEmployee = createEmployee;
        }

        public void Handle(UpdatePerson command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var person = _entities.Get<Person>()
                .SingleOrDefault(p => p.RevisionId == command.RevisionId);
            if (person == null) { return; }

            // log audit
            var personAudit = new CommandEvent
            {
                RaisedBy = command.FirstName + " " + command.LastName,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    Id = command.RevisionId,
                    command.IsActive,
                    command.IsDisplayNameDerived,
                    command.DisplayName,
                    command.Salutation,
                    command.FirstName,
                    command.MiddleName,
                    command.LastName,
                    command.Suffix,
                    command.Gender,
                    //command.Picture,
                }),
                PreviousState = person.ToJsonAudit(),
            };


            bool personChanged = false;

            if (person.IsActive != command.IsActive)
            { person.IsActive = command.IsActive; personChanged = true; }
            if (person.IsDisplayNameDerived != command.IsDisplayNameDerived)
            { person.IsDisplayNameDerived = command.IsDisplayNameDerived; personChanged = true; }
            if (person.DisplayName != command.DisplayName)
            { person.DisplayName = command.DisplayName; personChanged = true; }
            if (person.Salutation != command.Salutation)
            { person.Salutation = command.Salutation; personChanged = true; }
            if (person.FirstName != command.FirstName)
            { person.FirstName = command.FirstName; personChanged = true; }
            if (person.MiddleName != command.MiddleName)
            { person.MiddleName = command.MiddleName; personChanged = true; }
            if (person.LastName != command.LastName)
            { person.LastName = command.LastName; personChanged = true; }
            if (person.Suffix != command.Suffix)
            { person.Suffix = command.Suffix; personChanged = true; }
            if (person.Gender != command.Gender)
            { person.Gender = command.Gender; personChanged = true; }

            /* TODO: Move to UpdateEmployee */
            //{
            //    Affiliation primaryAffiliation = person.Affiliations.SingleOrDefault(x => x.IsPrimary);
            //    if (primaryAffiliation != null)
            //    {
            //        string workingTitle = (command.WorkingTitle != null) ? command.WorkingTitle.Trim() : null;
            //        primaryAffiliation.JobTitles = (!String.IsNullOrEmpty(command.WorkingTitle)) ? workingTitle : null;
            //        changed = true;
            //    }
            //}

            /* TODO: Handle these properties. Maybe as separate command? */
            //person.Picture = command.Picture;
            //person.Affiliations = command.Affiliations;
            //{
            //    if (person.Emails.Count != command.Emails.Count)
            //        { changed |= true; }
            //    else
            //    {
            //        IEnumerator<EmailAddress> pEnumerator = person.Emails.GetEnumerator();
            //        IEnumerator<EmailAddress> cEnumerator = command.Emails.GetEnumerator();
            //        for (int i = 0; i < person.Emails.Count; i += 1)
            //        {
            //            pEnumerator.MoveNext();
            //            cEnumerator.MoveNext();

            //            if ((pEnumerator.Current.Value != cEnumerator.Current.Value) ||
            //                (pEnumerator.Current.IsDefault != cEnumerator.Current.IsDefault) ||
            //                (pEnumerator.Current.IsConfirmed != cEnumerator.Current.IsConfirmed))
            //            {
            //                pEnumerator.Current.Value = cEnumerator.Current.Value;
            //                pEnumerator.Current.IsDefault = cEnumerator.Current.IsDefault;
            //                pEnumerator.Current.IsConfirmed = cEnumerator.Current.IsConfirmed;
            //                changed |= true;
            //            }
            //        }
            //    }
            //}

            Employee employee = null;

            if (command.EmployeeId != null)
            {
                employee = _entities.Get<Employee>()
                         .SingleOrDefault(p => p.Id == command.EmployeeId);
            }

            CommandEvent employeeAudit = null;

            if (employee != null)
            {
                employeeAudit = new CommandEvent
                {
                    RaisedBy = command.FirstName + " " + command.LastName,
                    Name = command.GetType().FullName,
                    Value = JsonConvert.SerializeObject(new
                    {
                        Id = command.RevisionId,
                        command.EmployeeFacultyRank,
                        command.EmployeeAdministrativeAppointments,
                        command.EmployeeJobTitles
                    }),
                    PreviousState = employee.ToJsonAudit(),
                };
            }

            bool employeeChanged = false;

            /* If all employee properties are null, remove entity */
            if ((employee != null) &&
                ((command.EmployeeFacultyRank == null) || (command.EmployeeFacultyRank.Rank == null)) &&
                (command.EmployeeAdministrativeAppointments == null) &&
                (command.EmployeeJobTitles == null))
            {
                _entities.Purge(employee);
                person.Employee = null;
                employee = null; // so Update is not called
                employeeChanged = true;
            }
            else
            {
                if (employee == null)
                {
                    CreateEmployee createEmployeeCommand = new CreateEmployee
                    {
                        FacultyRank = (command.EmployeeFacultyRank != null) ?
                            _entities.Get<EmployeeFacultyRank>().SingleOrDefault(r => r.Id == command.EmployeeFacultyRank.Id) :
                            null,
                        AdministrativeAppointments = command.EmployeeAdministrativeAppointments,
                        JobTitles = command.EmployeeJobTitles,
                        ForPersonId = person.RevisionId
                    };

                    _createEmployee.Handle(createEmployeeCommand);
                    employeeChanged = true;
                }
                else
                {
                    if ((command.EmployeeFacultyRank != null) &&
                       ((employee.FacultyRank == null) || (command.EmployeeFacultyRank.Id != employee.FacultyRank.Id)))
                    {
                        employee.FacultyRank = _entities.Get<EmployeeFacultyRank>()
                                                        .SingleOrDefault(r => r.Id == command.EmployeeFacultyRank.Id);
                        employeeChanged = true;
                    }

                    if (command.EmployeeAdministrativeAppointments != employee.AdministrativeAppointments)
                    {
                        employee.AdministrativeAppointments = command.EmployeeAdministrativeAppointments;
                        employeeChanged = true;
                    }

                    if (command.EmployeeJobTitles != employee.JobTitles)
                    {
                        employee.JobTitles = command.EmployeeJobTitles;
                        employeeChanged = true;
                    }
                }
            }

            // update
            if (personChanged)
            {
                personAudit.NewState = person.ToJsonAudit();
                _entities.Create(personAudit);
                _entities.Update(person);
            }

            if (employeeChanged)
            {
                if (employee != null)
                {
                    if (employeeAudit != null)
                        {
                            employeeAudit.NewState = employee.ToJsonAudit();
                            _entities.Create(employeeAudit);
                        }

                    _entities.Update(employee);
                }
            }
            
            if (personChanged || employeeChanged )
            {
                _unitOfWork.SaveChanges();
                //if (personChanged) { _eventProcessor.Raise(new PersonChanged()); }
                //if (employeeChanged) { _eventProcessor.Raise(new EmployeeChanged()); }
            }
        }
    }
}
 