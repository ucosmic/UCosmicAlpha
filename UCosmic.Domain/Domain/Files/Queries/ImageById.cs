using System;
using System.Linq;

namespace UCosmic.Domain.Files
{
    public class ImageById : BaseEntityQuery<Image>, IDefineQuery<Image>
    {
        public int id { get; set; }

        public ImageById(int inId)
        {
            if (inId == 0) throw new ArgumentNullException("inId");
            id = inId;
        }
    }

    public class HandleImageByIdQuery : IHandleQueries<ImageById, Image>
    {
        private readonly IQueryEntities _entities;

        public HandleImageByIdQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public Image Handle(ImageById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            return _entities.Query<Image>()
                .EagerLoad(_entities, query.EagerLoad)
                .SingleOrDefault(i => i.Id == query.id);
        }
    }
}
