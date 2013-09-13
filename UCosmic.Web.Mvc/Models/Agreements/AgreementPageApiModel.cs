using System;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models
{
    public class AgreementPageApiModel
    {
        public int Id { get; set; }
        public int? UmbrellaId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public bool? IsAutoRenew { get; set; }
        public string Status { get; set; }
        public DateTime StartsOn { get; set; }
        public DateTime ExpiresOn { get; set; }
        public bool IsExpirationEstimated { get; set; }
        public string Visibility { get; set; }
    }

    
}