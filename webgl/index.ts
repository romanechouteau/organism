import { WebGLRenderer, sRGBEncoding, Scene, PerspectiveCamera } from 'three'

import Mouse from '~/webgl/utils/Mouse'

interface ConstructorTypes {
  canvas: HTMLCanvasElement
}

export default class Webgl {
  mouse?: Mouse
  width: number
  scene?: Scene
  height: number
  canvas: HTMLCanvasElement
  camera?: PerspectiveCamera
  renderer?: WebGLRenderer
  hasFocus: boolean
  pixelRatio: number
  sceneController?: any

  constructor ({ canvas }: ConstructorTypes) {
    this.width = 0
    this.height = 0
    this.canvas = canvas
    this.hasFocus = true
    this.pixelRatio = this.getPixelRatio()

    this.resize(window.innerWidth, window.innerHeight)
    this.setRenderer()
    this.setCamera()
    this.setMouse()
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
    this.camera.position.set(0, 0, 10)
  }

  setMouse () {
    this.mouse = new Mouse({ width: this.width, height: this.height })
  }

  setScene () {
    if (this.scene && this.camera) { this.scene.add(this.camera) }
  }

  resize (width: number, height: number) {
    this.width = width
    this.height = height
    if (this.camera) {
      this.camera.aspect = this.width / this.height
      this.camera.updateProjectionMatrix()
    }
    if (this.mouse) {
      this.mouse.width = this.width
      this.mouse.height = this.height
    }
    if (this.renderer) {
      this.renderer.setSize(this.width, this.height)
    }
  }

  getPixelRatio () {
    return Math.min(window.devicePixelRatio || 1, 2)
  }

  render = () => {
    requestAnimationFrame(this.render)
    if (this.sceneController) { this.sceneController.render() }
    if (this.hasFocus && this.scene && this.camera && this.renderer) {
      this.renderer.render(this.scene, this.camera)
    }
  }
}
