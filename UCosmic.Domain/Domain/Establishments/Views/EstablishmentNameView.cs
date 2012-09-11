using AutoMapper;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentNameView
    {
        public string Text { get; set; }
        public string AsciiEquivalent { get; set; }
    }

    public class EstablihsmentViewProfile : Profile
    {
        protected override void Configure()
        {
            CreateMap<EstablishmentName, EstablishmentNameView>()
                .ForMember(d => d.AsciiEquivalent, o => o.MapFrom(s => s.AsciiEquivalent ?? string.Empty))
            ;
        }
    }
}