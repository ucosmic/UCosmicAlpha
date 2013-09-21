using System;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.People
{
    public class UpdateMyPhoto
    {
        public UpdateMyPhoto(IPrincipal principal)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
        }

        public IPrincipal Principal { get; private set; }
        public byte[] Content { get; set; }
        public string Name { get; set; }
        public string MimeType { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateMyPhotoCommand : AbstractValidator<UpdateMyPhoto>
    {
        public ValidateUpdateMyPhotoCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal)
                .NotNull()
                    .WithMessage(MustNotHaveNullPrincipal.FailMessage)
                .MustNotHaveEmptyIdentityName()
                    .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
                .MustFindUserByPrincipal(entities)
            ;

            RuleFor(x => x.Content)
                .NotNull().WithMessage(MustHaveFileContent.FailMessage)
                .Must(x => x.Length > 0).WithMessage(MustHaveFileContent.FailMessage)
                .MustNotExceedFileSize(1, FileSizeUnitName.Megabyte, x => x.Name)
            ;

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(MustHaveFileName.FailMessage)
                .MustHaveAllowedFileExtension(PersonConstraints.AllowedPhotoFileExtensions)
            ;

            RuleFor(x => x.MimeType)
                .NotEmpty().WithMessage(MustHaveFileMimeType.FailMessage)
            ;
        }
    }

    public class HandleUpdateMyPhotoCommand : IHandleCommands<UpdateMyPhoto>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<DeleteMyPhoto> _photoDeleteHandler;
        private readonly IStoreBinaryData _binaryData;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateMyPhotoCommand(ICommandEntities entities
            , IHandleCommands<DeleteMyPhoto> photoDeleteHandler
            , IStoreBinaryData binaryData
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _photoDeleteHandler = photoDeleteHandler;
            _binaryData = binaryData;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateMyPhoto command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var person = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.Photo,
                })
                .ByUserName(command.Principal.Identity.Name);

            // delete previous file
            _photoDeleteHandler.Handle(new DeleteMyPhoto(command.Principal)
            {
                NoCommit = true,
            });

            // create new file
            var path = string.Format(Person.PhotoPathFormat, person.RevisionId, Guid.NewGuid());
            var externalFile = new ExternalFile
            {
                Name = command.Name,
                Path = path,
                Length = command.Content.Length,
                MimeType = command.MimeType,
            };
            person.Photo = externalFile;
            _binaryData.Put(path, command.Content);

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    User = command.Principal.Identity.Name,
                    command.Content,
                    command.Name,
                    command.MimeType,
                }),
                NewState = externalFile.ToJsonAudit(),
            };

            // push to database
            _entities.Create(externalFile);
            _entities.Update(person);
            _entities.Create(audit);
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
 