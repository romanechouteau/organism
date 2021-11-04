import { Scene, AmbientLight, PerspectiveCamera, Raycaster, Vector2 } from 'three'

import Blobs from './Blobs'
import Background from './Background'
import Webgl from '~/webgl'
import Mouse from '~/webgl/utils/Mouse'

const BLOB_SIZE = 1

interface OptionsTypes {
  webgl: Webgl,
  camera?: PerspectiveCamera,
  mouse?: Mouse
}

export default class Evolution {
  mouse: Mouse
  webgl: Webgl
  scene: Scene
  camera: PerspectiveCamera
  light?: AmbientLight
  blobs?: Blobs
  raycaster: Raycaster
  background?: Background
  mergedBlobs: number[]

  constructor ({ webgl, camera, mouse }: OptionsTypes) {
    this.mouse = mouse as Mouse
    this.webgl = webgl
    this.camera = camera as PerspectiveCamera
    this.raycaster = new Raycaster()
    this.mergedBlobs = [0]

    this.scene = new Scene()

    this.setLight()
    this.setBlobs()
    this.setBackground()
    this.setClick()
  }

  setClick () {
    window.addEventListener('click', this.onClick.bind(this))
  }

  onClick () {
    const mouseVector = new Vector2(this.mouse.xCoords, this.mouse.yCoords)
    this.raycaster.setFromCamera(mouseVector, this.camera)

    const intersects = this.raycaster.intersectObjects(this.scene.children)
    if (intersects[0]) {
      const blobId = intersects[0].instanceId
      if (blobId && this.blobs) {
        this.mergedBlobs.push(blobId)
        this.blobs.mergeWithMain(blobId)
        window.setTimeout(this.mergeBlobs.bind(this), 300)
      }
    }
  }

  mergeBlobs () {
    if (this.blobs) { this.blobs.grow(this.mergedBlobs) }
  }

  setLight () {
    this.light = new AmbientLight(0xEEEEEE)

    this.scene.add(this.light)
  }

  setBlobs () {
    this.blobs = new Blobs({
      size: BLOB_SIZE,
      mouse: this.mouse,
      camera: this.camera,
      mergedBlobs: this.mergedBlobs
    })
    this.scene.add(this.blobs.wrapper)
  }

  setBackground () {
    this.background = new Background({ camera: this.camera })
    this.scene.add(this.background.wrapper)
  }

  render () {
    if (this.background) { this.background.render() }
    if (this.blobs) { this.blobs.render() }
  }
}
