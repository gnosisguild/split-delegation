import type { Config } from '@jest/types'
// Sync object
import { pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from './tsconfig.json'

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: '<rootDir>/',
})

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  moduleNameMapper,
}

export default config
