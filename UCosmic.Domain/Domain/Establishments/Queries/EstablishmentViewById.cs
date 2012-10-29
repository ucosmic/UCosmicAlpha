using System;
using System.Linq;

namespace UCosmic.Domain.Establishments
{
    public class EstablishmentViewById : IDefineQuery<EstablishmentView>
    {
        public EstablishmentViewById(int id)
        {
            Id = id;
        }

        public int Id { get; private set; }
    }

    public class HandleEstablishmentViewByIdQuery : IHandleQueries<EstablishmentViewById, EstablishmentView>
    {
        private readonly EstablishmentViewProjector _projector;

        public HandleEstablishmentViewByIdQuery(EstablishmentViewProjector projector)
        {
            _projector = projector;
        }

        public EstablishmentView Handle(EstablishmentViewById query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var view = _projector.GetView().AsQueryable();

            return view.SingleOrDefault(x => x.Id == query.Id);
        }
    }
}