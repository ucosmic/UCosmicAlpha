namespace UCosmic
{
    public interface IManageViews
    {
        TResult Get<TResult>();
        void Set<TResult>(object value);
    }
}