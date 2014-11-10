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
	public class LocationsRepository : ILocationsRepository
	{

        public IList<ActivityLocationsApiQueryResultModel> LocationsByEstablishment_Place(int? EstablishmentId, int? PlaceId)
        {


            SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
            // decrypt the password. Use this once all passwords have been encrypted.
            // string pw = FormsAuthentication.HashPasswordForStoringInConfigFile(password.Trim(), "sha1");
            string sql = "select av.revisionid as id, pp.officialname, eat.type  FROM [UCosmicTest].[ActivitiesV2].[ActivityLocation] al" + 
                  " inner join [UCosmicTest].[ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
                  " inner join [UCosmicTest].Places.place pp on al.placeId=pp.revisionid" +
                  " inner join [UCosmicTest].[ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
                  " inner join [UCosmicTest].[People].Person people on aa.personId=people.revisionid" +
                  " inner join [UCosmicTest].[identity].[user] iu on iu.personId=people.revisionid" +
                  " inner join [UCosmicTest].[ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
                  " inner join [UCosmicTest].employees.employeeactivitytype eat on eat.establishmentId=iu.tenantId and eat.id = at.typeId" +
                  " where iu.tenantId=" + EstablishmentId;
            if (PlaceId > 0)
            {
                sql += " and pp.revisionid=" + PlaceId;
            }
            //const string sql = "select eat.[type],  count(eat.[type]) as typeCount  FROM [UCosmicTest].[ActivitiesV2].[ActivityLocation] al" +
            //      " inner join [UCosmicTest].[ActivitiesV2].[ActivityValues] av on al.activityValuesId=av.revisionid" +
            //      " inner join [UCosmicTest].Places.place pp on al.placeId=pp.revisionid" +
            //      " inner join [UCosmicTest].[ActivitiesV2].[Activity] aa on av.activityId=aa.revisionid" +
            //      " inner join [UCosmicTest].[People].Person people on aa.personId=people.revisionid" +
            //      " inner join [UCosmicTest].[identity].[user] iu on iu.personId=people.revisionid" +
            //      " inner join [UCosmicTest].[ActivitiesV2].[ActivityType] at on at.activityValuesId=av.revisionid" +
            //      " inner join [UCosmicTest].employees.employeeactivitytype eat on eat.establishmentId=iu.tenantId" +
            //      " where iu.tenantId=3306 group by eat.[type]";
            //connectionFactory.
            IList<ActivityLocationsApiQueryResultModel> activityLocations = connectionFactory.SelectList<ActivityLocationsApiQueryResultModel>(DB.UCosmic, sql);
            //IList<ActivityLocationsApiModel> activityLocations = connectionFactory.SelectList<ActivityLocationsApiModel>(DB.UCosmic, sql, new { un = username });

            return activityLocations;
        }
        //public bool ValidateUserRegistration(Users loginCredentials)
        //{

        //    var username = loginCredentials.username;
        //    var password = loginCredentials.password;

        //    SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
        //    // decrypt the password. Use this once all passwords have been encrypted.
        //    // string pw = FormsAuthentication.HashPasswordForStoringInConfigFile(password.Trim(), "sha1");
        //    const string sql = "SELECT case when count(*) > 0 then false else true end as isValid" +
        //        " FROM users WHERE username = @un";
        //    //connectionFactory.
        //    IList<IsValid> isValid = connectionFactory.SelectList<IsValid>(DB.OrderFoodLive, sql, new { un = username });

        //    return isValid[0].isValid;
        //}

        //public IList<Users> ValidateUser(Logon loginCredentials)
        //{
        //    var username = loginCredentials.username;
        //    var password = loginCredentials.password;

        //    SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
        //    // decrypt the password. Use this once all passwords have been encrypted.
        //    // string pw = FormsAuthentication.HashPasswordForStoringInConfigFile(password.Trim(), "sha1");
        //    const string sql = "SELECT id, username, fname, lname, phone, password " +
        //        " FROM users WHERE username = @un AND password LIKE @pw";
        //    //connectionFactory.
        //    IList<Users> users = connectionFactory.SelectList<Users>(DB.OrderFoodLive, sql, new { un = username, pw = password + '%' });

        //    if (users.Count == 0)
        //    {
        //        throw new LoginExceptions("The Username or Password is incorrect.");
        //    }
        //    return users;
        //}

        //public IList<Users> GetUsername(Logon loginCredentials)
        //{
        //    var username = loginCredentials.username;

        //    SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
        //    // decrypt the password. Use this once all passwords have been encrypted.
        //    // string pw = FormsAuthentication.HashPasswordForStoringInConfigFile(password.Trim(), "sha1");
        //    const string sql = "select username from users where username LIKE @un limit 5";
        //    //connectionFactory.
        //    IList<Users> users = connectionFactory.SelectList<Users>(DB.OrderFoodLive, sql, new { un = username + '%' });

        //    if (users.Count == 0)
        //    {
        //        throw new LoginExceptions("The Username is incorrect.");
        //    }
        //    return users;
        //}

        //public bool insertUser(Users user)
        //{


        //    SqlConnectionFactory connectionFactory = new SqlConnectionFactory();


        //    string pw = FormsAuthentication.HashPasswordForStoringInConfigFile(user.password.Trim(), "sha1");


        //    string sql = "INSERT INTO users(username, fname, lname, phone, password, joinDate, address, city, state, zip, isBiz)" +
        //                    "VALUES(@username, @fname, @lname, @phone, @password, @joinDate, @address, @city, @state, @zip, @isBiz )";




        //    //IList<Account> users = connectionFactory.SelectList<Account>(DB.TrustaffMed, sql, new { un = username, pw = password });
        //    connectionFactory.Execute(DB.OrderFoodLive, sql, new
        //    {
        //        username = user.username,
        //        fname = user.fName,
        //        lname = user.lName,
        //        phone = user.phone,
        //        city = user.city,
        //        state = user.state,
        //        zip = user.zip,
        //        address = user.address,
        //        isBiz = user.isBiz,
        //        password = pw,
        //        joinDate = DateTime.Now

        //    }, commandType: System.Data.CommandType.Text);




        //    return true;
        //}

        //public bool updateUser(Users user)
        //{


        //    SqlConnectionFactory connectionFactory = new SqlConnectionFactory();


        //    string pw = FormsAuthentication.HashPasswordForStoringInConfigFile(user.password.Trim(), "sha1");


        //    string sql = "update users set username = @username, fname = @fname, phone = @phone, " +
        //        "password = @password, updateDate = @updateDate, address = @address, city = @city, state = @state, zip = @zip";




        //    //IList<Account> users = connectionFactory.SelectList<Account>(DB.TrustaffMed, sql, new { un = username, pw = password });
        //    connectionFactory.Execute(DB.OrderFoodLive, sql, new
        //    {
        //        username = user.username,
        //        fname = user.fName,
        //        lname = user.lName,
        //        phone = user.phone,
        //        city = user.city,
        //        state = user.state,
        //        zip = user.zip,
        //        address = user.address,
        //        isBiz = user.isBiz,
        //        password = pw,
        //        updateDate = DateTime.Now

        //    }, commandType: System.Data.CommandType.Text);




        //    return true;
        //}  


		//public bool updateUser(profileSettings loginCredentials, string UserType)
		//{
		//    var username = loginCredentials.username;
		//    var oldPassword = loginCredentials.oldPassword;
		//    var newPassword = loginCredentials.newPassword;
		//    var email = loginCredentials.email;

		//    if (loginCredentials.newPassword != loginCredentials.confirmPassword)
		//    {
		//        throw new UserRepositoryException("New and Confirm passwords must match.");
		//    }

		//    // decrypt the password. Use this once all passwords have been encrypted.
		//    // string pw = FormsAuthentication.HashPasswordForStoringInConfigFile(password.Trim(), "sha1");
		//    //const string sql = "SELECT TOP 1 userId, userType, firstName, lastName, username, password " +
		//    //    " FROM v_CardioLogin WHERE username = @un AND password = @pw";
		//    string sql = "UPDATE [Nurses] SET Email = @Email,Password = @newPassword WHERE [Password]=@oldPassword and [Username]=@username";
			
		//    if (UserType == "C") {
		//        sql = "UPDATE [FacilityContact] SET Email = @Email,Password = @newPassword WHERE [Password]=@oldPassword and [Username]=@username";
			
		//    }

			

		//    //IList<Account> users = connectionFactory.SelectList<Account>(DB.TrustaffMed, sql, new { un = username, pw = password });
		//    connectionFactory.Execute(DB.TrustaffMed, sql, new { username = username, 
		//        oldPassword = oldPassword, email = email, newPassword = newPassword }, commandType: System.Data.CommandType.Text);




		//    return true;
		//}  
	}
}