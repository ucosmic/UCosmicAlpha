﻿using System;
using System.Linq;
using AutoMapper;
using UCosmic.Domain.Agreements;

namespace UCosmic.Web.Mvc.Models.Agreements
{
    public class AgreementSettingsApiModel
    {
    }

    public static class AgreementSettingsProfiler
    {
        public class EntityToModelProfile : Profile
        {
            protected override void Configure()
            {
            }
        }
    }
}