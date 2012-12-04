﻿using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public static class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());

#if !DEBUG
            filters.Add(new EnforceHttpsAttribute());
#endif
        }
    }
}