using AutoMapper;
using UCosmic.Domain.InstitutionalAgreements;

namespace UCosmic.Web.Mvc.Models.Agreements
{
    public class AgreementApiModel
    {
        public int Id { get; set; }
    }

    public static class AgreementProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<InstitutionalAgreement, AgreementApiModel>()
                ;
            }
        }
    }
}