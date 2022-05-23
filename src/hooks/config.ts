import { useEffect, useState } from 'react'
import { defaultConfig, readConfig, writeConfig } from '../utils/config'
import type { Config } from '../utils/config'

export const useConfig = () => {
  const [config, setState] = useState<Config>(defaultConfig)
  const [ready, setReady] = useState(false)

  const setConfig = async (config: Config) => {
    await writeConfig(config)
    await reload()
  }

  const reload = async () => {
    setState(await readConfig())
    setReady(true)
  }

  useEffect(() => {
    reload()
  }, [])

  return {
    config,
    ready,
    setConfig,
    reload,
  }
}
