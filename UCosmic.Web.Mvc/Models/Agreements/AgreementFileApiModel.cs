using System;
using System.IO;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementFileApiModel
    {
        public int? Id { get; set; }
        public int AgreementId { get; set; }
        public Guid? UploadGuid { get; set; }
        public FileMedium FileMedium { get; set; }

        private string _originalName;
        private string _customName;

        public string OriginalName
        {
            get { return _originalName; }
            set
            {
                _originalName = value;
                if (string.IsNullOrWhiteSpace(CustomName))
                    CustomName = value;
            }
        }

        public string CustomName
        {
            get
            {
                if (string.IsNullOrWhiteSpace(_customName))
                    _customName = OriginalName;
                return _customName;
            }
            set { _customName = value; }
        }

        public string Visibility { get; set; }

        public string Extension
        {
            get
            {
                if (string.IsNullOrWhiteSpace(OriginalName)) return null;
                var extension = Path.GetExtension(OriginalName);
                return !string.IsNullOrWhiteSpace(extension) ? extension.ToLower() : null;
            }
        }
    }

    public static class AgreementFileProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementFile, AgreementFileApiModel>()
                    .ForMember(d => d.UploadGuid, o => o.Ignore())
                    .ForMember(d => d.OriginalName, o => o.MapFrom(s => string.IsNullOrWhiteSpace(s.FileName) ? s.Name : s.FileName))
                    .ForMember(d => d.CustomName, o => o.MapFrom(s => s.Name))
                    .ForMember(d => d.Extension, o => o.Ignore())
                    .ForMember(d => d.FileMedium, o => o.Ignore())
                ;
            }
        }

        public class ModelToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementFileApiModel, CreateFile>()
                    .ForMember(d => d.FileData, o => o.MapFrom(s => s.FileMedium))
                    .ForMember(d => d.Principal, o => o.Ignore())
                ;

                CreateMap<FileMedium, CreateFile.FileDataWrapper>()
                    .ForMember(d => d.MimeType, o => o.MapFrom(s => s.ContentType))
                ;
            }
        }
    }
}