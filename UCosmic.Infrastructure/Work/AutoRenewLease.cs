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
        private Timer _renewalTimer;
        private bool _isRenewing = true;
        private bool _disposed;

        public bool HasLease { get { return LeaseId != null; } }

        public AutoRenewLease(CloudBlockBlob blob)
        {
            _blob = blob;

            // acquire lease
            LeaseId = blob.TryAcquireLease(TimeSpan.FromSeconds(60));
            if (!HasLease) return;

            // keep renewing lease
            var fortySeconds = TimeSpan.FromSeconds(40);
            _renewalTimer = new Timer(x =>
            {
                if (_isRenewing)
                    blob.RenewLease(AccessCondition.GenerateLeaseCondition(LeaseId));
            }, null, fortySeconds, fortySeconds);
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

        private void Dispose(bool disposing)
        {
            if (_disposed) return;
            if (disposing && _renewalTimer != null)
            {
                _isRenewing = false;
                _renewalTimer.Dispose();
                _blob.ReleaseLease(AccessCondition.GenerateLeaseCondition(LeaseId));
                _renewalTimer = null;
            }
            _disposed = true;
        }
    }
}
