using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using OfficeOpenXml;
using OfficeOpenXml.Style;
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
            return Task.Factory.StartNew(() => WriteSpreadsheet(((PageOfAgreementApiFlatModel)value).Items.ToArray(), writeStream));
        }

        private static class ColumnName
        {
            internal const string Countries = "Countries";
            internal const string Type = "Type";
            internal const string Partners = "Partner(s)";
            internal const string Scope = "Scope";
            internal const string Starts = "Start Date";
            internal const string Expires = "Expiration";
            internal const string Status = "Status";
            internal const string Link = "Link";
            internal const string Description = "Description";
            internal const string Contacts = "Contacts";
        }

        private static readonly IDictionary<int, string> ColumnMap = new Dictionary<int, string>
        {
            { 1, ColumnName.Countries },
            { 2, ColumnName.Type },
            { 3, ColumnName.Partners },
            { 4, ColumnName.Scope },
            { 5, ColumnName.Starts },
            { 6, ColumnName.Expires },
            { 7, ColumnName.Status },
            { 8, ColumnName.Description },
            { 9, ColumnName.Contacts },
            { 10, ColumnName.Link },
        };

        private ExcelWorksheet _worksheet;
        private bool _isProtected;
        private bool _isPrivate;

        private void WriteSpreadsheet(AgreementApiFlatModel[] models, Stream stream)
        {
            _isProtected = models.All(x => x.ExpiresOn.HasValue);
            _isPrivate = models.All(x => !"[Private Data]".Equals(x.Status, StringComparison.OrdinalIgnoreCase));

            using (var excelPackage = new ExcelPackage())
            {
                _worksheet = excelPackage.Workbook.Worksheets.Add("Agreements");

                // note that EPPlus uses one-based indexing for cells, not zero-based.
                // so cell A1 is at row 1 column 1, not row 0 column 0
                var rowNumber = 1;

                // header row
                Cell(ColumnName.Countries).Value = ColumnName.Countries;
                Column(ColumnName.Countries).Width = 30;

                Cell(ColumnName.Type).Value = ColumnName.Type;
                Column(ColumnName.Type).Width = 40;

                Cell(ColumnName.Partners).Value = ColumnName.Partners;
                Column(ColumnName.Partners).Width = 40;
                Column(ColumnName.Partners).Style.WrapText = true;

                Cell(ColumnName.Scope).Value = ColumnName.Scope;
                Column(ColumnName.Scope).Width = 40;
                Column(ColumnName.Scope).Style.WrapText = true;

                Cell(ColumnName.Starts).Value = ColumnName.Starts;
                Column(ColumnName.Starts).Style.Numberformat.Format = "yyyy-dd-mm";
                Column(ColumnName.Starts).Width = 12;
                Column(ColumnName.Starts).Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                if (_isProtected)
                {
                    Cell(ColumnName.Expires).Value = ColumnName.Expires;
                    Column(ColumnName.Expires).Style.Numberformat.Format = "yyyy-dd-mm";
                    Column(ColumnName.Expires).Width = 12;
                    Column(ColumnName.Expires).Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                }

                if (_isPrivate)
                {
                    Cell(ColumnName.Status).Value = ColumnName.Status;
                    Column(ColumnName.Status).Width = 15;
                }

                Cell(ColumnName.Description).Value = ColumnName.Description;
                Column(ColumnName.Description).Width = 40;

                Cell(ColumnName.Contacts).Value = ColumnName.Contacts;
                Column(ColumnName.Contacts).Width = 30;

                Cell(ColumnName.Link).Value = ColumnName.Link;
                Column(ColumnName.Link).Width = 20;
                
                _worksheet.Row(rowNumber).Style.Font.Bold = true;
                _worksheet.Cells.Style.VerticalAlignment = 0;
                ++rowNumber;

                foreach (var model in models)
                {
                    Cell(ColumnName.Countries, rowNumber).Value = model.CountryNames ?? "[Unknown]";
                    Cell(ColumnName.Type, rowNumber).Value = model.Type;

                    var partners = model.Participants.Where(x => !x.IsOwner).ToArray();
                    var partnersText = "";
                    foreach (var partner in partners)
                    {
                        partnersText += partner.EstablishmentTranslatedName;
                        if (partner != partners.Last()) partnersText += "\r\n";
                    }
                    Cell(ColumnName.Partners, rowNumber).Value = partnersText;

                    var scope = model.Participants.Where(x => x.IsOwner).ToArray();
                    var scopeText = "";
                    foreach (var participant in scope)
                    {
                        scopeText += participant.EstablishmentTranslatedName;
                        if (participant != scope.Last()) scopeText += "\r\n";
                    }
                    Cell(ColumnName.Scope, rowNumber).Value = scopeText;

                    Cell(ColumnName.Starts, rowNumber).Value = model.StartsOn;

                    if (_isProtected)
                        Cell(ColumnName.Expires, rowNumber).Value = model.ExpiresOn;

                    if (_isPrivate)
                        Cell(ColumnName.Status, rowNumber).Value = model.Status;

                    Cell(ColumnName.Description, rowNumber).Value = model.Description ?? "[None]";
                    Cell(ColumnName.Contacts, rowNumber).Value = model.Contacts ?? "[Unknown]";

                    var url = string.Format("https://alpha.ucosmic.com/agreements/{0}", model.Id);
                    Cell(ColumnName.Link, rowNumber).Value = url;
                    Cell(ColumnName.Link, rowNumber).Hyperlink = new Uri(url);
                    Cell(ColumnName.Link, rowNumber).Style.Font.Color.SetColor(Color.FromArgb(255, 0, 0, 255));
                    Cell(ColumnName.Link, rowNumber).Style.Font.UnderLine = true;
                    //Cell(ColumnName.Link, rowNumber).Formula = string.Format("HYPERLINK(\"https://alpha.ucosmic.com/agreements/{0}\")", model.Id);


                    ++rowNumber;
                }

                _worksheet.View.FreezePanes(2, 1);

                var bytes = excelPackage.GetAsByteArray();
                stream.Write(bytes, 0, bytes.Length);
            }
        }

        private ExcelRange Cell(string columnName, int rowNumber = 1)
        {
            var columnNumber = ColumnMap.Single(x => x.Value == columnName).Key;
            if (!_isPrivate && columnName == ColumnName.Link)
                --columnNumber;
            if (!_isProtected && columnName == ColumnName.Link)
                --columnNumber;
            return _worksheet.Cells[rowNumber, columnNumber];
        }

        private ExcelColumn Column(string columnName)
        {
            var columnNumber = ColumnMap.Single(x => x.Value == columnName).Key;
            if (!_isPrivate && columnName == ColumnName.Link)
                --columnNumber;
            if (!_isProtected && columnName == ColumnName.Link)
                --columnNumber;
            return _worksheet.Column(columnNumber);
        }
    }
}