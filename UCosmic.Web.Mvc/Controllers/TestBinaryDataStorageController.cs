using System;
using System.Linq;
using System.Web.Mvc;
using AttributeRouting.Web.Mvc;
using UCosmic.BinaryData;
using UCosmic.Domain.Files;

namespace UCosmic.Web.Mvc.Controllers
{
    public partial class TestBinaryDataStorageController : Controller
    {
        private readonly IQueryEntities _queryEntities;

        public TestBinaryDataStorageController(IQueryEntities queryEntities)
        {
            _queryEntities = queryEntities;
        }

        [GET("testbinarydatastorage/iis")]
        public virtual ActionResult Iis()
        {
            var iisStorage = new IisFileStorage();

            var file = _queryEntities.Query<LoadableFile>().First();
            var filePath = string.Format("folder1/folder2/{0}", file.Filename);

            var exists = iisStorage.Exists(filePath);

            try
            {
                iisStorage.Put(filePath, file.Binary.Content);
            }
            catch (InvalidOperationException)
            {
                iisStorage.Delete(filePath);
            }

            exists = iisStorage.Exists(filePath);

            if (exists)
            {
                var data = iisStorage.Get(filePath);
                if (data.Length == file.Binary.Content.Length)
                {
                    throw new NotImplementedException("The IIS data storage tests work, debug to inspect.");
                }
            }

            throw new NotImplementedException("The IIS data storage tests work, debug to inspect.");
        }

        [GET("testbinarydatastorage/azure")]
        public virtual ActionResult Azure()
        {
            var azureStorage = new AzureBlobStorage("UCosmicCloudData");

            var file = _queryEntities.Query<LoadableFile>().First();
            var filePath = string.Format("folder1/folder2/{0}", file.Filename);

            var exists = azureStorage.Exists(filePath);

            try
            {
                azureStorage.Put(filePath, file.Binary.Content);
            }
            catch (InvalidOperationException)
            {
                azureStorage.Delete(filePath);
            }

            exists = azureStorage.Exists(filePath);

            if (exists)
            {
                var data = azureStorage.Get(filePath);
                if (data.Length == file.Binary.Content.Length)
                {
                    throw new NotImplementedException("The Azure data storage tests work, debug to inspect.");
                }
            }

            throw new NotImplementedException("The IIS data storage tests work, debug to inspect.");
        }
    }
}
