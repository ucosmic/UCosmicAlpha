using System.Collections.Generic;
using System.Linq;
using System.Threading;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Employees
{
    public class EmployeePlacesViewProjector
    {
        private static readonly ReaderWriterLockSlim Lock = new ReaderWriterLockSlim();
        private readonly IProcessQueries _queries;
        private readonly IManageViews _views;

        public EmployeePlacesViewProjector(IProcessQueries queries
            , IManageViews views
        )
        {
            _queries = queries;
            _views = views;
        }

        public IEnumerable<EmployeePlacesView> Get(string domain)
        {
            var establishment = _queries.Execute(new EstablishmentByDomain(domain));
            return establishment != null
                ? Get(establishment.RevisionId)
                : Enumerable.Empty<EmployeePlacesView>();
        }

        public IEnumerable<EmployeePlacesView> Get(int establishmentId)
        {
            Lock.EnterReadLock();
            try
            {
                var view = _views.Get<IEnumerable<EmployeePlacesView>>(establishmentId);
                return view ?? Enumerable.Empty<EmployeePlacesView>();
            }
            finally
            {
                Lock.ExitReadLock();
            }
        }

        internal void Set(IEnumerable<EmployeePlacesView> views, int establishmentId)
        {
            Lock.EnterWriteLock();
            try
            {
                _views.Set<IEnumerable<EmployeePlacesView>>(views, establishmentId);
            }
            finally
            {
                Lock.ExitWriteLock();
            }
        }
    }
}