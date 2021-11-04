import { Object3D, ShaderMaterial, Mesh, PlaneGeometry, PerspectiveCamera } from 'three'

// @ts-ignore
import vertexShader from '~/webgl/shaders/background.vert'
// @ts-ignore
import fragmentShader from '~/webgl/shaders/background.frag'
import { getSizeAtZ } from '~/webgl/utils/sizing'

const BACKGROUND_Z = -15

interface OptionsTypes {
  camera?: PerspectiveCamera
}

export default class Background {
  mesh: Mesh
  wrapper: Object3D
  camera: PerspectiveCamera
  material: ShaderMaterial
  timeElapsed: number

  constructor ({ camera }: OptionsTypes) {
    this.wrapper = new Object3D()
    this.camera = camera as PerspectiveCamera
    this.timeElapsed = 0

    const { width, height } = getSizeAtZ(BACKGROUND_Z, this.camera)
    const planeGeometry = new PlaneGeometry(width, height)
    this.material = new ShaderMaterial({
      transparent: true,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: this.timeElapsed }
      }
    })

    this.mesh = new Mesh(planeGeometry, this.material)
    this.mesh.position.z = BACKGROUND_Z
    this.wrapper.add(this.mesh)
  }

  render () {
    this.timeElapsed += 0.01

    this.material.uniforms.uTime.value = this.timeElapsed
  }
}
