using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;

namespace UCosmic.Web.Mvc.Models
{
  public class PersonInfoApiModel
  {
    public Guid EntityId { get; set; }
    public string Salutation { get; set; }
    public string FirstName { get; set; }
    public string MiddleName { get; set; }
    public string LastName { get; set; }
    public string Suffix { get; set; }
    public string DefaultEmail { get; set; }
  }

}