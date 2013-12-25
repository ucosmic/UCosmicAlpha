namespace UCosmic
{
    public interface IIndexDocuments<TDocument> where TDocument : IDefineDocument
    {
        void Index();
    }
}