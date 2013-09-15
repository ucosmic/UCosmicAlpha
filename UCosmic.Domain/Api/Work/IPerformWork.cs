namespace UCosmic
{
    public interface IPerformWork<in TJob> where TJob : IDefineWork
    {
        void Perform(TJob job);
    }
}
