namespace UCosmic
{
    public interface IManageViews
    {
        TView Get<TView>(params object[] parameters);
        void Set<TView>(object value, params object[] parameters);
    }
}