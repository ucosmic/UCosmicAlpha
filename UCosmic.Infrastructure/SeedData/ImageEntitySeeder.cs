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
            public string FileName;
            public string MimeType;
        };

        public ImageEntitySeeder(IHandleCommands<CreateImage> createImage
                                , IHandleCommands<CreateProxyImageMimeTypeXRef> createProxyImageMimeTypeXRef
                                , ICommandEntities entities
            )
            : base(createImage, createProxyImageMimeTypeXRef, entities)
        {
        }

        public override void Seed()
        {
            string basePath = string.Format("{0}{1}", AppDomain.CurrentDomain.BaseDirectory,
                                            @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\");

            FileMimeMapping[] fileMimeMappings =
            {
                /* NOTE: 'GenericDocument' name is used in controllers, if you change here, do a search. */
                new FileMimeMapping { FileName = "GenericDocument.png",     MimeType = "text/plain" },
                new FileMimeMapping { FileName = "PDFDocument.png",         MimeType = "application/pdf" },
                new FileMimeMapping { FileName = "Word-2013.png",           MimeType = "application/msword" },
                new FileMimeMapping { FileName = "Word-2013.png",           MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
                new FileMimeMapping { FileName = "Powerpoint-2013.png",     MimeType = "application/vnd.ms-powerpoint" },
                new FileMimeMapping { FileName = "Powerpoint-2013.png",     MimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
                new FileMimeMapping { FileName = "Excel-2013.png",          MimeType = "application/vnd.ms-excel" },
                new FileMimeMapping { FileName = "Excel-2013.png",          MimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            };

            foreach (FileMimeMapping mapping in fileMimeMappings)
            {
                var proxy = Seed(new CreateImage
                {
                    Width = Int32.Parse(ConfigurationManager.AppSettings["ProxyImageWidth"]),
                    Height = Int32.Parse(ConfigurationManager.AppSettings["ProxyImageWidth"]),
                    Title = "Proxy", // arbitrary
                    MimeType = "image/png",
                    FileName = mapping.FileName,
                    Constrained = true
                });
                Seed(new CreateProxyImageMimeTypeXRef
                {
                    MimeType = mapping.MimeType,
                    ImageId = proxy.Id
                });
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
                Seed(new CreateImage
                {
                    FileName = fileName,
                    Width = Int32.Parse(ConfigurationManager.AppSettings["ImageWidth"]),
                    Height = Int32.Parse(ConfigurationManager.AppSettings["ImageHeight"]),
                    Title = "Image", // arbitrary
                    MimeType = "image/jpeg",
                    Constrained = false
                });
            }
        }
    }

    public abstract class BaseImageEntitySeeder : ISeedData
    {
        private readonly IHandleCommands<CreateImage> _createImage;
        private readonly IHandleCommands<CreateProxyImageMimeTypeXRef> _createProxyImageMimeTypeXRef;
        private readonly ICommandEntities _entities;
        private static readonly string BasePath = string.Format("{0}{1}", AppDomain.CurrentDomain.BaseDirectory,
                                        @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\");

        protected BaseImageEntitySeeder(IHandleCommands<CreateImage> createImage
            , IHandleCommands<CreateProxyImageMimeTypeXRef> createProxyImageMimeTypeXRef
            , ICommandEntities entities
        )
        {
            _createImage = createImage;
            _createProxyImageMimeTypeXRef = createProxyImageMimeTypeXRef;
            _entities = entities;
        }

        public abstract void Seed();

        protected Image Seed(CreateImage command)
        {
            var existingEntity = _entities.Get<Image>().SingleOrDefault(x => x.FileName == command.FileName);
            if (existingEntity == null)
            {
                var filePath = string.Format("{0}{1}", BasePath, command.FileName);
                var info = new FileInfo(filePath);
                using (Stream fileStream = File.OpenRead(string.Format("{0}{1}", BasePath, command.FileName)))
                {
                    command.SourceStream = fileStream;
                    command.Size = info.Length;
                    _createImage.Handle(command);
                    return command.CreatedImage;
                }
            }
            return existingEntity;
        }

        protected ProxyImageMimeTypeXRef Seed(CreateProxyImageMimeTypeXRef command)
        {
            var existingEntity = _entities.Get<ProxyImageMimeTypeXRef>().SingleOrDefault(x => x.ImageId == command.ImageId);
            if (existingEntity == null)
            {
                _createProxyImageMimeTypeXRef.Handle(command);
                return command.CreatedProxyImageMimeTypeXRef;
            }
            return existingEntity;
        }
    }
}
