using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

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
            FacultyRank = new EmployeeFacultyRank();
            // ReSharper restore DoNotCallOverridableMethodsInConstructor
        }

        public int RevisionId { get ; protected internal set ; }
        public bool IsActive { get; protected internal set; }
        public bool IsDisplayNameDerived { get; protected internal set; }
        public string DisplayName { get; protected internal set; }
        public string Salutation { get; protected internal set; }
        public string FirstName { get; protected internal set; }
        public string MiddleName { get; protected internal set; }
        public string LastName { get; protected internal set; }
        public string Suffix { get; protected internal set; }
        public string Gender { get; protected internal set; }
        public EmployeeFacultyRank FacultyRank { get; protected internal set; }
        public string WorkingTitle { get; protected internal set; }
        //public byte[] Picture { get; protected internal set; }
        //public virtual ICollection<EmailAddress> Emails { get; protected internal set; }
        //public virtual ICollection<Affiliation> Affiliations { get; protected internal set; }
        public string AdministrativeAppointments { get; protected internal set; }
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
                    FacultyRank = command.FacultyRank.Rank,
                    //command.Picture,
                    //command.Emails,
                    //command.Affiliations,
                    command.AdministrativeAppointments,
                }),
                PreviousState = person.ToJsonAudit(),
            };
            
            bool changed = false;

            if (person.IsActive != command.IsActive)
                { person.IsActive = command.IsActive; changed |= true; }
            if (person.IsDisplayNameDerived != command.IsDisplayNameDerived)
                { person.IsDisplayNameDerived = command.IsDisplayNameDerived; changed |= true; }
            if (person.DisplayName != command.DisplayName)
                { person.DisplayName = command.DisplayName; changed |= true; }
            if (person.Salutation != command.Salutation)
                { person.Salutation = command.Salutation; changed |= true; }
            if (person.FirstName != command.FirstName)
                { person.FirstName = command.FirstName; changed |= true; }
            if (person.MiddleName != command.MiddleName)
                { person.MiddleName = command.MiddleName; changed |= true; }
            if (person.LastName != command.LastName)
                { person.LastName = command.LastName; changed |= true; }
            if (person.Suffix != command.Suffix)
                { person.Suffix = command.Suffix; changed |= true; }
            if (person.Gender != command.Gender)
                { person.Gender = command.Gender; changed |= true; }
            if ( ((person.FacultyRank == null) && (command.FacultyRank != null)) ||
                 ((person.FacultyRank != null) && (person.FacultyRank.EmployeeFacultyRankId != command.FacultyRank.EmployeeFacultyRankId)) )
            {
                person.FacultyRank =
                  _entities.Query<EmployeeFacultyRank>()
                            .SingleOrDefault(x => x.EmployeeFacultyRankId == command.FacultyRank.EmployeeFacultyRankId);
                changed |= true;
            }
            else
            {
                person.FacultyRank = null;
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
                { person.AdministrativeAppointments = command.AdministrativeAppointments; changed |= true; }

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
