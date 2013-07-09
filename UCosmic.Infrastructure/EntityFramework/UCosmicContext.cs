using System;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Data.Entity.Validation;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Mail;
using System.Reflection;
using System.Text;
using UCosmic.Configuration;
using UCosmic.Domain;
using UCosmic.Logging;
using UCosmic.Mail;

namespace UCosmic.EntityFramework
{
    public class UCosmicContext : DbContext, IQueryEntities, ICommandEntities, IUnitOfWork
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

        public void Reload<TEntity>(TEntity entity) where TEntity : Entity
        {
            Entry(entity).Reload();
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

        public override int SaveChanges()
        {
            try
            {
                return base.SaveChanges();
            }
            catch (DbEntityValidationException ex)
            {
                var config = new DotNetConfigurationManager();
                if (!config.EmergencyMailAddresses.Any()) throw;
                var mailSender = new SmtpMailSender(config, new ElmahExceptionLogger(
                    config.DefaultMailFromAddress, config.EmergencyMailAddresses));
                var message = new MailMessage(
                    config.DefaultMailFromAddress, config.EmergencyMailAddresses.First())
                {
                    Subject = "UCosmic caught DbEntityValidationException during SaveChanges.",
                };
                if (config.EmergencyMailAddresses.Count() > 1)
                    foreach (var emergencyAddress in config.EmergencyMailAddresses.Skip(1))
                        message.CC.Add(emergencyAddress);
                var body = new StringBuilder();
                foreach (var entry in ex.EntityValidationErrors)
                {
                    var entityType = entry.Entry.Entity.GetType();
                    foreach (var error in entry.ValidationErrors)
                    {
                        body.Append(entityType.Name);
                        body.Append('.');
                        body.Append(error.PropertyName);
                        body.Append(": \r\n");
                        body.Append(error.ErrorMessage);
                        body.Append("\r\n\r\n");
                    }
                }
                message.Body = body.ToString();
                mailSender.Send(message);
                Debug.WriteLine(message.Body);
                throw;
            }
        }
    }
}
