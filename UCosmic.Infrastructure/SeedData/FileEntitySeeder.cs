using System;
using System.Linq;
using UCosmic.Domain.Files;

namespace UCosmic.SeedData
{
    public class FileEntitySeeder : BaseFileEntitySeeder
    {
        private ICommandEntities _entities;

        public FileEntitySeeder(IProcessQueries queryProcessor
                                , IHandleCommands<CreateLoadableFile> createLoadableFile
                                , ICommandEntities entities
                                , IUnitOfWork unitOfWork
            ) : base(queryProcessor, createLoadableFile, unitOfWork)
        {
            _entities = entities;
        }

        public override void Seed()
        {
            string basePath = AppDomain.CurrentDomain.BaseDirectory +
                              @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\";

            string fileName = "1322FF22-E863-435E-929E-765EB95FB460.ppt";
            if (_entities.Get<LoadableFile>().Count(x => x.Filename == fileName) == 0)
            {
                Seed(new CreateLoadableFile
                {
                    Path = basePath + fileName,
                    MimeType = "application/vnd.ms-powerpoint",
                    Name = "Comtean BVSR Presentation"
                });
            }

            fileName = "02E6D488-B3FA-4D79-848F-303779A53ABE.docx";
            if (_entities.Get<LoadableFile>().Count(x => x.Filename == fileName) == 0)
            {
                Seed(new CreateLoadableFile
                {
                    Path = basePath + fileName,
                    MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    Name = "Data Feed DOCX"
                });
            }

            fileName = "817DB81E-53FC-47E1-A1DE-B8C108C7ACD6.pdf";
            if (_entities.Get<LoadableFile>().Count(x => x.Filename == fileName) == 0)
            {
                Seed(new CreateLoadableFile
                {
                    Path = basePath + fileName,
                    MimeType = "application/pdf",
                    Name = "GIT Pro User PDF"
                });
            }

            fileName = "3D3C0976-5117-4D5A-AF25-1B53166C550C.wmv";
            if (_entities.Get<LoadableFile>().Count(x => x.Filename == fileName) == 0)
            {
                Seed(new CreateLoadableFile
                {
                    Path = basePath + fileName,
                    MimeType = "video/x-ms-wmv",
                    Name = "Main WMV"
                });
            }

            fileName = "14E5C461-2E5E-4E63-9701-DC3F009AB98E.mov";
            if (_entities.Get<LoadableFile>().Count(x => x.Filename == fileName) == 0)
            {
                Seed(new CreateLoadableFile
                {
                    Path = basePath + fileName,
                    MimeType = "video/quicktime",
                    Name = "How I used QuickTime"
                });
            }

            fileName = "5FE682FD-F161-4669-A2C4-974F5B0F8BB1.mp4";
            if (_entities.Get<LoadableFile>().Count(x => x.Filename == fileName) == 0)
            {
                Seed(new CreateLoadableFile
                {
                    Path = basePath + fileName,
                    MimeType = "video/mp4",
                    Name = "Overview MPEG4 of where we were"
                });
            }

            fileName = "322BF184-32C3-49CA-8C97-18ABE32CFD8A.mp3";
            if (_entities.Get<LoadableFile>().Count(x => x.Filename == fileName) == 0)
            {
                Seed(new CreateLoadableFile
                {
                    Path = basePath + fileName,
                    MimeType = "audio/mpeg",
                    Name = "First audio MP3 of this group"
                });
            }

            fileName = "10EC87BD-3A95-439D-807A-0F57C3F89C8A.xls";
            if (_entities.Get<LoadableFile>().Count(x => x.Filename == fileName) == 0)
            {
                Seed(new CreateLoadableFile
                {
                    Path = basePath + fileName,
                    MimeType = "application/vnd.ms-excel",
                    Name = "Research Spreadsheet"
                });
            }
        }
    }

    public abstract class BaseFileEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateLoadableFile> _createLoadableFile;
        private readonly IUnitOfWork _unitOfWork;

        protected BaseFileEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateLoadableFile> createLoadableFile
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _createLoadableFile = createLoadableFile;
            _unitOfWork = unitOfWork;
        }

        public abstract void Seed();

        protected LoadableFile Seed(CreateLoadableFile command)
        {
            _createLoadableFile.Handle(command);
            _unitOfWork.SaveChanges();

            return command.CreatedLoadableFile;
        }
    }
}
