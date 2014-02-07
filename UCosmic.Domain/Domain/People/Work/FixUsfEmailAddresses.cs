using System;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.People
{
    public class FixUsfEmailAddresses : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformFixUsfEmailAddressesWork : IPerformWork<FixUsfEmailAddresses>
    {
        private readonly ICommandEntities _entities;

        public PerformFixUsfEmailAddressesWork(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Perform(FixUsfEmailAddresses job)
        {
            var peopleWithoutEmailAddress = _entities.Get<Person>()
                .EagerLoad(_entities, new Expression<Func<Person, object>>[]
                {
                    x => x.User,
                })
                .Where(x => x.User != null && x.User.Name.EndsWith("@usf.edu") && !x.Emails.Any())
                .ToArray()
            ;

            if (peopleWithoutEmailAddress.Length < 1) return;

            foreach (var person in peopleWithoutEmailAddress)
            {
                var emailValue = person.User.Name;
                if (person.User.Name.Equals("ccao@usf.edu"))
                {
                    emailValue = "ccao@health.usf.edu";
                }
                person.Emails.Add(new EmailAddress
                {
                    IsConfirmed = true,
                    IsDefault = true,
                    Number = 1,
                    Value = emailValue,
                });
            }

            _entities.SaveChanges();
        }
    }
}
