using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class DeleteMyPhoto
    {
        public DeleteMyPhoto(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public string[] FileNames { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateDeleteMyPhotoCommand : AbstractValidator<DeleteMyPhoto>
    {
        public ValidateDeleteMyPhotoCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustFindUserByPrincipal(entities)
            ;
        }
    }

    public class HandleDeleteMyPhotoCommand : IHandleCommands<DeleteMyPhoto>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;
        private readonly IUnitOfWork _unitOfWork;

        public HandleDeleteMyPhotoCommand(ICommandEntities entities
            , IStoreBinaryData binaryData
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _binaryData = binaryData;
            _unitOfWork = unitOfWork;
        }

        public void Handle(DeleteMyPhoto command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.Photo,
                })
                .ByUserName(command.Principal.Identity.Name);

            // if command has filenames, only delete photo if it matches one of them
            if (command.FileNames != null && !command.FileNames.Contains(person.Photo.Name))
                return;

            // only delete if there is a photo present
            var photo = person.Photo;
            if (photo == null) return;

            // unlink the photo before deleting
            person.Photo = null;

            // delete the photo from binary storage (if it exists there)
            if (!string.IsNullOrWhiteSpace(photo.Path))
            {
                _binaryData.Delete(photo.Path);
            }

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    command.FileNames,
                    User = command.Principal.Identity.Name,
                }),
                PreviousState = photo.ToJsonAudit(),
            };

            // push to database
            _entities.Update(person);
            _entities.Purge(photo);
            _entities.Create(audit);
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
 