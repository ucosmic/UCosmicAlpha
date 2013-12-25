using Lucene.Net.Search;

namespace UCosmic
{
    public interface IProvideDocumentSearchers
    {
        //IndexSearcher Acquire(Type documentType);
        IndexSearcher Acquire<TDocument>() where TDocument : IDefineDocument;
        void Release(IndexSearcher searcher);
    }
}