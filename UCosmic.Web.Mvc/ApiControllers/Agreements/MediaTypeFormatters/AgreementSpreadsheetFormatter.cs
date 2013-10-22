using System;
using System.Collections.Generic;
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
            return Task.Factory.StartNew(() => WriteSpreadsheet(((PageOfAgreementApiFlatModel)value).Items, writeStream));
        }

        private void WriteSpreadsheet(IEnumerable<AgreementApiFlatModel> models, Stream stream)
        {
            using (var excelPackage = new ExcelPackage())
            {
                var worksheet = excelPackage.Workbook.Worksheets.Add("Agreements");

                // note that EPPlus uses one-based indexing for cells, not zero-based.
                // so cell A1 is at row 1 column 1, not row 0 column 0
                var rowNumber = 1;

                // header row
                worksheet.Cells[rowNumber, 1].Value = "Type";
                worksheet.Column(1).Width = 40;

                worksheet.Cells[rowNumber, 2].Value = "Partner(s)";
                worksheet.Column(2).Width = 40;
                worksheet.Column(2).Style.WrapText = true;

                worksheet.Cells[rowNumber, 3].Value = "Scope";
                worksheet.Column(3).Width = 40;
                worksheet.Column(3).Style.WrapText = true;

                worksheet.Row(rowNumber).Style.Font.Bold = true;
                worksheet.Cells.Style.VerticalAlignment = 0;
                ++rowNumber;

                foreach (var model in models)
                {
                    worksheet.Cells[rowNumber, 1].Value = model.Type;

                    var partners = model.Participants.Where(x => !x.IsOwner).ToArray();
                    var partnersText = "";
                    foreach (var partner in partners)
                    {
                        partnersText += partner.EstablishmentTranslatedName;
                        if (partner != partners.Last()) partnersText += "\r\n";
                    }
                    worksheet.Cells[rowNumber, 2].Value = partnersText;

                    var scope = model.Participants.Where(x => x.IsOwner).ToArray();
                    var scopeText = "";
                    foreach (var participant in scope)
                    {
                        scopeText += participant.EstablishmentTranslatedName;
                        if (participant != scope.Last()) scopeText += "\r\n";
                    }
                    worksheet.Cells[rowNumber, 3].Value = scopeText;

                    ++rowNumber;
                }

                worksheet.View.FreezePanes(2, 1);

                var bytes = excelPackage.GetAsByteArray();
                stream.Write(bytes, 0, bytes.Length);
            }
        }
    }
}