import path from 'path'
import { environment } from '@raycast/api'
import { readJSON, writeJSON } from './json'
import type { JikeClientJSON } from 'jike-sdk'

export type ConfigUser = JikeClientJSON
export interface Config {
  users: ConfigUser[]
}

export const configPath = path.resolve(environment.supportPath, 'config.json')

export const getConfig = async () => {
  const defaultConfig: Config = { users: [] }
  return (await readJSON<Config>(configPath)) || defaultConfig
}

export const updateConfig = async (
  update: (cfg: Config) => void | Config | Promise<Config | void>
) => {
  let cfg = await getConfig()
  cfg = (await update(cfg)) || cfg
  await writeJSON(configPath, cfg)
}
