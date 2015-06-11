using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using MoreLinq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using AttributeRouting;
using AttributeRouting.Web.Http;
using AutoMapper;
using UCosmic.Web.Mvc.Models;
using UCosmic.Repositories;
using UCosmic.Domain.Establishments;

namespace UCosmic.Web.Mvc.ApiControllers
{


    //[System.Web.Http.Authorize]
    [RoutePrefix("api/studentsa")]
    public class StudentsApiController : ApiController
    {

        //public List<StudentImportResponse> GetAzureData(List<StudentImportRequest> student_request)
        //[POST("")]
        //public HttpResponseMessage GetAzureData([FromBody] List<StudentImportRequest> student_request)
        //{
        //    //StudentImportRequest[] student_request
        //    IList<StudentImportResponse> returnModel = new List<StudentImportResponse>();
        //    //IList<StudentImportResponseApiQueryResultModel> model = new List<StudentImportResponseApiQueryResultModel>();
        //    //IList<ActivityTypesApiReturn> establishmentTypes = new List<ActivityTypesApiReturn>();

        //    foreach (StudentImportRequest student in student_request)
        //    {

        //        //public string placeId { get; set; }
        //        //public string uCosmicAffiliationId { get; set; }
        //        ////Students institution -- this is the campus
        //        //public string uCosmicStudentAffiliationId { get; set; }
        //        ////Foreign affiliation... This is optional
        //        //public string uCosmicForeignAffiliationId { get; set; }
        //        StudentRepository studentRepository = new StudentRepository();
        //        var uCosmicAffiliationId = studentRepository.getEstablishmentId(student.uCosmicAffiliationCode, student.uCosmicAffiliation);
        //        var uCosmicStudentAffiliationId = studentRepository.getEstablishmentId(student.uCosmicStudentAffiliationCode, student.uCosmicStudentAffiliation);
        //        var uCosmicForeignAffiliationId = studentRepository.getEstablishmentId(student.uCosmicForeignAffiliationCode, student.uCosmicForeignAffiliation);
        //        var placeId = studentRepository.getPlaceId(student.country);
        //        returnModel.Add(new StudentImportResponse(placeId, uCosmicAffiliationId, uCosmicStudentAffiliationId, uCosmicForeignAffiliationId));
        //    }


        //    var response = Request.CreateResponse(HttpStatusCode.Created, "Home section was successfully created.");
        //    return response;

        //    //return returnModel.ToList();
        //}
        [POST("")]
        public List<StudentImportResponse> Post([FromBody] List<StudentImportRequest> student_request)
        {
            IList<StudentImportResponse> returnModel = new List<StudentImportResponse>();

            foreach (StudentImportRequest student in student_request)
            {

                //public string placeId { get; set; }
                //public string uCosmicAffiliationId { get; set; }
                ////Students institution -- this is the campus
                //public string uCosmicStudentAffiliationId { get; set; }
                ////Foreign affiliation... This is optional
                //public string uCosmicForeignAffiliationId { get; set; }
                StudentRepository studentRepository = new StudentRepository();
                var uCosmicAffiliationId = studentRepository.getEstablishmentId( student.uCosmicAffiliation);
                var uCosmicStudentAffiliationId = studentRepository.getEstablishmentId(student.uCosmicStudentAffiliation);
                var uCosmicForeignAffiliationId = studentRepository.getEstablishmentId( student.uCosmicForeignAffiliation);
                var placeId = studentRepository.getPlaceId(student.country);
                returnModel.Add(new StudentImportResponse(placeId, uCosmicAffiliationId, uCosmicStudentAffiliationId, uCosmicForeignAffiliationId));
            }

            //var response = Request.CreateResponse(HttpStatusCode.Created, "Home section was successfully created.");
            //return response;
            return returnModel.ToList();
        }
    }
}
