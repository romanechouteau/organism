import { Object3D, ShaderMaterial, Mesh, SphereGeometry } from 'three'

// @ts-ignore
import vertexShader from '~/webgl/shaders/blob.vert'
// @ts-ignore
import fragmentShader from '~/webgl/shaders/blob.frag'

interface OptionsTypes {
  size: number
}

export default class Cube {
  mesh: Mesh
  wrapper: Object3D
  material: ShaderMaterial
  timeElapsed: number

  constructor ({ size }: OptionsTypes) {
    this.wrapper = new Object3D()
    this.timeElapsed = 0

    const cubeGeometry = new SphereGeometry(size, 48, 48)
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: this.timeElapsed }
      }
    })

    this.mesh = new Mesh(cubeGeometry, this.material)
    this.wrapper.add(this.mesh)
  }

  render () {
    this.timeElapsed += 0.01

    this.material.uniforms.uTime.value = this.timeElapsed
  }
}
