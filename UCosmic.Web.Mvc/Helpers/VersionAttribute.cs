#if !DEBUG
using System.Diagnostics;
#endif
using System.Reflection;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public class VersionAttribute : ActionFilterAttribute
    {
        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            filterContext.Controller.ViewBag.Version = Version;
        }

        private static string Version
        {
            get
            {
                if (string.IsNullOrWhiteSpace(_version))
                {
                    var assembly = Assembly.GetExecutingAssembly();
#if !DEBUG
                    // when in production, display file version
                    var fvi = FileVersionInfo.GetVersionInfo(assembly.Location);
                    _version = string.Format("{0}.{1}.{2}.{3}",
                        fvi.FileMajorPart, fvi.FileMinorPart, fvi.FileBuildPart, fvi.FilePrivatePart);
#else
                    // when debugging, display assembly version
                    _version = assembly.GetName().Version.ToString();
#endif
                }
                return _version;
            }
        }
        private static string _version;
    }
}