using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace UCosmic
{
    public static class EnumExtensions
    {
        #region String to enum

        private static readonly object Lock = new object();
        private static readonly IDictionary<Type, IDictionary<string, object>> StringsToEnums = new Dictionary<Type, IDictionary<string, object>>();

        public static TEnum AsEnum<TEnum>(this string stringValue) where TEnum : struct, IConvertible
        {
            lock (Lock)
            {
                // check invoked argument and constrain generic argument
                var typeOfEnum = typeof(TEnum);
                if (string.IsNullOrWhiteSpace(stringValue))
                    throw new ArgumentException("Cannot be null or whitespace.", "stringValue");
                if (!typeOfEnum.IsEnum) throw new ArgumentException("TEnum must be an enumerated type.");

                // initialize the dictionary
                if (!StringsToEnums.ContainsKey(typeOfEnum))
                    StringsToEnums.Add(typeOfEnum, new Dictionary<string, object>());

                // defragment the string
                stringValue = stringValue.Replace(" ", string.Empty);

                // check the dictionary
                var pair = StringsToEnums[typeOfEnum];
                if (pair.ContainsKey(stringValue))
                    return (TEnum)pair[stringValue];

                // parse
                var parsed = Enum.Parse(typeof(TEnum), stringValue);
                pair.Add(stringValue, parsed);
                return (TEnum)pair[stringValue];
            }
        }

        #endregion
        #region Enum to string

        private static readonly IDictionary<Type, IDictionary<object, string>> EnumsToStrings = new Dictionary<Type, IDictionary<object, string>>();

        public static string AsSentenceFragment<TEnum>(this TEnum enumValue) where TEnum : struct, IConvertible
        {
            lock (Lock)
            {
                // check invoked argument and constrain generic argument
                var typeOfEnum = typeof(TEnum);
                if (!typeOfEnum.IsEnum) throw new ArgumentException("TEnum must be an enumerated type.");

                // initialize the dictionary
                if (!EnumsToStrings.ContainsKey(typeOfEnum))
                    EnumsToStrings.Add(typeOfEnum, new Dictionary<object, string>());

                // check the dictionary
                var pair = EnumsToStrings[typeOfEnum];
                if (pair.ContainsKey(enumValue))
                    return pair[enumValue];

                // fragment
                var fragmented = new StringBuilder();
                var characters = enumValue.ToString(CultureInfo.InvariantCulture).ToCharArray();
                foreach (var character in characters)
                    if (character.ToString(CultureInfo.InvariantCulture) == character.ToString(CultureInfo.InvariantCulture).ToUpper())
                        fragmented.AppendFormat(" {0}", character);
                    else
                        fragmented.Append(character);

                // parse
                var sentence = fragmented.ToString().Trim();
                pair.Add(enumValue, sentence);
                return pair[enumValue];
            }
        }

        #endregion
    }
}
