using System.Collections.Generic;
using System.Security.Policy;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;
using AutoMapper;
using System.Linq;
namespace UCosmic.Web.Mvc.Models
{
    public class AffiliationViewModel
    {
        public int PersonId { get; set; }
        public bool IsDefault { get; set; }
        //public string[] AncestorNames { get; set; }
        public IEnumerable<string> AncestorNames { get; set; }
        public int EstablishmentId { get; set; }
        public string EstablishmentName { get; set; }
        public string FacultyRank { get; set; }
        public string JobTitles { get; set; }
    }
    public static class AffiliationViewProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<Affiliation, AffiliationViewModel>()
                    .ForMember(d => d.AncestorNames, o => o.MapFrom(s => s.Establishment.Ancestors.Select(y => y.Ancestor)
                    .Select(y => y.Names.Any(z => z.IsContextName && !z.IsFormerName)
                        // ReSharper disable PossibleNullReferenceException
                        ? y.Names.FirstOrDefault(z => z.IsContextName && !z.IsFormerName).Text
                        // ReSharper restore PossibleNullReferenceException
                        : y.OfficialName)
                    .Skip(1)
                    .Reverse()))
                    .ForMember(d => d.EstablishmentName, o => o.MapFrom(s => (!s.IsDefault) ? s.Establishment.Names.Any(z => z.IsContextName && !z.IsFormerName)
                        ? s.Establishment.Names.FirstOrDefault(z => z.IsContextName && !z.IsFormerName).Text
                        : s.Establishment.OfficialName
                        : null
                        ))
                   .ForMember(d => d.FacultyRank, o => o.MapFrom(s => s.FacultyRank.Rank))
                //.ForMember(d => d.JobTitles, o => o.MapFrom(s => s.DefaultAffiliation.IsDefault ? s.DefaultAffiliation.JobTitles : null))
                ;
            }
        }
    }
}