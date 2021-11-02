import _ from 'lodash'
import $errUtils from '../cypress/error_utils'

// See Test Config Overrides in ../../../../cli/types/cypress.d.ts

type TestConfig = {
  _testConfig: {
    browser?: Object
  }
  invocationDetails: {
    stack: Object
  }
};

type ConfigOverrides = {
  env: Object | undefined
};

function setConfig (testConfigList: Array<TestConfig>, config: Function, localConfigOverrides: ConfigOverrides = { env: undefined }) {
  testConfigList.forEach(({ _testConfig: testConfigOverride, invocationDetails }) => {
    if (_.isArray(testConfigOverride)) {
      setConfig(testConfigOverride, config, localConfigOverrides)
    } else {
      delete testConfigOverride.browser

      try {
        config(testConfigOverride)
      } catch (e) {
        let err = $errUtils.errByPath('config.invalid_test_override', {
          errMsg: e.message,
        })

        err.stack = $errUtils.stackWithReplacedProps({ stack: invocationDetails.stack }, err)
        throw err
      }
      localConfigOverrides = { ...localConfigOverrides, ...testConfigOverride }
    }
  })

  return localConfigOverrides
}

function mutateConfiguration (testConfigList, config, env) {
  let globalConfig = _.clone(config())

  const localConfigOverrides = setConfig(testConfigList, config)

  // only store the global config values that updated
  globalConfig = _.pick(globalConfig, Object.keys(localConfigOverrides))
  const globalEnv = _.clone(env())

  const localConfigOverridesBackup = _.clone(localConfigOverrides)

  if (localConfigOverrides.env) {
    env(localConfigOverrides.env)
  }

  const localTestEnv = env()
  const localTestEnvBackup = _.clone(localTestEnv)

  // we restore config back to what it was before the test ran
  // UNLESS the user mutated config with Cypress.config, in which case
  // we apply those changes to the global config
  // TODO: (NEXT_BREAKING) always restore configuration
  //   do not allow global mutations inside test
  const restoreConfigFn = function () {
    _.each(localConfigOverrides, (val, key) => {
      if (localConfigOverridesBackup[key] !== val) {
        globalConfig[key] = val
      }

      // explicitly set to undefined if config wasn't previously defined
      if (!globalConfig.hasOwnProperty(key)) {
        globalConfig[key] = undefined
      }
    })

    _.each(localTestEnv, (val, key) => {
      if (localTestEnvBackup[key] !== val) {
        globalEnv[key] = val
      }
    })

    // reset test config overrides
    config(globalConfig)

    env.reset()
    env(globalEnv)
  }

  return restoreConfigFn
}

// this is called during test onRunnable time
// in order to resolve the test config upfront before test runs
export function getResolvedTestConfigOverride (test) {
  let curParent = test.parent

  const testConfig = [{
    _testConfig: test._testConfig,
    invocationDetails: test.invocationDetails,
  }]

  while (curParent) {
    if (curParent._testConfig) {
      testConfig.unshift({
        _testConfig: curParent._testConfig,
        invocationDetails: curParent.invocationDetails,
      })
    }

    curParent = curParent.parent
  }

  return testConfig.filter((opt) => opt._testConfig !== undefined)
}

class TestConfigOverride {
  private restoreTestConfigFn: Nullable<() => void> = null

  restoreAndSetTestConfigOverrides (test, config, env) {
    if (this.restoreTestConfigFn) this.restoreTestConfigFn()

    const resolvedTestConfig = test._testConfig || []

    this.restoreTestConfigFn = mutateConfiguration(resolvedTestConfig, config, env)
  }
}

export default {
  create () {
    return new TestConfigOverride()
  },
}
