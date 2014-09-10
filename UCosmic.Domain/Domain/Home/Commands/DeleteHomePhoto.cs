using System;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Principal;
using FluentValidation;
using Newtonsoft.Json;
using UCosmic.Domain.Audit;
using UCosmic.Domain.Files;
using UCosmic.Domain.Identity;
using System.Data;

namespace UCosmic.Domain.Home
{
    public class DeleteHomePhoto
    {
        public DeleteHomePhoto(Int32 homeSectionId)
        {
            //if (homeSectionId == null) throw new ArgumentNullException("homeSectionId");
            HomeSectionId = homeSectionId;
        }
        public Int32 HomeSectionId { get; private set; }
        //public IPrincipal Principal { get; private set; }
        public string[] FileNames { get; set; }

        internal bool NoCommit { get; set; }
    }

    public class ValidateDeleteHomePhotoCommand : AbstractValidator<DeleteHomePhoto>
    {
        public ValidateDeleteHomePhotoCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            //RuleFor(x => x.Principal)
            //    .NotNull()
            //        .WithMessage(MustNotHaveNullPrincipal.FailMessage)
            //    .MustNotHaveEmptyIdentityName()
            //        .WithMessage(MustNotHaveEmptyIdentityName.FailMessage)
            //    .MustFindUserByPrincipal(entities)
            //;
        }
    }

    public class HandleDeleteHomePhotoCommand : IHandleCommands<DeleteHomePhoto>
    {
        private readonly ICommandEntities _entities;
        private readonly IStoreBinaryData _binaryData;
        private readonly IUnitOfWork _unitOfWork;

        public HandleDeleteHomePhotoCommand(ICommandEntities entities
            , IStoreBinaryData binaryData
            , IUnitOfWork unitOfWork
        )
        {
            _entities = entities;
            _binaryData = binaryData;
            _unitOfWork = unitOfWork;
        }

        public void Handle(DeleteHomePhoto command)
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
                throw new Exception("HomeSection is null, cannot delete photo.");
                return;
            }
            // if command has filenames, only delete photo if it matches one of them
            if (command.FileNames != null && !command.FileNames.Contains(homeSection.Photo.Name))
                return;

            // only delete if there is a photo present
            var photo = homeSection.Photo;
            if (photo == null) return;

            // unlink the photo before deleting
            homeSection.Photo = null;

            // delete the photo from binary storage (if it exists there)
            if (!string.IsNullOrWhiteSpace(photo.Path))
            {
                _binaryData.Delete(photo.Path);
            }

            // log audit
            //var audit = new CommandEvent
            //{
            //    RaisedBy = command.Principal.Identity.Name,
            //    Name = command.GetType().FullName,
            //    Value = JsonConvert.SerializeObject(new
            //    {
            //        command.FileNames,
            //        User = command.Principal.Identity.Name,
            //    }),
            //    PreviousState = photo.ToJsonAudit(),
            //};

            // push to database
            _entities.Update(homeSection);
            _entities.Purge(photo);
            //_entities.Create(audit);
            if (!command.NoCommit)
            {
                _unitOfWork.SaveChanges();
            }
        }
    }
}
 