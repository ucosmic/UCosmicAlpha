using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Establishments
{
  public class EstablishmentDepartment : Entity
  {
    public EstablishmentDepartment()
    {
    }

    public int EstablishmentDepartmentId { get; set; }
    public string Name { get; set; }  }
}
