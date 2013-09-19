using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using UCosmic.Domain.Places;
using System;

namespace UCosmic.Domain.Agreements
{
    public class AgreementView
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public DateTime StartsOn { get; set; }
        public DateTime ExpiresOn { get; set; }
        public IEnumerable<AgreementParticipantView> Participants { get; set; }


        public AgreementView() { }

        public AgreementView(Agreement entity)
        {

            Id = entity.Id;
            Name = entity.Name;
            Type = entity.Type;
            Status = entity.Status;
            //StartsOn = new DateTime(entity.StartsOn);
            //ExpiresOn = new DateTime(entity.ExpiresOn); 

            var participants = new List<AgreementParticipantView>();
            foreach (var participant in entity.Participants)
                participants.Add(new AgreementParticipantView(participant));
            Participants = participants;


          
        }
    }
}
