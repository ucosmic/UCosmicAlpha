using System.Collections.Generic;
using System.Collections.ObjectModel;
using AutoMapper;
using UCosmic.Domain.People;
using System.Linq;
using System;
using UCosmic.Domain.Employees;


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
    public EmployeeFacultyRank FacultyRank { get; set; }
    public string WorkingTitle { get; set; }
    //public string PrimaryEmail { get; set; }
    //public string AlternateEmail { get; set; }
    //public byte[] Picture { get; set; }on
    //public ICollection<Affiliation> Affiliations { get; set; }
    public string AdministrativeAppointments { get; set; }

    public static class PersonApiProfiler
    {
        public class PersonToPersonApiModelProfile : Profile
        {
            protected override void Configure()
            {
                Mapper.CreateMap<Person, PersonApiModel>()
                    .ForMember(dst => dst.WorkingTitle, opt => opt.Ignore());
                    /* TODO: Working title is actually default affiliation JobTitle */

                Mapper.CreateMap<PersonApiModel, UpdatePerson>();
            }
        }
    }
  }
}