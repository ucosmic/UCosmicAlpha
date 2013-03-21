using System;
using System.Drawing;

namespace UCosmic.Domain.Images
{
    public class Image : Entity
    {
        protected internal Image()
        {
        }

        public int Id { get; protected set; }
        public string SourceId { get; protected internal set; }  
        public byte[] Data { get; protected internal set; }
    }

}