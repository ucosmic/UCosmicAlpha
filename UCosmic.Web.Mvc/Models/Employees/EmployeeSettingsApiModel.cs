using System;
using System.Linq.Expressions;
using AutoMapper;
using UCosmic.Domain.Employees;

namespace UCosmic.Web.Mvc.Models
{
    public class EmployeeSettingsApiModel
    {
        public int EstablishmentId { get; set; }
        public EmployeeSettingsFacultyRankApiModel[] FacultyRanks { get; set; }

        internal static readonly Expression<Func<EmployeeModuleSettings, object>>[] EagerLoad =
            new Expression<Func<EmployeeModuleSettings, object>>[]
            {
                x => x.FacultyRanks,
            };
    }

    public static class EmployeeSettingsApiProfiler
    {
        public class EntityToModel : Profile
        {
            protected override void Configure()
            {
                CreateMap<EmployeeModuleSettings, EmployeeSettingsApiModel>();
            }
        }
    }
}