using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Newtonsoft.Json;

namespace UCosmic.Work
{
    public class AzureBlobWorkScheduler : IScheduleWork
    {
        private const string BlobKey = "work-schedule";
        private readonly CloudBlockBlob _blob;

        public AzureBlobWorkScheduler(string connectionStringName)
        {
            if (string.IsNullOrWhiteSpace(connectionStringName))
                throw new ArgumentNullException("connectionStringName", "Cannot be null or whitespace.");
            var connectionString = ConfigurationManager.ConnectionStrings[connectionStringName];
            if (connectionString == null)
                throw new InvalidOperationException(string.Format(
                    "There is no ConnectionString named '{0}' in the configuration file.", connectionStringName));

            if (string.IsNullOrWhiteSpace(connectionString.ConnectionString))
                throw new InvalidOperationException(string.Format(
                    "The ConnectionString named '{0}' has no connectionString attribute value.", connectionStringName));

            var storageAccount = CloudStorageAccount.Parse(connectionString.ConnectionString);
            var client = storageAccount.CreateCloudBlobClient();
            var container = client.GetContainerReference(BlobKey);
            container.CreateIfNotExists(BlobContainerPublicAccessType.Off);
            _blob = container.GetBlockBlobReference(BlobKey);

            if (_blob.Exists()) return;

            try
            {
                var accessCondition = AccessCondition.GenerateIfNoneMatchCondition("*");
                _blob.UploadFromByteArray(new byte[0], 0, 0, accessCondition);
            }
            catch (StorageException storageException)
            {
                if (!storageException.HasResponse(HttpStatusCode.Conflict, "The specified blob already exists.") &&
                    !storageException.HasResponse(HttpStatusCode.PreconditionFailed, "There is currently a lease on the blob and no lease ID was specified in the request."))
                    throw;
            }
        }

        public void Schedule(IDefineWork job, DateTime onUtc)
        {
            ScheduleInternal(job, onUtc);
        }

        public void Reschedule(IDefineWork job, DateTime onUtc, Exception exception)
        {
            if (exception == null) throw new ArgumentNullException("exception");
            ScheduleInternal(job, onUtc, exception);
        }

        private void ScheduleInternal(IDefineWork job, DateTime onUtc, Exception exception = null)
        {
            while (true)
            {
                // exclusive access to the blob
                using (var arl = new AutoRenewLease(_blob))
                {
                    if (arl.HasLease)
                    {
                        // load schedule from the blob
                        var schedule = LoadSchedule().ToList();
                        var scheduledJob = GetScheduledJob(schedule, job);

                        // only schedule if the job is not already scheduled
                        if (scheduledJob == null)
                        {
                            schedule.Add(new ScheduledJob
                            {
                                Job = job,
                                OnUtc = onUtc,
                            });
                            SaveSchedule(schedule, arl.LeaseId);
                        }

                        // or the job should be scheduled sooner than it is scheduled
                        else if (exception != null && scheduledJob.OnUtc > onUtc)
                        {
                            scheduledJob.OnUtc = onUtc;
                            SaveSchedule(schedule, arl.LeaseId);
                        }
                        return;
                    }
                    Thread.Sleep(100);
                }
            }
        }

        public DateTime? GetSchedule(IDefineWork job)
        {
            while (true)
            {
                // exclusive access to the blob
                using (var arl = new AutoRenewLease(_blob))
                {
                    if (arl.HasLease)
                    {
                        // load schedule from the blob
                        var schedule = LoadSchedule().ToArray();
                        var scheduledJob = GetScheduledJob(schedule, job);

                        // only return if job is scheduled to run in the past
                        if (scheduledJob != null && scheduledJob.OnUtc < DateTime.UtcNow)
                        {
                            // schedule the next run
                            var performOn = scheduledJob.OnUtc;
                            scheduledJob.OnUtc = DateTime.UtcNow.Add(job.Interval);
                            SaveSchedule(schedule, arl.LeaseId);
                            return performOn;
                        }

                        return null;
                    }
                    Thread.Sleep(100);
                }
            }
        }

        private IEnumerable<ScheduledJob> LoadSchedule()
        {
            var json = LoadIntermediateSchedule();
            var intermediate = JsonConvert.DeserializeObject<dynamic[]>(json);

            // only populate if there are job in the intermediate schedule
            if (string.IsNullOrWhiteSpace(json) || intermediate == null || !intermediate.Any())
                return Enumerable.Empty<ScheduledJob>();

            var schedule = intermediate
                .Select(x => new ScheduledJob
                {
                    Job = JsonConvert.DeserializeObject(x.Job.ToString(), Type.GetType(x.Type.ToString())),
                    OnUtc = x.OnUtc,
                })
                .ToArray();

            return schedule;
        }

        private void SaveSchedule(IEnumerable<ScheduledJob> schedule, string leaseId)
        {
            // serialize to intermediate array
            var intermediate = schedule
                .Select(x => new
                {
                    Type = x.Job.GetType(),
                    Job = JsonConvert.SerializeObject(x.Job),
                    x.OnUtc,
                })
                .ToArray();

            var json = JsonConvert.SerializeObject(intermediate);
            var bytes = json.AsByteArray();
            _blob.Properties.ContentType = "application/json";
            _blob.UploadFromByteArray(bytes, 0, bytes.Length, AccessCondition.GenerateLeaseCondition(leaseId));
        }

        private string LoadIntermediateSchedule()
        {
            using (var stream = new MemoryStream())
            {
                _blob.DownloadToStream(stream);
                return stream.ToArray().AsString();
            }
        }

        private static ScheduledJob GetScheduledJob(IEnumerable<ScheduledJob> schedule, IDefineWork job)
        {
            return schedule.SingleOrDefault(x => x.Job.GetType() == job.GetType());
        }

        private class ScheduledJob
        {
            public IDefineWork Job { get; set; }
            public DateTime OnUtc { get; set; }
        }
    }
}