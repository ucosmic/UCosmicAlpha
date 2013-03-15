using System;
using System.IO;

namespace UCosmic.Domain.Files
{
    public class CreateLoadableFile
    {
        public string Path { get; set; }
        public string MimeType { get; set; }
        public string Name { get; set; }

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

        public void Handle(CreateLoadableFile command)
        {
            if (command == null) throw new ArgumentNullException("command");
            if (!File.Exists(command.Path)) { throw new Exception(command.Path + " not found."); }

            string name = command.Name;
            string filename = null;
            BinaryReader reader = null;
            int length = 0;
            byte[] contents = null;

            try
            {
                FileInfo finfo = new FileInfo(command.Path);
                filename = finfo.Name;

                if (String.IsNullOrEmpty(command.Name))
                {
                    name = filename;
                }

                FileStream stream = new FileStream(command.Path, FileMode.Open, FileAccess.Read);
                reader = new BinaryReader(stream);
                if (stream.Length > Int32.MaxValue) { throw new Exception(command.Path + " is too large."); }
                length = (int)stream.Length;
                contents = reader.ReadBytes(length);
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
                Name = name,
                Filename = filename
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
