//using System;

//namespace UCosmic.Domain.Activities
//{
//    public class ProjectActivityViews : IDefineWork
//    {
//        public TimeSpan Interval { get { return TimeSpan.FromMinutes(60); } }
//    }

//    public class PerformProjectActivityViewsWork : IPerformWork<ProjectActivityViews>
//    {
//        private static readonly object Lock = new object();

//        private readonly ActivityViewProjector _projector;

//        public PerformProjectActivityViewsWork(ActivityViewProjector projector)
//        {
//            _projector = projector;
//        }

//        public void Perform(ProjectActivityViews job)
//        {
//            lock (Lock)
//            {
//                _projector.BuildViews();
//            }
//        }
//    }
//}
