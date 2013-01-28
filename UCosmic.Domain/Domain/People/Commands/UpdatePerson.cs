using System;
using System.Collections.Generic;
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
            //Emails = new Collection<EmailAddress>();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

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
        public int EmployeeFacultyRankId { get; set; }
        public string WorkingTitle { get; set; }
        //public byte[] Picture { get; set; }
        //public virtual ICollection<EmailAddress> Emails { get; set; }
        //public virtual ICollection<Affiliation> Affiliations { get; set; }
        public string AdministrativeAppointments { get; set; }
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
        private readonly IProcessEvents _eventProcessor;

        public HandleUpdatePersonCommand(ICommandEntities entities
            , IUnitOfWork unitOfWork
            , IProcessEvents eventProcessor
        )
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
            _eventProcessor = eventProcessor;
        }

        public void Handle(UpdatePerson command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var person = _entities.Get<Person>()
                .SingleOrDefault(p => p.RevisionId == command.RevisionId);
            if (person == null) { return; }

            var facultyRank = _entities.Get<EmployeeFacultyRank>()
                .SingleOrDefault(p => p.Id == command.EmployeeFacultyRankId);

            // log audit
            var audit = new CommandEvent
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
                    EmployeeFacultyRank = (facultyRank != null) ? facultyRank.Rank : null,
                    //command.Picture,
                    //command.Emails,
                    //command.Affiliations,
                    command.AdministrativeAppointments,
                }),
                PreviousState = person.ToJsonAudit(),
            };
            
            bool changed = false;

            if (person.IsActive != command.IsActive)
                { person.IsActive = command.IsActive; changed = true; }
            if (person.IsDisplayNameDerived != command.IsDisplayNameDerived)
                { person.IsDisplayNameDerived = command.IsDisplayNameDerived; changed = true; }
            if (person.DisplayName != command.DisplayName)
                { person.DisplayName = command.DisplayName; changed = true; }
            if (person.Salutation != command.Salutation)
                { person.Salutation = command.Salutation; changed = true; }
            if (person.FirstName != command.FirstName)
                { person.FirstName = command.FirstName; changed = true; }
            if (person.MiddleName != command.MiddleName)
                { person.MiddleName = command.MiddleName; changed = true; }
            if (person.LastName != command.LastName)
                { person.LastName = command.LastName; changed = true; }
            if (person.Suffix != command.Suffix)
                { person.Suffix = command.Suffix; changed = true; }
            if (person.Gender != command.Gender)
                { person.Gender = command.Gender; changed = true; }

            {
                Affiliation primaryAffiliation = person.Affiliations.SingleOrDefault(x => x.IsPrimary);
                if (primaryAffiliation != null)
                {
                    string workingTitle = (command.WorkingTitle != null) ? command.WorkingTitle.Trim() : null;
                    primaryAffiliation.JobTitles = (!String.IsNullOrEmpty(command.WorkingTitle)) ? workingTitle : null;
                    changed = true;
                }
            }

            if (command.EmployeeFacultyRankId == 0)
            {
                person.EmployeeFacultyRank = null;
                changed = true;
            }
            else if ((person.EmployeeFacultyRank == null) ||
                    ((person.EmployeeFacultyRank != null) && (person.EmployeeFacultyRank.Id != command.EmployeeFacultyRankId)))
            {
                person.EmployeeFacultyRank = _entities.Get<EmployeeFacultyRank>()
                                                .SingleOrDefault(x => x.Id == command.EmployeeFacultyRankId);
                changed = true;
            }
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

            if (person.AdministrativeAppointments != command.AdministrativeAppointments)
                { person.AdministrativeAppointments = command.AdministrativeAppointments; changed = true; }

            // update
            if (changed)
            {
                audit.NewState = person.ToJsonAudit();
                _entities.Create(audit);
                _entities.Update(person);

                _unitOfWork.SaveChanges();
                //_eventProcessor.Raise(new PersonChanged());
            }
        }
    }
}
