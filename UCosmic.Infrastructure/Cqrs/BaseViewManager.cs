using System;

namespace UCosmic.Cqrs
{
    public abstract class BaseViewManager
    {
         internal string ComputeKey(Type type)
         {
             return string.Format("view:{0}", type.FullName);
         }
    }
}