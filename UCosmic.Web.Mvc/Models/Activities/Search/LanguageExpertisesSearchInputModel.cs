using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.LanguageExpertises;

namespace UCosmic.Web.Mvc.Models
{
    public class LanguageExpertisesSearchInputModel : BaseSearchInputModel
    {
        public LanguageExpertisesSearchInputModel()
        {
            OrderBy = "lastname-asc";
        }

        public string LanguageCode { get; set; }
        public string Keyword { get; set; }
        public string OrderBy { get; set; }
        public int? AncestorId { get; set; }
    }

    public static class LanguageExpertisesSearchInputProfiler
    {
        public class ModelToQuery : Profile
        {
            protected override void Configure()
            {
                CreateMap<LanguageExpertisesSearchInputModel, LanguageExpertisesPageByTerms>()
                    .ForMember(d => d.EstablishmentId, o => o.Ignore())
                    .ForMember(d => d.EstablishmentDomain, o => o.Ignore())
                    .ForMember(d => d.EagerLoad, o => o.Ignore())

                    .ForMember(d => d.TwoLetterIsoCode, o => o.ResolveUsing(s => s.LanguageCode))

                    // map the LanguageExpertise code
                    //.ForMember(d => d.LanguageCode, o => o.ResolveUsing(s =>
                    //{
                    //    // a LanguageExpertise code value of null implies finding results without a LanguageExpertise code
                    //    if (s.LanguageCode == "-1" || "none".Equals(s.LanguageCode, StringComparison.OrdinalIgnoreCase)) return null;

                    //    // a LanguageExpertise code value of "" implies finding all results regardless of LanguageExpertise code
                    //    return "any".Equals(s.LanguageCode, StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(s.LanguageCode)
                    //        ? string.Empty : s.LanguageCode;
                    //}))

                    // map the order by
                    .ForMember(d => d.OrderBy, o => o.ResolveUsing(s =>
                    {
                        var orderBy = new Dictionary<Expression<Func<LanguageExpertise, object>>, OrderByDirection>();
                        if (string.IsNullOrWhiteSpace(s.OrderBy) || !s.OrderBy.Contains("-"))
                        {
                            orderBy.Add(e => e.Language.NativeName, OrderByDirection.Ascending);
                        }
                        else
                        {
                            var columnAndDirection = s.OrderBy.Split(new[] { '-' });
                            var column = columnAndDirection[0];
                            var direction = "desc".Equals(columnAndDirection[1], StringComparison.OrdinalIgnoreCase)
                                ? OrderByDirection.Descending : OrderByDirection.Ascending;
                            var otherDirection = "asc".Equals(columnAndDirection[1], StringComparison.OrdinalIgnoreCase)
                                ? OrderByDirection.Descending : OrderByDirection.Ascending;

                            switch (column.ToLower())
                            {
                                case "lastname":
                                    orderBy.Add(x => x.Person.LastName ?? x.Person.DisplayName, direction);
                                    break;
                                case "reading":
                                    orderBy.Add(x => x.ReadingProficiency , direction);
                                    break;
                                case "writing":
                                    orderBy.Add(x => x.WritingProficiency , direction);
                                    break;
                                case "listening":
                                    orderBy.Add(x => x.ListeningProficiency , direction);
                                    break;
                                case "speaking":
                                    orderBy.Add(x => x.SpeakingProficiency, direction);
                                    break;
                                case "language":
                                    orderBy.Add(x => x.Language.Names.FirstOrDefault().Text, direction);
                                    break;
                                //case "LanguageExpertise":
                                //    orderBy.Add(x => x.Institution != null && x.Institution.Location.Places.Any(y => y.IsLanguageExpertise), otherDirection);
                                //    orderBy.Add(x => x.Institution != null
                                //        ? x.Language.Names.Any(y => y.IsLanguageExpertise)
                                //            ? x.Language.Names.FirstOrDefault()
                                //            : null
                                //        : null, direction);
                                //    break;
                            }
                        }

                        if (!orderBy.Any())
                            orderBy.Add(x => x.RevisionId, OrderByDirection.Ascending);

                        return orderBy;
                    }))
                ;
            }
        }
    }
}