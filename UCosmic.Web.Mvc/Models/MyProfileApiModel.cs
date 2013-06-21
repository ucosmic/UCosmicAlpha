using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;
using System.Web.Mvc;


namespace UCosmic.Web.Mvc.Models
{
    public class MyProfileNavigationApiModel
    {
        public bool StartInEdit { get; set; }
        public string StartTabName { get; set; }
    }

    public class MyProfileAffiliationApiModel
    {
        public int Id { get; set; }
        public int PersonId { get; set; }
        public int EstablishmentId { get; set; }
        public string Establishment { get; set; }
        public string JobTitles { get; set; }
        public bool IsDefault { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsAcknowledged { get; set; }
        public bool IsClaimingStudent { get; set; }
        public bool IsClaimingEmployee { get; set; }
        public bool IsClaimingInternationalOffice { get; set; }
        public bool IsClaimingAdministrator { get; set; }
        public bool IsClaimingFaculty { get; set; }
        public bool IsClaimingStaff { get; set; }
        public int? CampusId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }
        public int? FacultyRankId { get; set; }

        /* These are only passed to client (r/o). */
        public string Campus { get; set; }
        public string College { get; set; }
        public string Department { get; set; }
        public string FacultyRank { get; set; }
    }

    public class MyProfileApiModel
    {
        public int PersonId { get; set; }
        public bool IsActive { get; set; }
        public bool IsDisplayNameDerived { get; set; }
        public string DisplayName { get; set; }
        public string Salutation { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Suffix { get; set; }
        public string Gender { get; set; }
        public bool HasPhoto { get; set; }
        public string PreferredTitle { get; set; }
        public ICollection<MyProfileAffiliationApiModel> Affiliations { get; set; }

        public bool StartInEdit { get; set; }
        public string StartTabName { get; set; }
    }

    public static class MyProfileApiModelProfiler
    {
        public class EntityToModelProfile : Profile
        {
            public class EstablishmentNameResolver : ValueResolver<Affiliation, String>
            {
                private readonly IQueryEntities _entities;

                public EstablishmentNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(Affiliation source)
                {
                    string info = null;

                    var institution = _entities.Query<Establishment>()
                                                .SingleOrDefault(x => x.RevisionId == source.EstablishmentId);

                    if (institution != null)
                    {
                        info = institution.OfficialName;
                    }

                    return info;
                }
            }
            public class EstablishmentCampusNameResolver : ValueResolver<Affiliation, String>
            {
                private readonly IQueryEntities _entities;

                public EstablishmentCampusNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(Affiliation source)
                {
                    string info = null;

                    if (source.CampusId.HasValue)
                    {
                        var institution = _entities.Query<Establishment>()
                                                   .SingleOrDefault(x => x.RevisionId == source.CampusId.Value);

                        if (institution != null)
                        {
                            info = institution.OfficialName;
                        }
                    }

                    return info;
                }
            }
            public class EstablishmentCollegeNameResolver : ValueResolver<Affiliation, String>
            {
                private readonly IQueryEntities _entities;

                public EstablishmentCollegeNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(Affiliation source)
                {
                    string info = null;

                    if (source.CollegeId.HasValue)
                    {
                        var institution = _entities.Query<Establishment>()
                                                   .SingleOrDefault(x => x.RevisionId == source.CollegeId.Value);

                        if (institution != null)
                        {
                            info = institution.OfficialName;
                        }
                    }

                    return info;
                }
            }
            public class EstablishmentDepartmentNameResolver : ValueResolver<Affiliation, String>
            {
                private readonly IQueryEntities _entities;

                public EstablishmentDepartmentNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(Affiliation source)
                {
                    string info = null;

                    if (source.DepartmentId.HasValue)
                    {
                        var institution = _entities.Query<Establishment>()
                                                   .SingleOrDefault(x => x.RevisionId == source.DepartmentId.Value);

                        if (institution != null)
                        {
                            info = institution.OfficialName;
                        }
                    }

                    return info;
                }
            }
            public class FacultyRankResolver : ValueResolver<Affiliation, String>
            {
                private readonly IQueryEntities _entities;

                public FacultyRankResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override String ResolveCore(Affiliation source)
                {
                    string info = null;

                    if (source.FacultyRankId.HasValue)
                    {
                        var settings = _entities.Query<EmployeeModuleSettings>()
                                                   .SingleOrDefault(x => x.Establishment.RevisionId == source.EstablishmentId);

                        if (settings != null)
                        {
                            var employeeFacultyRank = settings.FacultyRanks.SingleOrDefault(r => r.Id == source.FacultyRankId);
                            if (employeeFacultyRank != null)
                            {
                                info = employeeFacultyRank.Rank;
                            }
                        }
                    }

                    return info;
                }
            }

            protected override void Configure()
            {
                CreateMap<Affiliation, MyProfileAffiliationApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.Campus, o => o.ResolveUsing<MyProfileApiModelProfiler.EntityToModelProfile.EstablishmentCampusNameResolver>()
                        .ConstructedBy(() => new EstablishmentCampusNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    .ForMember(d => d.College, o => o.ResolveUsing<MyProfileApiModelProfiler.EntityToModelProfile.EstablishmentCollegeNameResolver>()
                        .ConstructedBy(() => new EstablishmentCollegeNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    .ForMember(d => d.Department, o => o.ResolveUsing<MyProfileApiModelProfiler.EntityToModelProfile.EstablishmentDepartmentNameResolver>()
                        .ConstructedBy(() => new EstablishmentDepartmentNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    .ForMember(d => d.FacultyRank, o => o.ResolveUsing<MyProfileApiModelProfiler.EntityToModelProfile.FacultyRankResolver>()
                        .ConstructedBy(() => new FacultyRankResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                        ;

                CreateMap<Person, MyProfileApiModel>()
                    .ForMember(d => d.PersonId, o => o.MapFrom(s => s.RevisionId) )
                    .ForMember(d => d.HasPhoto, o => o.MapFrom(s => s.Photo != null))
                    .ForMember(d => d.PreferredTitle, o => o.MapFrom(s => (s.Employee != null) ? s.Employee.JobTitles : null))
                    .ForMember(d => d.StartInEdit, o => o.Ignore())
                    .ForMember(d => d.StartTabName, o => o.Ignore())
                    ;
            }
        }

        public class ModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<MyProfileAffiliationApiModel, UpdatePerson.Affiliation>();

                CreateMap<MyProfileApiModel, UpdateMyProfile>()
                    .ForMember(d => d.Principal, o => o.Ignore())
                    .ForMember(d => d.JobTitles, o => o.MapFrom(s => s.PreferredTitle))
                ;
            }
        }

        public class ModelToGenerateDisplayNameProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<MyProfileApiModel, GenerateDisplayName>();
            }
        }


    }
}