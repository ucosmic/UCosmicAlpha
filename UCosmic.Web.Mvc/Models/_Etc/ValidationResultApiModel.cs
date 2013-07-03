using AutoMapper;
using FluentValidation.Results;

namespace UCosmic.Web.Mvc.Models
{
    public class ValidationResultApiModel
    {
        public bool IsValid { get; set; }
        public ValidationFailureApiModel[] Errors { get; set; }
    }

    public static class ValidationResultsApiProfiler
    {
        public class ValidationResultToModelProfile : Profile
        {
            protected override void Configure()
            {
                Mapper.CreateMap<ValidationResult, ValidationResultApiModel>();
            }
        }
    }
}