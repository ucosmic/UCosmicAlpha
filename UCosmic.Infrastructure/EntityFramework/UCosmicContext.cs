using System;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using UCosmic.Domain;

namespace UCosmic.EntityFramework
{
    public class UCosmicContext : DbContext, IUnitOfWork, ICommandEntities
    {
        private IDatabaseInitializer<UCosmicContext> _initializer;

        public IDatabaseInitializer<UCosmicContext> Initializer
        {
            get { return _initializer; }
            set
            {
                _initializer = value;
                Database.SetInitializer(Initializer);
            }
        }

        public IQueryable<TEntity> Get<TEntity>() where TEntity : Entity
        {
            return Set<TEntity>();
        }

        public IQueryable<TEntity> Query<TEntity>() where TEntity : Entity
        {
            return Set<TEntity>().AsNoTracking();
        }

        public TEntity FindByPrimaryKey<TEntity>(params object[] primaryKeyValues)
            where TEntity : Entity
        {
            return Set<TEntity>().Find(primaryKeyValues);
        }

        public IQueryable<TEntity> EagerLoad<TEntity>(IQueryable<TEntity> query, Expression<Func<TEntity, object>> expression)
            where TEntity : Entity
        {
            if (query != null && expression != null)
                query = query.Include(expression);
            return query;
        }

        public void Create<TEntity>(TEntity entity) where TEntity : Entity
        {
            if (Entry(entity).State == EntityState.Detached)
                Set<TEntity>().Add(entity);
        }

        public void Update<TEntity>(TEntity entity) where TEntity : Entity
        {
            var entry = Entry(entity);
            entry.State = EntityState.Modified;
        }

        public void Purge<TEntity>(TEntity entity) where TEntity : Entity
        {
            if (Entry(entity).State != EntityState.Deleted)
                Set<TEntity>().Remove(entity);
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            var complexType = typeof(ComplexTypeConfiguration<>);
            var entityType = typeof(EntityTypeConfiguration<>);

            var typesToRegister = Assembly.GetAssembly(GetType()).GetTypes()
                .Where(t => !t.IsAbstract &&
                (
                       complexType.IsGenericallyAssignableFrom(t)
                    || entityType.IsGenericallyAssignableFrom(t)
                ))
                .ToArray();
            foreach (var typeToRegister in typesToRegister)
            {
                dynamic configurationInstance = Activator.CreateInstance(typeToRegister);
                modelBuilder.Configurations.Add(configurationInstance);
            }
        }
    }
}
