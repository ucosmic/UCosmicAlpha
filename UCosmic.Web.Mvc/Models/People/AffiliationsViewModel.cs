using System.Collections.Generic;
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

        public string JobTitles { get; set; }
    }
    //var models = entities.Select(x => new AffiliationViewModel
    //{
    //    AncestorNames = x.Establishment.Ancestors.Select(y => y.Ancestor)
    //        .Select(y => y.Names.Any(z => z.IsContextName && !z.IsFormerName)
    //            // ReSharper disable PossibleNullReferenceException
    //            ? y.Names.FirstOrDefault(z => z.IsContextName && !z.IsFormerName).Text
    //            // ReSharper restore PossibleNullReferenceException
    //            : y.OfficialName)
    //        .ToArray()
    //});
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
                        : y.OfficialName)))

                //CreateMap<Affiliation, AffiliationViewModel>()
                //    .ForMember(d => d.AncestorNames, o => o.MapFrom(s => new
                //    {
                //        AncestorNames = s.Establishment.Ancestors.Select(y => y.Ancestor)
                //            .Select(y => y.Names.Any(z => z.IsContextName && !z.IsFormerName)
                //                // ReSharper disable PossibleNullReferenceException
                //                ? y.Names.FirstOrDefault(z => z.IsContextName && !z.IsFormerName).Text
                //                // ReSharper restore PossibleNullReferenceException
                //                : y.OfficialName).ToArray()
                //    }))

                    //.ForMember(d => d.AncestorNames, o => o.MapFrom(s => s.Select(x => new
                    //{
                    //    AncestorNames = x.Establishment.Ancestors.Select(y => y.Ancestor)
                    //        .Select(y => y.Names.Any(z => z.IsContextName && !z.IsFormerName)
                    //            // ReSharper disable PossibleNullReferenceException
                    //            ? y.Names.FirstOrDefault(z => z.IsContextName && !z.IsFormerName).Text
                    //            // ReSharper restore PossibleNullReferenceException
                    //            : y.OfficialName)
                    //})))

                    //.ForMember(d => d.EmailAddress, o => o.MapFrom(s => s.Emails.Any(x => x.IsDefault) ? s.Emails.FirstOrDefault(x => x.IsDefault).Value : null))
                    //.ForMember(d => d.JobTitles, o => o.MapFrom(s => s.DefaultAffiliation.IsDefault ? s.DefaultAffiliation.JobTitles : null))
                ;
            }
        }
    }
}