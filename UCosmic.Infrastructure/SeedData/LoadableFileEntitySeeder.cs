using System;
using System.IO;
using System.Linq;
using UCosmic.Domain.Files;

namespace UCosmic.SeedData
{
    public class LoadableFileEntitySeeder : BaseLoadableFileEntitySeeder
    {
        public LoadableFileEntitySeeder(IHandleCommands<CreateLoadableActivityFile> createLoadableFile
            , ICommandEntities entities
        )
            : base(createLoadableFile, entities)
        {
        }

        public override void Seed()
        {
            Seed(new CreateLoadableActivityFile
            {
                FileName = "1322FF22-E863-435E-929E-765EB95FB460.ppt",
                MimeType = "application/vnd.ms-powerpoint",
                Title = "Comtean BVSR Presentation"
            });

            Seed(new CreateLoadableActivityFile
            {
                FileName = "02E6D488-B3FA-4D79-848F-303779A53ABE.docx",
                MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                Title = "Data Feed DOCX"
            });

            Seed(new CreateLoadableActivityFile
            {
                FileName = "817DB81E-53FC-47E1-A1DE-B8C108C7ACD6.pdf",
                MimeType = "application/pdf",
                Title = "GIT Pro User PDF"
            });

            Seed(new CreateLoadableActivityFile
            {
                FileName = "10EC87BD-3A95-439D-807A-0F57C3F89C8A.xls",
                MimeType = "application/vnd.ms-excel",
                Title = "Research Spreadsheet"
            });

            Seed(new CreateLoadableActivityFile
            {
                FileName = "mkusenba-photo.jpg",
                MimeType = "image/jpg",
            });

            Seed(new CreateLoadableActivityFile
            {
                FileName = "billhogarth-photo.jpg",
                MimeType = "image/jpg",
            });
        }
    }

    public abstract class BaseLoadableFileEntitySeeder : ISeedData
    {
        private readonly IHandleCommands<CreateLoadableActivityFile> _createLoadableFile;
        private readonly ICommandEntities _entities;
        private static readonly string BasePath = AppDomain.CurrentDomain.BaseDirectory +
                          @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\";


        protected BaseLoadableFileEntitySeeder(IHandleCommands<CreateLoadableActivityFile> createLoadableFile
            , ICommandEntities entities
        )
        {
            _createLoadableFile = createLoadableFile;
            _entities = entities;
        }

        public abstract void Seed();

        protected LoadableFile Seed(CreateLoadableActivityFile command)
        {
            var existingEntity = _entities.Get<LoadableFile>().FirstOrDefault(x => x.FileName == command.FileName);
            if (existingEntity == null)
            {
                using (var fileStream = File.OpenRead(string.Format("{0}{1}", BasePath, command.FileName)))
                {
                    command.Content = fileStream.ReadFully();
                    _createLoadableFile.Handle(command);
                    return command.CreatedLoadableFile;
                }
            }
            return existingEntity;
        }
    }
}
