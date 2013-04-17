using System;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class UpdatePlaceHierarchy
    {
        internal UpdatePlaceHierarchy(Place place)
        {
            if (place == null) throw new ArgumentNullException("place");
            Place = place;
        }

        internal Place Place { get; private set; }
    }

    public class HandleUpdatePlaceHierarchyCommand : IHandleCommands<UpdatePlaceHierarchy>
    {
        private readonly ICommandEntities _entities;

        public HandleUpdatePlaceHierarchyCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(UpdatePlaceHierarchy command)
        {
            if (command == null) throw new ArgumentNullException("command");

            command.Place.Ancestors.ToList().ForEach(node =>
                _entities.Purge(node));

            var separation = 1;
            var parent = command.Place.Parent;
            while (parent != null)
            {
                command.Place.Ancestors.Add(new PlaceNode
                {
                    Ancestor = parent,
                    Separation = separation++,
                });
                parent = parent.Parent;
            }
        }
    }
}
