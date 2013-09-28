using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace UCosmic.Domain
{
    internal static class LinqPropertyChain
    {
        internal static Expression<Func<TInput, TOutput>> Chain<TInput, TOutput, TIntermediate>(Expression<Func<TInput, TIntermediate>> outer, Expression<Func<TIntermediate, TOutput>> inner)
        {
            var visitor = new Visitor(new Dictionary<ParameterExpression, Expression>
                                      {
                                          {inner.Parameters[0], outer.Body}
                                      });

            var newBody = visitor.Visit(inner.Body);
            return Expression.Lambda<Func<TInput, TOutput>>(newBody, outer.Parameters);
        }

        private class Visitor : ExpressionVisitor
        {
            private readonly Dictionary<ParameterExpression, Expression> _replacement;

            internal Visitor(Dictionary<ParameterExpression, Expression> replacement)
            {
                _replacement = replacement;
            }

            protected override Expression VisitParameter(ParameterExpression node)
            {
                return _replacement.ContainsKey(node) ? _replacement[node] : node;
            }
        }
    }
}