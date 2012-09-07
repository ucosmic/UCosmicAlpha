using System;

namespace UCosmic.Cache
{
    public interface IProvideCache
    {
        bool Contains(string key);
        object Get(string key);
        void Add(string key, object value, TimeSpan timeout);
    }
}