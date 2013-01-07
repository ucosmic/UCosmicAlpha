using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Establishments
{
  public class EstablishmentCollege : Entity
  {
    public EstablishmentCollege()
    {
      // ReSharper disable DoNotCallOverridableMethodsInConstructor
      Departments = new Collection<EstablishmentDepartment>();
      // ReSharper restore DoNotCallOverridableMethodsInConstructor
    }

    public int EstablishmentCollegeId { get; set; }
    public string Name { get; set; }
    public virtual ICollection<EstablishmentDepartment> Departments { get; set; }
  }
}
