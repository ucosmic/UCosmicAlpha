using System.Collections.Generic;
using System.Collections.ObjectModel;
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
        public string CountryCode { get; set; }
        public string CountryName { get; set; }
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


            //var country = GetCountry(entity);
            //CountryCode = country != null ? country.GeoPlanetPlace.Country.Code : string.Empty;
            //CountryName = country != null ? country.OfficialName : string.Empty;
          
        }

        //private static Place GetCountry(Agreement agreement)
        //{
        //    var country = agreement.Location.Places.FirstOrDefault(e => e.IsCountry);
        //    if (country == null)
        //    {
        //        var parent = agreement.Parent;
        //        while (parent != null)
        //        {
        //            country = parent.Location.Places.FirstOrDefault(e => e.IsCountry);
        //            if (country != null) break;
        //            parent = parent.Parent;
        //        }
        //    }
        //    return country;
        //}
    }
}
