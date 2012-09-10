using System.Collections.Generic;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentView
    {
        public int RevisionId { get; set; }
        public string OfficialName { get; set; }
        public string WebsiteUrl { get; set; }
        public IEnumerable<EstablishmentNameView> Names { get; set; }
        public IEnumerable<EstablishmentUrlView> Urls { get; set; }
    }

    public class EstablishmentNameView
    {
        public string Text { get; set; }
        public string AsciiEquivalent { get; set; }
    }

    public class EstablishmentUrlView
    {
        public string Value { get; set; }
    }
}
