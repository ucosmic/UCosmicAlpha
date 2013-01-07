using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace UCosmic.Domain.People
{
  /* DCC - Not an enum due to non-support in EF.  This was another option.  Didn't like it.
   * http://blogs.msdn.com/b/alexj/archive/2009/06/05/tip-23-how-to-fake-enums-in-ef-4.aspx
  */
  public static class PersonGender
  {
    public static int Unknown = 0;
    public static int Male = 1;
    public static int Female = 2;
    public static int Private = 3;
  }
}
