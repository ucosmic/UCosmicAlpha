using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Establishments
{
  public class EstablishmentCampus : Entity
  {
    public EstablishmentCampus()
    {
      // ReSharper disable DoNotCallOverridableMethodsInConstructor
      Colleges = new Collection<EstablishmentCollege>();
      // ReSharper restore DoNotCallOverridableMethodsInConstructor
    }

    public int EstablishmentCampusId { get; set; }
    public string Name { get; set; }
    public virtual ICollection<EstablishmentCollege> Colleges { get; set; }
  }
}
