using System;
using System.Diagnostics;
using System.Web;
using UCosmic.Domain.Activities;

namespace UCosmic.Web.Mvc
{
    public static class SessionExtensions
    {
        private const string LastActivityLensKey = "LastActivityLens";

        public static void LastActivityLens(this HttpSessionStateBase session, HttpRequestBase request)
        {
            if (session == null) throw new ArgumentNullException("session");
            Debug.Assert(request.Url != null);
            session[LastActivityLensKey] = request.Url.PathAndQuery;
        }

        public static string LastActivityLens(this HttpSessionStateBase session)
        {
            if (session == null) throw new ArgumentNullException("session");
            return session[LastActivityLensKey] as string ?? "";
        }

        private const string LastEmployeeLensKey = "LastEmployeeLens";

        public static void LastEmployeeLens(this HttpSessionStateBase session, HttpRequestBase request)
        {
            if (session == null) throw new ArgumentNullException("session");
            Debug.Assert(request.Url != null);
            session[LastEmployeeLensKey] = request.Url.PathAndQuery;
        }

        public static string LastEmployeeLens(this HttpSessionStateBase session)
        {
            if (session == null) throw new ArgumentNullException("session");
            return session[LastEmployeeLensKey] as string ?? "";
        }
    }
}