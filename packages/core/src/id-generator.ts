interface IdGenerator {
  nextId(): number
}

function createIdGenerator(): IdGenerator {
  let nextId = 0
  return {
    nextId(): number {
      return nextId++
    },
  }
}

export type { IdGenerator }
export { createIdGenerator }
