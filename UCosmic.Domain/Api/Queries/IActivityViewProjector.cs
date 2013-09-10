using System.Collections.Generic;
using UCosmic.Domain.Activities;

namespace UCosmic
{
    public interface IActivityViewProjector
    {
        void BuildViews();
        ICollection<ActivityView> BeginReadView();
        void EndReadView();
        ActivityGlobalActivityCountView BeginReadActivityCountsView(int establishmentId);
        void EndReadActivityCountsView();
        ActivityGlobalPeopleCountView BeginReadPeopleCountsView(int establishmentId);
        void EndReadPeopleCountsView();

    }
}
