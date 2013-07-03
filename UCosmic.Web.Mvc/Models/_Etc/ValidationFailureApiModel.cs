using AutoMapper;
using FluentValidation.Results;

namespace UCosmic.Web.Mvc.Models
{
    public class ValidationFailureApiModel
    {
        public string PropertyName { get; set; }
        public string ErrorMessage { get; set; }
        public string AttemptedValue { get; set; }
    }

    public static class ValidationFailureApiProfiler
    {
        public class ValidationFailureToModelProfile : Profile
        {
            protected override void Configure()
            {
                Mapper.CreateMap<ValidationFailure, ValidationFailureApiModel>()
                    .ForMember(d => d.PropertyName, o => o.MapFrom(s => string.Format("{0}{1}",
                        s.PropertyName.Substring(0, 1).ToLower(), s.PropertyName.Substring(1))))
                ;
            }
        }
    }
}