using System.Linq;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementContactApiModel
    {
        public int Id { get; set; }
        public int AgreementId { get; set; }
        public int? PersonId { get; set; }
        public int? UserId { get; set; }
        public string Type { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string EmailAddress { get; set; }
        public string Title { get; set; }

        public AgreementContactPhoneApiModel[] Phones { get; set; }
    }

    public static class AgreementContactProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementContact, AgreementContactApiModel>()
                    .ForMember(d => d.UserId, o => o.MapFrom(s => s.Person.User != null ? s.Person.User.RevisionId : (int?)null))
                    .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.Person.DisplayName))
                    .ForMember(d => d.Salutation, o => o.MapFrom(s => s.Person.Salutation))
                    .ForMember(d => d.FirstName, o => o.MapFrom(s => s.Person.FirstName))
                    .ForMember(d => d.MiddleName, o => o.MapFrom(s => s.Person.MiddleName))
                    .ForMember(d => d.LastName, o => o.MapFrom(s => s.Person.LastName))
                    .ForMember(d => d.Suffix, o => o.MapFrom(s => s.Person.Suffix))
                    .ForMember(d => d.EmailAddress, o => o.MapFrom(s => s.Person.Emails.FirstOrDefault(x => x.IsDefault)))
                    .ForMember(d => d.Phones, o => o.MapFrom(s => s.PhoneNumbers))
                ;
            }
        }

        public class ModelToCreateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<AgreementContactApiModel, CreateContact>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.CreatedContactId, o => o.Ignore())
                    .ForMember(d => d.JobTitle, o => o.MapFrom(s => s.Title))
                ;
            }
        }
    }
}