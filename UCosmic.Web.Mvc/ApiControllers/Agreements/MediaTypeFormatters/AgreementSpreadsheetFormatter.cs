using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using OfficeOpenXml;
using UCosmic.Web.Mvc.Models;

namespace UCosmic.Web.Mvc.ApiControllers
{
    public class AgreementSpreadsheetFormatter : MediaTypeFormatter
    {
        public AgreementSpreadsheetFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("multipart/form-data"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/octet-stream"));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/vnd.ms-excel")); // xls
        }

        public override bool CanReadType(Type type)
        {
            return false;
        }

        public override bool CanWriteType(Type type)
        {
            return type == typeof(PageOfAgreementApiFlatModel);
        }

        public override Task WriteToStreamAsync(Type type, object value, Stream writeStream, HttpContent content, TransportContext transportContext)
        {
            //return base.WriteToStreamAsync(type, value, writeStream, content, transportContext);
            return Task.Factory.StartNew(() => WriteSpreadsheet((PageOfAgreementApiFlatModel)value, writeStream));
        }

        private void WriteSpreadsheet(PageOfAgreementApiFlatModel model, Stream stream)
        {
            using (ExcelPackage excelPackage = new ExcelPackage())
            {
                var ws = excelPackage.Workbook.Worksheets.Add("Agreements");

                var items = model.Items.ToArray();
                var i = 0;
                foreach (var item in items)
                {
                    var row = ws.Row(i);
                    ws.Cells[i + 1, 1].Value = "asdf";
                    ++i;
                }

                var bytes = excelPackage.GetAsByteArray();
                stream.Write(bytes, 0, bytes.Length);
            }
        }
    }
}