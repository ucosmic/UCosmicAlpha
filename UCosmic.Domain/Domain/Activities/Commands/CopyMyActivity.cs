using System;
using System.Collections.Generic;
using System.Linq;
using UCosmic.Domain.Identity;
using UCosmic.Domain.People;

namespace UCosmic.Domain.Activities
{
    public class CopyMyActivity
    {
        public Activity From { get; set; }
        public Activity To { get; set; }
    }
}
