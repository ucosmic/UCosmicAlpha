using System.Linq;
using System.Text;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public static class AgreementUmbrellaOptionApiProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<Agreement, TextValuePair>()
                    .ForMember(d => d.Value, o => o.MapFrom(s => s.Id))
                    .ForMember(d => d.Text, o => o.ResolveUsing(s =>
                    {
                        // use the agreement name when it exists
                        if (!string.IsNullOrWhiteSpace(s.Name)) return s.Name;

                        // try to construct name from non-owning participants
                        var text = new StringBuilder();
                        if (s.Participants.Any(x => !x.IsOwner))
                        {
                            text.Append(s.Participants.First(x => !x.IsOwner).Establishment.TranslatedName);
                            text.Append(" ");
                        }
                        else
                        {
                            text.Append("Unilateral ");
                        }
                        text.Append(s.Type);
                        return text.ToString();
                    }))
                ;
            }
        }
    }
}