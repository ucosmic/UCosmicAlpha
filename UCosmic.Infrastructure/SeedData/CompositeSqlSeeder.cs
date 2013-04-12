using System.Linq;
using System.Web.Security;
using UCosmic.Domain.Files;

namespace UCosmic.SeedData
{
    public class CompositeSqlSeeder : ISeedData
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IQueryEntities _entities;
        private readonly DevelopmentSqlSeeder _sqlSeeder;
        private readonly MemberEntitySeeder _memberEntitySeeder;
        private readonly LoadableFileEntitySeeder _loadableFileEntitySeeder;
        private readonly ImageEntitySeeder _imageEntitySeeder;
        private readonly ExternalFileEntitySeeder _externalFileEntitySeeder;

        public CompositeSqlSeeder(IUnitOfWork unitOfWork
            , IQueryEntities entities
            , DevelopmentSqlSeeder sqlSeeder
            , MemberEntitySeeder memberEntitySeeder
            , LoadableFileEntitySeeder loadableFileEntitySeeder
            , ImageEntitySeeder imageEntitySeeder
            , ExternalFileEntitySeeder externalFileEntitySeeder
        )
        {
            _unitOfWork = unitOfWork;
            _entities = entities;
            _sqlSeeder = sqlSeeder;
            _memberEntitySeeder = memberEntitySeeder;
            _loadableFileEntitySeeder = loadableFileEntitySeeder;
            _imageEntitySeeder = imageEntitySeeder;
            _externalFileEntitySeeder = externalFileEntitySeeder;
        }

        public void Seed()
        {
            // binary data makes .sql files unmanageable
            var files = _entities.Query<LoadableFile>();
            if (!files.Any())
            {
                _loadableFileEntitySeeder.Seed();
                _unitOfWork.SaveChanges();
            }

            var images = _entities.Query<Image>();
            if (!images.Any())
            {
                _imageEntitySeeder.Seed();
                _unitOfWork.SaveChanges();
            }

            _sqlSeeder.Seed();
            _unitOfWork.SaveChanges();

            _externalFileEntitySeeder.Seed();

            var members = Membership.GetAllUsers().Cast<MembershipUser>();
            if (!members.Any()) _memberEntitySeeder.Seed();
        }
    }
}
