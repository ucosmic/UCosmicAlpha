using System;
using System.Threading;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace UCosmic.Work
{
    public class AutoRenewLease : IDisposable
    {
        private readonly CloudBlockBlob _blob;
        public readonly string LeaseId;
        private Thread _renewalThread;
        private volatile bool _isRenewing = true;
        private bool _disposed;

        public bool HasLease { get { return LeaseId != null; } }

        public AutoRenewLease(CloudBlockBlob blob)
        {
            _blob = blob;

            // acquire lease
            LeaseId = blob.TryAcquireLease(TimeSpan.FromSeconds(60));
            if (!HasLease) return;

            // keep renewing lease
            _renewalThread = new Thread(() =>
            {
                try
                {
                    while (_isRenewing)
                    {
                        Thread.Sleep(TimeSpan.FromSeconds(40.0));
                        if (_isRenewing)
                            blob.RenewLease(AccessCondition.GenerateLeaseCondition(LeaseId));
                    }
                }
                // ReSharper disable EmptyGeneralCatchClause
                catch { }
                // ReSharper restore EmptyGeneralCatchClause
            });
            _renewalThread.Start();
        }

        ~AutoRenewLease()
        {
            Dispose(false);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (_disposed) return;
            if (disposing && _renewalThread != null)
            {
                //_renewalThread.Abort();
                _isRenewing = false;
                _blob.ReleaseLease(AccessCondition.GenerateLeaseCondition(LeaseId));
                _renewalThread = null;
            }
            _disposed = true;
        }
    }
}
