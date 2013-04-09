using System;


namespace UCosmic.Web.Mvc
{
    public static class FileSizeFormatter
    {
        public static string ToFileSize(this long size)
        {
            if (size < 1024)
            {
                return (size).ToString("F0");
            }
            if (size < Math.Pow(1024, 2))
            {
                return string.Format("{0:F0} Kb", size/1024);
            }
            if (size < Math.Pow(1024, 3))
            {
                return string.Format("{0:F0} Mb", size / Math.Pow(1024, 2));
            }
            if (size < Math.Pow(1024, 4))
            {
                return string.Format("{0:F0} Gb", size / Math.Pow(1024, 3));
            }
            if (size < Math.Pow(1024, 5))
            {
                return string.Format("{0:F0} Tb", size / Math.Pow(1024, 4));
            }
            if (size < Math.Pow(1024, 6))
            {
                return string.Format("{0:F0} Pb", size / Math.Pow(1024, 5));
            }
            return string.Format("{0:F0} Eb", size / Math.Pow(1024, 6));
        }
    }
}