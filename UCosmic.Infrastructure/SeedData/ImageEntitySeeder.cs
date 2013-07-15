//using System;
//using System.IO;
//using System.Linq;
//using UCosmic.Domain.Files;

//namespace UCosmic.SeedData
//{
//    public class ImageEntitySeeder : BaseImageEntitySeeder
//    {
//        public ImageEntitySeeder(IHandleCommands<CreateImage> createImage, ICommandEntities entities)
//            : base(createImage, entities) { }

//        public override void Seed()
//        {
//            string[] fileNames =
//            {
//                "EE23D741-C50D-40D5-8214-C18DF68CC6D3.jpg",
//                "5C62D74E-E8EE-4B9A-95F3-B2ABB1F6F912.gif",
//                "A44FAB3B-DEBA-4F14-8965-E379569066A9.png",
//                "C0DA4900-762B-4B26-AE03-843CBB7C0E7B.bmp",
//                "E4E53300-08D3-47C0-954C-BF15EF54F0A3.tif",
//            };

//            foreach (string fileName in fileNames)
//            {
//                Seed(new CreateImage
//                {
//                    FileName = fileName,
//                    Title = "Image", // arbitrary
//                    MimeType = "image/jpeg",
//                });
//            }
//        }
//    }

//    public abstract class BaseImageEntitySeeder : ISeedData
//    {
//        private static readonly string BasePath = string.Format("{0}{1}",
//            AppDomain.CurrentDomain.BaseDirectory, @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\");
//        private readonly IHandleCommands<CreateImage> _createImage;
//        private readonly ICommandEntities _entities;

//        protected BaseImageEntitySeeder(IHandleCommands<CreateImage> createImage
//            , ICommandEntities entities
//        )
//        {
//            _createImage = createImage;
//            _entities = entities;
//        }

//        public abstract void Seed();

//        protected Image Seed(CreateImage command)
//        {
//            var existingEntity = _entities.Get<Image>().FirstOrDefault(x => x.FileName == command.FileName);
//            if (existingEntity == null)
//            {
//                var filePath = string.Format("{0}{1}", BasePath, command.FileName);
//                using (Stream fileStream = File.OpenRead(string.Format("{0}{1}", BasePath, command.FileName)))
//                {
//                    command.Content = fileStream.ReadFully();
//                    _createImage.Handle(command);
//                    return command.CreatedImage;
//                }
//            }
//            return existingEntity;
//        }
//    }
//}
