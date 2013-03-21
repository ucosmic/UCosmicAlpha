using System;
using System.Linq;
using UCosmic.Domain.Images;

namespace UCosmic.SeedData
{
    public class ImageEntitySeeder : BaseImageEntitySeeder
    {
        private ICommandEntities _entities;

        public ImageEntitySeeder(IProcessQueries queryProcessor
                                , IHandleCommands<CreateImage> createImage
                                , ICommandEntities entities
                                , IUnitOfWork unitOfWork
            )
            : base(queryProcessor, createImage, unitOfWork)
        {
            _entities = entities;
        }

        public override void Seed()
        {
            string basePath = AppDomain.CurrentDomain.BaseDirectory +
                              @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\";
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
                string sourceId = fileName.Substring(0, fileName.IndexOf('.'));
                if (_entities.Get<Image>().Count(x => x.SourceId == sourceId) == 0)
                {
                    Seed(new CreateImage
                    {
                        SourceId = sourceId,
                        Path = basePath + fileName,
                        Width = 300,
                        Height = 300
                    });
                }

                sourceId = fileName.Substring(0, fileName.IndexOf('.')) + "_proxy";
                if (_entities.Get<Image>().Count(x => x.SourceId == sourceId) == 0)
                {
                    Seed(new CreateImage
                    {
                        SourceId = sourceId,
                        Path = basePath + fileName,
                        Width = 48,
                        Height = 48
                    });
                }
            }
        }
    }

    public abstract class BaseImageEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateImage> _createImage;
        private readonly IUnitOfWork _unitOfWork;

        protected BaseImageEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateImage> createImage
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _createImage = createImage;
            _unitOfWork = unitOfWork;
        }

        public abstract void Seed();

        protected Image Seed(CreateImage command)
        {
            _createImage.Handle(command);
            _unitOfWork.SaveChanges();

            return command.CreatedImage;
        }
    }
}
