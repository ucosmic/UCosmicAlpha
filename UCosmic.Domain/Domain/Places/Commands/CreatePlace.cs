using System;
using System.Linq;
using FluentValidation;

namespace UCosmic.Domain.Places
{
    public class CreatePlace
    {
        public string OfficialName { get; set; }
        public int? ParentId { get; set; }
        public bool IsWater { get; set; }
        public bool IsRegion { get; set; }
        public Place Created { get; internal set; }
    }

    public class ValidateCreatePlaceCommand : AbstractValidator<CreatePlace>
    {
        public ValidateCreatePlaceCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // check parent existence
            When(x => x.ParentId.HasValue, () =>
                RuleFor(x => x.ParentId.Value)
                    .MustFindPlaceById(entities)
            );

            // TODO
            // official name duplicates
        }
    }

    public class HandleCreatePlaceCommand : IHandleCommands<CreatePlace>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<EnsurePlaceHierarchy> _hierarchy;

        public HandleCreatePlaceCommand(ICommandEntities entities
            , IHandleCommands<EnsurePlaceHierarchy> hierarchy
        )
        {
            _entities = entities;
            _hierarchy = hierarchy;
        }

        public void Handle(CreatePlace command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var parent = command.ParentId.HasValue
                ? _entities.Get<Place>().Single(x => x.RevisionId == command.ParentId.Value) : null;
            var entity = new Place
            {
                OfficialName = command.OfficialName,
                ParentId = command.ParentId,
                Parent = parent,
                IsWater = command.IsWater,
                IsRegion = command.IsRegion,
            };
            _entities.Create(entity);
            _hierarchy.Handle(new EnsurePlaceHierarchy(entity));
            _entities.SaveChanges();
            command.Created = _entities.Query<Place>().Single(x => x.RevisionId == entity.RevisionId);
        }
    }
}
