using System.Collections.Generic;
using System.Web.Http;
using AttributeRouting.Web.Http;
using UCosmic.Web.Mvc.Models.Agreements;

namespace UCosmic.Web.Mvc.ApiControllers
{
    [DefaultApiHttpRouteConvention]
    public class AgreementsController : ApiController
    {
        public IEnumerable<AgreementApiModel> GetPaged()
        {
            return null;
        }

        [GET("{agreementId}/participants")]
        public IEnumerable<AgreementParticipantApiModel> GetParticipants(int agreementId)
        {
            return null;
        }
    }
}
