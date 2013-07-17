//using System;
//using System.IO;
//using FluentValidation;

//namespace UCosmic.Domain.Files
//{
//    public class CreateLoadableActivityFile
//    {
//        //public Stream SourceStream { get; set; }
//        public byte[] Content { get; set; }
//        public string FileName { get; set; }
//        //public string Extension { get; set; }
//        public string MimeType { get; set; }
//        public string Title { get; set; }

//        public LoadableFile CreatedLoadableFile { get; set; }
//    }

//    public class HandleCreateLoadableActivityFileCommand : IHandleCommands<CreateLoadableActivityFile>
//    {
//        private readonly ICommandEntities _entities;
//        private readonly IUnitOfWork _unitOfWork;

//        public HandleCreateLoadableActivityFileCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
//        {
//            _entities = entities;
//            _unitOfWork = unitOfWork;
//        }

//        public class ValidateCreateLoadableActivityFileCommand : AbstractValidator<CreateLoadableActivityFile>
//        {
//            public ValidateCreateLoadableActivityFileCommand()
//            {
//                CascadeMode = CascadeMode.StopOnFirstFailure;

//                RuleFor(x => x.FileName)
//                    .MustHaveFileExtension("jpg", "png", "tif", "bmp", "gif", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods")
//                        .WithMessage(MustHaveFileExtension.FailMessageFormat, x => Path.GetExtension(x.FileName))
//                ;
//            }
//        }

//        public void Handle(CreateLoadableActivityFile command)
//        {
//            if (command == null) throw new ArgumentNullException("command");

//            string title = command.Title;
//            //BinaryReader reader = null;
//            //long length;
//            //byte[] contents;
//            if (String.IsNullOrEmpty(command.Title))
//            {
//                title = Path.GetFileNameWithoutExtension(command.FileName);
//            }

//            //try
//            //{

//                //length = command.SourceStream.Length;
//                //if (length > Int32.MaxValue)
//                //{
//                //    throw new Exception(string.Format("{0} is too large.", command.FileName));
//                //}
//                //reader = new BinaryReader(command.SourceStream);
//                //contents = reader.ReadBytes((int)length);
//            //}
//            //catch (Exception ex)
//            //{
//            //    throw new Exception("Error occurred seeding file.", ex);
//            //}
//            //finally
//            //{
//            //    if ( reader != null )  { reader.Close(); }
//            //}

//            var loadableFile = new LoadableFile
//            {
//                Length = command.Content.Length,
//                MimeType = command.MimeType,
//                Title = title,
//                Name = Path.GetFileNameWithoutExtension(command.FileName),
//                Extension = Path.GetExtension(command.FileName).Substring(1),
//                FileName = command.FileName,
//            };

//            loadableFile.Binary = new LoadableFileBinary
//            {
//                Owner = loadableFile,
//                Content = command.Content,
//            };

//            _entities.Create(loadableFile);
//            _unitOfWork.SaveChanges();

//            command.CreatedLoadableFile = loadableFile;
//        }
//    }
//}
