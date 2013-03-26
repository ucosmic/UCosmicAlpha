using System.Linq;
using System.Web.Security;
using UCosmic.Domain.Files;
using UCosmic.Domain.Images;

namespace UCosmic.SeedData
{
    public class CompositeSqlSeeder : ISeedData
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IQueryEntities _entities;
        private readonly DevelopmentSqlSeeder _sqlSeeder;
        private readonly MemberEntitySeeder _memberEntitySeeder;
        private readonly FileEntitySeeder _fileEntitySeeder;
        private readonly ImageEntitySeeder _imageEntitySeeder;

        public CompositeSqlSeeder(IUnitOfWork unitOfWork
            , IQueryEntities entities
            , DevelopmentSqlSeeder sqlSeeder
            , MemberEntitySeeder memberEntitySeeder
            , FileEntitySeeder fileEntitySeeder
            , ImageEntitySeeder imageEntitySeeder
        )
        {
            _unitOfWork = unitOfWork;
            _entities = entities;
            _sqlSeeder = sqlSeeder;
            _memberEntitySeeder = memberEntitySeeder;
            _fileEntitySeeder = fileEntitySeeder;
            _imageEntitySeeder = imageEntitySeeder;
        }

        public void Seed()
        {
            // binary data makes .sql files unmanageable
            var files = _entities.Query<LoadableFile>();
            if (!files.Any())
            {
                _fileEntitySeeder.Seed();
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

            var members = Membership.GetAllUsers().Cast<MembershipUser>();
            if (!members.Any()) _memberEntitySeeder.Seed();
        }
    }
}
