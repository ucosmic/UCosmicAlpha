using System.Linq;
using System.Web.Security;

namespace UCosmic.SeedData
{
    public class CompositeSqlSeeder : ISeedData
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly DevelopmentSqlSeeder _sqlSeeder;
        private readonly MemberEntitySeeder _memberEntitySeeder;

        public CompositeSqlSeeder(IUnitOfWork unitOfWork
            , DevelopmentSqlSeeder sqlSeeder
            , MemberEntitySeeder memberEntitySeeder
        )
        {
            _unitOfWork = unitOfWork;
            _sqlSeeder = sqlSeeder;
            _memberEntitySeeder = memberEntitySeeder;
        }

        public void Seed()
        {
            _sqlSeeder.Seed();
            _unitOfWork.SaveChanges();

            var members = Membership.GetAllUsers().Cast<MembershipUser>();
            if (!members.Any()) _memberEntitySeeder.Seed();
        }
    }
}
