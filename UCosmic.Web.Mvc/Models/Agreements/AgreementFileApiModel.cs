using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementFileApiModel
    {
        public string AgreementId { get; set; }
        public string Path { get; set; }
        public string Name { get; set; }
        public string Visibility { get; set; }
    }

    public static class AgreementFileProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementFile, AgreementFileApiModel>()
                    .ForMember(d => d.AgreementId, o => o.MapFrom(s => s.AgreementId))
                    .ForMember(d => d.Path, o => o.MapFrom(s => s.Path))
                    .ForMember(d => d.Name, o => o.MapFrom(s => s.Name))
                    .ForMember(d => d.Visibility, o => o.MapFrom(s => s.Visibility))
                ;
            }
        }
    }
}