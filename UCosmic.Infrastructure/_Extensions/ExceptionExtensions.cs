using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;

namespace UCosmic
{
    internal static class ExceptionExtensions
    {
        private static readonly IEnumerable<Func<Exception, bool>> RetryableExceptionPredicates = new Func<Exception, bool>[]
        {
            x => x is DbException && x.Message.Contains("deadlock"),
            x => x is SqlException && x.Message.StartsWith("Violation of UNIQUE KEY constraint"),
        };

        internal static bool IsRetryable(this Exception exception)
        {
            while (exception != null)
            {
                if (RetryableExceptionPredicates.Any(new[] { exception }.Any)) return true;
                exception = exception.InnerException;
            }

            return false;
        }
    }
}
