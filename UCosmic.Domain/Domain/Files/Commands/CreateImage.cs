//using System;
//using System.IO;
//using FluentValidation;

//namespace UCosmic.Domain.Files
//{
//    public class CreateImage
//    {
//        public byte[] Content { get; set; }
//        public string Title { get; set; }
//        public string MimeType { get; set; }
//        public string FileName { get; set; }

//        public Image CreatedImage { get; internal set; }
//    }

//    public class ValidateCreateImageCommand : AbstractValidator<CreateImage>
//    {
//        public ValidateCreateImageCommand()
//        {
//            CascadeMode = CascadeMode.StopOnFirstFailure;

//            RuleFor(x => x.FileName)
//                .MustHaveFileExtension("jpg", "png", "tif", "bmp", "gif")
//                    .WithMessage(MustHaveFileExtension.FailMessageFormat, x => Path.GetExtension(x.FileName))
//            ;
//        }
//    }

//    public class HandleCreateImageCommand : IHandleCommands<CreateImage>
//    {
//        private readonly ICommandEntities _entities;
//        private readonly IUnitOfWork _unitOfWork;

//        public HandleCreateImageCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
//        {
//            _entities = entities;
//            _unitOfWork = unitOfWork;
//        }

//        public void Handle(CreateImage command)
//        {
//            if (command == null) throw new ArgumentNullException("command");

//            var image = new Image
//            {
//                Content = command.Content,
//                Title = command.Title,
//                MimeType = command.MimeType,
//                Name = Path.GetFileNameWithoutExtension(command.FileName),
//                Extension = Path.GetExtension(command.FileName).Substring(1),
//                FileName = command.FileName,
//                Length = command.Content.Length,
//            };

//            _entities.Create(image);
//            _unitOfWork.SaveChanges();

//            command.CreatedImage = image;
//        }
//    }
//}
