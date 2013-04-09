using System;
using System.IO;
using FluentValidation;

namespace UCosmic.Domain.Files
{
    public class CreateLoadableFile
    {
        public Stream SourceStream { get; set; }
        public string Name { get; set; }
        public string Extension { get; set; }
        public string MimeType { get; set; }
        public string Title { get; set; }

        public LoadableFile CreatedLoadableFile { get; set; }
    }

    public class HandleCreateLoadableFileCommand : IHandleCommands<CreateLoadableFile>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateLoadableFileCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public class ValidateCreateLoadableFileCommand : AbstractValidator<CreateLoadableFile>
        {
            public ValidateCreateLoadableFileCommand()
            {
                CascadeMode = CascadeMode.StopOnFirstFailure;

                RuleFor(x => x.Extension)
                    .MustBeOfFileType()
                        .WithMessage(MustBeOfFileType.FailMessageFormat, x => x.Extension)
                ;
            }
        }

        public void Handle(CreateLoadableFile command)
        {
            if (command == null) throw new ArgumentNullException("command");

            string title = command.Title;
            BinaryReader reader = null;
            long length;
            byte[] contents;

            try
            {
                if (String.IsNullOrEmpty(command.Title))
                {
                    title = command.Name;
                }

                length = command.SourceStream.Length;
                if (length > Int32.MaxValue)
                {
                    throw new Exception(string.Format("{0}.{1} is too large.", command.Name, command.Extension));
                }
                reader = new BinaryReader(command.SourceStream);
                contents = reader.ReadBytes((int)length);
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred seeding file.", ex);
            }
            finally
            {
                if ( reader != null )  { reader.Close(); }
            }      

            var loadableFile = new LoadableFile
            {
                Length = length,
                MimeType = command.MimeType,
                Title = title,
                Name = command.Name,
                Extension = command.Extension
            };

            loadableFile.Binary = new LoadableFileBinary
            {
                Owner = loadableFile,
                Content = contents
            };

            _entities.Create(loadableFile);
            _unitOfWork.SaveChanges();

            command.CreatedLoadableFile = loadableFile;
        }
    }
}
