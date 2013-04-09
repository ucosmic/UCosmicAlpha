using System.Linq;
using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public static class TempDataExtensions
    {
        private const string FlasherKey = "Flasher";

        public static string Flash(this TempDataDictionary tempData)
        {
            var message = tempData[FlasherKey] as string;
            return message ?? "";
        }

        public static void Flash(this TempDataDictionary tempData, string messageFormat, params object[] messageArguments)
        {
            var message = messageArguments != null && messageArguments.Any()
                ? string.Format(messageFormat, messageArguments)
                : messageFormat;

            if (tempData.ContainsKey(FlasherKey)) tempData[FlasherKey] = message;
            else tempData.Add(FlasherKey, message);
        }
    }
}