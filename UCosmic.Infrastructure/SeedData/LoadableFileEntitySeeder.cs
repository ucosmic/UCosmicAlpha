using System;
using System.IO;
using System.Linq;
using UCosmic.Domain.Files;

namespace UCosmic.SeedData
{
    public class LoadableFileEntitySeeder : BaseLoadableFileEntitySeeder
    {
        private readonly ICommandEntities _entities;

        public LoadableFileEntitySeeder(IHandleCommands<CreateLoadableFile> createLoadableFile
                                , ICommandEntities entities
                                , IUnitOfWork unitOfWork
            ) : base(createLoadableFile, unitOfWork)
        {
            _entities = entities;
        }

        public override void Seed()
        {
            string basePath = AppDomain.CurrentDomain.BaseDirectory +
                              @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\";

            string filename = "1322FF22-E863-435E-929E-765EB95FB460.ppt";
            string name = Path.GetFileNameWithoutExtension(filename);
            string extension = Path.GetExtension(filename);
            extension = extension != null ? extension.Substring(1) : null;
            if (_entities.Get<LoadableFile>().Count(x => x.Name == name) == 0)
            {
                using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}",basePath,filename)))
                {
                    Seed(new CreateLoadableFile
                    {
                        SourceStream = fileStream,
                        Name = name,
                        Extension = extension,
                        MimeType = "application/vnd.ms-powerpoint",
                        Title = "Comtean BVSR Presentation"
                    });
                }
            }

            filename = "02E6D488-B3FA-4D79-848F-303779A53ABE.docx";
            name = Path.GetFileNameWithoutExtension(filename);
            extension = Path.GetExtension(filename);
            extension = extension != null ? extension.Substring(1) : null;
            if (_entities.Get<LoadableFile>().Count(x => x.Name == name) == 0)
            {
                using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}", basePath, filename)))
                {
                    Seed(new CreateLoadableFile
                    {
                        SourceStream = fileStream,
                        Name = name,
                        Extension = extension,
                        MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        Title = "Data Feed DOCX"
                    });
                }
            }

            filename = "817DB81E-53FC-47E1-A1DE-B8C108C7ACD6.pdf";
            name = Path.GetFileNameWithoutExtension(filename);
            extension = Path.GetExtension(filename);
            extension = extension != null ? extension.Substring(1) : null;
            if (_entities.Get<LoadableFile>().Count(x => x.Name == name) == 0)
            {
                using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}", basePath, filename)))
                {
                    Seed(new CreateLoadableFile
                    {
                        SourceStream = fileStream,
                        Name = name,
                        Extension = extension,
                        MimeType = "application/pdf",
                        Title = "GIT Pro User PDF"
                    });
                }
            }

            //filename = "3D3C0976-5117-4D5A-AF25-1B53166C550C.wmv";
            //name = Path.GetFileNameWithoutExtension(filename);
            //extension = Path.GetExtension(filename).Substring(1);
            //if (_entities.Get<LoadableFile>().Count(x => x.Name == name) == 0)
            //{
            //    using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}",basePath,filename)))
            //    {
            //        Seed(new CreateLoadableFile
            //        {
            //            SourceStream = fileStream,
            //            Name = name,
            //            Extension = extension,
            //            MimeType = "video/x-ms-wmv",
            //            Title = "Main WMV"
            //        });
            //    }
            //}

            //filename = "14E5C461-2E5E-4E63-9701-DC3F009AB98E.mov";
            //name = Path.GetFileNameWithoutExtension(filename);
            //extension = Path.GetExtension(filename).Substring(1);
            //if (_entities.Get<LoadableFile>().Count(x => x.Name == name) == 0)
            //{
            //    using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}",basePath,filename)))
            //    {
            //        Seed(new CreateLoadableFile
            //        {
            //            SourceStream = fileStream,
            //            Name = name,
            //            Extension = extension,
            //            MimeType = "video/quicktime",
            //            Title = "How I used QuickTime"
            //        });
            //    }
            //}

            //filename = "5FE682FD-F161-4669-A2C4-974F5B0F8BB1.mp4";
            //name = Path.GetFileNameWithoutExtension(filename);
            //extension = Path.GetExtension(filename).Substring(1);
            //if (_entities.Get<LoadableFile>().Count(x => x.Name == name) == 0)
            //{
            //    using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}",basePath,filename)))
            //    {
            //        Seed(new CreateLoadableFile
            //        {
            //            SourceStream = fileStream,
            //            Name = name,
            //            Extension = extension,
            //            MimeType = "video/mp4",
            //            Title = "Overview MPEG4 of where we were"
            //        });
            //    }
            //}

            //filename = "322BF184-32C3-49CA-8C97-18ABE32CFD8A.mp3";
            //name = Path.GetFileNameWithoutExtension(filename);
            //extension = Path.GetExtension(filename).Substring(1);
            //if (_entities.Get<LoadableFile>().Count(x => x.Name == name) == 0)
            //{
            //    using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}",basePath,filename)))
            //    {
            //        Seed(new CreateLoadableFile
            //        {
            //            SourceStream = fileStream,
            //            Name = name,
            //            Extension = extension,
            //            MimeType = "audio/mpeg",
            //            Title = "First audio MP3 of this group"
            //        });
            //    }
            //}

            filename = "10EC87BD-3A95-439D-807A-0F57C3F89C8A.xls";
            name = Path.GetFileNameWithoutExtension(filename);
            extension = Path.GetExtension(filename);
            extension = extension != null ? extension.Substring(1) : null;
            if (_entities.Get<LoadableFile>().Count(x => x.Name == name) == 0)
            {
                using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}", basePath, filename)))
                {
                    Seed(new CreateLoadableFile
                    {
                        SourceStream = fileStream,
                        Name = name,
                        Extension = extension,
                        MimeType = "application/vnd.ms-excel",
                        Title = "Research Spreadsheet"
                    });
                }
            }

            filename = "mkusenba-photo.jpg";
            name = Path.GetFileNameWithoutExtension(filename);
            extension = Path.GetExtension(filename);
            extension = extension != null ? extension.Substring(1) : null;
            if (_entities.Get<LoadableFile>().Count(x => x.Name == filename) == 0)
            {
                using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}", basePath, filename)))
                {
                    Seed(new CreateLoadableFile
                    {
                        SourceStream = fileStream,
                        Name = name,
                        Extension = extension,
                        MimeType = "image/jpg",
                    });
                }
            }

            filename = "billhogarth-photo.jpg";
            name = Path.GetFileNameWithoutExtension(filename);
            extension = Path.GetExtension(filename);
            extension = extension != null ? extension.Substring(1) : null;
            if (_entities.Get<LoadableFile>().Count(x => x.Name == filename) == 0)
            {
                using (FileStream fileStream = File.OpenRead(string.Format("{0}{1}", basePath, filename)))
                {
                    Seed(new CreateLoadableFile
                    {
                        SourceStream = fileStream,
                        Name = name,
                        Extension = extension,
                        MimeType = "image/jpg",
                    });
                }
            }
        }
    }

    public abstract class BaseLoadableFileEntitySeeder : ISeedData
    {
        private readonly IHandleCommands<CreateLoadableFile> _createLoadableFile;
        private readonly IUnitOfWork _unitOfWork;

        protected BaseLoadableFileEntitySeeder(IHandleCommands<CreateLoadableFile> createLoadableFile
            , IUnitOfWork unitOfWork
        )
        {
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
