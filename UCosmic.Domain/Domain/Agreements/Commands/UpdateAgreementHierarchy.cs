using System;
using System.Collections.Generic;
using System.Linq;

namespace UCosmic.Domain.Agreements
{
    public class UpdateAgreementHierarchy
    {
        public UpdateAgreementHierarchy(Agreement agreement)
        {
            if (agreement == null) throw new ArgumentNullException("agreement");
            Agreement = agreement;
        }

        public Agreement Agreement { get; private set; }
    }

    public class HandleUpdateAgreementHierarchyCommand : IHandleCommands<UpdateAgreementHierarchy>
    {
        private readonly ICommandEntities _entities;

        public HandleUpdateAgreementHierarchyCommand(ICommandEntities entities)
        {
            _entities = entities;
        }

        // when creating a new agreement, there will be no children.
        // however, there may be an umbrella and other ancestors.
        // each ancestor must have its offspring and children updated.
        // when changing an existing agreement, there may be ancestors and offspring.
        // however, they only change when the agreement's umbrella has changed.
        // each ancestor in the old tree must have its offspring and children updated.
        // each ancestor and offspring in the new tree must have its offspring and ancestors updated.
        public void Handle(UpdateAgreementHierarchy command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var umbrella = command.Agreement;
            while (umbrella.Umbrella != null)
                umbrella = umbrella.Umbrella;

            ClearNodesRecursive(umbrella);
            BuildNodesRecursive(umbrella);
        }

        private void ClearNodesRecursive(Agreement umbrella)
        {
            // ensure that the offspring and children properties are not null
            umbrella.Offspring = umbrella.Offspring ?? new List<AgreementNode>();
            umbrella.Children = umbrella.Children ?? new List<Agreement>();

            // delete all of this umbrella's offspring nodes
            while (umbrella.Offspring.FirstOrDefault() != null)
                _entities.Purge(umbrella.Offspring.First());

            // operate recursively over children
            foreach (var child in umbrella.Children)
            {
                // ensure that the child's ancestor nodes are not null
                child.Ancestors = child.Ancestors ?? new List<AgreementNode>();

                // delete each of the child's ancestor nodes
                while (child.Ancestors.FirstOrDefault() != null)
                    _entities.Purge(child.Ancestors.First());

                // run this method again on the child
                ClearNodesRecursive(child);
            }
        }

        private static void BuildNodesRecursive(Agreement umbrella)
        {
            // operate recursively over children
            foreach (var child in umbrella.Children)
            {
                // create & add ancestor node for this child
                var node = new AgreementNode
                {
                    Ancestor = umbrella,
                    Offspring = child,
                    Separation = 1,
                };
                child.Ancestors.Add(node);

                // ensure the umbrella's ancestors nodes are not null
                umbrella.Ancestors = umbrella.Ancestors ?? new List<AgreementNode>();

                // loop over the umbrella's ancestors
                foreach (var ancestor in umbrella.Ancestors)
                {
                    // create & add ancestor node for this child
                    node = new AgreementNode
                    {
                        Ancestor = ancestor.Ancestor,
                        Offspring = child,
                        Separation = ancestor.Separation + 1,
                    };
                    child.Ancestors.Add(node);
                }

                // run this method again on the child
                BuildNodesRecursive(child);
            }
        }
    }
}
