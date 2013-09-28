namespace UCosmic.Domain
{
    internal class EntityRanker<TEntity> where TEntity : Entity
    {
        internal int Rank { get; set; }
        internal TEntity Entity { get; set; }
    }
}