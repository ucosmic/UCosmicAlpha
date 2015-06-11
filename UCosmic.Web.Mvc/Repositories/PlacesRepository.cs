using System.Collections.Generic;
//using UCosmic.Exceptions;
using UCosmic.Interfaces;
using UCosmic.Factories;
using System.Web.Security;
using System;
using System.Data.Entity;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;
using System.Data.SqlClient;
using Dapper;
using UCosmic.Domain.Establishments;


namespace UCosmic.Repositories
{

    public class PlacesRepository
    {
        private SqlConnectionFactory connectionFactory = new SqlConnectionFactory();

        public IList<string> getContinentList()
        {
            const string sql = @"SELECT ContinentName FROM Places.GeoNamesCountry
                                Group By ContinentName
                                Order By ContinentName ASC";

            return connectionFactory.SelectList<string>(DB.UCosmic, sql);
        }

        public IList<string> getCountryList()
        {
            const string sql = @"SELECT Name FROM Places.GeoNamesCountry
                                Order By Name ASC";

            return connectionFactory.SelectList<string>(DB.UCosmic, sql);
        }

        public IList<GeoNamesCountry> getCountryRecordList()
        {
            const string sql = @"SELECT * FROM Places.GeoNamesCountry
                                Order By Name ASC";
            return connectionFactory.SelectList<GeoNamesCountry>(DB.UCosmic, sql);
        }

        public IList<Establishment> getEstablishments()
        {
            const string sql = @"SELECT * FROM Establishments.Establishment";
            return connectionFactory.SelectList<Establishment>(DB.UCosmic, sql);
        }
    }  
}