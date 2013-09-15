using System;
using System.Net;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace UCosmic
{
    internal static class BlobLeaseExtensions
    {
        internal static string TryAcquireLease(this CloudBlockBlob blob, TimeSpan? leaseTime = null)
        {
            try
            {
                return blob.AcquireLease(leaseTime);
            }
            catch (StorageException storageException)
            {
                var webException = storageException.InnerException as WebException;
                if (webException == null || webException.Response == null
                    || ((HttpWebResponse)webException.Response).StatusCode != HttpStatusCode.Conflict)
                    throw;

                webException.Response.Close();
                return null;
            }
        }

        internal static string AcquireLease(this CloudBlockBlob blob, TimeSpan? leaseTime = null)
        {
            leaseTime = leaseTime ?? TimeSpan.FromSeconds(60);
            return blob.AcquireLease(leaseTime.Value, null);
        }
    }
}