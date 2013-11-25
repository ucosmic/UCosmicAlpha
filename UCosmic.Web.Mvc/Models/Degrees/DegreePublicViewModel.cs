using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using AutoMapper;
using UCosmic.Domain.Degrees;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.Models
{
    public class DegreePublicViewModel
    {
        public string Title { get; set; }
        public string FieldOfStudy { get; set; }
        public int? YearAwarded { get; set; }
        public Establishment Institution { get; set; }
    }

}