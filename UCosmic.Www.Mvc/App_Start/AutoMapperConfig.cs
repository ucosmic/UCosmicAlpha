using System.Reflection;
using AutoAutoMapper;
using AutoMapper;

namespace UCosmic.Web.Mvc
{
    public static class AutoMapperConfig
    {
        public static void RegisterProfiles()
        {
            var assemblies = new[]
            {
                Assembly.GetAssembly(typeof(WebApiApplication)),
            };

            AutoProfiler.RegisterProfiles(assemblies);
            Mapper.AssertConfigurationIsValid();
        }
    }
}
