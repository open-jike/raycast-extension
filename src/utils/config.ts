import path from 'path'
import { environment } from '@raycast/api'
import { readJSON, writeJSON } from './json'
import type { JikeClientJSON } from 'jike-sdk'

export type ConfigUser = JikeClientJSON
export interface Config {
  users: ConfigUser[]
}

export const defaultConfig: Config = { users: [] }
export const configPath = path.resolve(environment.supportPath, 'config.json')

export const readConfig = async () => {
  return (await readJSON<Config>(configPath)) || defaultConfig
}

export const writeConfig = async (config: Config) =>
  writeJSON(configPath, config)
