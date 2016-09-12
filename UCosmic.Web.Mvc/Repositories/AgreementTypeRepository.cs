using System.Collections.Generic;
//using UCosmic.Exceptions;
using UCosmic.Interfaces;
using UCosmic.Factories;
using System.Web.Security;
using System;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;


namespace UCosmic.Repositories
{
    public class AgreementTypesApiReturn
    {
        public string Code;
        public string Name;
    }
    public class AgreementTypesRepository// : ISummaryRepository
	{

        public IList<AgreementTypesApiReturn> AgreementTypes_By_establishmentId(int? EstablishmentId)
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            const string sql = "SELECT  aastv.text as Code" +
                " ,[ForEstablishmentId], aastv.text as Name" +
                " FROM [Agreements].[AgreementSettings] aas" +
                " inner join [Agreements].[AgreementSettingsTypeValue] aastv on aas.revisionId = aastv.configurationId" +
                " where forestablishmentId = 3306";
            IList<AgreementTypesApiReturn> activityLocations = connectionFactory.SelectList<AgreementTypesApiReturn>(DB.UCosmic, sql);
            
            return activityLocations;
        }
        
	}
}