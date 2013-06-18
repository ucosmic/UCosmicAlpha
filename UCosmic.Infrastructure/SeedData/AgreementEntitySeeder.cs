using System;
using System.IO;
using System.Linq;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Files;
using UCosmic.Domain.Agreements;
using System.Security.Principal;
using UCosmic.Domain.People;

namespace UCosmic.SeedData
{
    public class InstitutionalAgreementEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly ICommandEntities _entities;
        private readonly IHandleCommands<CreateOrUpdateAgreement> _agreementHandler;
        private readonly IHandleCommands<CreateLooseFile> _fileHandler;
        private readonly IUnitOfWork _unitOfWork;

        public InstitutionalAgreementEntitySeeder(IProcessQueries queryProcessor
            , ICommandEntities entities
            , IHandleCommands<CreateOrUpdateAgreement> agreementHandler
            , IHandleCommands<CreateLooseFile> fileHandler
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _entities = entities;
            _agreementHandler = agreementHandler;
            _fileHandler = fileHandler;
            _unitOfWork = unitOfWork;
        }

        public void Seed()
        {
            PurgeCurrentAgreements();
            var uc = _queryProcessor.Execute(new EstablishmentByEmail("@uc.edu"));
            var ucId = uc.RevisionId;
            var principal = GetPrincipal("uc.edu");

            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Agreement",
                Title = "1 Agreement Test",
                StartsOn = new DateTime(2011, 8, 8),
                ExpiresOn = new DateTime(2011, 12, 31),
                Status = "Active",
                IsTitleDerived = false,
                IsAutoRenew = true,
                Description = "This agreement is used to test scenarios for automatically generating a summary description.",
                AddParticipantEstablishmentIds = new[] { ucId },
                AddContactCommands = new[]
                {
                    new AddContactToAgreement(principal)
                    {
                        ContactType = "Seeded Contact",
                        PersonEntityId = _queryProcessor.Execute(new PersonByEmail("ludwigd@uc.edu")).EntityId,
                    },
                },
            });
            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Title = "Institutional Collaboration Agreement between University of Cincinnati and Jinan University - Status is Active",
                StartsOn = new DateTime(2010, 11, 29),
                ExpiresOn = new DateTime(2015, 11, 28),
                Status = "Active",
                IsTitleDerived = true,
                IsAutoRenew = false,
                Description = "The University of Cincinnati and Jinan University have a mutual interest in promoting training, " +
                    "research, education and publication through joint activities.",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.jnu.edu.cn")).RevisionId,
                },
                AttachFileIds = new[] { CreateLooseFile1() },
                AddContactCommands = new[]
                {
                    new AddContactToAgreement(principal)
                    {
                        ContactType = "Seeded Contact",
                        PersonEntityId = _queryProcessor.Execute(new PersonByEmail("ludwigd@uc.edu")).EntityId,
                    },
                },
            });

            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Title = "Institutional Collaboration Agreement between University of Cincinnati and Swinburne University of Technology - Status is Active",
                StartsOn = new DateTime(2009, 8, 8),
                ExpiresOn = new DateTime(2012, 8, 7),
                Status = "Active",
                IsTitleDerived = true,
                IsAutoRenew = false,
                Description = "Typical international collaboration agreement",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.swinburne.edu.au")).RevisionId,
                },
            });

            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Title = "Institutional Collaboration Agreement between University of Cincinnati and Fachhochschule Nordwestschweiz - Status is Active",
                StartsOn = new DateTime(2005, 2, 22),
                ExpiresOn = new DateTime(2013, 5, 10),
                Status = "Active",
                IsTitleDerived = true,
                IsAutoRenew = false,
                Description = "Multiple collaboration",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.fhnw.ch")).RevisionId,
                },
            });

            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Title = "Institutional Collaboration Agreement between University of Cincinnati and Johannes Kepler Universität Linz - Status is Dead",
                StartsOn = new DateTime(1999, 4, 13),
                ExpiresOn = new DateTime(2010, 6, 13),
                Status = "Dead",
                IsTitleDerived = true,
                IsAutoRenew = true,
                Description = "Original ICA signed in 1999 and valid for 3 years; new MOU signed in 2000; addendum signed in 2005.",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.jku.at")).RevisionId,
                },
            });

            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Title = "Institutional Collaboration Agreement between University of Cincinnati and Université catholique de Louvain - Status is Active",
                StartsOn = new DateTime(2009, 8, 23),
                ExpiresOn = new DateTime(2012, 8, 22),
                Status = "Active",
                IsTitleDerived = true,
                IsAutoRenew = false,
                Description = "The University of Cincinnati and the Université catholique de Louvain have a mutual interest " +
                    "in promoting training, research, education and publication through joint activities.",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.uclouvain.be")).RevisionId,
                },
            });

            var umbrella1Id = Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Activity Agreement",
                Title = "FIPSE Brazil Activity Agreement",
                StartsOn = new DateTime(2009, 8, 1),
                ExpiresOn = new DateTime(2014, 7, 31),
                Status = "Active",
                IsTitleDerived = false,
                IsAutoRenew = false,
                Description = "This multilateral agreement is between four (4) institutions: the University of Cincinnati " +
                    "(U.S. lead institution), the University of Florida, the Universidade Federal do Rio de Janeiro (Brazilian " +
                    "lead institution), and the Universidade Federal do Parana. \r\n\r\nAgreement is for undergraduate and graduate " +
                    "student exchange. \r\n\r\nThis agreement actually contains two different end dates: Page 1, Article 4, cites a " +
                    "four-year span, ending July 31, 2013. Page 5, Article 22, says it is a 5-year span.",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.ufl.edu")).RevisionId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.ufrj.br")).RevisionId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.ufpr.br")).RevisionId,
                },
            });

            Seed(new CreateOrUpdateAgreement(principal)
            {
                UmbrellaId = umbrella1Id,
                Type = "Memorandum of Cooperation",
                Title = "Memorandum of Cooperation between University of Cincinnati and Universidade Federal do Paraná - Status is Unknown",
                StartsOn = new DateTime(1990, 7, 11),
                ExpiresOn = new DateTime(2014, 7, 31),
                Status = "Unknown",
                IsTitleDerived = true,
                IsAutoRenew = null,
                Description = "Memorandum of Cooperation between University of Cincinnati. Cincinnati, Oh U.S.A. " +
                    "and Universidade Federal DO Parana. Curitiba, Parana, Brazil and, as facilitators, the " +
                    "Ohio-Parana and Parana-Ohio Committees of the Nation Association of the Partners of the Americas",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.ufpr.br")).RevisionId,
                },
            });

            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Title = "Institutional Collaboration Agreement between University of Cincinnati and Instituto de Pesquisa e Planejamento Urbano de Curitiba - Status is Active",
                StartsOn = new DateTime(2009, 9, 19),
                ExpiresOn = new DateTime(2010, 9, 18),
                Status = "Active",
                IsTitleDerived = true,
                IsAutoRenew = false,
                Description = "Multiple collabation",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.ippuc.org.br")).RevisionId,
                },
            });

            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Title = "Institutional Collaboration Agreement between University of Cincinnati and Universidade Positivo - Status is Active",
                StartsOn = new DateTime(2008, 3, 12),
                ExpiresOn = new DateTime(2011, 3, 11),
                Status = "Active",
                IsTitleDerived = true,
                IsAutoRenew = false,
                Description = "The University of Cincinnati and the Universidade Positivo have a mutual interest " +
                    "in promotin training, research, education and publication through joint activities.",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.up.com.br")).RevisionId,
                },
            });

            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Title = "Institutional Collaboration Agreement between University of Cincinnati College of Medicine and Universidade de São Paulo - Status is Active",
                StartsOn = new DateTime(2010, 2, 25),
                ExpiresOn = new DateTime(2015, 2, 24),
                Status = "Active",
                IsTitleDerived = true,
                IsAutoRenew = false,
                Description = "To promote academic cooperation for exchange of teaching staff, joint research projects, exchange of students, shared courses and subjects, etc.",
                AddParticipantEstablishmentIds = new[]
                {
                    _queryProcessor.Execute(new EstablishmentByUrl("www.med.uc.edu")).RevisionId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.usp.br")).RevisionId,
                },
            });

            Seed(new CreateOrUpdateAgreement(principal)
            {
                Type = "Institutional Collaboration Agreement",
                Title = "Institutional Collaboration Agreement between University of Cincinnati and Universidad de Desarrollo - Status is Active",
                StartsOn = new DateTime(2006, 7, 19),
                ExpiresOn = new DateTime(2012, 7, 18),
                Status = "Active",
                IsTitleDerived = true,
                IsAutoRenew = true,
                Description = "Update ICA - Auto Renews for 3 year periods.",
                AddParticipantEstablishmentIds = new[]
                {
                    ucId,
                    _queryProcessor.Execute(new EstablishmentByUrl("www.udd.cl")).RevisionId,
                },
            });

        }

        protected int Seed(CreateOrUpdateAgreement command)
        {
            _agreementHandler.Handle(command);
            return command.Id;
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

        private int CreateLooseFile1()
        {
            const string fileName = "Jinan University ICA.pdf";
            using (var fileStream = File.OpenRead(string.Format("{0}{1}{2}", AppDomain.CurrentDomain.BaseDirectory,
                @"..\UCosmic.Infrastructure\SeedData\SeedMediaFiles\", fileName)))
            {
                var content = fileStream.ReadFully();
                var fileCommand = new CreateLooseFile
                {
                    MimeType = "application/pdf",
                    Name = "Jinan University ICA.pdf",
                    Content = content,
                };
                _fileHandler.Handle(fileCommand);
                return fileCommand.CreatedLooseFileId;
            }
        }
    }
}
