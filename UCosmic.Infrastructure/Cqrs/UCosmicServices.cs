using System;
using System.Data.Entity;
using System.Linq;
using Newtonsoft.Json;

namespace UCosmic.Cqrs
{
    public class UCosmicServices : DbContext, IManageViews
    {
        public UCosmicServices()
        {
            Database.SetInitializer(new ServicesDbInitializer());
        }

        private DbSet<JsonView> JsonViews { get { return Set<JsonView>(); } }

        public TView Get<TView>(params object[] parameters)
        {
            try
            {
                var key = typeof(TView).GetViewKey(parameters);
                var entity = JsonViews.AsNoTracking().SingleOrDefault(x => x.Key == key);
                if (entity == null)
                {
                    entity = new JsonView
                    {
                        Key = key,
                        UpdatedOnUtc = DateTime.UtcNow,
                    };
                    JsonViews.Add(entity);
                    SaveChanges();
                    return default(TView);
                }
                var value = JsonConvert.DeserializeObject<TView>(entity.Value);
                return value;
            }
            catch (Exception)
            {
                return Get<TView>(parameters);
            }
        }

        public void Set<TView>(object value, params object[] parameters)
        {
            try
            {
                var key = typeof(TView).GetViewKey(parameters);
                var entity = JsonViews.SingleOrDefault(x => x.Key == key);
                var json = JsonConvert.SerializeObject(value);
                if (entity == null)
                {
                    entity = new JsonView
                    {
                        Key = key,
                        Value = json,
                        UpdatedOnUtc = DateTime.UtcNow,
                    };
                    JsonViews.Add(entity);
                }
                entity.Value = json;
                entity.UpdatedOnUtc = DateTime.UtcNow;
                SaveChanges();
            }
            catch (Exception)
            {
                Set<TView>(value, parameters);
            }
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            var jsonView = modelBuilder.Entity<JsonView>();
            jsonView.ToTable("JsonView");
            jsonView.HasKey(x => x.Id);
            jsonView.Property(x => x.Key).IsRequired().HasMaxLength(400);
            jsonView.Property(x => x.Value).HasColumnType("ntext");

            base.OnModelCreating(modelBuilder);
        }
    }
}