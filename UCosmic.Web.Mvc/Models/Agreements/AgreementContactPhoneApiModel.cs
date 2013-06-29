using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementContactPhoneApiModel
    {
        public string Value { get; set; }
        public string Type { get; set; }
    }

    public static class AgreementContactPhoneProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementContactPhone, AgreementContactPhoneApiModel>()
                ;
            }
        }
    }
}