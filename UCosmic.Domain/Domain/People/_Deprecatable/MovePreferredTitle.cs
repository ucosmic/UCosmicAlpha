//using System;
//using System.Diagnostics;
//using System.Linq;
//using System.Linq.Expressions;
//using UCosmic.Domain.Employees;

//namespace UCosmic.Domain.People
//{
//    public class MovePreferredTitle : IDefineWork
//    {
//        public TimeSpan Interval { get { return TimeSpan.FromMilliseconds(int.MaxValue); } }
//    }

//    public class PerformMovePreferredTitleWork : IPerformWork<MovePreferredTitle>
//    {
//        private readonly ICommandEntities _entities;
//        private readonly ISendMail _mailSender;
//        private readonly ILogExceptions _exceptionLogger;
//        private static bool _mailSent;

//        public PerformMovePreferredTitleWork(ICommandEntities entities, ISendMail mailSender, ILogExceptions exceptionLogger)
//        {
//            _entities = entities;
//            _mailSender = mailSender;
//            _exceptionLogger = exceptionLogger;
//        }

//        public void Perform(MovePreferredTitle job)
//        {
//            var reportBuilder = new WorkReportBuilder("Move Employee Preferred Title");
//            try
//            {
//                var isChanged = false;

//                // get all employees from the database
//                var people = _entities.Get<Person>()
//                    .Where(x => x.Employee != null)
//                    .EagerLoad(_entities, new Expression<Func<Person, object>>[]
//                    {
//                        x => x.Employee,
//                        x => x.User,
//                        x => x.Affiliations,
//                    })
//                    .ToArray();

//                // move job titles to default affiliation
//                foreach (var person in people)
//                {
//                    // make sure there is a default affiliation
//                    var defaultAffiliation = person.DefaultAffiliation;
//                    if (defaultAffiliation == null)
//                            throw new InvalidOperationException("Found person without known default affiliation");
                    
//                    if (defaultAffiliation.JobTitles == person.Employee.JobTitles)
//                    {
                        
//                    }
//                    else if (string.IsNullOrWhiteSpace(person.Employee.JobTitles) && !string.IsNullOrWhiteSpace(defaultAffiliation.JobTitles))
//                    {
                        
//                    }
//                    else if (!string.IsNullOrWhiteSpace(person.Employee.JobTitles) && string.IsNullOrWhiteSpace(defaultAffiliation.JobTitles))
//                    {
//                        defaultAffiliation.JobTitles = person.Employee.JobTitles;
//                        isChanged = true;
//                    }
//                    else
//                    {
//                        defaultAffiliation.JobTitles = person.Employee.JobTitles;
//                        isChanged = true;
//                    }
//                }

//                if (isChanged) _entities.SaveChanges();
//            }
//            catch (Exception ex)
//            {
//                reportBuilder.Report("");
//                reportBuilder.Report("JOB FAILED!");
//                reportBuilder.Report(ex.GetType().Name);
//                reportBuilder.Report(ex.Message);
//                reportBuilder.Report(ex.StackTrace);
//                _exceptionLogger.Log(ex);
//                if (!_mailSent)
//                    reportBuilder.Send(_mailSender);
//                _mailSent = true;
//            }
//            //finally // do not want to receive emails indicating success every 10 minutes
//            //{
//            //    if (!_mailSent)
//            //        reportBuilder.Send(_mailSender);
//            //    _mailSent = true;
//            //}
//        }
//    }
//}
