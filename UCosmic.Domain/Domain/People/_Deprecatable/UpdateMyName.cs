//using System;
//using System.Linq.Expressions;
//using System.Security.Principal;
//using FluentValidation;
//using UCosmic.Domain.Identity;

//namespace UCosmic.Domain.People
//{
//    // deprecated. use UpdatePerson instead.
//    public class UpdateMyName
//    {
//        public IPrincipal Principal { get; set; }
//        public bool IsDisplayNameDerived { get; set; }
//        public string DisplayName { get; set; }
//        public string Salutation { get; set; }
//        public string FirstName { get; set; }
//        public string MiddleName { get; set; }
//        public string LastName { get; set; }
//        public string Suffix { get; set; }
//        public int ChangeCount { get; internal set; }
//        public bool ChangedState { get { return ChangeCount > 0; } }
//    }

//    public class ValidateUpdateMyNameCommand : AbstractValidator<UpdateMyName>
//    {
//        public ValidateUpdateMyNameCommand(IQueryEntities entities)
//        {
//            CascadeMode = CascadeMode.StopOnFirstFailure;

//            RuleFor(x => x.DisplayName)
//                // display name cannot be empty
//                .NotEmpty()
//                    .WithMessage(MustNotHaveEmptyDisplayName.FailMessage)
//            ;

//            RuleFor(x => x.Principal)
//                // principal cannot be null
//                .NotNull()
//                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)

//                // principal identity name cannot be null or whitespace
//                .MustNotHaveEmptyIdentityName()
//                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)

//                // principal identity name must match User.Name entity property
//                .MustFindUserByPrincipal(entities)
//            ;
//        }
//    }

//    public class HandleUpdateMyNameCommand : IHandleCommands<UpdateMyName>
//    {
//        private readonly ICommandEntities _entities;

//        public HandleUpdateMyNameCommand(ICommandEntities entities)
//        {
//            _entities = entities;
//        }

//        public void Handle(UpdateMyName command)
//        {
//            if (command == null) throw new ArgumentNullException("command");

//            // get the person for the principal
//            var user = _entities.Get<User>()
//                .EagerLoad(_entities, new Expression<Func<User, object>>[]
//                {
//                    u => u.Person,
//                })
//                .ByPrincipal(command.Principal);


//            // update fields
//            if (user.Person.IsDisplayNameDerived != command.IsDisplayNameDerived) command.ChangeCount++;
//            user.Person.IsDisplayNameDerived = command.IsDisplayNameDerived;

//            if (user.Person.DisplayName != command.DisplayName) command.ChangeCount++;
//            user.Person.DisplayName = command.IsDisplayNameDerived
//                ? new HandleGenerateDisplayNameQuery().Handle(
//                    new GenerateDisplayName
//                    {
//                        Salutation = command.Salutation,
//                        FirstName = command.FirstName,
//                        MiddleName = command.MiddleName,
//                        LastName = command.LastName,
//                        Suffix = command.Suffix,
//                    })
//                : command.DisplayName;

//            if (user.Person.Salutation != command.Salutation) command.ChangeCount++;
//            user.Person.Salutation = command.Salutation;

//            if (user.Person.FirstName != command.FirstName) command.ChangeCount++;
//            user.Person.FirstName = command.FirstName;

//            if (user.Person.MiddleName != command.MiddleName) command.ChangeCount++;
//            user.Person.MiddleName = command.MiddleName;

//            if (user.Person.LastName != command.LastName) command.ChangeCount++;
//            user.Person.LastName = command.LastName;

//            if (user.Person.Suffix != command.Suffix) command.ChangeCount++;
//            user.Person.Suffix = command.Suffix;

//            // store
//            if (command.ChangeCount > 0) _entities.Update(user.Person);
//        }
//    }
//}
