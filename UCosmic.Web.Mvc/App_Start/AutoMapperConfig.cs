using System.Reflection;
using AutoAutoMapper;
using AutoMapper;
using UCosmic.Domain.Places;
using System;

namespace UCosmic.Web.Mvc
{
    public static class AutoMapperConfig
    {
        public static void RegisterProfiles()
        {
            var assemblies = new[]
            {
                Assembly.GetAssembly(typeof(GeoPlanetProfiler)),
                Assembly.GetAssembly(typeof(WebApiApplication)),
            };

            try
            {
                AutoProfiler.RegisterProfiles(assemblies);
            }
            catch (Exception ex)
            {
                //NLog logger = new NLog();
                if (ex is ReflectionTypeLoadException)
                {
                    var typeLoadException = ex as ReflectionTypeLoadException;
                    var loaderExceptions = typeLoadException.LoaderExceptions;                 
                    foreach (var loaderException in loaderExceptions)
                    {
                        Console.Out.Write("Loader Exception.", loaderException);
                        //logger.ErrorException("Loader Exception.", loaderException);
                    }
                }
                Console.Out.Write("Loader Exception.", ex);
                //logger.ErrorException("Error while running", ex);
            }
            Mapper.AssertConfigurationIsValid();
        }
    }
}
