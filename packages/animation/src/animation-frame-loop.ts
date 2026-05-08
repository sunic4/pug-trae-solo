class AnimationFrameLoop {
  private _frameId: number | null = null
  private _isRunning = false
  private _resolve: (() => void) | null = null

  get isRunning(): boolean {
    return this._isRunning
  }

  start(tick: () => boolean): Promise<void> {
    this.stop()
    return new Promise<void>((resolve) => {
      this._resolve = resolve
      this._isRunning = true
      const loop = (): void => {
        const done = tick()
        if (done) {
          this._frameId = null
          this._isRunning = false
          if (this._resolve !== null) {
            this._resolve()
            this._resolve = null
          }
          return
        }
        this._frameId = requestAnimationFrame(loop)
      }
      this._frameId = requestAnimationFrame(loop)
    })
  }

  stop(): void {
    if (this._frameId !== null) {
      cancelAnimationFrame(this._frameId)
      this._frameId = null
    }
    this._isRunning = false
    if (this._resolve !== null) {
      this._resolve()
      this._resolve = null
    }
  }
}

export { AnimationFrameLoop }
