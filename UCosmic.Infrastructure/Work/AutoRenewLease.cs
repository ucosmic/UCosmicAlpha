using System;
using System.Net;
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
        private bool _disposed;

        public bool HasLease { get { return LeaseId != null; } }

        public AutoRenewLease(CloudBlockBlob blob)
        {
            _blob = blob;

            // create the container if it doesn't exist
            blob.Container.CreateIfNotExists();

            // create the blob if it doesn't exist
            try
            {
                var accessCondition = AccessCondition.GenerateIfNoneMatchCondition("*");
                blob.UploadFromByteArray(new byte[0], 0, 0, accessCondition);
            }
            catch (StorageException ex)
            {
                var webException = ex.InnerException as WebException;
                if (webException == null || webException.Response == null
                    || ((HttpWebResponse)webException.Response).StatusCode != HttpStatusCode.Conflict
                    || ((HttpWebResponse)webException.Response).StatusDescription != "The specified blob already exists.")
                    throw;
            }

            // acquire lease
            LeaseId = blob.TryAcquireLease(TimeSpan.FromSeconds(60));
            if (!HasLease) return;

            // keep renewing lease
            // ReSharper disable FunctionNeverReturns
            _renewalThread = new Thread(() =>
            {
                while (true)
                {
                    Thread.Sleep(TimeSpan.FromSeconds(40.0));
                    blob.RenewLease(AccessCondition.GenerateLeaseCondition(LeaseId));
                }
            });
            // ReSharper restore FunctionNeverReturns
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
                _renewalThread.Abort();
                _blob.ReleaseLease(AccessCondition.GenerateLeaseCondition(LeaseId));
                _renewalThread = null;
            }
            _disposed = true;
        }
    }
}
