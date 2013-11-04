using System.Threading;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Employees
{
    public class EmployeeActivityCountsViewProjector
    {
        private static readonly ReaderWriterLockSlim Lock = new ReaderWriterLockSlim();
        private readonly IProcessQueries _queries;
        private readonly IManageViews _views;

        public EmployeeActivityCountsViewProjector(IProcessQueries queries
            , IManageViews views
        )
        {
            _queries = queries;
            _views = views;
        }

        public EmployeeActivityCountsView Get(string domain)
        {
            var establishment = _queries.Execute(new EstablishmentByDomain(domain));
            return establishment != null
                ? Get(establishment.RevisionId) : null;
        }

        public EmployeeActivityCountsView Get(int establishmentId)
        {
            Lock.EnterReadLock();
            try
            {
                var view = _views.Get<EmployeeActivityCountsView>(establishmentId);
                return view ?? new EmployeeActivityCountsView
                {
                    EstablishmentId = establishmentId,
                };
            }
            finally
            {
                Lock.ExitReadLock();
            }
        }

        internal void Set(EmployeeActivityCountsView view, int establishmentId)
        {
            Lock.EnterWriteLock();
            try
            {
                _views.Set<EmployeeActivityCountsView>(view, establishmentId);
            }
            finally
            {
                Lock.ExitWriteLock();
            }
        }
    }
}