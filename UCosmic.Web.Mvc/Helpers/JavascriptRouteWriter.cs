using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace UCosmic.Web.Mvc
{
    public class JavascriptRouteWriter
    {
        // need to be able to pass strings, guid's, and ints to action methods
        // for strings and guid's, those can be handled randomly.

        private const int MaxParams = 5;
        private readonly IDictionary<int, string> _strings = new Dictionary<int, string>();
        private readonly IDictionary<int, int> _integers = new Dictionary<int, int>();
        private readonly IDictionary<int, Guid> _guids = new Dictionary<int, Guid>();

        public JavascriptRouteWriter()
        {
            // generate ints, strings, & guid's for URL parameter injection
            var random = new Random();
            for (var i = 0; i < MaxParams; i++)
            {
                _strings.Add(i, Guid.NewGuid().ToString());
                _guids.Add(i, Guid.NewGuid());

                // do not add integer if it already exists
                var integer = random.Next(2132957683, int.MaxValue - 1);
                while (_integers.Any(x => x.Value == integer))
                    integer = random.Next(2132957683, int.MaxValue - 1);
                _integers.Add(i, integer);
            }
        }

        public T Value<T>(int index)
        {
            if (index >= MaxParams)
                throw new ArgumentOutOfRangeException(string.Format(
                    "Javascript route writer must be expanded to accept more than {0} parameters.", MaxParams));

            var isString = typeof(T) == typeof(string);
            if (isString)
            {
                var value = _strings[index] as object;
                return (T)value;
            }

            var isInt = typeof(T) == typeof(int);
            if (isInt)
            {
                var value = _integers[index] as object;
                return (T)value;
            }

            var isGuid = typeof(T) == typeof(Guid);
            if (isGuid)
            {
                var value = _guids[index] as object;
                return (T)value;
            }
            
            throw new NotSupportedException(string.Format(
                "Javascript route writer does not currently support '{0}' parameters.", typeof(T)));
        }

        public string WriteRoute(string url)
        {
            if (url == null)
                throw new ArgumentNullException("url", "A null javascript route has been detected");

            for (var i = 0; i < MaxParams; i++)
            {
                url = url.Replace(_strings[i], string.Format("{{{0}}}", i));
                url = url.Replace(_integers[i].ToString(CultureInfo.InvariantCulture), string.Format("{{{0}}}", i));
                url = url.Replace(_integers[i].ToString(CultureInfo.InvariantCulture), string.Format("{{{0}}}", i));
            }

            return url;
        }
    }
}