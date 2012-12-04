using System.Web.Mvc;

namespace UCosmic.Web.Mvc
{
    public static class TempDataExtensions
    {
        public static void Flash(this TempDataDictionary tempData, string message)
        {
            const string key = "Flasher";
            if (tempData.ContainsKey(key)) tempData[key] = message;
            else tempData.Add(key, message);
        }
    }
}