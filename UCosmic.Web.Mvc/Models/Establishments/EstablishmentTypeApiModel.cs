using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class EstablishmentTypeApiModel
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string CategoryCode { get; set; }
        public string CategoryText { get; set; }
    }

    public class EstablishmentCategoryApiModel
    {
        public string Code { get; set; }
        public string Text { get; set; }
        public string PluralText { get; set; }
        public EstablishmentTypeApiModel[] Types { get; set; }
    }

    public static class EstablishmentTypeProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentType, EstablishmentTypeApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.Text, o => o.MapFrom(s => s.EnglishName))
                    .ForMember(d => d.CategoryText, o => o.MapFrom(s => s.Category.EnglishName))
                ;
            }
        }
    }

    public static class EstablishmentCategoryProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentCategory, EstablishmentCategoryApiModel>()
                    .ForMember(d => d.Text, o => o.MapFrom(s => s.EnglishName))
                    .ForMember(d => d.PluralText, o => o.MapFrom(s => s.EnglishPluralName))
                ;
            }
        }
    }
}