using System;
using System.Configuration;
using System.IO;
using System.Linq;
using UCosmic.Domain.Files;

namespace UCosmic.SeedData
{
    public class ImageEntitySeeder : BaseImageEntitySeeder
    {
        struct FileMimeMapping
        {
            public string fileName;
            public string mimeType;
        };

        private ICommandEntities _entities;

        public ImageEntitySeeder(IProcessQueries queryProcessor
                                , IHandleCommands<CreateImage> createImage
                                , IHandleCommands<CreateProxyImageMimeTypeXRef> createProxyImageMimeTypeXRef
                                , ICommandEntities entities
                                , IUnitOfWork unitOfWork
            )
            : base(queryProcessor, createImage, createProxyImageMimeTypeXRef, unitOfWork)
        {
            _entities = entities;
        }

        public override void Seed()
        {
            string basePath = AppDomain.CurrentDomain.BaseDirectory + @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\";

            FileMimeMapping[] fileMimeMappings =
            {
                /* NOTE: 'GenericDocument' name is used in controllers, if you change here, do a search. */
                new FileMimeMapping { fileName = "GenericDocument.png",     mimeType = "text/plain" },
                new FileMimeMapping { fileName = "PDFDocument.png",         mimeType = "application/pdf" },
                new FileMimeMapping { fileName = "Word-2013.png",           mimeType = "application/msword" },
                new FileMimeMapping { fileName = "Word-2013.png",           mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
                new FileMimeMapping { fileName = "Powerpoint-2013.png",     mimeType = "application/vnd.ms-powerpoint" },
                new FileMimeMapping { fileName = "Powerpoint-2013.png",     mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
            };

            foreach (FileMimeMapping mapping in fileMimeMappings)
            {
                string filePath = basePath + mapping.fileName;
                FileInfo info = new FileInfo(filePath);
                string name = info.Name.Substring(0, info.Name.IndexOf('.'));
                if (_entities.Get<Image>().Count(x => x.Name == name) == 0)
                {
                    using (Stream fileStream = File.OpenRead(basePath + mapping.fileName))
                    {
                        Image proxy = Seed(new CreateImage
                        {
                            SourceStream = fileStream,
                            Width = Int32.Parse(ConfigurationManager.AppSettings["ProxyImageWidth"]),
                            Height = Int32.Parse(ConfigurationManager.AppSettings["ProxyImageWidth"]),
                            Title = "Proxy", // arbitrary
                            MimeType = "image/png",
                            Name = name,
                            Extension = info.Extension.Substring(1),
                            Size = info.Length,
                            Constrained = true
                        });

                        Seed(new CreateProxyImageMimeTypeXRef
                        {
                            MimeType = mapping.mimeType,
                            ImageId = proxy.Id
                        });
                    }
                }
            }

            string[] fileNames =
            {
                "EE23D741-C50D-40D5-8214-C18DF68CC6D3.jpg",
                "5C62D74E-E8EE-4B9A-95F3-B2ABB1F6F912.gif",
                "A44FAB3B-DEBA-4F14-8965-E379569066A9.png",
                "C0DA4900-762B-4B26-AE03-843CBB7C0E7B.bmp",
                "E4E53300-08D3-47C0-954C-BF15EF54F0A3.tif",
            };

            foreach (string fileName in fileNames)
            {
                string filePath = basePath + fileName;
                FileInfo info = new FileInfo(filePath);
                string name = info.Name.Substring(0, info.Name.IndexOf('.'));
                if (_entities.Get<Image>().Count(x => x.Name == name) == 0)
                {
                    using (Stream fileStream = File.OpenRead(basePath + fileName))
                    {
                        Seed(new CreateImage
                        {
                            SourceStream = fileStream,
                            Width = Int32.Parse(ConfigurationManager.AppSettings["ImageWidth"]),
                            Height = Int32.Parse(ConfigurationManager.AppSettings["ImageHeight"]),
                            Title = "Image", // arbitrary
                            MimeType = "image/jpeg",
                            Name = name,
                            Extension = info.Extension.Substring(1),
                            Size = info.Length,
                            Constrained = false
                        });
                    }
                }
            }
        }
    }

    public abstract class BaseImageEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateImage> _createImage;
        private readonly IHandleCommands<CreateProxyImageMimeTypeXRef> _createProxyImageMimeTypeXRef;
        private readonly IUnitOfWork _unitOfWork;

        protected BaseImageEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateImage> createImage
            , IHandleCommands<CreateProxyImageMimeTypeXRef> createProxyImageMimeTypeXRef
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _createImage = createImage;
            _createProxyImageMimeTypeXRef = createProxyImageMimeTypeXRef;
            _unitOfWork = unitOfWork;
        }

        public abstract void Seed();

        protected Image Seed(CreateImage command)
        {
            _createImage.Handle(command);
            _unitOfWork.SaveChanges();

            return command.CreatedImage;
        }

        protected ProxyImageMimeTypeXRef Seed(CreateProxyImageMimeTypeXRef command)
        {
            _createProxyImageMimeTypeXRef.Handle(command);
            _unitOfWork.SaveChanges();

            return command.CreatedProxyImageMimeTypeXRef;
        }
    }
}
