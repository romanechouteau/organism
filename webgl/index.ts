import { WebGLRenderer, sRGBEncoding, Scene, PerspectiveCamera } from 'three'

interface ConstructorTypes {
  canvas: HTMLCanvasElement
}

export default class Webgl {
  width: number
  scene?: Scene
  height: number
  canvas: HTMLCanvasElement
  camera?: PerspectiveCamera
  renderer?: WebGLRenderer
  hasFocus: boolean
  pixelRatio: number

  constructor ({ canvas }: ConstructorTypes) {
    this.width = 0
    this.height = 0
    this.canvas = canvas
    this.hasFocus = true
    this.pixelRatio = this.getPixelRatio()

    this.resize(window.innerWidth, window.innerHeight)
    this.setRenderer()
    this.setCamera()
  }

  setRenderer () {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    this.renderer.outputEncoding = sRGBEncoding
    this.renderer.setClearColor(0x000000, 1.0)
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.setSize(this.width, this.height)
  }

  setCamera () {
    this.camera = new PerspectiveCamera(45, this.width / this.height, 1, 1000)
  }

  resize (width: number, height: number) {
    this.width = width
    this.height = height
    if (this.renderer) { this.renderer.setSize(width, height) }
  }

  getPixelRatio () {
    return Math.min(window.devicePixelRatio || 1, 2)
  }

  render = () => {
    requestAnimationFrame(this.render)
    if (this.hasFocus && this.scene && this.camera && this.renderer) {
      this.renderer.render(this.scene, this.camera)
    }
  }
}