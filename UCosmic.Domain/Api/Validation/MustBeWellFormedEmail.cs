/**
 *
 * There is already an EmailAddress() validation method built into FluentValidation.NET.
 *
 * Usage examples can be found in
 *      UCosmic.Domain.Identity.SendConfirmEmailMessage
 *      UCosmic.Domain.Identity.SendCreatePasswordMessage.cs
 *      UCosmic.Domain.People.UpdateMyEmailValue.cs
 */























































//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Text.RegularExpressions;
//using System.Globalization;
//using FluentValidation;
//using FluentValidation.Validators;

//namespace UCosmic
//{
//    public class MustBeWellFormedEmail : PropertyValidator
//    {

//        bool isEmailValid = false;
//        public const string FailMessageFormat = "The value '{0}' does not appear to be a valid Email Address.";

//        internal MustBeWellFormedEmail()
//            : base(FailMessageFormat.Replace("{0}", "{PropertyValue}")) { }

//        protected override bool IsValid(PropertyValidatorContext context)
//        {
//            if (!(context.PropertyValue is string))
//                throw new NotSupportedException(string.Format(
//                    "The {0} PropertyValidator can only operate on string properties", GetType().Name));

//            var value = (string)context.PropertyValue;

//            if (String.IsNullOrEmpty(value))
//                return false;

//            return Regex.IsMatch(Regex.Replace(value, @"(@)(.+)$", this.DomainMapper),
//                   @"^(?("")(""[^""]+?""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))" +
//                   @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-\w]*[0-9a-z]*\.)+[a-z0-9]{2,17}))$",
//                   RegexOptions.IgnoreCase);
//        }



//        private string DomainMapper(Match match)
//        {
//            IdnMapping idn = new IdnMapping();

//            string domainName = match.Groups[2].Value;
//            try
//            {
//                domainName = idn.GetAscii(domainName);
//            }
//            catch (ArgumentException)
//            {
//                isEmailValid = true;
//            }
//            return match.Groups[1].Value + domainName;
//        }

//    }
//}
