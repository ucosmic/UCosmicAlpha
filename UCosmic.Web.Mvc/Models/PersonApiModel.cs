using AutoMapper;
using System.Linq;
using UCosmic.Domain.Employees;
using UCosmic.Domain.People;


namespace UCosmic.Web.Mvc.Models
{
  public class PersonApiModel
  {
    public int RevisionId { get; set; }
    public bool IsActive { get; set; }
    public bool IsDisplayNameDerived { get; set; }
    public string DisplayName { get;  set; }
    public string Salutation { get; set; }
    public string FirstName { get; set; }
    public string MiddleName { get; set; }
    public string LastName { get; set; }
    public string Suffix { get; set; }
    public string Gender { get; set; }
    public EmployeeFacultyRank EmployeeFacultyRank { get; set; }
    public string WorkingTitle { get; set; }
    //public string PrimaryEmail { get; set; }
    //public string AlternateEmail { get; set; }
    //public byte[] Picture { get; set; }on
    //public ICollection<Affiliation> Affiliations { get; set; }
    public string AdministrativeAppointments { get; set; }

    public static class PersonApiProfiler
    {
        public class WorkingTitleResolver : ValueResolver<Person, string>
        {
            protected override string ResolveCore(Person person)
            {
                string workingTitle = null;

                Affiliation primaryAffiliation = person.Affiliations.SingleOrDefault(x => x.IsPrimary);
                if (primaryAffiliation != null)
                {
                   workingTitle = primaryAffiliation.JobTitles;
                }

                return workingTitle;
            }
        }

        public class PersonToPersonApiModelProfile : Profile
        {
            protected override void Configure()
            {
                Mapper.CreateMap<Person, PersonApiModel>()
                    .ForMember(dst => dst.WorkingTitle, opt => opt.ResolveUsing<WorkingTitleResolver>());

                Mapper.CreateMap<PersonApiModel, UpdatePerson>();
            }
        }
    }
  }
}