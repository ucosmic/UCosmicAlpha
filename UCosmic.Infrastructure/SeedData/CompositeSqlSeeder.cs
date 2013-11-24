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
        private readonly PrivateSqlSeeder _privateSeeder;

        public CompositeSqlSeeder(IUnitOfWork unitOfWork
            , IQueryEntities entities
            , DevelopmentSqlSeeder sqlSeeder
            , MemberEntitySeeder memberEntitySeeder
            , ExternalFileEntitySeeder externalFileEntitySeeder
            , PrivateSqlSeeder privateSeeder
        )
        {
            _unitOfWork = unitOfWork;
            _entities = entities;
            _sqlSeeder = sqlSeeder;
            _memberEntitySeeder = memberEntitySeeder;
            _externalFileEntitySeeder = externalFileEntitySeeder;
            _privateSeeder = privateSeeder;
        }

        public void Seed()
        {
            _sqlSeeder.Seed();
            _unitOfWork.SaveChanges();

            _externalFileEntitySeeder.Seed();

            var members = Membership.GetAllUsers().Cast<MembershipUser>();
            if (!members.Any()) _memberEntitySeeder.Seed();

            _privateSeeder.Seed();
        }
    }
}
