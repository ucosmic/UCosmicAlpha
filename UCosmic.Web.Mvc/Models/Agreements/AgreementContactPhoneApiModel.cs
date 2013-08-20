using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementContactPhoneApiModel
    {
        public int ContactId { get; set; }
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
                    .ForMember(d => d.ContactId, o => o.MapFrom(s => s.OwnerId))
                ;
            }
        }

        public class ModelToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementContactPhoneApiModel, CreateContactPhone>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.AgreementId, o => o.Ignore())
                    .ForMember(d => d.ContactId, o => o.Ignore())
                    .ForMember(d => d.CreatedContactPhoneId, o => o.Ignore())
                ;
            }
        }
    }
}