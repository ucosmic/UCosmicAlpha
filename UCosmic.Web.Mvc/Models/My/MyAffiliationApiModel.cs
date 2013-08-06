using System.Linq;
using System.Web.Mvc;
using AutoMapper;
using UCosmic.Domain.Employees;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class MyAffiliationApiModel
    {
        public int Id { get; set; }
        public int PersonId { get; set; }
        public int EstablishmentId { get; set; }
        public string Establishment { get; set; }
        public string JobTitles { get; set; }
        public bool IsDefault { get; set; }
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

    public static class MyAffiliationApiModelProfiler
    {
        public class EntityToModelProfile : Profile
        {
            private class EstablishmentNameResolver : ValueResolver<Affiliation, string>
            {
                private readonly IQueryEntities _entities;

                public EstablishmentNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override string ResolveCore(Affiliation source)
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

            private class EstablishmentCampusNameResolver : ValueResolver<Affiliation, string>
            {
                private readonly IQueryEntities _entities;

                public EstablishmentCampusNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override string ResolveCore(Affiliation source)
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

            private class EstablishmentCollegeNameResolver : ValueResolver<Affiliation, string>
            {
                private readonly IQueryEntities _entities;

                public EstablishmentCollegeNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override string ResolveCore(Affiliation source)
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

            private class EstablishmentDepartmentNameResolver : ValueResolver<Affiliation, string>
            {
                private readonly IQueryEntities _entities;

                public EstablishmentDepartmentNameResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override string ResolveCore(Affiliation source)
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

            private class FacultyRankResolver : ValueResolver<Affiliation, string>
            {
                private readonly IQueryEntities _entities;

                public FacultyRankResolver(IQueryEntities entities)
                {
                    _entities = entities;
                }

                protected override string ResolveCore(Affiliation source)
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
                CreateMap<Affiliation, MyAffiliationApiModel>()
                    .ForMember(d => d.Id, o => o.MapFrom(s => s.RevisionId))
                    .ForMember(d => d.PersonId, o => o.Ignore())
                    .ForMember(d => d.Campus, o => o.ResolveUsing<EstablishmentCampusNameResolver>()
                        .ConstructedBy(() => new EstablishmentCampusNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    .ForMember(d => d.College, o => o.ResolveUsing<EstablishmentCollegeNameResolver>()
                        .ConstructedBy(() => new EstablishmentCollegeNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    .ForMember(d => d.Department, o => o.ResolveUsing<EstablishmentDepartmentNameResolver>()
                        .ConstructedBy(() => new EstablishmentDepartmentNameResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                    .ForMember(d => d.FacultyRank, o => o.ResolveUsing<FacultyRankResolver>()
                        .ConstructedBy(() => new FacultyRankResolver(DependencyResolver.Current.GetService<IQueryEntities>())))
                ;
            }
        }

        public class ModelToUpdateCommandProfile : Profile
        {
            protected override void Configure()
            {
                CreateMap<MyAffiliationApiModel, UpdatePerson.Affiliation>();
            }
        }
    }
}