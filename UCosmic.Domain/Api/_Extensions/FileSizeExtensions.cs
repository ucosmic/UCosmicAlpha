using System;
using System.Text;
using UCosmic.Domain.Files;

namespace UCosmic
{
    public static class FileSizeExtensions
    {
        private const long Factor = 1024;

        public static string ToFileSize(this decimal lengthInBytes, int maxPrecision = 2, FileSizeUnitName? fileSizeUnitName = null)
        {
            if (maxPrecision < 0) throw new ArgumentOutOfRangeException("maxPrecision", "Must be greater than or equal to zero.");
            var unit = fileSizeUnitName ?? GetSmartUnitName(lengthInBytes);
            var size = lengthInBytes.ConvertBytesTo(unit);
            var precision = size.GetPrecision(maxPrecision);
            var sizeText = size.ToString(precision.GetSizeFormat());
            var unitText = unit.GetUnitText(sizeText);
            return string.Format("{0} {1}", sizeText, unitText);
        }

        public static string ToAbbreviatedFileSize(this decimal lengthInBytes, int maxPrecision = 2, FileSizeUnitAbbreviation? fileSizeUnitAbbreviation = null)
        {
            if (maxPrecision < 0) throw new ArgumentOutOfRangeException("maxPrecision", "Must be greater than or equal to zero.");
            var unit = fileSizeUnitAbbreviation ?? GetSmartUnitAbbreviation(lengthInBytes);
            var size = lengthInBytes.ConvertBytesTo(unit);
            var precision = size.GetPrecision(maxPrecision);
            var sizeText = size.ToString(precision.GetSizeFormat());
            return string.Format("{0} {1}", sizeText, unit);
        }

        public static string ToFileSize(this long lengthInBytes, int maxPrecision = 2, FileSizeUnitName? fileSizeUnitName = null)
        {
            return ((decimal) lengthInBytes).ToFileSize(maxPrecision, fileSizeUnitName);
        }

        public static string ToAbbreviatedFileSize(this long lengthInBytes, int maxPrecision = 2, FileSizeUnitAbbreviation? fileSizeUnitAbbreviation = null)
        {
            return ((decimal)lengthInBytes).ToAbbreviatedFileSize(maxPrecision, fileSizeUnitAbbreviation);
        }

        private static string GetSizeFormat(this int precision)
        {
            var sizeFormatter = new StringBuilder('0');
            if (precision > 0)
            {
                sizeFormatter.Append('.');
                for (var i = 0; i < precision; i++)
                    sizeFormatter.Append('0');
            }
            return sizeFormatter.ToString();
        }

        private static int GetPrecision(this decimal size, int maxPrecision)
        {
            var precision = 0;
            for (var i = maxPrecision; i > 0; i--)
            {
                var tenFactor = (int)Math.Pow(10, i - 1);
                if ((size * tenFactor) % 1 == 0) continue;
                precision = i;
                break;
            }
            return precision;
        }

        private static decimal ConvertBytesTo(this decimal lengthInBytes, FileSizeUnitName unitName)
        {
            switch (unitName)
            {
                case FileSizeUnitName.Byte: return lengthInBytes;
                case FileSizeUnitName.Kilobyte: return lengthInBytes / Factor;
                case FileSizeUnitName.Megabyte: return lengthInBytes / Factor / Factor;
                case FileSizeUnitName.Gigabyte: return lengthInBytes / Factor / Factor / Factor;
                case FileSizeUnitName.Terabyte: return lengthInBytes / Factor / Factor / Factor / Factor;
                case FileSizeUnitName.Petabyte: return lengthInBytes / Factor / Factor / Factor / Factor / Factor;
                default:
                    return lengthInBytes / Factor / Factor / Factor / Factor / Factor / Factor;
            }
        }

        private static decimal ConvertBytesTo(this decimal lengthInBytes, FileSizeUnitAbbreviation unitAbbreviation)
        {
            switch (unitAbbreviation)
            {
                case FileSizeUnitAbbreviation.B: return lengthInBytes;
                case FileSizeUnitAbbreviation.Kb: return lengthInBytes / Factor;
                case FileSizeUnitAbbreviation.Mb: return lengthInBytes / Factor / Factor;
                case FileSizeUnitAbbreviation.Gb: return lengthInBytes / Factor / Factor / Factor;
                case FileSizeUnitAbbreviation.Tb: return lengthInBytes / Factor / Factor / Factor / Factor;
                case FileSizeUnitAbbreviation.Pb: return lengthInBytes / Factor / Factor / Factor / Factor / Factor;
                default: return lengthInBytes / Factor / Factor / Factor / Factor / Factor / Factor;
            }
        }

        private static FileSizeUnitName GetSmartUnitName(this decimal lengthInBytes)
        {
            if (lengthInBytes < Factor) return FileSizeUnitName.Byte;
            if (lengthInBytes < Factor * Factor) return FileSizeUnitName.Kilobyte;
            if (lengthInBytes < Factor * Factor * Factor) return FileSizeUnitName.Megabyte;
            if (lengthInBytes < Factor * Factor * Factor * Factor) return FileSizeUnitName.Gigabyte;
            if (lengthInBytes < Factor * Factor * Factor * Factor * Factor) return FileSizeUnitName.Terabyte;
            if (lengthInBytes < Factor * Factor * Factor * Factor * Factor * Factor) return FileSizeUnitName.Petabyte;
            return FileSizeUnitName.Exabyte;
        }

        private static FileSizeUnitAbbreviation GetSmartUnitAbbreviation(this decimal lengthInBytes)
        {
            if (lengthInBytes < Factor) return FileSizeUnitAbbreviation.B;
            if (lengthInBytes < Factor * Factor) return FileSizeUnitAbbreviation.Kb;
            if (lengthInBytes < Factor * Factor * Factor) return FileSizeUnitAbbreviation.Mb;
            if (lengthInBytes < Factor * Factor * Factor * Factor) return FileSizeUnitAbbreviation.Gb;
            if (lengthInBytes < Factor * Factor * Factor * Factor * Factor) return FileSizeUnitAbbreviation.Tb;
            if (lengthInBytes < Factor * Factor * Factor * Factor * Factor * Factor) return FileSizeUnitAbbreviation.Pb;
            return FileSizeUnitAbbreviation.Eb;
        }

        private static string GetUnitText(this FileSizeUnitName unit, string sizeText)
        {
            return sizeText == "1" ? unit.ToString() : string.Format("{0}s", unit);
        }

        //public static string ToFileSize(this long size)
        //{
        //    if (size < 1024)
        //    {
        //        return (size).ToString("F0");
        //    }
        //    if (size < Math.Pow(1024, 2))
        //    {
        //        return string.Format("{0:F0} KB", size/1024);
        //    }
        //    if (size < Math.Pow(1024, 3))
        //    {
        //        return string.Format("{0:F0} MB", size / Math.Pow(1024, 2));
        //    }
        //    if (size < Math.Pow(1024, 4))
        //    {
        //        return string.Format("{0:F0} GB", size / Math.Pow(1024, 3));
        //    }
        //    if (size < Math.Pow(1024, 5))
        //    {
        //        return string.Format("{0:F0} TB", size / Math.Pow(1024, 4));
        //    }
        //    if (size < Math.Pow(1024, 6))
        //    {
        //        return string.Format("{0:F0} PB", size / Math.Pow(1024, 5));
        //    }
        //    return string.Format("{0:F0} EB", size / Math.Pow(1024, 6));
        //}
    }
}