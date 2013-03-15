using System.Collections.Generic;
using UCosmic.Domain.Establishments;
using UCosmic.Domain.Languages;

namespace UCosmic.SeedData
{
    public class EstablishmentEntitySeeder : ISeedData
    {
        private readonly EstablishmentTypeAndCategorySeeder _typeAndCategorySeeder;
        private readonly EstablishmentSunyEntitySeeder _sunySeeder;
        private readonly EstablishmentUcEntitySeeder _ucSeeder;
        private readonly EstablishmentFoundingMemberEntitySeeder _foundingMemberSeeder;
        private readonly EstablishmentSamplePartnerEntitySeeder _samplePartnerSeeder;
        private readonly EstablishmentUmnEntitySeeder _umnSeeder;
        private readonly EstablishmentUsfEntitySeeder _usfSeeder;
        private readonly EstablishmentUwoEntitySeeder _uwoSeeder;
        private readonly EstablishmentTestShibEntitySeeder _testShibSeeder;
        //private readonly EstablishmentUcShibEntitySeeder _ucShibSeeder;
        private readonly EstablishmentRecruitmentAgencyEntitySeeder _agencySeeder;

        public EstablishmentEntitySeeder(EstablishmentTypeAndCategorySeeder typeAndCategorySeeder
            , EstablishmentSunyEntitySeeder sunySeeder
            , EstablishmentUcEntitySeeder ucSeeder
            , EstablishmentFoundingMemberEntitySeeder foundingMemberSeeder
            , EstablishmentSamplePartnerEntitySeeder samplePartnerSeeder
            , EstablishmentUmnEntitySeeder umnSeeder
            , EstablishmentUsfEntitySeeder usfSeeder
            , EstablishmentUwoEntitySeeder uwoSeeder
            , EstablishmentTestShibEntitySeeder testShibSeeder
            //, EstablishmentUcShibEntitySeeder ucShibSeeder
            , EstablishmentRecruitmentAgencyEntitySeeder agencySeeder
        )
        {
            _typeAndCategorySeeder = typeAndCategorySeeder;
            _sunySeeder = sunySeeder;
            _ucSeeder = ucSeeder;
            _foundingMemberSeeder = foundingMemberSeeder;
            _samplePartnerSeeder = samplePartnerSeeder;
            _umnSeeder = umnSeeder;
            _usfSeeder = usfSeeder;
            _uwoSeeder = uwoSeeder;
            _testShibSeeder = testShibSeeder;
            //_ucShibSeeder = ucShibSeeder;
            _agencySeeder = agencySeeder;
        }

        public void Seed()
        {
            _typeAndCategorySeeder.Seed();
            _sunySeeder.Seed();
            _ucSeeder.Seed();
            _foundingMemberSeeder.Seed();
            _samplePartnerSeeder.Seed();
            _umnSeeder.Seed();
            _usfSeeder.Seed();
            _uwoSeeder.Seed();
            _testShibSeeder.Seed();
            //_ucShibSeeder.Seed();
            _agencySeeder.Seed();
        }
    }

    public class EstablishmentSunyEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentSunyEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
        }

        public override void Seed()
        {
            var suny = Seed(new SeedEstablishment
            {
                OfficialName = "State University of New York (SUNY)",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.UniversitySystem.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.suny.edu",
                EmailDomains = new[] { "@suny.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Adirondack",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.UniversitySystem.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunyacc.edu",
                EmailDomains = new[] { "@sunyacc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "University at Albany (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.albany.edu",
                EmailDomains = new[] { "@albany.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Alfred State College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.alfredstate.edu",
                EmailDomains = new[] { "@alfredstate.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Alfred University (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.alfred.edu",
                EmailDomains = new[] { "@alfred.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Binghamtom University (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.binghamton.edu",
                EmailDomains = new[] { "@binghamton.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "The College at Brockport (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.brockport.edu",
                EmailDomains = new[] { "@brockport.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Broome Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunybroome.edu",
                EmailDomains = new[] { "@sunybroome.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "University at Buffalo (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.buffalo.edu",
                EmailDomains = new[] { "@buffalo.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Buffalo State College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.buffalostate.edu",
                EmailDomains = new[] { "@buffalostate.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Canton",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.canton.edu",
                EmailDomains = new[] { "@canton.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Cayuga Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cayuga-cc.edu",
                EmailDomains = new[] { "@cayuga-cc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Clinton Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.clinton.edu",
                EmailDomains = new[] { "@clinton.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Cobleskill",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cobleskill.edu",
                EmailDomains = new[] { "@cobleskill.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Columbia-Greene Community College",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunycgcc.edu",
                EmailDomains = new[] { "@sunycgcc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Cornell University College of Agriculture and Life Sciences",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cals.cornell.edu",
                EmailDomains = new[] { "@cals.cornell.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Cornell University College of Human Ecology",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.human.cornell.edu",
                EmailDomains = new[] { "@human.cornell.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Cornell University College of Veterinary Medicine",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.vet.cornell.edu",
                EmailDomains = new[] { "@vet.cornell.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Cornell University ILR School",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ilr.cornell.edu",
                EmailDomains = new[] { "@ilr.cornell.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Corning Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.corning-cc.edu",
                EmailDomains = new[] { "@corning-cc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Cortland",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cortland.edu",
                EmailDomains = new[] { "@cortland.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Delhi",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.delhi.edu",
                EmailDomains = new[] { "@delhi.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Downstate Medical Center",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.downstate.edu",
                EmailDomains = new[] { "@downstate.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Dutchess Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunydutchess.edu",
                EmailDomains = new[] { "@sunydutchess.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Empire State College",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.esc.edu",
                EmailDomains = new[] { "@esc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY College of Environmental Science and Forestry",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.esf.edu",
                EmailDomains = new[] { "@esf.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Erie Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ecc.edu",
                EmailDomains = new[] { "@ecc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Farmingdale State College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.farmingdale.edu",
                EmailDomains = new[] { "@farmingdale.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Fashion Institute of Technology (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.fitnyc.edu",
                EmailDomains = new[] { "@fitnyc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Finger Lakes Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.flcc.edu",
                EmailDomains = new[] { "@flcc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Fredonia",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.fredonia.edu",
                EmailDomains = new[] { "@fredonia.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Fulton-Montgomery Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "fmcc.suny.edu",
                EmailDomains = new[] { "@fmcc.suny.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Genesse Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.genesse.edu",
                EmailDomains = new[] { "@genesse.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Geneseo",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.geneseo.edu",
                EmailDomains = new[] { "@geneseo.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Herkimer County Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.herkimer.edu",
                EmailDomains = new[] { "@herkimer.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Hudson Valley Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.hvcc.edu",
                EmailDomains = new[] { "@hvcc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Jamestown Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunyjcc.edu",
                EmailDomains = new[] { "@sunyjcc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Jefferson Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunyjefferson.edu",
                EmailDomains = new[] { "@sunyjefferson.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Maritime College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunymaritime.edu",
                EmailDomains = new[] { "@sunymaritime.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Mohawk Valley Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.mvcc.edu",
                EmailDomains = new[] { "@mvcc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Monroe Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.monroecc.edu",
                EmailDomains = new[] { "@monroecc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Morrisville State College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.morrisville.edu",
                EmailDomains = new[] { "@morrisville.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Nassau Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ncc.edu",
                EmailDomains = new[] { "@ncc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "New Paltz (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.newpaltz.edu",
                EmailDomains = new[] { "@newpaltz.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Niagra County Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.niagaracc.suny.edu",
                EmailDomains = new[] { "@niagaracc.suny.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "North Country Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.nccc.edu",
                EmailDomains = new[] { "@nccc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "The College at Old Westbury (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.oldwestbury.edu",
                EmailDomains = new[] { "@oldwestbury.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY College at Oneonta",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.oneonta.edu",
                EmailDomains = new[] { "@oneonta.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Onondaga Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunyocc.edu",
                EmailDomains = new[] { "@sunyocc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY College of Optometry",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunyopt.edu",
                EmailDomains = new[] { "@sunyopt.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Orange",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunyorange.edu",
                EmailDomains = new[] { "@sunyorange.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Oswego (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.oswego.edu",
                EmailDomains = new[] { "@oswego.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Plattsburgh",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.plattsburgh.edu",
                EmailDomains = new[] { "@plattsburgh.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Potsdam",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.potsdam.edu",
                EmailDomains = new[] { "@potsdam.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Purchase College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.purchase.edu",
                EmailDomains = new[] { "@purchase.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Rockland Community College",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunyrockland.edu",
                EmailDomains = new[] { "@sunyrockland.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Schenectady County Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunysccc.edu",
                EmailDomains = new[] { "@sunysccc.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Stony Brook University (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.stonybrook.edu",
                EmailDomains = new[] { "@stonybrook.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Suffolk County Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunysuffolk.edu",
                EmailDomains = new[] { "@sunysuffolk.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Sullivan Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunysullivan.edu",
                EmailDomains = new[] { "@sunysullivan.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNYIT",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunyit.edu",
                EmailDomains = new[] { "@sunyit.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Tompkins Cortland Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.tc3.edu",
                EmailDomains = new[] { "@tc3.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "SUNY Ulster",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunyulster.edu",
                EmailDomains = new[] { "@sunyulster.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Upstate Medical University (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.upstate.edu",
                EmailDomains = new[] { "@upstate.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Westchester Community College (SUNY)",
                IsMember = true,
                ParentId = suny.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.CommunityCollege.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sunywcc.edu",
                EmailDomains = new[] { "@sunywcc.edu" },
            });
        }
    }

    public class EstablishmentUcEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentUcEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
        }

        public override void Seed()
        {
            var uc = Seed(new SeedEstablishment
            {
                OfficialName = "University of Cincinnati",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uc.edu",
                EmailDomains = new[] { "@uc.edu", "@ucmail.uc.edu" },
                FindPlacesByCoordinates = true,
                CenterLatitude = 39.132084,
                CenterLongitude = -84.516479,
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Allied Health Sciences, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cahs.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "McMicken College of Arts & Sciences, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.artsci.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Business, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.business.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College Conservatory of Music, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "ccm.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Design, Architecture, Art, and Planning, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.daap.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Education, Criminal Justice, and Human Services, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cech.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Engineering & Applied Sciences, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ceas.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Law, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.law.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Medicine, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.med.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Nursing, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "nursing.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "James L. Winkle College of Pharmacy, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "pharmacy.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "School of Social Work, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uc.edu/socialwork",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Raymond Walters College, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.rwc.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Clermont College, University of Cincinnati",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ucclermont.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "University of Cincinnati Graduate School",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.grad.uc.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "University of Cincinnati Honors Program",
                IsMember = true,
                ParentId = uc.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.AcademicProgram.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uc.edu/honors.html",
            });
        }
    }

    public class EstablishmentFoundingMemberEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentFoundingMemberEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
        }

        public override void Seed()
        {
            #region Lehigh

            var lehigh = Seed(new SeedEstablishment
            {
                OfficialName = "Lehigh University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.lehigh.edu",
                EmailDomains = new[] { "@lehigh.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Lehigh University College of Arts and Sciences",
                IsMember = true,
                ParentId = lehigh.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "cas.lehigh.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Lehigh University College of Business and Economics",
                IsMember = true,
                ParentId = lehigh.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.lehigh.edu/business",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Lehigh University College of Education",
                IsMember = true,
                ParentId = lehigh.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.lehigh.edu/education",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Lehigh University P.C. Rossin College of Engineering and Applied Science",
                IsMember = true,
                ParentId = lehigh.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.lehigh.edu/engineering",
            });

            #endregion
            #region Manipal

            var manipalGlobal = Seed(new SeedEstablishment
            {
                OfficialName = "Manipal Education",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.UniversitySystem.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.manipalglobal.com",
            });
            var manipalEdu = Seed(new SeedEstablishment
            {
                OfficialName = "Manipal University",
                IsMember = true,
                ParentId = manipalGlobal.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.manipal.edu",
                EmailDomains = new[] { "@manipal.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Melaka Manipal Medical College",
                IsMember = true,
                ParentId = manipalEdu.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.manipal.edu/Institutions/Medicine/MMMCMelaka",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "ICICI Manipal Academy",
                IsMember = true,
                ParentId = manipalEdu.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ima.manipal.edu",
                EmailDomains = new[] { "@ima.manipal.edu" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "American University of Antigua",
                IsMember = true,
                ParentId = manipalGlobal.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.auamed.org",
                EmailDomains = new[] { "@auamed.org" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Manipal University Dubai Campus",
                IsMember = true,
                ParentId = manipalGlobal.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.manipaldubai.com",
                EmailDomains = new[] { "@manipaldubai.com" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Manipal College of Medical Sciences, Nepal",
                IsMember = true,
                ParentId = manipalGlobal.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.manipal.edu.np",
                EmailDomains = new[] { "@manipal.edu.np" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Sikkim Manipal University",
                IsMember = true,
                ParentId = manipalGlobal.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.smude.edu.in",
                EmailDomains = new[] { "@smude.edu.in" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Manipal International University",
                IsMember = true,
                ParentId = manipalGlobal.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.miu.edu.my",
                EmailDomains = new[] { "@miu.edu.my" },
            });

            #endregion
            #region Usil

            var usil = Seed(new SeedEstablishment
            {
                OfficialName = "Universidad San Ignacio de Loyola",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.usil.edu.pe",
                EmailDomains = new[] { "@usil.edu.pe" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad San Ignacio de Loyola Facultad de Ciencias Empresariales",
                IsMember = true,
                ParentId = usil.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.usil.edu.pe/0/facultad.aspx?PFL=9",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad San Ignacio de Loyola Facultad de Educación",
                IsMember = true,
                ParentId = usil.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.usil.edu.pe/0/facultad.aspx?PFL=12",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad San Ignacio de Loyola Facultad de Administración Hotelera, Turismo y Gastronomía",
                IsMember = true,
                ParentId = usil.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.usil.edu.pe/0/facultad.aspx?PFL=8",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad San Ignacio de Loyola Facultad de  Humanidades",
                IsMember = true,
                ParentId = usil.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.usil.edu.pe/0/facultad.aspx?PFL=11",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad San Ignacio de Loyola Ingeniería y Arquitectura",
                IsMember = true,
                ParentId = usil.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.usil.edu.pe/0/modulos/EVE/EVE_DetallarEvento.aspx?PFL=0&EVE=711",
            });

            #endregion
            #region Griffith

            var griffith = Seed(new SeedEstablishment
            {
                OfficialName = "Griffith University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.griffith.edu.au",
                EmailDomains = new[] { "@griffith.edu.au" },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Griffith University Gold Coast Campus",
                IsMember = true,
                ParentId = griffith.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.UniversityCampus.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.griffith.edu.au/about-griffith/campuses/gold-coast-campus",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Griffith University Logan Campus",
                IsMember = true,
                ParentId = griffith.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.UniversityCampus.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.griffith.edu.au/about-griffith/campuses/logan-campus",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Griffith University Mt Gravatt Campus",
                IsMember = true,
                ParentId = griffith.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.UniversityCampus.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.griffith.edu.au/about-griffith/campuses/mt-gravatt-campus",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Griffith University Nathan Campus",
                IsMember = true,
                ParentId = griffith.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.UniversityCampus.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.griffith.edu.au/about-griffith/campuses/nathan-campus",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Griffith University South Bank Campus",
                IsMember = true,
                ParentId = griffith.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.UniversityCampus.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.griffith.edu.au/about-griffith/campuses/south-bank-campus",
            });

            #endregion
            #region Singles (Bjtu, Edinburgh, etc)

            Seed(new SeedEstablishment
            {
                OfficialName = "Beijing Jiaotong University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.bjtu.edu.cn",
                EmailDomains = new[] { "@bjtu.edu.cn", "@njtu.edu.cn" },
                NonOfficialUrls = new[]
                {
                    new SeedEstablishment.NonOfficialUrl
                    {
                        Value = "www.njtu.edu.cn",
                        IsDefunct = true,
                    }
                },
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Northern Jiaotong University",
                        IsDefunct = true,
                        TranslationToLanguageId = _queryProcessor.Execute(
                            new LanguageByIsoCode("en")).Id,
                    }
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Edinburgh Napier University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.napier.ac.uk",
                EmailDomains = new[] { "@napier.ac.uk" },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Future University in Egypt",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.fue.edu.eg",
                EmailDomains = new[] { "@fue.edu.eg" },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidade Presbiteriana Mackenzie",
                IsMember = false,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.mackenzie.br",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "The University of New South Wales",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.unsw.edu.au",
                EmailDomains = new[] { "@unsw.edu.au" },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "University of Minnesota",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.umn.edu",
                EmailDomains = new[] { "@umn.edu" },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "The College Board",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.BusinessOrCorporation.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.collegeboard.org",
                EmailDomains = new[] { "@collegeboard.org" },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Institute of International Education (IIE)",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Association.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.iie.org",
                EmailDomains = new[] { "@iie.org" },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Terra Dotta, LLC",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.BusinessOrCorporation.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.terradotta.com",
                EmailDomains = new[] { "@terradotta.com" },
            });

            #endregion
        }
    }

    public class EstablishmentUmnEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentUmnEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
        }

        public override void Seed()
        {
            var umn = _queryProcessor.Execute(new EstablishmentByUrl("www.umn.edu"));
            Seed(new SeedEstablishment
            {
                OfficialName = "Center for Allied Health Programs, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cahp.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Biological Sciences, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cbs.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Continuing Education, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cce.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "School of Dentistry, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.dentistry.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Design, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.design.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Education & Human Development, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cehd.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "University of Minnesota Extension",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.extension.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Food, Agricultural and Natural Resource Sciences, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cfans.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "The Graduate School, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.grad.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "University of Minnesota Law School",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.law.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Liberal Arts, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cla.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Carlson School of Management, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.csom.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "University of Minnesota Medical School",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.med.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "School of Nursing, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.nursing.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Pharmacy, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.pharmacy.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Hubert H. Humphrey School of Public Affairs, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.hhh.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "School of Public Health, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sph.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Science & Engineering, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cse.umn.edu",
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "College of Veterinary Medicine, University of Minnesota",
                IsMember = true,
                ParentId = umn.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cvm.umn.edu",
            });
        }
    }

    public class EstablishmentUsfEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentUsfEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
        }

        public override void Seed()
        {
            var university = Seed(new SeedEstablishment
                {
                    OfficialName = "University of South Florida",
                    IsMember = true,
                    TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                        KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                    OfficialWebsiteUrl = "www.usf.edu",
                    EmailDomains = new[] { "@usf.edu", "@iac.usf.edu", "@mail.usf.edu" },
                    FindPlacesByCoordinates = true,
                    CenterLatitude = 28.061680,
                    CenterLongitude = -82.414803,
                });

            var campus = Seed(new SeedEstablishment
                {
                    OfficialName = "USF Tampa Campus",
                    IsMember = true,
                    ParentId = university.RevisionId,
                    TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                        KnownEstablishmentType.UniversityCampus.AsSentenceFragment())).RevisionId,
                });

            var college = Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Arts & Sciences",
                IsMember = true,
                ParentId = campus.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cas.usf.edu",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Arts & Sciences Department of Africana Studies",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "africanastudies.usf.edu",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Arts & Sciences Department of Anthropology",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "anthropology.usf.edu",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Arts & Sciences Department of Cell Biology, Microbiology and Molecular Biology",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "biology.usf.edu/cmmb",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Arts & Sciences Department of Chemistry",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "chemistry.usf.edu",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Arts & Sciences Department of Sociology",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "sociology.usf.edu",
            });

            /* TODO: Seed the other departments */

            college = Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Behavioral and Community Sciences",
                IsMember = true,
                ParentId = campus.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cbcs.usf.edu",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Behavioral and Community Sciences Department of Child & Family Studies",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "cfs.cbcs.usf.edu",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Behavioral and Community Sciences Department of Communication Sciences & Disorders",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "csd.cbcs.usf.edu",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of Behavioral and Community Sciences Department of Criminology",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "criminology.cbcs.usf.edu",
            });

            /* TODO: Seed the other departments */

            college = Seed(new SeedEstablishment
            {
                OfficialName = "USF College of School of Accountancy",
                IsMember = true,
                ParentId = campus.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.College.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "business.usf.edu",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of School of Accountancy Department of Finance",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "business.usf.edu/departments/accountancy",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of School of Accountancy Department of Information Systems / Decision Sciences",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "business.usf.edu/departments/isds",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of School of Accountancy Department of Management & Organization",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "business.usf.edu/departments/management",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "USF College of School of Accountancy Department of Marketing",
                IsMember = true,
                ParentId = college.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.Department.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "business.usf.edu/departments/marketing",
            });

            /* TODO: Seed other colleges */

            campus = Seed(new SeedEstablishment
            {
                OfficialName = "USF St. Petersburg Campus",
                OfficialWebsiteUrl = "www.usfsp.edu",
                EmailDomains = new[] { "@usfsp.edu" },
                IsMember = true,
                ParentId = university.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.UniversityCampus.AsSentenceFragment())).RevisionId,
            });

            /* TODO: Seed other campuses */
        }
    }

    public class EstablishmentUwoEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentUwoEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
        }

        public override void Seed()
        {
            Seed(new SeedEstablishment
            {
                OfficialName = "Western University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uwo.ca",
                EmailDomains = new[] { "@uwo.ca" },
                FindPlacesByCoordinates = true,
                CenterLatitude = 43.008728,
                CenterLongitude = -81.276215,
            });
        }
    }

    public class EstablishmentTestShibEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateSamlSignOnInfo> _updateSaml;
        private readonly IUnitOfWork _unitOfWork;

        public EstablishmentTestShibEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IHandleCommands<UpdateSamlSignOnInfo> updateSaml
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
            _updateSaml = updateSaml;
            _unitOfWork = unitOfWork;
        }

        public override void Seed()
        {
            var testShib = Seed(new SeedEstablishment
            {
                OfficialName = "TestShib2",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.BusinessOrCorporation.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.testshib.org",
                EmailDomains = new[] { "@testshib.org" },
            });
            _updateSaml.Handle(new UpdateSamlSignOnInfo
            {
                Establishment = testShib,
                EntityId = "https://idp.testshib.org/idp/shibboleth",
                MetadataUrl = "https://idp.testshib.org/idp/shibboleth",
            });
            _unitOfWork.SaveChanges();
        }
    }

    public class EstablishmentUcShibEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<UpdateSamlSignOnInfo> _updateSaml;
        private readonly IUnitOfWork _unitOfWork;

        public EstablishmentUcShibEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IHandleCommands<UpdateSamlSignOnInfo> updateSaml
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
            _updateSaml = updateSaml;
            _unitOfWork = unitOfWork;
        }

        public override void Seed()
        {
            var uc = _queryProcessor.Execute(new EstablishmentByUrl("www.uc.edu"));
            _updateSaml.Handle(new UpdateSamlSignOnInfo
            {
                Establishment = uc,
                EntityId = "https://qalogin.uc.edu/idp/shibboleth",
                MetadataUrl = "https://qalogin.uc.edu/idp/profile/Metadata/SAML",
            });
            _unitOfWork.SaveChanges();
        }
    }

    public class EstablishmentSamplePartnerEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentSamplePartnerEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
        }

        public override void Seed()
        {
            var en = _queryProcessor.Execute(new LanguageByIsoCode("en"));
            var fr = _queryProcessor.Execute(new LanguageByIsoCode("fr"));
            Seed(new SeedEstablishment
            {
                OfficialName = "Jinan University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.jnu.edu.cn",
                FindPlacesByCoordinates = true,
                CenterLatitude = 23.128067,
                CenterLongitude = 113.347710,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Swinburne University of Technology",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.swinburne.edu.au",
                NonOfficialUrls = new[]
                {
                    new SeedEstablishment.NonOfficialUrl
                    {
                        Value = "www.swin.edu.au"
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = -37.851940,
                CenterLongitude = 144.991974,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Fachhochschule Nordwestschweiz",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.fhnw.ch",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "University of Applied Sciences Northwestern Switzerland",
                        TranslationToLanguageId = en.Id,
                    },
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Fachhochschule Beider Basel",
                        TranslationToLanguageId = en.Id,
                        IsDefunct = true,
                    },
                },
                NonOfficialUrls = new[]
                {
                    new SeedEstablishment.NonOfficialUrl
                    {
                        Value = "www.fhbb.ch",
                        IsDefunct = true,
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = 47.484417,
                CenterLongitude = 8.207265,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Johannes Kepler Universität Linz",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.jku.at",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Johannes Kepler University Linz",
                        TranslationToLanguageId = en.Id,
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = 48.337395,
                CenterLongitude = 14.317374,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Université catholique de Louvain",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uclouvain.be",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Catholic University of Louvain",
                        TranslationToLanguageId = en.Id,
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = 50.673618,
                CenterLongitude = 4.604945,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidade Federal do Paraná",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ufpr.br",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Federal University of Parana",
                        TranslationToLanguageId = en.Id,
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = -25.434137,
                CenterLongitude = -49.267353,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidade Federal do Rio de Janeiro",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ufrj.br",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Federal University of Rio de Janeiro",
                        TranslationToLanguageId = en.Id,
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = -22.862494,
                CenterLongitude = -43.223907,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "University of Florida",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ufl.edu",
                FindPlacesByCoordinates = true,
                CenterLatitude = 29.643528,
                CenterLongitude = -82.350685,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Instituto de Pesquisa e Planejamento Urbano de Curitiba",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ippuc.org.br",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Institute for Research and Urban Planning Curtiba",
                        TranslationToLanguageId = en.Id,
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = -25.414003,
                CenterLongitude = -49.252010,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidade Positivo",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.up.com.br",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Positive University",
                        TranslationToLanguageId = en.Id,
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = -25.448196,
                CenterLongitude = -49.355865,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidade de São Paulo",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.usp.br",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "University of Sao Paulo",
                        TranslationToLanguageId = en.Id,
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = -23.559305,
                CenterLongitude = -46.715672,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad del Desarrollo",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.udd.cl",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "University of Development",
                        TranslationToLanguageId = en.Id,
                    },
                },
                FindPlacesByCoordinates = true,
                CenterLatitude = -36.823036,
                CenterLongitude = -73.036003,
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad Nacional del Nordeste",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.unne.edu.ar",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Northeast National University",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad de Flores",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uflo.edu.ar",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "University of Flores",
                        TranslationToLanguageId = en.Id,
                    },
                },
                NonOfficialUrls = new[]
                {
                    new SeedEstablishment.NonOfficialUrl
                    {
                        Value = "universidad.uflo.edu.ar",
                        IsDefunct = true,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidade Federal de Goiás",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ufg.br",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Federal University of Goias",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Fundação Getúlio Vargas",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.fgv.br",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Getulio Vargas Foundation",
                        TranslationToLanguageId = en.Id,
                    },
                },
                NonOfficialUrls = new[]
                {
                    new SeedEstablishment.NonOfficialUrl
                    {
                        Value = "portal.fgv.br",
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidade Estadual do Ceara",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uece.br",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Ceara State University",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidade Estadual Paulista",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.unesp.br",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Paulista State University",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Université du Québec à Montréal",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uqam.ca",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "University of Quebec at Montreal",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad de Artes, Ciencias y Comunicación",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uniacc.cl",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "University of Arts, Sciences, and Communication",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad de Santiago de Chile",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.usach.cl",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "University of Santiago Chile",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Capital Normal University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cnu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Chang'an University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.xahu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "The China Conservatory",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ccmusic.edu.cn",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "China Conservatory of Music",
                        TranslationToLanguageId = en.Id,
                        IsDefunct = true,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Dalian Jiaotong University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.djtu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "East China Jiaotong University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ecjtu.jx.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Environmental Management College of China",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.emcc.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Guangxi University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.gxu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Guangxi University of Technology",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.gxut.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Guilin University of Technology",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.glut.edu.cn",
                NonOfficialUrls = new[]
                {
                    new SeedEstablishment.NonOfficialUrl
                    {
                        Value = "www.glite.edu.cn",
                        IsDefunct = true,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Hebei University of Technology",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.hebut.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Chinese Academy of Sciences",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cas.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Institute of Psychology, Chinese Academy of Sciences",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.psych.cas.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Liaoning Normal University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.lnnu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Nankai University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.nankai.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Shandong Province",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.GovernmentAdministration.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sd.gov.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Shandong University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sdu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Shanghai Academy of Environmental Sciences",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.saes.sh.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Shanghai Jiao Tong University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sjtu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Soochow University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.suda.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "South China Normal University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.scnu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Southwestern University of Finance and Economics",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.swufe.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Sun Yat-Sen University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.sysu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Tongji University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.tongji.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Tsinghua University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.tsinghua.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Xian International Studies University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.xisu.edu.cn",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad Tecnológica de Bolívar",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.unitecnologica.edu.co",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Technology University of Bolivar",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad del Atlántico",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.uniatlantico.edu.co",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Atlantic University",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Universidad del Valle",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.univalle.edu.co",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Valle University",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Arcada",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.arcada.fi",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Tekniska Läroverkets Kamratförbund r.f",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.tlk.fi",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Swedish Institute of Technology",
                        TranslationToLanguageId = en.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Audencia Nantes School of Management",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.audencia.com",
                NonOfficialNames = new[]
                {
                    new SeedEstablishment.NonOfficialName
                    {
                        Text = "Ecole Supérieure de Commerce de Nantes",
                        TranslationToLanguageId = fr.Id,
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Nanyang Technological University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.ntu.edu.sg",
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Chungnam National University",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.cnu.ac.kr",
                NonOfficialUrls = new[]
                {
                    new SeedEstablishment.NonOfficialUrl
                    {
                        Value = "plus.cnu.ac.kr",
                    },
                    new SeedEstablishment.NonOfficialUrl
                    {
                        Value = "ipsi.cnu.ac.kr",
                    },
                },
            });

            Seed(new SeedEstablishment
            {
                OfficialName = "Beijing University of Technology",
                IsMember = true,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.University.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.bjut.edu.cn",
            });
        }
    }

    public class EstablishmentRecruitmentAgencyEntitySeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentRecruitmentAgencyEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
        }

        public override void Seed()
        {
            var en = _queryProcessor.Execute(new LanguageByIsoCode("en"));
            var zh = _queryProcessor.Execute(new LanguageByIsoCode("zh"));

            #region EduGlobal

            var eduGlobalHq = Seed(new SeedEstablishment
            {
                OfficialName = "EduGlobal Beijing",
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.RecruitmentAgency.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.eduglobalchina.com",
                FindPlacesByCoordinates = true,
                CenterLatitude = 39.89871600001,
                CenterLongitude = 116.4178770000002,
                Addresses = new[]
                {
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = en.Id,
                        Text = "7F North Office Tower, Beijing New World Centre\r\n3B Chongwenmenwai St\r\n100062 Beijing\r\nPR China",
                    },
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = zh.Id,
                        Text = "中国北京崇文区崇文门外大街3号B\r\n北京新世界中心写字楼B座7层\r\n邮编：100062",
                    },
                },
                PublicContactInfo = new SeedEstablishment.ContactInfo
                {
                    Phone = "+86 (10) 6708 0808",
                    Fax = "+86 (10) 6708 2541",
                    Email = "infobeijing@eduglobal.com",
                },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "EduGlobal Changchun",
                ParentId = eduGlobalHq.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.RecruitmentAgency.AsSentenceFragment())).RevisionId,
                FindPlacesByCoordinates = true,
                CenterLatitude = 43.8911290000001,
                CenterLongitude = 125.310471,
                Addresses = new[]
                {
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = en.Id,
                        Text = "Songhuajiang University,\r\nNo.758 Qianjin Street, Changchun City,\r\nJilin Province\r\n130000, P.R.China",
                    },
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = zh.Id,
                        Text = "吉林省长春市前进大街758号松花江大学\r\n邮编：130000",
                    },
                },
                PublicContactInfo = new SeedEstablishment.ContactInfo
                {
                    Phone = "+86 431 85111566",
                    Fax = "+86 431-85111566",
                    Email = "lina.wang@eduglobal.com",
                },
            });

            #endregion
            #region EIC Group

            var eicHq = Seed(new SeedEstablishment
            {
                OfficialName = "EIC Group Beijing",
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.RecruitmentAgency.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.eic.org.cn",
                FindPlacesByCoordinates = true,
                CenterLatitude = 39.9059830001,
                CenterLongitude = 116.4593730001,
                Addresses = new[]
                {
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = en.Id,
                        Text = "Room 1203, Block A, Jianwai SOHO\r\n39 East 3rd Ring Road\r\nChaoyang District, Beijing\r\nChina  100022",
                    },
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = zh.Id,
                        Text = "北京市朝阳区东三环中路39号建外SOHO A座\r\n12,15层国贸办公区",
                    },
                },
                PublicContactInfo = new SeedEstablishment.ContactInfo
                {
                    Phone = "+86 (10) 5878 1616",
                    Fax = "+86 (10) 5869 4393",
                    Email = "beijing@eic.org.cn",
                },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "EIC Group Changsha",
                ParentId = eicHq.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.RecruitmentAgency.AsSentenceFragment())).RevisionId,
                FindPlacesByCoordinates = true,
                CenterLatitude = 28.194132,
                CenterLongitude = 112.976715,
                Addresses = new[]
                {
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = en.Id,
                        Text = "Floor 24, Pinghetang Business Mansion\r\nNo. 88 Huangxing Middle Road\r\nChangsha City, Hunan Province\r\nChina",
                    },
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = zh.Id,
                        Text = "长沙市黄兴中路88号平和堂商务楼24楼启德教育\r\n中心",
                    },
                },
                PublicContactInfo = new SeedEstablishment.ContactInfo
                {
                    Phone = "+86 (731) 8448 8495",
                    Fax = "+86 (731) 8448 3835",
                    Email = "changsha@eic.org.cn",
                },
            });

            #endregion
            #region CanAchieve

            var canAchieveHq = Seed(new SeedEstablishment
            {
                OfficialName = "Can Achieve Group Beijing",
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.RecruitmentAgency.AsSentenceFragment())).RevisionId,
                OfficialWebsiteUrl = "www.can-achieve.com.cn",
                FindPlacesByCoordinates = true,
                CenterLatitude = 39.905605,
                CenterLongitude = 116.459831,
                Addresses = new[]
                {
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = en.Id,
                        Text = "802, Tower B, JianWai SOHO, Office Building\r\nChaoyang District\r\nBeijing China, 100022",
                    },
                },
                PublicContactInfo = new SeedEstablishment.ContactInfo
                {
                    Phone = "+86 (10) 5869 9445",
                    Fax = "+86 (10) 5869 4171",
                },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Can Achieve Group Nanjing",
                ParentId = canAchieveHq.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.RecruitmentAgency.AsSentenceFragment())).RevisionId,
                FindPlacesByCoordinates = true,
                CenterLatitude = 32.044769,
                CenterLongitude = 118.789917,
                Addresses = new[]
                {
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = en.Id,
                        Text = "A 12F Deji Mansion, No. 188 Changjiang Road\r\nNanjing, Jiangsu Province\r\nChina, 210018",
                    },
                },
                PublicContactInfo = new SeedEstablishment.ContactInfo
                {
                    Phone = "+86 (25) 8681 6111",
                },
            });
            Seed(new SeedEstablishment
            {
                OfficialName = "Can Achieve Group Guangzhou",
                ParentId = canAchieveHq.RevisionId,
                TypeId = _queryProcessor.Execute(new EstablishmentTypeByEnglishName(
                    KnownEstablishmentType.RecruitmentAgency.AsSentenceFragment())).RevisionId,
                FindPlacesByCoordinates = true,
                CenterLatitude = 23.13893700002,
                CenterLongitude = 113.32875100002,
                Addresses = new[]
                {
                    new SeedEstablishment.Address
                    {
                        TranslationToLanguageId = en.Id,
                        Text = "Room 511, Nanfang Securities Building\r\nNo.140-148, Tiyu Dong Road",
                    },
                },
                PublicContactInfo = new SeedEstablishment.ContactInfo
                {
                    Phone = "+86 (20) 2222 0066",
                },
            });

            #endregion
        }
    }

    public abstract class BaseEstablishmentEntitySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<SeedEstablishment> _createEstablishment;
        private readonly IUnitOfWork _unitOfWork;

        protected BaseEstablishmentEntitySeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _createEstablishment = createEstablishment;
            _unitOfWork = unitOfWork;
        }

        public abstract void Seed();

        protected Establishment Seed(SeedEstablishment command)
        {
            // make sure establishment does not already exist
            var establishment = _queryProcessor.Execute(new EstablishmentByOfficialName(command.OfficialName));
            if (!string.IsNullOrWhiteSpace(command.OfficialWebsiteUrl))
                establishment = _queryProcessor.Execute(new EstablishmentByUrl(command.OfficialWebsiteUrl));
            if (establishment != null) return establishment;

            _createEstablishment.Handle(command);
            _unitOfWork.SaveChanges();
            return command.CreatedEstablishment;
        }
    }

    public class EstablishmentTypeAndCategorySeeder : ISeedData
    {
        private readonly IProcessQueries _queryProcessor;
        private readonly IHandleCommands<CreateEstablishmentCategory> _createEstablishmentCategory;
        private readonly IHandleCommands<CreateEstablishmentType> _createEstablishmentType;
        private readonly IUnitOfWork _unitOfWork;

        public EstablishmentTypeAndCategorySeeder(IProcessQueries queryProcessor
            , IHandleCommands<CreateEstablishmentCategory> createEstablishmentCategory
            , IHandleCommands<CreateEstablishmentType> createEstablishmentType
            , IUnitOfWork unitOfWork
        )
        {
            _queryProcessor = queryProcessor;
            _createEstablishmentCategory = createEstablishmentCategory;
            _createEstablishmentType = createEstablishmentType;
            _unitOfWork = unitOfWork;
        }

        public void Seed()
        {
            // first seed establishment categories and types
            var establishmentCategoryEntries = new Dictionary<string, string>
            {
                { EstablishmentCategoryCode.Inst, "Institution" },
                { EstablishmentCategoryCode.Corp, "Business or Corporation" },
                { EstablishmentCategoryCode.Govt, "Government" },
            };

            foreach (var establishmentCategoryEntry in establishmentCategoryEntries)
            {
                var establishmentCategory = _queryProcessor.Execute(
                    new EstablishmentCategoryByCode(establishmentCategoryEntry.Key));
                if (establishmentCategory == null)
                {
                    _createEstablishmentCategory.Handle(new CreateEstablishmentCategory
                    {
                        Code = establishmentCategoryEntry.Key,
                        EnglishName = establishmentCategoryEntry.Value,
                    });
                }
            }

            var establishmentTypeEntries = new Dictionary<KnownEstablishmentType, string>
            {
                { KnownEstablishmentType.UniversitySystem, EstablishmentCategoryCode.Inst },
                { KnownEstablishmentType.UniversityCampus, EstablishmentCategoryCode.Inst },
                { KnownEstablishmentType.University, EstablishmentCategoryCode.Inst },
                { KnownEstablishmentType.College, EstablishmentCategoryCode.Inst },
                { KnownEstablishmentType.CommunityCollege, EstablishmentCategoryCode.Inst },
                { KnownEstablishmentType.AcademicProgram, EstablishmentCategoryCode.Inst },
                { KnownEstablishmentType.GovernmentAdministration, EstablishmentCategoryCode.Govt },
                { KnownEstablishmentType.BusinessOrCorporation, EstablishmentCategoryCode.Corp },
                { KnownEstablishmentType.RecruitmentAgency, EstablishmentCategoryCode.Corp },
                { KnownEstablishmentType.Association, EstablishmentCategoryCode.Corp },
                { KnownEstablishmentType.Department, EstablishmentCategoryCode.Inst },
            };

            foreach (var establishmentTypeEntry in establishmentTypeEntries)
            {
                var establishmentType = _queryProcessor.Execute(
                    new EstablishmentTypeByEnglishName(establishmentTypeEntry.Key.AsSentenceFragment()));
                if (establishmentType == null)
                {
                    _createEstablishmentType.Handle(new CreateEstablishmentType
                    {
                        CategoryCode = establishmentTypeEntry.Value,
                        EnglishName = establishmentTypeEntry.Key.AsSentenceFragment(),
                    });
                }
            }
            _unitOfWork.SaveChanges();
        }
    }

    public class EstablishmentConfigurationSeeder : BaseEstablishmentEntitySeeder
    {
        private readonly IProcessQueries _queryProcessor;

        public EstablishmentConfigurationSeeder(IProcessQueries queryProcessor
            , IHandleCommands<SeedEstablishment> createEstablishment
            , IUnitOfWork unitOfWork
        )
            : base(queryProcessor, createEstablishment, unitOfWork)
        {
            _queryProcessor = queryProcessor;
        }

        public override void Seed()
        {
            //throw new System.NotImplementedException();

        }

    }

}
