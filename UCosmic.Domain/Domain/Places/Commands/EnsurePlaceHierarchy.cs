using System;
using System.Collections.ObjectModel;
using System.Linq;

namespace UCosmic.Domain.Places
{
    public class EnsurePlaceHierarchy
    {
        internal EnsurePlaceHierarchy(Place place)
        {
            if (place == null) throw new ArgumentNullException("place");
            Place = place;
        }

        internal Place Place { get; private set; }
    }

    public class HandleEnsurePlaceHierarchyCommand : IHandleCommands<EnsurePlaceHierarchy>
    {
        private readonly ICommandEntities _entities;

        public HandleEnsurePlaceHierarchyCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Handle(EnsurePlaceHierarchy command)
        {
            if (command == null) throw new ArgumentNullException("command");

            // when place is transient, its parent or any ancestors may also be transient
            var isTransient = command.Place.RevisionId == default(int);
            var oldAncestors = new Collection<PlaceNode>(command.Place.Ancestors.ToArray());
            var newAncestors = new Collection<PlaceNode>();
            var addAncestors = new Collection<PlaceNode>();
            var separation = 1;
            var parent = command.Place.Parent;
            while (parent != null)
            {
                // create the node to reference its foreign keys
                var entity = new PlaceNode
                {
                    Ancestor = parent,
                    Offspring = command.Place,
                    Separation = separation,
                };
                if (!isTransient)
                {
                    entity.AncestorId = parent.RevisionId;
                    entity.OffspringId = command.Place.RevisionId;
                }
                newAncestors.Add(entity); // hang onto the ancestor node

                // does this ancestor already exist?
                var ancestor = isTransient
                    ? command.Place.Ancestors.FirstOrDefault(x => ReferenceEquals(x.Ancestor, parent))
                    : command.Place.Ancestors.FirstOrDefault(x => x.AncestorId == parent.RevisionId);
                if (ancestor != null) // yes this ancestor is already present
                {
                    ancestor.Separation = separation;
                }
                else
                {
                    addAncestors.Add(entity);
                    _entities.Create(entity);
                }
                ++separation;
                parent = parent.Parent;
            }

            // any ancestors to delete?
            var ancestorsToDelete = isTransient
                ? oldAncestors.Where(x => !newAncestors.Select(y => y.Ancestor).Contains(x.Ancestor)).ToArray()
                : oldAncestors.Where(x => !newAncestors.Select(y => y.AncestorId).Contains(x.AncestorId)).ToArray();
            if (ancestorsToDelete.Any())
                foreach (var ancestorToDelete in ancestorsToDelete)
                {
                    _entities.Purge(ancestorToDelete);
                }
        }
    }
}
