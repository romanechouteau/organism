import { Scene, AmbientLight, PerspectiveCamera, Raycaster, Vector2 } from 'three'
// @ts-ignore
import PoissonDiskSampling from 'poisson-disk-sampling'

import Blob from './Blob'
import Background from './Background'
import Webgl from '~/webgl'
import { getSizeAtZ } from '~/webgl/utils/sizing'
import Mouse from '~/webgl/utils/Mouse'

const BLOB_SIZE = 1
const MAX_Z = -10
const BASE_HSL_S = 70
const BASE_HSL_L = 95

interface OptionsTypes {
  webgl: Webgl,
  camera?: PerspectiveCamera,
  mouse?: Mouse
}

const getColor = () => {
  return [Math.random() * 360, BASE_HSL_S, BASE_HSL_L]
}

export default class Evolution {
  mouse: Mouse
  webgl: Webgl
  scene: Scene
  camera: PerspectiveCamera
  light?: AmbientLight
  mainBlob?: Blob
  raycaster: Raycaster
  background?: Background
  otherBlobs: Blob[]
  mergedBlobs: Blob[]

  constructor ({ webgl, camera, mouse }: OptionsTypes) {
    this.mouse = mouse as Mouse
    this.webgl = webgl
    this.camera = camera as PerspectiveCamera
    this.otherBlobs = []
    this.raycaster = new Raycaster()
    this.mergedBlobs = []

    this.scene = new Scene()

    this.setLight()
    this.setMainBlob()
    this.setBackgroundBlobs()
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
      const blob = intersects[0].object
      const foundBlob = this.otherBlobs.find(b => b.name === blob.name)
      if (foundBlob) {
        this.mergedBlobs.push(foundBlob)
        foundBlob.mergeWithMain(this.mainBlob as Blob)
        window.setTimeout(this.mergeBlobs.bind(this), 300)
      }
    }
  }

  mergeBlobs () {
    [this.mainBlob, ...this.mergedBlobs].forEach((blob) => {
      if (blob) {
        blob.grow(1 + this.mergedBlobs.length * 0.2)
      }
    })
  }

  setLight () {
    this.light = new AmbientLight(0xEEEEEE)

    this.scene.add(this.light)
  }

  setMainBlob () {
    this.mainBlob = new Blob({
      size: BLOB_SIZE,
      index: 0,
      color: getColor(),
      mouse: this.mouse,
      position: [0, 0, 0],
      camera: this.camera
    })
    this.scene.add(this.mainBlob.wrapper)
  }

  setBackgroundBlobs () {
    const { width, height } = getSizeAtZ(0, this.camera)
    const maxWidth = width + 20
    const maxHeight = height + 20
    const p = new PoissonDiskSampling({
      shape: [maxWidth, maxHeight, Math.abs(MAX_Z)],
      minDistance: 4,
      maxDistance: 8,
      tries: 30
    })
    const points = p.fill()

    this.otherBlobs = points.map((point: number[], index: number) => {
      const color = getColor()
      const blob = new Blob({
        size: 1,
        index: index + 1,
        color,
        mouse: this.mouse,
        position: [
          point[0] - maxWidth / 2,
          point[1] - maxHeight / 2,
          -1 + point[2] + MAX_Z
        ],
        camera: this.camera
      })

      return blob
    })

    this.scene.add(...this.otherBlobs.map(blob => blob.wrapper))
  }

  setBackground () {
    this.background = new Background({ camera: this.camera })
    this.scene.add(this.background.wrapper)
  }

  render () {
    if (this.background) { this.background.render() }
    if (this.mainBlob) { this.mainBlob.render() }
    for (let i = 0; i < this.otherBlobs.length; i++) {
      this.otherBlobs[i].render()
    }
  }
}
