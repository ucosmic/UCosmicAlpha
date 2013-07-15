using System.Linq;
using System.Web.Security;

namespace UCosmic.SeedData
{
    public class CompositeSqlSeeder : ISeedData
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IQueryEntities _entities;
        private readonly DevelopmentSqlSeeder _sqlSeeder;
        private readonly MemberEntitySeeder _memberEntitySeeder;
        private readonly ExternalFileEntitySeeder _externalFileEntitySeeder;
        private readonly SensativeSqlSeeder _sensativeSeeder;

        public CompositeSqlSeeder(IUnitOfWork unitOfWork
            , IQueryEntities entities
            , DevelopmentSqlSeeder sqlSeeder
            , MemberEntitySeeder memberEntitySeeder
            , ExternalFileEntitySeeder externalFileEntitySeeder
            , SensativeSqlSeeder sensativeSeeder
        )
        {
            _unitOfWork = unitOfWork;
            _entities = entities;
            _sqlSeeder = sqlSeeder;
            _memberEntitySeeder = memberEntitySeeder;
            _externalFileEntitySeeder = externalFileEntitySeeder;
            _sensativeSeeder = sensativeSeeder;
        }

        public void Seed()
        {
            _sqlSeeder.Seed();
            _unitOfWork.SaveChanges();

            _externalFileEntitySeeder.Seed();

            var members = Membership.GetAllUsers().Cast<MembershipUser>();
            if (!members.Any()) _memberEntitySeeder.Seed();

            _sensativeSeeder.Seed();
        }
    }
}
