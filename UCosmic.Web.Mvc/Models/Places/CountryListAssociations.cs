using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using UCosmic.Repositories;

namespace UCosmic.Web.Mvc.Models.Places
{
    //public class country_item
    //{
    //    public int id;
    //    public string country;
    //    public string code;
    //}

    public class country_list_item
    {
        public int id;
        public string country;
        public string code;
        public List<CountryListAllApiReturn> associations;
    }
}