// DEPRECATED: do this from the other side (update toponym, not place)
//using System;
//using System.Linq;
//using FluentValidation;
//using Newtonsoft.Json;
//using UCosmic.Domain.Audit;

//namespace UCosmic.Domain.Places
//{
    //public class UpdatePlaceGeoNamesReference
    //{
    //    public UpdatePlaceGeoNamesReference(int placeId, int? geoNameId)
    //    {
    //        PlaceId = placeId;
    //        GeoNameId = geoNameId;
    //    }

    //    public int PlaceId { get; private set; }
    //    public int? GeoNameId { get; private set; }
    //}

    //public class ValidateUpdatePlaceGeoNamesReferenceCommand : AbstractValidator<UpdatePlaceGeoNamesReference>
    //{
    //    public ValidateUpdatePlaceGeoNamesReferenceCommand(IQueryEntities entities)
    //    {
    //        CascadeMode = CascadeMode.StopOnFirstFailure;

    //        // id must be within valid range and exist in the database
    //        RuleFor(x => x.PlaceId)
    //            .MustFindPlaceById(entities)
    //                .WithMessage(MustFindPlaceById.FailMessageFormat, x => x.PlaceId)
    //        ;
    //    }
    //}

    //public class HandleUpdatePlaceGeoNamesReferenceCommand : IHandleCommands<UpdatePlaceGeoNamesReference>
    //{
    //    private readonly IProcessQueries _queryProcessor;
    //    private readonly ICommandEntities _entities;
    //    private readonly IUnitOfWork _unitOfWork;

    //    public HandleUpdatePlaceGeoNamesReferenceCommand(IProcessQueries queryProcessor
    //        , ICommandEntities entities
    //        , IUnitOfWork unitOfWork
    //    )
    //    {
    //        _queryProcessor = queryProcessor;
    //        _entities = entities;
    //        _unitOfWork = unitOfWork;
    //    }

    //    public void Handle(UpdatePlaceGeoNamesReference command)
    //    {
    //        if (command == null) throw new ArgumentNullException("command");

    //        var place = _entities.Get<Place>().Single(x => x.RevisionId == command.PlaceId);

    //        var audit = new CommandEvent
    //        {
    //            RaisedBy = System.Threading.Thread.CurrentPrincipal.Identity.Name,
    //            Name = command.GetType().FullName,
    //            Value = JsonConvert.SerializeObject(new
    //            {
    //                command.PlaceId,
    //                command.GeoNameId,
    //            }),
    //            PreviousState = place.ToJsonAudit(),
    //        };

    //        if (command.GeoNameId.HasValue)
    //        {
    //            var geoNamesEntity = _queryProcessor.Execute(
    //                new SingleGeoNamesToponym(command.GeoNameId.Value)
    //                {
    //                    NoCommit = true,
    //                });
    //            place.GeoNamesToponym = geoNamesEntity;
    //        }
    //        else
    //        {
    //            place.GeoNamesToponym = null;
    //        }

    //        audit.NewState = place.ToJsonAudit();
    //        _entities.Create(audit);
    //        _unitOfWork.SaveChanges();
    //    }
    //}
//}
