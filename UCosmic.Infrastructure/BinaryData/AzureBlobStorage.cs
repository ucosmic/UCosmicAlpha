using System;
using System.Configuration;
using System.IO;
using System.Linq;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace UCosmic.BinaryData
{
    public class AzureBlobStorage : IStoreBinaryData
    {
        private readonly ConnectionStringSettings _connectionString;
        private readonly CloudStorageAccount _storageAccount;
        private readonly CloudBlobClient _blobClient;

        public AzureBlobStorage(string connectionStringName)
        {
            _connectionString = ConfigurationManager.ConnectionStrings[connectionStringName];
            _storageAccount = CloudStorageAccount.Parse(_connectionString.ConnectionString);
            _blobClient = _storageAccount.CreateCloudBlobClient();
        }

        private string GetContainerName(string path)
        {
            var pathParts = path.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);
            return pathParts.First();
        }

        private string GetBlobName(string path)
        {
            var pathParts = path.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries).ToList();
            pathParts.Remove(pathParts.First());
            var fileName = string.Join("/", pathParts);
            return fileName;
        }

        public bool Exists(string path)
        {
            var containerName = GetContainerName(path);
            var blobName = GetBlobName(path);
            var containerReference = _blobClient.GetContainerReference(containerName);
            var blockBlobReference = containerReference.GetBlockBlobReference(blobName);

            return containerReference.Exists() && blockBlobReference.Exists();
        }

        public void Put(string path, byte[] data, bool overwrite = false)
        {
            // disallow file replacement unless specified in method invocation
            if (!overwrite && Exists(path))
                throw new InvalidOperationException(string.Format(
                    "A file already exists at the path '{0}'. To overwrite this file, invoke this method with overwrite == true.", path));

            var containerName = GetContainerName(path);
            var blobName = GetBlobName(path);

            var containerReference = _blobClient.GetContainerReference(containerName);

            containerReference.CreateIfNotExists();
            var blockBlobReference = containerReference.GetBlockBlobReference(blobName);

            using (var stream = new MemoryStream(data, 0, data.Length))
            {
                blockBlobReference.UploadFromStream(stream);
            }
        }

        public byte[] Get(string path)
        {
            var containerName = GetContainerName(path);
            var blobName = GetBlobName(path);
            var containerReference = _blobClient.GetContainerReference(containerName);
            var blockBlobReference = containerReference.GetBlockBlobReference(blobName);

            using (var stream = new MemoryStream())
            {
                blockBlobReference.DownloadToStream(stream);
                return stream.ToArray();
            }
        }

        public void Delete(string path)
        {
            var containerName = GetContainerName(path);
            var blobName = GetBlobName(path);
            var containerReference = _blobClient.GetContainerReference(containerName);
            var blockBlobReference = containerReference.GetBlockBlobReference(blobName);

            blockBlobReference.Delete();
        }
    }
}
