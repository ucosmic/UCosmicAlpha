using AutoMapper;
namespace UCosmic.Domain.Establishments
{
    public class EstablishmentUrlView
    {
        public string Value { get; set; }
    }

    public class EstablishmentUrlViewProfile : Profile
    {
        protected override void Configure()
        {
            CreateMap<EstablishmentUrl, EstablishmentUrlView>();
        }
    }
}