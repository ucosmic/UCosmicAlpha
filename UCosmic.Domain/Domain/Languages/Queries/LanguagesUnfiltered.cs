using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;

namespace UCosmic.Domain.Languages
{
    public class LanguagesUnfiltered : BaseViewsQuery<LanguageView>, IDefineQuery<LanguageView[]>
    {
        public bool UserLanguageFirst { get; set; }
    }

    public class HandleLanguagesUnfilteredQuery : IHandleQueries<LanguagesUnfiltered, LanguageView[]>
    {
        private readonly IQueryEntities _entities;

        public HandleLanguagesUnfilteredQuery(IQueryEntities entities)
        {
            _entities = entities;
        }

        public LanguageView[] Handle(LanguagesUnfiltered query)
        {
            if (query == null) throw new ArgumentNullException("query");

            var results = _entities.Query<Language>()
                .EagerLoad(_entities, new Expression<Func<Language, object>>[]
                {
                    x => x.Names.Select(y => y.TranslationToLanguage)
                })
            ;

            var outList = new List<LanguageView>();
            foreach (var entity in results)
                outList.Add(new LanguageView(entity));

            outList = outList.AsQueryable().OrderBy(query.OrderBy).ToList();
            if (query.UserLanguageFirst)
            {
                var userLanguageCode = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
                var userLanguage = outList.SingleOrDefault(x => x.TwoLetterIsoCode.Equals(userLanguageCode, StringComparison.OrdinalIgnoreCase));
                if (userLanguage != null)
                {
                    outList.Remove(userLanguage);
                    outList.Insert(0, userLanguage);
                }
            }

            return outList.ToArray();
        }
    }
}