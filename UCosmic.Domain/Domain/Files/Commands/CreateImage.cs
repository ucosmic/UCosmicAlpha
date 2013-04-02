using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using FluentValidation;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Files
{
    public class CreateImage
    {
        public Stream SourceStream { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string Title { get; set; }
        public string MimeType { get; set; }
        public string Name { get; set; }
        public string Extension { get; set; }
        public long Size { get; set; }

        public bool Constrained { get; set; }

        public UCosmic.Domain.Files.Image CreatedImage { get; set; }
    }

    public class ValidateCreateImageCommand : AbstractValidator<CreateImage>
    {
        public ValidateCreateImageCommand()
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            RuleFor(x => x.Extension)
                .MustBeOfFileType()
                    .WithMessage(MustBeOfFileType.FailMessageFormat, x => x.Extension)
            ;
        }
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

            System.Drawing.Image unprocessedImage = null;

            unprocessedImage = System.Drawing.Image.FromStream(command.SourceStream);

            System.Drawing.Imaging.ImageFormat toFormat = unprocessedImage.RawFormat;

            if (command.MimeType == "image/jpeg")
            {
                toFormat = System.Drawing.Imaging.ImageFormat.Jpeg;
            }
            else if (command.MimeType == "image/png")
            {
                toFormat = System.Drawing.Imaging.ImageFormat.Png;
            }
            else
            {
                throw new Exception("Unsupported mime type.");
            }

            byte[] processedImage =
                Resize(unprocessedImage, command.Width, command.Height, toFormat, command.Constrained);

            UCosmic.Domain.Files.Image image = new Image
            {
                Data = processedImage,
                Title = command.Title,
                MimeType = command.MimeType,
                Name = command.Name,
                Extension = command.Extension,
                Size = command.Size
            };

            _entities.Create(image);
            _unitOfWork.SaveChanges();

            command.CreatedImage = image;
        }


        // ------------------------------------------------------------------------
        /*
         * This method will resize the source image with the following option:
         * 
         * If inConstrained is true, the source image will be resized keeping
         * aspect ratio based on longest edge.  The resized source image will be
         * placed inside the canvas with the provided canvas dimensions.  Use
         * this option to handle document icons like PDF, Word, Excel, etc.  
         * Specify ImageFormat.Png in order to get transparency for this option.
         * 
         * If inConstrained is false, the image is simply resized.  The canvas
         * dimensions are used to resize image based on which image edge is largest.
         * Aspect ratio remains the same.
         * 
        */
        // ------------------------------------------------------------------------
        private byte[] Resize(System.Drawing.Image inSourceImage,
                                    int inDestCanvasWidth,
                                    int inDestCanvasHeight,
                                    ImageFormat inToFormat,
                                    bool inConstrained)
        {
            Debug.Assert(inDestCanvasWidth != 0);
            Debug.Assert(inDestCanvasHeight != 0);

            int srcWidth = inSourceImage.Width;
            int srcHeight = inSourceImage.Height;
            int dstWidth = 0;
            int dstHeight = 0;
            int dstCanvasWidth = 0;
            int dstCanvasHeight = 0;
            int x = 0;
            int y = 0;
            float scale = 0;
            System.Drawing.Image destImage = null;

            if (srcWidth > srcHeight)
            {
                scale = (float)inDestCanvasWidth / (float)srcWidth;
            }
            else
            {
                scale = (float)inDestCanvasHeight / (float)srcHeight;
            }

            dstWidth = (int)((float)srcWidth * scale);
            dstHeight = (int)((float)srcHeight * scale);

            dstCanvasWidth = inConstrained ? inDestCanvasWidth : dstWidth;
            dstCanvasHeight = inConstrained ? inDestCanvasHeight : dstHeight;

            x = (dstCanvasWidth - dstWidth) / 2;
            y = (dstCanvasHeight - dstHeight) / 2;

            destImage = new Bitmap(dstCanvasWidth, dstCanvasHeight);

            Graphics g = Graphics.FromImage(destImage);
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;

            Rectangle destBounds = new Rectangle(0, 0, dstCanvasWidth, dstCanvasHeight);
            g.FillRectangle(new SolidBrush(Color.Transparent), destBounds);

            g.DrawImage(inSourceImage, x, y, dstWidth, dstHeight);

            MemoryStream memStream = new MemoryStream();
            destImage.Save(memStream, inToFormat);

            return memStream.ToArray();
        }

    }
}
