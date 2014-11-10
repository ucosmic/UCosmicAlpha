using System.Collections.Generic;
using UCosmic.Domain.Places;
using UCosmic.Web.Mvc.Models;
namespace UCosmic.Interfaces
{
	public class ILocationsRepository
	{
		//Users ValidateUser(Logon logonCredentials);
		//bool updateUser(profileSettings loginCredentials, string UserType);

		//bool profileSettings(profileSettings loginCredentials, string UserType);

        internal IList<ActivityLocationsApiModel> LocationsByEstablishment_Place(int EstablishmentId, int? PlaceId)
        {
            throw new System.NotImplementedException();
        }

        //internal IList<Users> GetUsername(Logon logonCredentials)
        //{
        //    throw new System.NotImplementedException();
        //}
    }
}