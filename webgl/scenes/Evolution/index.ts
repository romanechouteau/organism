import { Scene, AmbientLight } from 'three'

import Blob from './Blob'

export default class Evolution {
  blob: Blob
  scene: Scene
  light: AmbientLight

  constructor () {
    this.scene = new Scene()

    this.light = new AmbientLight(0xFFFFFF)

    this.blob = new Blob({ size: 1 })

    this.scene.add(this.light)
    this.scene.add(this.blob.wrapper)
  }

  render () {
    this.blob.render()
  }
}
