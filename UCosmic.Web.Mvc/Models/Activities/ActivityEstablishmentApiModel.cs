using AutoMapper;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class ActivityEstablishmentApiModel
    {
        public int Id { get; set; }
        public string OfficialName { get; set; }
    }

    public static class ActivityEstablishmentApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<EstablishmentView, ActivityEstablishmentApiModel>();
            }
        }
    }
}