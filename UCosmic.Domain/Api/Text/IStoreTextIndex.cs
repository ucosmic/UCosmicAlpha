using Lucene.Net.Analysis;
using Lucene.Net.Store;
using UCosmic.Domain;

namespace UCosmic
{
    public interface IStoreTextIndices
    {
        Directory GetStore(string catalog);
        Directory GetStore<TEntity>() where TEntity : Entity ;
        Directory GetStore<TEntity, TAnalyzer>() where TEntity : Entity where TAnalyzer : Analyzer;
    }
}
