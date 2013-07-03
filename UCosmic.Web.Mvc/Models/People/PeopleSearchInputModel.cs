using AutoMapper;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class PeopleSearchInputModel : BaseSearchInputModel
    {
        public string Email { get; set; }
        public StringMatchStrategy EmailMatch { get; set; }

        public string FirstName { get; set; }
        public StringMatchStrategy FirstNameMatch { get; set; }

        public string LastName { get; set; }
        public StringMatchStrategy LastNameMatch { get; set; }
    }

    public static class PeopleSearchInputModelProfiler
    {
        public class ModelToQueryProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<PeopleSearchInputModel, PeopleByCriteria>()
                    .ForMember(d => d.EagerLoad, o => o.Ignore())
                    .ForMember(d => d.OrderBy, o => o.Ignore())
                ;
            }
        }
    }
}