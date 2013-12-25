using System;
using Lucene.Net.Store;

namespace UCosmic
{
    public interface IStoreDocumentIndexes
    {
        Directory GetDirectory(Type documentType);
        Directory GetDirectory<TDocument>() where TDocument : IDefineDocument;
    }
}
