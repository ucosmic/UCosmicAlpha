using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Places
{
    public class EnsurePlaceHierarchies
    {
        internal EnsurePlaceHierarchies()
        {
            EnsuredPlaceNames = new Dictionary<int, string>();
        }

        internal IDictionary<int, string> EnsuredPlaceNames { get; set; }

        public class HandleEnsurePlaceHierarchiesCommand : IHandleCommands<EnsurePlaceHierarchies>
        {
            private readonly ICommandEntities _entities;
            private readonly IHandleCommands<EnsurePlaceHierarchy> _hierarchy;

            public HandleEnsurePlaceHierarchiesCommand(ICommandEntities entities
                , IHandleCommands<EnsurePlaceHierarchy> hierarchy
            )
            {
                _entities = entities;
                _hierarchy = hierarchy;
            }

            public void Handle(EnsurePlaceHierarchies command)
            {
                if (command == null) throw new ArgumentNullException("command");

                var queryable = _entities.Get<Place>()
                    .EagerLoad(_entities, new Expression<Func<Place, object>>[]
                    {
                        x => x.Parent.Ancestors.Select(y => y.Ancestor),
                        x => x.Ancestors.Select(y => y.Ancestor),
                    })
                    .Where(x => x.Parent != null)
                    .Where(x => x.Ancestors.Count <= x.Parent.Ancestors.Count // place should always have more ancestors than its parent
                        || !x.Ancestors.Select(y => y.AncestorId).Contains(x.ParentId.Value) // place ancestors should always contain the parent
                        // place should have 1 more ancestor than its closest ancestor does
                        || x.Ancestors.Count != x.Ancestors.OrderBy(y => y.Separation).FirstOrDefault().Ancestor.Ancestors.Count + 1)
                    .OrderBy(x => x.Ancestors.Count)
                ;
                //var placesFixed = new List<Place>();
                while (queryable.Any())
                {
                    var howMany = queryable.Count();
                    if (howMany < 1) break;
                    var place = queryable.First();
                    if (!command.EnsuredPlaceNames.ContainsKey(place.RevisionId))
                        command.EnsuredPlaceNames.Add(place.RevisionId, place.OfficialName);
                    _hierarchy.Handle(new EnsurePlaceHierarchy(place));
                    //placesFixed.Add(place);
                    _entities.SaveChanges();
                }
                //var names = placesFixed.Select(x => x.OfficialName).ToArray();
            }
        }
    }
}
