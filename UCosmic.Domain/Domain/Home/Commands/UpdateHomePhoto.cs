using System;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.Home
{
    public class UpdateHomePhoto
    {
        public UpdateHomePhoto(Int32 homeSectionId)
        {
            //if (homeSectionId == null) throw new ArgumentNullException("homeSectionId");
            HomeSectionId = homeSectionId;
        }
        public Int32 HomeSectionId { get; private set; }
        public byte[] Content { get; set; }
        public string Name { get; set; }
        public string MimeType { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateUpdateHomePhotoCommand : AbstractValidator<UpdateHomePhoto>
    {
        public ValidateUpdateHomePhotoCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            //RuleFor(x => x.Principal)
            //    .NotNull()
            //        .WithMessage(MustNotHaveNullPrincipal.FailMessage)
            //    .MustNotHaveEmptyIdentityName()
            //        .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
            //    .MustFindUserByPrincipal(entities)
            //;

            RuleFor(x => x.Content)
                .NotNull().WithMessage(MustHaveFileContent.FailMessage)
                .Must(x => x.Length > 0).WithMessage(MustHaveFileContent.FailMessage)
                .MustNotExceedFileSize(1, FileSizeUnitName.Megabyte, x => x.Name)
            ;

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(MustHaveFileName.FailMessage)
                .MustHaveAllowedFileExtension(HomeSectionConstraints.AllowedPhotoFileExtensions)
            ;

            RuleFor(x => x.MimeType)
                .NotEmpty().WithMessage(MustHaveFileMimeType.FailMessage)
            ;
        }
    }

    public class HandleUpdateHomePhotoCommand : IHandleCommands<UpdateHomePhoto>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<DeleteHomePhoto> _photoDeleteHandler;
        private readonly IStoreBinaryData _binaryData;
        private readonly IUnitOfWork _unitOfWork;

        public HandleUpdateHomePhotoCommand(ICommandEntities entities
            , IHandleCommands<DeleteHomePhoto> photoDeleteHandler
            , IStoreBinaryData binaryData
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _photoDeleteHandler = photoDeleteHandler;
            _binaryData = binaryData;
            _unitOfWork = unitOfWork;
        }

        public void Handle(UpdateHomePhoto command)
        {
            if (command == null) { throw new ArgumentNullException("command"); }

            var homeSection = _entities.Get<HomeSection>()
                .EagerLoad(_entities, new Expression<Func<HomeSection, object>>[]
                {
                    x => x.Photo,
                })
                .ById(command.HomeSectionId);
            //.Where(x => x.Id == command.HomeSectionId);
            if (homeSection == null)
            {
                throw new Exception("HomeSection is null, cannot add photo.");
                return;
            }

            // delete previous file
            _photoDeleteHandler.Handle(new DeleteHomePhoto(command.HomeSectionId)
            {
                NoCommit = true,
            });

            // create new file
            var path = string.Format(HomeSection.PhotoPathFormat, homeSection.Id, Guid.NewGuid());
            var externalFile = new ExternalFile
            {
                Name = command.Name,
                Path = path,
                Length = command.Content.Length,
                MimeType = command.MimeType,
            };
            homeSection.Photo = externalFile;
            _binaryData.Put(path, command.Content);

            // log audit
            //var audit = new CommandEvent
            //{
            //    RaisedBy = command.Principal.Identity.Name,
            //    Name = command.GetType().FullName,
            //    Value = JsonConvert.SerializeObject(new
            //    {
            //        User = command.Principal.Identity.Name,
            //        command.Content,
            //        command.Name,
            //        command.MimeType,
            //    }),
            //    NewState = externalFile.ToJsonAudit(),
            //};

            // push to database
            _entities.Create(externalFile);
            _entities.Update(homeSection);
            //_entities.Create(audit);
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
 