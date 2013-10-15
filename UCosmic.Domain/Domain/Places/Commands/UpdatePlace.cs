using System;
using System.Linq;
using FluentValidation;

namespace UCosmic.Domain.Places
{
    public class UpdatePlace
    {
        public UpdatePlace(int placeId)
        {
            PlaceId = placeId;
            ParentId = 0;
        }

        public UpdatePlace(int placeId, int? parentId)
        {
            PlaceId = placeId;
            ParentId = parentId;
        }

        public int PlaceId { get; private set; }
        public int? ParentId { get; private set; }
        public bool? IsRegion { get; set; }
        public bool? IsWater { get; set; }
    }

    public class ValidateUpdatePlaceCommand : AbstractValidator<UpdatePlace>
    {
        public ValidateUpdatePlaceCommand(IQueryEntities entities)
        {
            CascadeMode = CascadeMode.StopOnFirstFailure;

            // id must be within valid range and exist in the database
            RuleFor(x => x.PlaceId)
                .MustFindPlaceById(entities)
            ;

            When(x => x.ParentId.HasValue && x.ParentId.Value != 0, () =>
                RuleFor(x => x.ParentId.Value)
                    .MustFindPlaceById(entities)
            );
        }
    }

    public class HandleUpdatePlaceCommand : IHandleCommands<UpdatePlace>
    {
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<EnsurePlaceHierarchy> _hierarchy;

        public HandleUpdatePlaceCommand(ICommandEntities entities
            , IHandleCommands<EnsurePlaceHierarchy> hierarchy
        )
        {
            _entities = entities;
            _hierarchy = hierarchy;
        }

        public void Handle(UpdatePlace command)
        {
            if (command == null) throw new ArgumentNullException("command");

            var entity = _entities.Get<Place>().Single(x => x.RevisionId == command.PlaceId);

            //var audit = new CommandEvent
            //{
            //    RaisedBy = System.Threading.Thread.CurrentPrincipal.Identity.Name,
            //    Name = command.GetType().FullName,
            //    Value = JsonConvert.SerializeObject(new
            //    {
            //        command.PlaceId,
            //        command.IsRegion,
            //    }),
            //    PreviousState = place.ToJsonAudit(),
            //};

            var lastParentId = entity.ParentId; // do not change parent when command.ParentId is zero
            if (command.ParentId.HasValue && command.ParentId.Value != 0)
            {
                var parent = _entities.Get<Place>().Single(x => x.RevisionId == command.ParentId.Value);
                entity.Parent = parent;
                entity.ParentId = parent.RevisionId;
            }
            else if (!command.ParentId.HasValue)
            {
                entity.Parent = null;
                entity.ParentId = null;
            }

            if (command.IsRegion.HasValue) entity.IsRegion = command.IsRegion.Value;
            if (command.IsWater.HasValue) entity.IsWater = command.IsWater.Value;

            //audit.NewState = place.ToJsonAudit();
            //_entities.Create(audit);

            if (lastParentId != entity.ParentId)
                _hierarchy.Handle(new EnsurePlaceHierarchy(entity));

            _entities.SaveChanges();
        }
    }
}
