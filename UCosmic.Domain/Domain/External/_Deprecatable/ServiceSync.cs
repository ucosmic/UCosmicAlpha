//using System;

//namespace UCosmic.Domain.External
//{
//    public class ServiceSync : Entity
//    {
//        protected internal ServiceSync()
//        {
//        }

//        public byte[] RowVersion { get; protected internal set; }
//        public int Id { get; protected internal set; }
//        public string Name { get; protected internal set; }
//        public DateTime? ExternalSyncDate { get; protected internal set; }
//        public DateTime? LastUpdateAttempt { get; protected internal set; }
//        public int? UpdateFailCount { get; protected internal set; }
//        public string LastUpdateResult { get; protected internal set; } /* success, inprogress, failed */
//        /* May need to make a collection in the future. */
//        public string ServiceUsername { get; protected internal set; }
//        public string ServicePassword { get; protected internal set; }
//    }
//}
