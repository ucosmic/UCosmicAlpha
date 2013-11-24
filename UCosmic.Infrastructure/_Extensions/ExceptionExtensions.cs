using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Net;

namespace UCosmic
{
    internal static class ExceptionExtensions
    {
        private static readonly IEnumerable<Func<Exception, bool>> RetryableExceptionPredicates = new Func<Exception, bool>[]
        {
            x => x is DbException && x.Message.Contains("deadlock"),
            x => x is SqlException && x.Message.StartsWith("Violation of UNIQUE KEY constraint"),
            x => x is EntityException && x.Message.Equals("The underlying provider failed on Open."),
            x => x is OptimisticConcurrencyException && x.Message.Equals("Store update, insert, or delete statement affected an unexpected number of rows (0). Entities may have been modified or deleted since entities were loaded. Refresh ObjectStateManager entries."),
            x => x is TimeoutException && x.Message.Equals("The remote server returned an error: (504) Gateway Timeout."),
            x => x is DbUpdateConcurrencyException && x.Message.StartsWith("Store update, insert, or delete statement affected an unexpected number of rows (0)."),
            x => x is WebException && x.Message.StartsWith("The remote server returned an error: (500) Internal Server Error."),
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
