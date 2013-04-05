using System;
using System.Linq;

namespace UCosmic.Domain.Files
{
    public class ImageByName : BaseEntityQuery<Image>, IDefineQuery<Image>
    {
        public string Name { get; private set; }

        public ImageByName(string inName)
        {
            if (String.IsNullOrEmpty(inName)) throw new ArgumentNullException("inName");
            Name = inName;
        }
    }

    public class HandleImageBySourceIdQuery : IHandleQueries<ImageByName, Image>
    {
        private readonly IQueryEntities _entities;

        public HandleImageBySourceIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Image Handle(ImageByName query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Image>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(i => i.Name == query.Name);
        }
    }
}
