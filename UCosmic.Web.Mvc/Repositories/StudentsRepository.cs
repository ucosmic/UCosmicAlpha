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
using System.Linq;
using UCosmic.Domain.Establishments;


namespace UCosmic.Repositories
{
    public class StudentQueryParameters
    {
        public string orderBy { get;set; }
        public string orderDirection { get; set; }
        public int pageSize { get; set; }
        public int page{get;set;}
        public string institution { get; set; }
        public string campus { get; set; }
        public DateTime FStartDate { get; set; }
        public DateTime FEndDate { get; set; }
        public string FCountry { get; set; }
        public string FContinent { get; set; }
        public string FDegree { get; set; }
        public string FLevel { get; set; }
        public string FInstitution { get; set; }
        public string FStatus { get; set; }
    }

    public class StudentActivityRepository
    {
        public string StatusOUT = "OUT";
        private SqlConnectionFactory connectionFactory = new SqlConnectionFactory();
        private IList<GeoNamesCountry> countries;
        private IList<Establishment> establishments;
        private PlacesRepository pr;
        private bool preloaded;
        private const string from_conditions = @" FROM [vw_MobilityDetail]";
        private const string paginated_from =
            @" FROM (SELECT ROW_NUMBER() OVER( " + order_conditions + @") AS
            rownum, * FROM vw_MobilityDetail WHERE " + filter_conditions +" )AS vw_MobilityDetail1 ";

        private const string filter_conditions = 
            @"  status like @FStatus and 
                termStart >= @FStartDate and 
                termStart <= @FEndDate and 
                campus like @campus and
                Country like @FCountry and 
                continent like @FContinent and 
                program like @FDegree and 
                level like @FLevel and 
                institution like @FInstitution ";
        private const string paginated_where =
            @" WHERE 
                (rownum > ((@page-1)*@pageSize)) and 
                (rownum <= (@page*@pageSize)) and
                termStart >= @FStartDate and " + filter_conditions;

        private const string order_conditions =
            @" order by 
                CASE WHEN @orderDirection='ASC' THEN
	                CASE @orderBy  --string
	                WHEN 'Country' THEN Country 
                    WHEN 'status' THEN status
                    WHEN 'program' then program
	                END 
                END ASC,
                CASE WHEN @orderDirection='ASC' THEN
	                CASE @orderBy --date
	                WHEN 'TermStart' THEN TermStart 
	                END
                END ASC,
                CASE WHEN @orderDirection='ASC' THEN
	                CASE @orderBy --int
	                WHEN 'rank' THEN rank 
	                END
                END ASC,
                CASE WHEN @orderDirection='DESC' THEN
	                CASE @orderBy --string
	                WHEN 'Country' THEN Country
                    WHEN 'status' THEN status
                    WHEN 'program' then program 
	                END 
                END DESC,
                CASE WHEN @orderDirection='DESC' THEN
	                CASE @orderBy --date
	                WHEN 'TermStart' THEN TermStart 
	                END
                END DESC,
                CASE WHEN @orderDirection='DESC' THEN
	                CASE @orderBy --int
	                WHEN 'rank' THEN rank 
	                END
                END DESC
                ";
        public StudentActivityRepository()
        {
            //don't preload
            this.pr = new PlacesRepository();
            preloaded = false;
        }
        public StudentActivityRepository(bool preload)
        {
            this.pr = new PlacesRepository();
            preloaded = false;

            //Preload countries/establishments to reduce database access
            if (preload) doPreload();
        }
        public void doPreload()
        {
            this.countries = pr.getCountryRecordList();
            this.establishments = pr.getEstablishments();
            this.preloaded = true;
        }
        public IList<StudentActivity> getStudentActivities(StudentQueryParameters param)
        {

            const string sql = @"select *" + paginated_from + paginated_where + order_conditions; 
            IList<StudentActivity> studentActivities = connectionFactory.SelectList<StudentActivity>(DB.UCosmic, sql, param);
            return studentActivities;
        }
        public IEnumerable<CountryMobility> getCountryCounts(StudentQueryParameters param)
        {
            string oldStatus = param.FStatus;

            param.FStatus = "IN";
            const string sql_IN = @"select country, countryCode, ISNULL(COUNT(*),0) as inbound" + from_conditions + " WHERE " + filter_conditions + " GROUP BY country, countryCode";
            IList<CountryMobility> inboundActivities = connectionFactory.SelectList<CountryMobility>(DB.UCosmic, sql_IN, param);

            param.FStatus = "OUT";
            const string sql_OUT = @"select country, countryCode, ISNULL(COUNT(*),0) as outbound" + from_conditions + " WHERE " + filter_conditions + " GROUP BY country, countryCode";
            IList<CountryMobility> outboundActivities = connectionFactory.SelectList<CountryMobility>(DB.UCosmic, sql_OUT, param);

            param.FStatus = oldStatus;

            var transfers = from t in inboundActivities.Concat(outboundActivities)
                            group t by t.countryCode into g
                            select new CountryMobility()
                            {
                                country = g.Select(x=>x.country).First(),
                                countryCode = g.Key,
                                inbound = g.Sum(x => x.inbound),
                                outbound = g.Sum(x => x.outbound),
                            };

            return transfers;

        }
        public int getStudentActivityCount(StudentQueryParameters param)
        {
            const string sql = @"select COUNT(*)" + from_conditions + " WHERE " + filter_conditions;
            return connectionFactory.SelectList<int>(DB.UCosmic, sql, param)[0];
        }
        public UploadInfo uploadStudents(IList<StudentImportApi> students)
        {
            UploadInfo ui = new UploadInfo();

            //Attempt to upload each student
            foreach (StudentImportApi student in students)
            {
                try
                {
                    StudentMobilityData record = new StudentMobilityData();
                    if (student.externalId == 0)
                    {
                        ui.nullID += 1;
                        continue;
                    }
                    record.termId = getTermId(student);
                    record.studentId = student.externalId;
                    record.status = student.status;

                    record.institutionId = getInstitutionId(student);
                    record.studentEstablishmentId = getEstablishmentId(student);
                    record.foreignEstablishmentId = getForeignEstablishmentId(student);

                    //We must have a studentEstablishmentId
                    if (!record.studentEstablishmentId.HasValue)
                    {
                        ui.noEstablishmentList.Add(student.externalId.ToString());
                        continue;
                    }
                    else
                    {
                        record.levelId = getLevelId(student, (int)record.studentEstablishmentId);
                        record.programId = getProgramId(student, (int)record.studentEstablishmentId);
                    }

                    if (!record.institutionId.HasValue)
                    {
                        ui.noInstitutionList.Add(student.externalId.ToString());
                        continue;
                    }

                    GeoNamesCountry c = (from p in countries
                                      where p.Name == student.country
                                      select p).FirstOrDefault();
                    if(c!=null){
                        record.placeId = c.GeoNameId;
                    }
                    else
                    {
                        ui.noPlaceList.Add(student.externalId.ToString());
                        continue;
                    }


                    if (isDuplicate(record))
                    {
                        ui.duplicateList.Add(student.externalId.ToString());
                    }
                    else
                    {
                        commitRecord(record);
                        ui.success += 1;
                    }

                }
                catch
                {
                    //Will catch if a SQL statement fails on the student
                    ui.failureList.Add(student.externalId.ToString());
                }

            }
            return ui;
        }
        public int getTermId(StudentImportApi student)
        {
            string sql = @"select id from [Students].[TermData] where name=@termDescription and startDate=@termStart and endDate=@termEnd";

            try
            {
                int id = (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, student, System.Data.CommandType.Text);
                return id;
            }
            catch (System.InvalidOperationException e)
            {
                //ID did not exist
                sql = @"insert into [Students].[TermData] VALUES(@termDescription, @termStart, @termEnd)" +
                      @"SELECT CAST(SCOPE_IDENTITY() as int)";
                return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, student, System.Data.CommandType.Text);
            }
        }
        public int? getEstablishmentId(StudentImportApi student)
        {
            if (preloaded)
            {
                Establishment e = (from p in establishments
                                   where (p.RevisionId == student.uCosmicStudentAffiliationCode
                                   || p.OfficialName == student.uCosmicStudentAffiliation)
                                   select p).FirstOrDefault();
                if (e == null) return null;
                else return e.RevisionId;
            }
            else
            {
                string sql = @"select RevisionId from [Establishments].[Establishment] where RevisionId=@uCosmicStudentAffiliationCode";
                try
                {
                    return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, student, System.Data.CommandType.Text);
                }
                catch (System.InvalidOperationException e)
                {
                    //Return "establishment does not exist error"
                    return null;
                }
            }
        }
        public int? getInstitutionId(StudentImportApi student)
        {
            if (preloaded)
            {
                Establishment e = (from p in establishments
                                   where (p.RevisionId == student.uCosmicAffiliationCode
                                   || p.OfficialName == student.uCosmicAffiliation)
                                   select p).FirstOrDefault();
                if (e == null) return null;
                else return e.RevisionId;
            }
            else
            {
                string sql = @"select RevisionId from [Establishments].[Establishment] where RevisionId=@uCosmicAffiliationCode";
                try
                {
                    return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, student, System.Data.CommandType.Text);
                }
                catch (System.InvalidOperationException e)
                {
                    //Return "establishment does not exist error"
                    return null;
                }
            }
           
        }
        public int? getForeignEstablishmentId(StudentImportApi student)
        {
            if (preloaded)
            {
                Establishment e = (from p in establishments
                                   where (p.RevisionId == student.uCosmicForeignAffiliationCode
                                   || p.OfficialName == student.uCosmicForeignAffiliation)
                                   select p).FirstOrDefault();
                if (e == null) return null;
                else return e.RevisionId;
            }
            else
            {
                string sql = @"select RevisionId from [Establishments].[Establishment] where RevisionId=@uCosmicForeignAffiliationCode";
                try
                {
                    return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, student, System.Data.CommandType.Text);
                }
                catch (System.InvalidOperationException e)
                {
                    return null;
                }
            }
        }
        public int getLevelId(StudentImportApi student, int establishmentId)
        {
            //Look for leveldata object
            StudentLevelData leveldata = new StudentLevelData();
            leveldata.establishmentId = establishmentId;
            leveldata.name = student.level;
            leveldata.rank = student.rank;

            string sql = @"select id from [Students].[StudentLevel] where establishmentId=@establishmentId and name=@name";
            try
            {
                return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, leveldata, System.Data.CommandType.Text);
            }
            catch (System.InvalidOperationException e)
            {
                sql = @"insert into [Students].[StudentLevel] VALUES(@establishmentId, @name, @rank)" +
                    @"SELECT CAST(SCOPE_IDENTITY() as int)";
                return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, leveldata, System.Data.CommandType.Text);
            }
        }
        public int getPlaceId(StudentImportApi student)
        {
            string sql = @"select GeoNameId from [Places].[GeoNamesCountry] where Name=@country";
            try
            {
                return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, student, System.Data.CommandType.Text);
            }
            catch (System.InvalidOperationException e)
            {
                return -1;
            }
        }
        public int getProgramId(StudentImportApi student, int establishmentId)
        {
            StudentProgramData progData = new StudentProgramData();
            progData.establishmentId = establishmentId;
            progData.isStandard = false;
            progData.name = student.progDescription;
            progData.code = student.progCode;

            string sql = @"select id from [Students].[StudentProgramData] where code=@code and (isStandard=1 or establishmentId=@establishmentId)";
            try
            {
                return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, progData, System.Data.CommandType.Text);
            }
            catch (System.InvalidOperationException e)
            {

                sql = @"insert into [Students].[StudentProgramData] (code,name,isStandard,establishmentId) VALUES(@code, @name, @isStandard, @establishmentId)" +
                      @"SELECT CAST(SCOPE_IDENTITY() as int)";
                return (int)connectionFactory.ExecuteWithId(DB.UCosmic, sql, progData, System.Data.CommandType.Text);
            }
        }
        public bool isDuplicate(StudentMobilityData record)
        {
            //Check if record exists
            string sql = @"select TOP 1 id from [Students].[StudentMobility] where studentId=@studentId and termId=@termId";

            try
            {
                //Entry is a dupicate, do not add
                connectionFactory.ExecuteWithId(DB.UCosmic, sql, record, System.Data.CommandType.Text);
                return true;
            }
            catch (System.InvalidOperationException e)
            {
                //If the entry does not exist, add it   
                return false;
            }
        }
        public void commitRecord(StudentMobilityData record)
        {
            try
            {
                string sql = @"insert into [Students].[StudentMobility]" +
              @"VALUES(@studentId, @status, @levelId, @termId, @placeId, @programId, @institutionId, @studentEstablishmentId, @foreignEstablishmentId)";
                connectionFactory.Execute(DB.UCosmic, sql, record, System.Data.CommandType.Text);
            }
            catch (System.InvalidOperationException e)
            {
                //TODO: Don't fail silently.
            }
        }   
        public IList<StudentProgramData> getPrograms(string institution)
        {
            const string sql = @" SELECT program as name, code
                                    FROM [UCosmicTest].[dbo].[vw_MobilityDetail]
                                    where institution=@institution
                                    group by program,code
                                ";
            StudentQueryParameters param = new StudentQueryParameters();
            param.institution = institution;
            return connectionFactory.SelectList<StudentProgramData>(DB.UCosmic, sql, param);

        }
        public IList<StudentTermData> getTerms(string institution){
            const string sql = @" SELECT [term] as name,[termStart] as startDate
                                FROM [UCosmicTest].[dbo].[vw_MobilityDetail]
                                where institution=@institution
                                group by term,termStart
                                order by termStart desc
                                ";
            StudentQueryParameters param = new StudentQueryParameters();
            param.institution = institution;
            return connectionFactory.SelectList<StudentTermData>(DB.UCosmic, sql, param);

        }
        public IList<StudentLevelData> getLevels(string institution)
        {
            const string sql = @" SELECT [level] as name,[rank]
                                FROM [UCosmicTest].[dbo].[vw_MobilityDetail]
                                where institution=@institution
                                group by level,rank
                                order by rank desc
                                ";
            StudentQueryParameters param = new StudentQueryParameters();
            param.institution = institution;
            return connectionFactory.SelectList<StudentLevelData>(DB.UCosmic, sql, param);

        }       
    }
}