import { objectType } from 'nexus'
import { Project } from './Project'
import { Browser } from './Browser'

export const App = objectType({
  name: 'App',
  description: 'Namespace for information related to the app',
  definition (t) {
    t.field('activeProject', {
      type: Project,
      description: 'Active project',
    })

    t.nonNull.list.nonNull.field('browsers', {
      type: Browser,
      description: 'Browsers found that are compatible with Cypress',
    })

    t.nonNull.string('healthCheck', {
      description: 'See if the GraphQL server is alive',
      resolve: () => 'OK',
    })

    t.nonNull.boolean('isInGlobalMode', {
      description: 'Whether the app is in global mode or not',
    })

    t.nonNull.list.nonNull.field('projects', {
      type: Project,
      description: 'All known projects for the app',
    })
  },
})

// @nxs.objectType({
//   description: 'Namespace for information related to the app',
// })
// export class App {
//   private _browsers: FoundBrowser[] = []
//   private _hasRetrievedProjectsFromCache;
//   constructor (private ctx: BaseContext) {
//     this._hasRetrievedProjectsFromCache = false
//   }
//   @nxs.field.nonNull.string({
//     description: 'See if the GraphQL server is alive',
//   })
//   get healthCheck (): NxsResult<'App', 'healthCheck'> {
//     return 'OK'
//   }
//   @nxs.field.nonNull.boolean({
//     description: 'Whether this is the first open of the application or not',
//   })
//   static get isFirstOpen (): NxsResult<'App', 'isFirstOpen'> {
//     return true
//   }
//   @nxs.field.nonNull.boolean({
//     description: 'Whether the app is in global mode or not',
//   })
//   get isInGlobalMode (): NxsResult<'App', 'isInGlobalMode'> {
//     const hasGlobalModeArg = this.ctx.launchArgs.global ?? false
//     const isMissingActiveProject = !this.ctx.activeProject
//     return hasGlobalModeArg || isMissingActiveProject
//   }
//   @nxs.field.type(() => Project, {
//     description: 'Active project',
//   })
//   get activeProject (): NxsResult<'App', 'activeProject'> {
//     // TODO: Figure out how to model project and dashboard project relationship
//     return this.ctx.localProjects[0]!
//   }
//   @nxs.field.nonNull.list.nonNull.type(() => Project, {
//     description: 'All known projects for the app',
//   })
//   get projects (): core.MaybePromise<NxsResult<'App', 'projects'>> {
//     if (!this._hasRetrievedProjectsFromCache) {
//       this._hasRetrievedProjectsFromCache = true
//       return this.ctx.actions.loadProjects()
//     }
//     return this.ctx.localProjects
//   }
//   @nxs.field.nonNull.list.nonNull.type(() => Browser, {
//     description: 'Browsers found that are compatible with Cypress',
//   })
//   get browsers (): NxsResult<'App', 'browsers'> {
//     return this._browsers.map((x) => new Browser(x))
//   }
//   setBrowsers (browsers: FoundBrowser[]): void {
//     this._browsers = browsers
//   }
// }
