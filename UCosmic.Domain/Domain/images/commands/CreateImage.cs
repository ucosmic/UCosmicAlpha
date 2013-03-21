using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace UCosmic.Domain.Images
{
    public class CreateImage
    {
        public string SourceId { get; set; }
        public string Path { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }

        public UCosmic.Domain.Images.Image CreatedImage { get; set; }
    }

    public class HandleCreateImageCommand : IHandleCommands<CreateImage>
    {
        private readonly ICommandEntities _entities;
        private readonly IUnitOfWork _unitOfWork;

        public HandleCreateImageCommand(ICommandEntities entities, IUnitOfWork unitOfWork)
        {
            _entities = entities;
            _unitOfWork = unitOfWork;
        }

        public void Handle(CreateImage command)
        {
            if (command == null) throw new ArgumentNullException("command");
            if (!File.Exists(command.Path)) { throw new Exception(command.Path + " not found."); }

            System.Drawing.Image unprocessedImage = null;

            try
            {
                unprocessedImage = System.Drawing.Image.FromFile(command.Path);
            }
            catch (Exception ex)
            {
                throw new Exception("Error occurred reading image file " + command.Path, ex);
            }

            UCosmic.Domain.Images.Image image = new Image
            {
                SourceId = command.SourceId,
                Data = ConvertToJPEG(unprocessedImage, command.Width, command.Height)
            };

            _entities.Create(image);
            _unitOfWork.SaveChanges();

            command.CreatedImage = image;
        }


        public byte[] ConvertToJPEG(System.Drawing.Image inSourceImage, int inDestWidth, int inDestHeight)
        {
            Debug.Assert(inDestWidth != 0);
            Debug.Assert(inDestHeight != 0);

            System.Drawing.Image destImage = new Bitmap(inDestWidth, inDestHeight);

            Graphics g = Graphics.FromImage(destImage);
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;

            Rectangle destBounds = new Rectangle(0, 0, inDestWidth, inDestHeight);
            g.FillRectangle(new SolidBrush(Color.Transparent), destBounds);

            int srcWidth = inSourceImage.Width;
            int srcHeight = inSourceImage.Height;
            int width = inDestWidth;
            int height = inDestHeight;
            int x = 0;
            int y = 0;

            if ((srcWidth != inDestWidth) || (srcHeight != inDestHeight))
            {
                float scale;

                if (srcWidth > srcHeight)
                {
                    scale = (float)inDestWidth / (float)srcWidth;
                }
                else
                {
                    scale = (float)inDestHeight / (float)srcHeight;
                }

                width = (int)((float)srcWidth * scale);
                height = (int)((float)srcHeight * scale);
                x = (inDestWidth - width) / 2;
                y = (inDestHeight - height) / 2;
            }

            g.DrawImage(inSourceImage, x, y, width, height);

            MemoryStream memStream = new MemoryStream();
            destImage.Save(memStream, ImageFormat.Jpeg);

            return memStream.ToArray();
        }

    }
}
