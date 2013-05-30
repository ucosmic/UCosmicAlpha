using System;
using System.IO;
using System.Runtime.Serialization;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Identity;

namespace UCosmic.Domain.External
{
    public class UsfFacultyImporter : IHandleEvents<UserCreated>
    {
        private readonly IQueryEntities _entities;

        public UsfFacultyImporter(IQueryEntities entities)
        {
            _entities = entities;
        }

        public void Import(int userId)
        {
            /* Setup for web api call to USF service. */

            /* Wait for data. */
                /* If we timeout or error, nothing is imported leave. */

            /* Compare the last activity date to what we have stored. */

            /* If the LAD does not match, we need to update the USF departments. */
                /* Call UsfDepartementImporter.Import() */
                /* UpdateUsfEstablishmentHierarchy() That's going to be fun to write */

            /* Update faculty profile information. */
        }

        public void Handle(UserCreated @event)
        {
            Import(@event.UserId);
            //@event.Signal.Set();
        }

    }
}
