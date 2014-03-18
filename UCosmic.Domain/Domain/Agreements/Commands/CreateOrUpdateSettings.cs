using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using UCosmic.Domain.People;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Agreements
{
    public class CreateOrUpdateSettings
    {
        public CreateOrUpdateSettings(IPrincipal principal, int id = 0)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            Id = id;
        }

        public IPrincipal Principal { get; private set; }
        public int Id { get; private set; }
        public bool IsCustomTypeAllowed { get; set; }
        public bool IsCustomStatusAllowed { get; set; }
        public bool IsCustomContactTypeAllowed { get; set; }
        public IEnumerable<string> AllowedTypeValues { get; set; }
        public IEnumerable<string> AllowedStatusValues { get; set; }
        public IEnumerable<string> AllowedContactTypeValues { get; set; }
    }


    //public class ValidateCreateOrUpdateSettingsCommand : AbstractValidator<CreateOrUpdateSettings>
    //{
    //    public ValidateCreateOrUpdateSettingsCommand(IProcessQueries queryProcessor)
    //    {
    //        CascadeMode = CascadeMode.StopOnFirstFailure;

    //        RuleFor(x => x.Principal)
    //            .MustFindUserByPrincipal(queryProcessor);
    //    }
    //}


    public class HandleCreateOrUpdateSettingsCommand : IHandleCommands<CreateOrUpdateSettings>
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateOrUpdateSettingsCommand(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateOrUpdateSettings command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // make sure user is authorized to update settings
            if (!command.Principal.IsInRole(RoleName.AgreementSupervisor))
                throw new InvalidOperationException(string.Format(
                    "User '{0}' does not have privileges to invoke this function.",
                        command.Principal.Identity.Name));

            var configuration = command.Id != 0
                ? _queryProcessor.Execute(
                    new MyAgreementSettings(command.Principal)
                    {
                        IsWritable = true,
                        EagerLoad = new Expression<Func<AgreementSettings, object>>[]
                        {
                            c => c.AllowedTypeValues,
                            c => c.AllowedStatusValues,
                            c => c.AllowedContactTypeValues,
                        }
                    })
                : new AgreementSettings
                    {
                        ForEstablishment = _entities.Get<Person>()
                            .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                            {
                                x => x.Affiliations.Select(y => y.Establishment)
                            })
                            .ByUserName(command.Principal.Identity.Name)
                            .DefaultAffiliation.Establishment,
                    };

            if (configuration.RevisionId != command.Id)
                throw new InvalidOperationException(string.Format(
                    "User '{0}' does not own '{1}' with id '{2}'.",
                        command.Principal.Identity.Name,
                        typeof(AgreementSettings).Name,
                        command.Id));

            configuration.IsCustomTypeAllowed = command.IsCustomTypeAllowed;
            configuration.IsCustomStatusAllowed = command.IsCustomStatusAllowed;
            configuration.IsCustomContactTypeAllowed = command.IsCustomContactTypeAllowed;

            if (command.AllowedTypeValues != null)
            {
                var commandItems = command.AllowedTypeValues.ToArray();
                var entityItems = configuration.AllowedTypeValues.ToList();
                foreach (var entityItem in entityItems)
                {
                    // remove when does not exist in command
                    var remove = commandItems.All(p => p != entityItem.Text);
                    if (remove) _entities.Purge(entityItem);
                }
                foreach (var commandItem in commandItems)
                {
                    // add when does not exist in entity
                    var add = entityItems.All(p => p.Text != commandItem);
                    if (add) _entities.Create(
                        new AgreementSettingsTypeValue
                        {
                            Settings = configuration,
                            Text = commandItem,
                        });
                }
            }

            if (command.AllowedStatusValues != null)
            {
                var commandItems = command.AllowedStatusValues.ToArray();
                var entityItems = configuration.AllowedStatusValues.ToList();
                foreach (var entityItem in entityItems)
                {
                    // remove when does not exist in command
                    var remove = commandItems.All(p => p != entityItem.Text);
                    if (remove) _entities.Purge(entityItem);
                }
                foreach (var commandItem in commandItems)
                {
                    // add when does not exist in entity
                    var add = entityItems.All(p => p.Text != commandItem);
                    if (add) _entities.Create(
                        new AgreementSettingsStatusValue
                        {
                            Settings = configuration,
                            Text = commandItem,
                        });
                }
            }

            if (command.AllowedContactTypeValues != null)
            {
                var commandItems = command.AllowedContactTypeValues.ToArray();
                var entityItems = configuration.AllowedContactTypeValues.ToList();
                foreach (var entityItem in entityItems)
                {
                    // remove when does not exist in command
                    var remove = commandItems.All(p => p != entityItem.Text);
                    if (remove) _entities.Purge(entityItem);
                }
                foreach (var commandItem in commandItems)
                {
                    // add when does not exist in entity
                    var add = entityItems.All(p => p.Text != commandItem);
                    if (add) _entities.Create(
                        new AgreementSettingsContactTypeValue
                        {
                            Settings = configuration,
                            Text = commandItem,
                        });
                }

                if (command.Id != 0) _entities.Update(configuration);
                else _entities.Create(configuration);
                _unitOfWork.SaveChanges();
            }
        }
    }
}
