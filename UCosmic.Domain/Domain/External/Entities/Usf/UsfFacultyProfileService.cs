using System;
using System.Linq;

namespace UCosmic.Domain.External
{
    public class UsfFacultyProfileService
    {
        internal readonly ServiceIntegration Integration;

        internal UsfFacultyProfileService(ServiceIntegration integration)
        {
            if (integration == null) throw new ArgumentNullException("integration");
            Integration = integration;
        }

        internal string LoginUrl
        {
            get { return GetStringAttributeValue(UsfFacultyProfileAttribute.LoginUrl); }
        }

        internal string Login
        {
            get { return GetStringAttributeValue(UsfFacultyProfileAttribute.Login); }
        }

        internal string Password
        {
            get { return GetStringAttributeValue(UsfFacultyProfileAttribute.Password); }
        }

        internal string TicketUrl
        {
            get { return GetStringAttributeValue(UsfFacultyProfileAttribute.TicketUrl); }
        }

        internal string Status
        {
            get { return GetStringAttributeValue(UsfFacultyProfileAttribute.Status); }
            set { SetStringAttributeValue(UsfFacultyProfileAttribute.Status, value); }
        }

        internal string PersonUrl
        {
            get { return GetStringAttributeValue(UsfFacultyProfileAttribute.PersonUrl); }
        }

        internal string DepartmentsUrl
        {
            get { return GetStringAttributeValue(UsfFacultyProfileAttribute.DepartmentsUrl); }
        }

        internal string LastUpdate
        {
            get { return GetStringAttributeValue(UsfFacultyProfileAttribute.LastUpdate); }
            set { SetStringAttributeValue(UsfFacultyProfileAttribute.LastUpdate, value); }
        }

        internal string Logging
        {
            get { return GetStringAttributeValue(UsfFacultyProfileAttribute.Logging); }
        }

        private string GetStringAttributeValue(UsfFacultyProfileAttribute attribute)
        {
            return Integration.StringAttributes
                .Where(x => x.Name.Equals(attribute.ToString()))
                .Select(x => x.Value).SingleOrDefault();
        }

        private void SetStringAttributeValue(UsfFacultyProfileAttribute attribute, string value)
        {
            var entity = Integration.StringAttributes.SingleOrDefault(x => x.Name.Equals(attribute.ToString()));
            if (entity == null)
            {
                entity = new ServiceStringAttribute
                {
                    Name = attribute.ToString(),
                    TenantId = Integration.TenantId,
                    IntegrationName = Integration.Name,
                };
                Integration.StringAttributes.Add(entity);
            }
            entity.Value = value;
        }
    }
}
