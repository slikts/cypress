import { cacheExchange, Client, createClient, dedupExchange, errorExchange } from '@urql/core'
import { executeExchange } from '@urql/exchange-execute'
import { graphqlSchema } from '@packages/graphql'
import type { ClientTestContext } from '../../src/graphql/graphqlFake'

export function testApolloClient (ctx: ClientTestContext): Client {
  return createClient({
    url: '/graphql',
    exchanges: [
      dedupExchange,
      cacheExchange,
      errorExchange({
        onError (error) {
          // eslint-disable-next-line
          console.error(error)
        },
      }),
      executeExchange({
        schema: graphqlSchema,
        context: ctx,
      }),
    ],
  })
}