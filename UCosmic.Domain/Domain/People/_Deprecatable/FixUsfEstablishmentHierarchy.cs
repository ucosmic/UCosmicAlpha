//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Linq.Expressions;
//using UCosmic.Domain.Establishments;

//namespace UCosmic.Domain.People
//{
//    public class FixUsfEstablishmentHierarchy : IDefineWork
//    {
//        public TimeSpan Interval { get { return TimeSpan.FromMilliseconds(int.MaxValue); } }
//    }

//    public class PerformFixUsfEstablishmentHierarchyWork : IPerformWork<FixUsfEstablishmentHierarchy>
//    {
//        private readonly ICommandEntities _entities;
//        private readonly ISendMail _mailSender;
//        private readonly ILogExceptions _exceptionLogger;
//        private static bool _mailSent;

//        public PerformFixUsfEstablishmentHierarchyWork(ICommandEntities entities, ISendMail mailSender, ILogExceptions exceptionLogger)
//        {
//            _entities = entities;
//            _mailSender = mailSender;
//            _exceptionLogger = exceptionLogger;
//        }

//        public void Perform(FixUsfEstablishmentHierarchy job)
//        {
//            var reportBuilder = new WorkReportBuilder("Fix USF Establishment Hierarchy");
//            try
//            {
//                var isChanged = false;

//                // get all usf establishments
//                var usf = _entities.Get<Establishment>()
//                    .EagerLoad(_entities, new Expression<Func<Establishment, object>>[]
//                    {
//                        x => x.Offspring,
//                    })
//                    .Single(x => x.WebsiteUrl == "www.usf.edu");

//                var sarasota = usf.Children.Single(x => x.OfficialName.StartsWith("USF Sarasota"));
//                if (!sarasota.Names.Any(x => !x.IsOfficialName && x.Text == "USF Sarasota"))
//                {
//                    sarasota.Names.Add(new EstablishmentName
//                    {
//                        ForEstablishment = sarasota,
//                        Text = "USF Sarasota",
//                    });
//                    isChanged = true;
//                }

//                var offsprings = usf.Offspring
//                    .Select(x => x.Offspring)
//                    .Where(x => x.Ancestors.Count > 1)
//                    .OrderByDescending(x => x.Ancestors.Count)
//                    .ThenBy(x => x.OfficialName)
//                    .ToArray();
//                var removedEstablishmentIds = new List<int>();
//                foreach (var offspring in offsprings)
//                {
//                    var establishment = offspring;
//                    if (removedEstablishmentIds.Contains(establishment.RevisionId)) continue;

//                    #region Remove Duplicate Department Names

//                    // delete all duplicate siblings
//                    var duplicateDepartments = establishment.Parent.Children
//                        .Where(x => x.Ancestors.Count == 3 && x.OfficialName == establishment.OfficialName && x.RevisionId != establishment.RevisionId)
//                        .ToArray();
//                    if (duplicateDepartments.Any())
//                    {
//                        foreach (var duplicate in duplicateDepartments)
//                        {
//                            PurgeAndMerge(duplicate, establishment);
//                            removedEstablishmentIds.Add(duplicate.RevisionId);
//                            isChanged = true;
//                        }
//                    }

//                    #endregion
//                    #region Remove Duplicate Department Children

//                    // delete duplicate department children
//                    if (establishment.OfficialName == establishment.Parent.OfficialName)
//                    {
//                        PurgeAndMerge(establishment, establishment.Parent);
//                        isChanged = true;
//                        continue;
//                    }

//                    #endregion
//                    #region Remove Unnamed Departments

//                    // delete all unnamed departments
//                    if (establishment.OfficialName.Equals("None", StringComparison.OrdinalIgnoreCase))
//                    {
//                        PurgeAndMerge(establishment, establishment.Parent);
//                        isChanged = true;
//                        continue;
//                    }

//                    #endregion
//                    #region Contextual Naming

//                    // add contextual name
//                    var contextName = establishment.OfficialName;
//                    if (!establishment.Names.Any(x => x.IsContextName))
//                    {
//                        establishment.Names.Add(new EstablishmentName
//                        {
//                            ForEstablishment = establishment,
//                            IsContextName = true,
//                            Text = contextName,
//                        });

//                        var officialName = establishment.Ancestors.Count == 3
//                            ? string.Format("{0}, {1}, {2}", contextName, establishment.Parent.OfficialName, establishment.Parent.Parent.OfficialName)
//                            : string.Format("{0}, {1}", contextName, establishment.Parent.OfficialName);

//                        establishment.OfficialName = officialName;
//                        establishment.Names.Single(x => x.IsOfficialName).Text = officialName;

//                        isChanged = true;
//                    }

//                    #endregion
//                    #region ExternalId / CustomId Migration

//                    // move external id's to collection entity
//                    if (!string.IsNullOrWhiteSpace(establishment.ExternalId) && !establishment.CustomIds.Any())
//                    {
//                        establishment.CustomIds.Add(new EstablishmentCustomId
//                        {
//                            EstablishmentId = establishment.RevisionId,
//                            Owner = establishment,
//                            Value = establishment.ExternalId,
//                        });
//                        isChanged = true;
//                    }

//                    #endregion

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

//        private void PurgeAndMerge(Establishment purge, Establishment merge)
//        {
//            // move custom id to parent
//            if (!string.IsNullOrWhiteSpace(purge.ExternalId))
//            {
//                merge.CustomIds.Add(new EstablishmentCustomId
//                {
//                    EstablishmentId = merge.RevisionId,
//                    Owner = merge,
//                    Value = purge.ExternalId,
//                });
//            }

//            // move all affiliations with this establishment
//            var affectedAffiliations = _entities.Get<Affiliation>()
//                .Where(x => x.EstablishmentId == purge.RevisionId).ToArray();
//            foreach (var affectedAffiliation in affectedAffiliations)
//                affectedAffiliation.EstablishmentId = merge.RevisionId;

//            _entities.Purge(purge);
//        }
//    }
//}
