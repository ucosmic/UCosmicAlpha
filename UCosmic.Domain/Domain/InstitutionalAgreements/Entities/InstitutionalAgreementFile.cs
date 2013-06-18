using System;
using System.Threading;

namespace UCosmic.Domain.InstitutionalAgreements
{
    public class InstitutionalAgreementFile : Entity
    {
        private string _fileName;
        internal const string PathFormat = "/institutional-agreements/{0}/{1}";

        protected internal InstitutionalAgreementFile()
        {
            Guid = Guid.NewGuid();
            CreatedOnUtc = DateTime.UtcNow;
            CreatedByPrincipal = Thread.CurrentPrincipal.Identity.Name;
        }

        public int Id { get; protected set; }
        public Guid Guid { get; protected set; }

        public int AgreementId { get; protected internal set; }
        public virtual InstitutionalAgreement Agreement { get; protected internal set; }

        //public byte[] Content { get; protected internal set; }
        public int Length { get; protected internal set; }
        public string MimeType { get; protected internal set; }
        public string Name { get; protected internal set; }
        public string Path { get; protected internal set; }

        public string FileName
        {
            get { return (string.IsNullOrWhiteSpace(_fileName)) ? Name : _fileName; }
            protected internal set { _fileName = value; }
        }

        public string VisibilityText { get; protected set; }
        public InstitutionalAgreementVisibility Visibility
        {
            get { return VisibilityText.AsEnum<InstitutionalAgreementVisibility>(); }
            protected internal set { VisibilityText = value.AsSentenceFragment(); }
        }

        public DateTime CreatedOnUtc { get; protected internal set; }
        public string CreatedByPrincipal { get; protected internal set; }
        public DateTime? UpdatedOnUtc { get; protected internal set; }
        public string UpdatedByPrincipal { get; protected internal set; }
        public byte[] Version { get; protected internal set; }
    }
}