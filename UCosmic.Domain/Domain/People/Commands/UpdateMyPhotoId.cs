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
    // use this command only when seeding data
    public class UpdateMyPhotoId
    {
        public UpdateMyPhotoId(IPrincipal principal, int photoId)
        {
            if (principal == null) throw new ArgumentNullException("principal");
            Principal = principal;
            PhotoId = photoId;
        }

        public IPrincipal Principal { get; private set; }
        public int PhotoId { get; private set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateMyPhotoIdCommand : AbstractValidator<UpdateMyPhotoId>
    {
        public ValidateUpdateMyPhotoIdCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Principal.Identity.Name)
                .NotEmpty()
                    .WithMessage(MustNotHaveEmptyPrincipalIdentityName.FailMessage)
                .MustFindUserByName(entities)
                    .WithMessage(MustFindUserByName.FailMessageFormat, x => x.Principal.Identity.Name)
            ;
        }
    }

    public class HandleUpdateMyPhotoIdCommand : IHandleCommands<UpdateMyPhotoId>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<DeleteMyPhoto> _photoDeleteHandler;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateMyPhotoIdCommand(ICommandEntities entities
            , IHandleCommands<DeleteMyPhoto> photoDeleteHandler
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _photoDeleteHandler = photoDeleteHandler;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateMyPhotoId command)
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
            var loadableFile = _entities.Get<LoadableFile>().Single(x => x.Id == command.PhotoId);
            person.Photo = loadableFile;

            // log audit
            var audit = new CommandEvent
            {
                RaisedBy = command.Principal.Identity.Name,
                Name = command.GetType().FullName,
                Value = JsonConvert.SerializeObject(new
                {
                    User = command.Principal.Identity.Name,
                    command.PhotoId,
                }),
                NewState = loadableFile.ToJsonAudit(),
            };

            // push to database
            _entities.Create(loadableFile);
            _entities.Update(person);
            _entities.Create(audit);
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
