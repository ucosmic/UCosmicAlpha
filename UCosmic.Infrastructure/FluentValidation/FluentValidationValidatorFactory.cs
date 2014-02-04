using System;
using FluentValidation;
using SimpleInjector;

namespace UCosmic.FluentValidation
{
    public class FluentValidationValidatorFactory : ValidatorFactoryBase
    {
        private readonly Container _container;

        public FluentValidationValidatorFactory(Container container)
        {
            _container = container;
        }

        public override IValidator CreateInstance(Type validatorType)
        {
            return _container.GetInstance(validatorType) as IValidator;
        }
    }
}
