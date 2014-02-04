using FluentValidation;
using UCosmic.Domain.People;

namespace UCosmic.Web.Mvc.Models
{
    public class EmailAddressPostModel
    {
        public int PersonId { get; set; }
        public string Value { get; set; }
    }

    public class EmailAddressPostValidator : AbstractValidator<EmailAddressPostModel>
    {
        public EmailAddressPostValidator(IProcessQueries queries)
        {
            RuleFor(x => x.PersonId)
                .MustFindPersonById(queries).WithMessage("Could not find person #{0}", x => x.PersonId)
            ;

            RuleFor(x => x.Value)
                .NotEmpty().WithMessage("Email address is required.")
                .EmailAddress().WithMessage("'{0}' is not a valid email address.", x => x.Value)
                .MustNotFindEmailAddressByValue(queries)
                .MustBeAllowableEmailDomainForPerson(queries, x => x.PersonId)
            ;
        }
    }
}