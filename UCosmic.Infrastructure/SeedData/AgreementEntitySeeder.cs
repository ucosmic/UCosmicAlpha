using System;
using System.IO;
using System.Linq;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Agreements;
using System.Security.Principal;
using UCosmic.Domain.People;

namespace UCosmic.SeedData
{
    public class AgreementEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateAgreement> _createAgreementHandler;
        private readonly IHandleCommands<CreateContact> _createContactHandler;
        private readonly IHandleCommands<CreateFile> _createFileHandler;
        private readonly IUnitOfWork _unitOfWork;

        public AgreementEntitySeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateAgreement> createAgreementHandler
            , IHandleCommands<CreateContact> createContactHandler
            , IHandleCommands<CreateFile> createFileHandler
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _createAgreementHandler = createAgreementHandler;
            _createContactHandler = createContactHandler;
            _createFileHandler = createFileHandler;
            _unitOfWork = unitOfWork;
        }

        public void Seed()
        {
            PurgeCurrentAgreements();
            var uc = _queryProcessor.Execute(new EstablishmentByEmail("@uc.edu"));
            var ucId = uc.RevisionId;
            var principal = GetPrincipal("uc.edu");

            #region UC Agreement #1

            var agreementId = Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Agreement",
                Name = "1 Agreement Test",
                StartsOn = new DateTime(2011, 8, 8),
                ExpiresOn = new DateTime(2011, 12, 31),
                Status = "Active",
                IsAutoRenew = true,
                Content = "<p>This agreement is used to test scenarios for automatically generating a summary description.</p>",
                Notes = "Here are some agreement notes.",
                Visibility = "Public",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                },
            });
            _createContactHandler.Handle(new CreateContact(principal)
            {
                AgreementId = agreementId,
                Type = "Seeded Contact",
                PersonId = _queryProcessor.Execute(new PersonByEmail("ludwigd@uc.edu")).RevisionId,
            });

            #endregion
            #region UC Agreement #2

            agreementId = Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                StartsOn = new DateTime(2010, 11, 29),
                ExpiresOn = new DateTime(2015, 11, 28),
                Status = "Active",
                IsAutoRenew = false,
                Content = "<p>The University of Cincinnati and Jinan University have a mutual interest in promoting training, " +
                    "research, education and publication through joint activities.</p>",
                Visibility = "Public",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.jnu.edu.cn")).RevisionId),
                },
            });
            _createContactHandler.Handle(new CreateContact(principal)
            {
                AgreementId = agreementId,
                Type = "Seeded Contact",
                PersonId = _queryProcessor.Execute(new PersonByEmail("ludwigd@uc.edu")).RevisionId,
            });
            _createFileHandler.Handle(new CreateFile(principal)
            {
                AgreementId = agreementId,
                FileData = CreateFileWrapper("Jinan University ICA.pdf"),
                Visibility = "Protected",
            });

            #endregion
            #region UC Agreement #3

            Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                StartsOn = new DateTime(2009, 8, 8),
                ExpiresOn = new DateTime(2012, 8, 7),
                Status = "Active",
                IsAutoRenew = false,
                Notes = "Typical international collaboration agreement",
                Visibility = "Public",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.swinburne.edu.au")).RevisionId),
                },
            });

            #endregion
            #region UC Agreement #4

            Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Content = "<p>Institutional Collaboration Agreement between University of Cincinnati and Fachhochschule Nordwestschweiz</p>\r\n<p>Status is Active</p>",
                StartsOn = new DateTime(2005, 2, 22),
                ExpiresOn = new DateTime(2013, 5, 10),
                Status = "Active",
                IsAutoRenew = false,
                Notes = "Multiple collaboration",
                Visibility = "Public",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.fhnw.ch")).RevisionId),
                },
            });

            #endregion
            #region UC Agreement #5

            Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Notes = "Institutional Collaboration Agreement between University of Cincinnati and Johannes Kepler Universität Linz - Status is Dead",
                StartsOn = new DateTime(1999, 4, 13),
                ExpiresOn = new DateTime(2010, 6, 13),
                Status = "Dead",
                Visibility = "Protected",
                IsAutoRenew = true,
                Content = "<p>Original ICA signed in 1999 and valid for 3 years</p>\r\n<p>New MOU signed in 2000; addendum signed in 2005.</p>",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.jku.at")).RevisionId),
                },
            });

            #endregion
            #region UC Agreement #6

            Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Notes = "Institutional Collaboration Agreement between University of Cincinnati and Université catholique de Louvain - Status is Active",
                StartsOn = new DateTime(2009, 8, 23),
                ExpiresOn = new DateTime(2012, 8, 22),
                Status = "Active",
                Visibility = "Private",
                IsAutoRenew = false,
                Content = "<p>The University of Cincinnati and the Université catholique de Louvain have a mutual interest " +
                    "in promoting training, research, education and publication through joint activities.</p>",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.uclouvain.be")).RevisionId),
                },
            });

            #endregion
            #region UC Agreement #7

            var umbrella1Id = Seed(new CreateAgreement(principal)
            {
                Type = "Activity Agreement",
                Name = "FIPSE Brazil Activity Agreement",
                StartsOn = new DateTime(2009, 8, 1),
                ExpiresOn = new DateTime(2014, 7, 31),
                Status = "Active",
                Visibility = "Public",
                IsAutoRenew = false,
                Content = "<p>This multilateral agreement is between four (4) institutions: the University of Cincinnati " +
                    "(U.S. lead institution), the University of Florida, the Universidade Federal do Rio de Janeiro (Brazilian " +
                    "lead institution), and the Universidade Federal do Parana.</p>\r\n<p>Agreement is for undergraduate and graduate " +
                    "student exchange.</p>\r\n<p>This agreement actually contains two different end dates: Page 1, Article 4, cites a " +
                    "four-year span, ending July 31, 2013. Page 5, Article 22, says it is a 5-year span.</p>",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.ufl.edu")).RevisionId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.ufrj.br")).RevisionId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.ufpr.br")).RevisionId),
                },
            });

            #endregion
            #region UC Agreement #8

            Seed(new CreateAgreement(principal)
            {
                UmbrellaId = umbrella1Id,
                Type = "Memorandum of Cooperation",
                Notes = "Memorandum of Cooperation between University of Cincinnati and Universidade Federal do Paraná - Status is Unknown",
                StartsOn = new DateTime(1990, 7, 11),
                ExpiresOn = new DateTime(2014, 7, 31),
                Status = "Unknown",
                Visibility = "Public",
                IsAutoRenew = null,
                Content = "<p>Memorandum of Cooperation between University of Cincinnati. Cincinnati, Oh U.S.A. " +
                    "and Universidade Federal DO Parana. Curitiba, Parana, Brazil and, as facilitators, the " +
                    "Ohio-Parana and Parana-Ohio Committees of the Nation Association of the Partners of the Americas.</p>",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.ufpr.br")).RevisionId),
                },
            });

            #endregion
            #region UC Agreement #9

            Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Content = "Institutional Collaboration Agreement between University of Cincinnati and Instituto de Pesquisa e Planejamento Urbano de Curitiba - Status is Active",
                StartsOn = new DateTime(2009, 9, 19),
                ExpiresOn = new DateTime(2010, 9, 18),
                Status = "Active",
                Visibility = "Public",
                IsAutoRenew = false,
                Notes = "Multiple collabation",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.ippuc.org.br")).RevisionId),
                },
            });

            #endregion
            #region UC Agreement #10

            Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Notes = "Institutional Collaboration Agreement between University of Cincinnati and Universidade Positivo - Status is Active",
                StartsOn = new DateTime(2008, 3, 12),
                ExpiresOn = new DateTime(2011, 3, 11),
                Status = "Active",
                Visibility = "Public",
                IsAutoRenew = false,
                Content = "The University of Cincinnati and the Universidade Positivo have a mutual interest " +
                    "in promotin training, research, education and publication through joint activities.",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.up.com.br")).RevisionId),
                },
            });

            #endregion
            #region UC Agreement #11

            Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Notes = "Institutional Collaboration Agreement between University of Cincinnati College of Medicine and Universidade de São Paulo - Status is Active",
                StartsOn = new DateTime(2010, 2, 25),
                ExpiresOn = new DateTime(2015, 2, 24),
                Status = "Active",
                Visibility = "Protected",
                IsAutoRenew = false,
                Content = "<p>To promote academic cooperation for exchange of teaching staff, joint research projects, exchange of students, shared courses and subjects, etc.</p>",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.med.uc.edu")).RevisionId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.usp.br")).RevisionId),
                },
            });

            #endregion
            #region UC Agreement #12

            Seed(new CreateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Content = "Institutional Collaboration Agreement between University of Cincinnati and Universidad de Desarrollo - Status is Active",
                StartsOn = new DateTime(2006, 7, 19),
                ExpiresOn = new DateTime(2012, 7, 18),
                Status = "Active",
                Visibility = "Private",
                IsAutoRenew = true,
                Notes = "Update ICA - Auto Renews for 3 year periods.",
                Participants = new[]
                {
                    new CreateParticipant(principal, 0, ucId),
                    new CreateParticipant(principal, 0, _queryProcessor.Execute(new EstablishmentByUrl("www.udd.cl")).RevisionId),
                },
            });

            #endregion
        }

        private int Seed(CreateAgreement command)
        {
            _createAgreementHandler.Handle(command);
            return command.CreatedAgreementId;
        }

        private IPrincipal GetPrincipal(string domain)
        {
            var identity = new GenericIdentity(string.Format("supervisor1@{0}", domain));
            var principal = new GenericPrincipal(identity, new[]
            {
                RoleName.AgreementSupervisor
            });
            return principal;
        }

        private void PurgeCurrentAgreements()
        {
            _entities.Get<Agreement>().ToList().ForEach(a =>
            {
                _entities.Get<Agreement>().ToList().ForEach(agreement =>
                    agreement.Offspring.ToList().ForEach(_entities.Purge)
                );
                _entities.Purge(a);
                _unitOfWork.SaveChanges();
            });
        }

        private static CreateFile.FileDataWrapper CreateFileWrapper(string fileName, string mimeType = "application/pdf")
        {
            using (var fileStream = File.OpenRead(string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\", fileName)))
            {
                var content = fileStream.ReadFully();
                return new CreateFile.FileDataWrapper
                {
                    Content = content,
                    FileName = fileName,
                    MimeType = mimeType,
                };
            }
        }
    }
}
