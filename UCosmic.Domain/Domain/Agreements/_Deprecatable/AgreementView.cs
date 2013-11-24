//using System;
//using System.Collections.Generic;

//namespace UCosmic.Domain.Agreements
//{
//    public class AgreementView
//    {
//        public int Id { get; set; }
//        public string Name { get; set; }
//        public string Type { get; set; }
//        public string Status { get; set; }
//        public DateTime StartsOn { get; set; }
//        public DateTime ExpiresOn { get; set; }
//        public IEnumerable<AgreementParticipantView> Participants { get; set; }
//        //public ICollection<AgreementParticipant> Participants { get; set; }


//        public AgreementView() { }

//        public AgreementView(Agreement entity)
//        {
//            var participants = new List<AgreementParticipantView>();

//            Id = entity.Id;
//            Name = entity.Name;
//            Type = entity.Type;
//            Status = entity.Status;
//            StartsOn = entity.StartsOn;
//            ExpiresOn = entity.ExpiresOn; 

//            foreach (var participant in entity.Participants)
//                participants.Add(new AgreementParticipantView(participant));
//            Participants = participants;
//        }
//    }
//}
