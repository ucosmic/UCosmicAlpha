using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;

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

            var fixedPeople = new List<string>();
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
                var fixedPerson = new StringBuilder();
                fixedPerson.Append(person.DisplayName);
                fixedPerson.Append(string.Format(" - NetID: {0}", person.User.Name));
                fixedPerson.Append(string.Format(", email = {0}", emailValue));
                fixedPeople.Add(fixedPerson.ToString());
            }

            fixedPeople = fixedPeople.OrderBy(x => x).ToList();
            var output = new StringBuilder();
            foreach (var item in fixedPeople)
            {
                output.AppendLine(item);
            }
            var inspect = output.ToString();

            _entities.SaveChanges();
        }
    }
}
