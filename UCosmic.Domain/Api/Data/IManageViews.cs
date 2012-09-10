namespace UCosmic
{
    public interface IManageViews
    {
        TView Get<TView>();
        void Set<TView>(object value);
    }
}