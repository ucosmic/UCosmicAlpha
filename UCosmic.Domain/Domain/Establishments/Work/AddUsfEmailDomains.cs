using System;
using System.Linq;
using System.Linq.Expressions;
using UCosmic.Domain.Establishments;

namespace UCosmic.Domain.People
{
    public class AddUsfEmailDomains : IDefineWork
    {
        public TimeSpan Interval { get { return TimeSpan.MaxValue; } }
    }

    public class PerformAddUsfEmailDomainsWork : IPerformWork<AddUsfEmailDomains>
    {
        private readonly ICommandEntities _entities;

        public PerformAddUsfEmailDomainsWork(ICommandEntities entities)
        {
            _entities = entities;
        }

        public void Perform(AddUsfEmailDomains job)
        {
            var emailDomains = new[]
            {
                "@usfsp.edu",
                "@acad.usf.edu",
                "@acnet.usf.edu",
                "@admin.usf.edu",
                "@afrotc.usf.edu",
                "@arch.usf.edu",
                "@arotc.usf.edu",
                "@arts.usf.edu",
                "@athena.arch.usf.edu",
                "@banshee.sar.usf.edu",
                "@bcs.usf.edu",
                "@bitt.usf.edu",
                "@cas.usf.edu",
                "@cchd.usf.edu",
                "@chuma.cas.usf.edu",
                "@chuma1.cas.usf.edu",
                "@coba.usf.edu",
                "@coedu.usf.edu",
                "@connect.usf.edu",
                "@crhsp.usf.edu",
                "@csl.usf.edu",
                "@cte.usf.edu",
                "@cutr.eng.usf.edu",
                "@cutr.usf.edu",
                "@cvpa.usf.edu",
                "@eng.usf.edu",
                "@enlace.usf.edu",
                "@fastmail.usf.edu",
                "@flkin.org",
                "@fmhi.usf.edu",
                "@forest.usf.edu",
                "@grad.usf.edu",
                "@gsis.usf.edu",
                "@healthlib.usf.edu",
                "@honors.usf.edu",
                "@housing.usf.edu",
                "@ibl.usf.edu",
                "@intellis.org",
                "@intellis.usf.edu",
                "@intellismedia.com",
                "@intellismedia.org",
                "@intellismedia.usf.edu",
                "@jmslc.usf.edu",
                "@lakeland.usf.edu",
                "@lib.usf.edu",
                "@lklnd.usf.edu",
                "@luna.cas.usf.edu",
                "@mail.cas.usf.edu",
                "@math.usf.edu",
                "@nrotc.usf.edu",
                "@phialphatheta.org",
                "@poly.usf.edu",
                "@pplant.usf.edu",
                "@research.usf.edu",
                "@reserv.usf.edu",
                "@ritchie.acomp.usf.edu",
                "@sa.usf.edu",
                "@sacd.arch.usf.edu",
                "@sar.usf.edu",
                "@sg.usf.edu",
                "@shell.cas.usf.edu",
                "@success.usf.edu",
                "@sundome.org",
                "@tarski.math.usf.edu",
                "@tempest.coedu.usf.edu",
                "@theclawatusf.org",
                "@trustees.usf.edu",
                "@ugs.usf.edu",
                "@ur.usf.edu",
                "@usfedu.mail.onmicrosoft.com",
                "@uspssenate.usf.edu",
                "@wateratlas.org",
                "@wusf.com",
                "@wusf.net",
                "@wusf.org",
                "@wusf.usf.edu",
                "@wusftv.usf.edu",
            };
            var saveChanges = false;

            foreach (var emailDomain in emailDomains)
            {
                var exists = _entities.Query<EstablishmentEmailDomain>()
                    .SingleOrDefault(x => x.Value.Equals(emailDomain, StringComparison.OrdinalIgnoreCase));
                if (exists != null) continue;

                saveChanges = true;
                _entities.Create(new EstablishmentEmailDomain
                {
                    EstablishmentId = 3306,
                    Value = emailDomain,
                });
            }

            if (saveChanges) _entities.SaveChanges();
        }
    }
}
