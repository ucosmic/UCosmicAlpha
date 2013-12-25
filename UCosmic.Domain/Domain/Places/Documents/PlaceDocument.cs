using Lucene.Net.Documents;
using Lucene.Net.Search;

namespace UCosmic.Domain.Places
{
    public class PlaceDocument : IDefineDocument
    {
        public PlaceDocument() { }

        internal PlaceDocument(Place entity)
        {
            PlaceId = entity.RevisionId;
            IsEarth = entity.IsEarth;
            IsContinent = entity.IsContinent;
            IsCountry = entity.IsCountry;
            OfficialName = entity.OfficialName;
        }

        internal PlaceDocument(ScoreDoc scoreDoc, Document document)
        {
            Score = scoreDoc.Score;
            PlaceId = int.Parse(document.Get(this.PropertyName(x => x.PlaceId)));
            IsEarth = bool.Parse(document.Get(this.PropertyName(x => x.IsEarth)));
            IsContinent = bool.Parse(document.Get(this.PropertyName(x => x.IsContinent)));
            IsCountry = bool.Parse(document.Get(this.PropertyName(x => x.IsCountry)));
            OfficialName = document.Get(this.PropertyName(x => x.OfficialName));
        }

        //[NumericField(Key = true, Store = StoreMode.Yes, )]
        public int PlaceId { get; set; }

        public bool IsEarth { get; set; }
        public bool IsContinent { get; set; }
        public bool IsCountry { get; set; }

        //[Field(IndexMode.NotAnalyzed)]
        public string OfficialName { get; set; }
        public string OfficialNameLower { get { return OfficialName.ToLower(); } }
        public string OfficialNameStandard { get { return OfficialName; } }

        public float Score { get; set; }
        public override string ToString()
        {
            return OfficialName;
        }
    }
}
