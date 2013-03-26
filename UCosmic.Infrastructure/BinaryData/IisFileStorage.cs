using System;
using System.IO;
using System.Linq;
using System.Web.Hosting;

namespace UCosmic.BinaryData
{
    // stores binary data as files on the local filesystem
    public class IisFileStorage : IStoreBinaryData
    {
        private static string Root
        {
            // store all binary data in App_Data subdirectory
            get { return HostingEnvironment.MapPath("~/App_Data/binary-data"); }
        }

        private static string GetFullPath(string relativePath)
        {
            // combine root with relative path for System.IO usage
            return Path.Combine(Root, relativePath);
        }

        public bool Exists(string path)
        {
            // this does not work for directories, only files
            var fullPath = GetFullPath(path);
            var exists = File.Exists(fullPath);
            return exists;
        }

        public void Put(string path, byte[] data, bool overwrite = false)
        {
            // disallow file replacement unless specified in method invocation
            if (!overwrite && Exists(path))
                throw new InvalidOperationException(string.Format(
                    "A file already exists at the path '{0}'. To overwrite this file, invoke this method with overwrite == true.", path));

            // create directories if they do not already exist
            var fullPath = GetFullPath(path);
            var directoryToCheck = "";
            var directories = fullPath.Split(new[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries).ToList();
            directories.Remove(directories.Last()); // last element will be the file name, not a directory
            foreach (var directory in directories)
            {
                directoryToCheck = directoryToCheck != ""
                    ? string.Format("{0}/{1}", directoryToCheck, directory)
                    : directory;
                if (!Directory.Exists(directoryToCheck))
                    Directory.CreateDirectory(directoryToCheck);
            }

            // create the file
            using (var fileStream = File.Create(fullPath))
            {
                try
                {
                    fileStream.Write(data, 0, data.Length);
                }
                finally
                {
                    fileStream.Close();
                }
            }
        }

        public byte[] Get(string path)
        {
            var fullPath = GetFullPath(path);

            // return null when file does not exist
            if (!Exists(path)) return null;

            var data = File.ReadAllBytes(fullPath);
            return data;
        }

        public void Delete(string path)
        {
            // do nothing unless file exists
            var fullPath = GetFullPath(path);
            if (!Exists(path)) return;

            File.Delete(fullPath);
        }
    }
}
