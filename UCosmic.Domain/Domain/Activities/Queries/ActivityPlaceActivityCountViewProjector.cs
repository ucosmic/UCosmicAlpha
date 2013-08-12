using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.Activities
{
    class ActivityPlaceActivityCountViewProjector : IHandleEvents<ApplicationStarted>,
                                                    IHandleEvents<ActivityCountTrendViewsRequested>
    {
        private static readonly object _updateLock = new object();
        private readonly IQueryEntities _entities;
        private readonly IProcessEvents _eventProcessor;
        private readonly IManageViews _viewManager;

        public ActivityPlaceActivityCountViewProjector(IQueryEntities entities,
                                                       IManageViews viewManager,
                                                       IProcessEvents eventProcessor)
        {
            _entities = entities;
            _viewManager = viewManager;
            _eventProcessor = eventProcessor;
        }

        private IEnumerable<ActivityPlaceActivityCountView> UpdateView()
        {
            lock (_updateLock)
            {
                //var entities = _entities.Query<Establishment>()
                //    .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
                //        {
                //            x => x.Names.Select(y => y.TranslationToLanguage),
                //            x => x.Urls,
                //            x => x.Location.Places.Select(y => y.GeoPlanetPlace),
                //            x => x.Parent,
                //            x => x.Type,
                //        })
                //    .OrderBy(x => x.RevisionId)
                //;

                //var view = new List<ActivityPlaceActivityCountView>();
                //foreach (var entity in entities)
                //    view.Add(new ActivityPlaceActivityCountView(entity));

               // _viewManager.Set<IEnumerable<ActivityPlaceActivityCountView>>(null);
            }

            return null;
        }

        internal IEnumerable<ActivityPlaceActivityCountView> GetView(int establishmentId)
        {
            var view = _viewManager.Get<IEnumerable<ActivityPlaceActivityCountView>>();

            var dirtyFlag = _viewManager.Get<ActivityCountTrendViewsDirtyFlag>();
            if ((dirtyFlag != null) && dirtyFlag.IsDirty)
            {
                _eventProcessor.Raise(new ActivityCountTrendViewsRequested
                {
                    EstablishmentId = establishmentId
                }); // view will update in a new thread
            }

            return view;
        }
 
        public void Handle(ApplicationStarted @event)
        {
            UpdateView();
        }

        public void Handle(ActivityCountTrendViewsRequested @event)
        {
            UpdateView();
        }
    }
}
