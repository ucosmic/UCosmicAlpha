namespace UCosmic.Domain.Files
{
    public class LoadableFileBinary : Entity
    {
        protected internal LoadableFileBinary()
        {
        }

        public int Id { get; set; }
        public virtual LoadableFile Owner { get; protected internal set; }
        public byte[] Content { get; protected internal set; }
    }
}