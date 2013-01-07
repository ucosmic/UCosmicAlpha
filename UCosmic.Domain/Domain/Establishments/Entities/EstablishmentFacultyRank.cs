using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.Establishments
{
  public class EstablishmentFacultyRank : Entity
  {
    public EstablishmentFacultyRank()
    {
    }

    public int EstablishmentFacultyRankId { get; set; }
    public string Rank { get; set; }
  }
}
