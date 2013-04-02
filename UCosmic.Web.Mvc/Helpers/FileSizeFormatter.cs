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
            else if (size < Math.Pow(1024, 2))
            {
                return (size / 1024).ToString("F0") + " Kb";
            }
            else if (size < Math.Pow(1024, 3))
            {
                return (size / Math.Pow(1024, 2)).ToString("F0") + " Mb";
            }
            else if (size < Math.Pow(1024, 4))
            {
                return (size / Math.Pow(1024, 3)).ToString("F0") + " Gb";
            }
            else if (size < Math.Pow(1024, 5))
            {
                return (size / Math.Pow(1024, 4)).ToString("F0") + " Tb";
            }
            else if (size < Math.Pow(1024, 6))
            {
                return (size / Math.Pow(1024, 5)).ToString("F0") + " Pb";
            }
            else
            {
                return (size / Math.Pow(1024, 6)).ToString("F0") + " Eb";
            }
        }
    }
}