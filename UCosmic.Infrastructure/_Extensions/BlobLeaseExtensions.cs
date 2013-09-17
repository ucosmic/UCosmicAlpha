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
                if (storageException.HasResponse(HttpStatusCode.Conflict, "There is already a lease present."))
                    return null;
                throw;
            }
        }

        private static string AcquireLease(this CloudBlockBlob blob, TimeSpan? leaseTime = null)
        {
            leaseTime = leaseTime ?? TimeSpan.FromSeconds(60);
            return blob.AcquireLease(leaseTime.Value, null);
        }

        internal static bool HasResponse(this StorageException storageException, HttpStatusCode httpStatusCode, string httpStatusMessage)
        {
            var hasResponse = storageException.RequestInformation.HttpStatusCode == (int)httpStatusCode;
            hasResponse &= storageException.RequestInformation.HttpStatusMessage == httpStatusMessage;
            return hasResponse;
        }
    }
}