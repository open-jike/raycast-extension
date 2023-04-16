import { readFile, writeFile } from 'node:fs/promises'

export const readJSON = async <T>(file: string) => {
  try {
    return JSON.parse(await readFile(file, 'utf-8')) as T
  } catch {
    return undefined
  }
}

export const writeJSON = (file: string, data: unknown) =>
  writeFile(file, JSON.stringify(data), 'utf-8')
