import gsap from 'gsap'
import { Object3D, ShaderMaterial, Mesh, SphereGeometry, PerspectiveCamera, Vector2 } from 'three'

// @ts-ignore
import vertexShader from '~/webgl/shaders/blob.vert'
// @ts-ignore
import fragmentShader from '~/webgl/shaders/blob.frag'
import Mouse from '~/webgl/utils/Mouse'
import { getSizeAtZ } from '~/webgl/utils/sizing'

interface OptionsTypes {
  size: number,
  index: number,
  color: number[],
  mouse: Mouse,
  camera: PerspectiveCamera,
  position: number[],
}

export default class Blob {
  mesh: Mesh
  name: string
  mouse: Mouse
  camera: PerspectiveCamera
  wrapper: Object3D
  material: ShaderMaterial
  timeElapsed: number
  mouseVector: Vector2

  constructor ({ size, index, color, mouse, position, camera }: OptionsTypes) {
    this.wrapper = new Object3D()
    this.timeElapsed = 0
    this.mouse = mouse
    this.camera = camera
    this.name = `blob-${index}`

    this.mouseVector = new Vector2(this.mouse.xCoords, this.mouse.yCoords)

    const { width, height } = getSizeAtZ(position[2], this.camera)

    const blobGeometry = new SphereGeometry(size, 48, 48)
    this.material = new ShaderMaterial({
      transparent: true,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: this.timeElapsed },
        uColor: { value: color },
        uOffset: { value: index },
        uMouse: { value: [this.mouse.xCoords, this.mouse.yCoords] },
        uPosition: { value: [position[0] / width, position[1] / height] }
      }
    })

    this.mesh = new Mesh(blobGeometry, this.material)
    this.mesh.name = this.name
    this.wrapper.add(this.mesh)
    this.wrapper.position.set(position[0], position[1], position[2])
  }

  render () {
    this.timeElapsed += 0.01

    this.material.uniforms.uTime.value = this.timeElapsed

    const currentMouse = new Vector2(this.mouse.xCoords, this.mouse.yCoords)
    this.mouseVector.lerp(currentMouse, 0.05)

    this.material.uniforms.uMouse.value = [this.mouseVector.x, this.mouseVector.y]
  }

  mergeWithMain (main: Blob) {
    gsap.to(this.wrapper.position, {
      x: main.wrapper.position.x,
      y: main.wrapper.position.y,
      z: main.wrapper.position.z,
      duration: 1,
      ease: 'elastic.out(1, 0.78)'
    })
  }

  grow (size: number) {
    gsap.to(this.wrapper.scale, {
      x: size,
      y: size,
      z: size,
      duration: 1,
      ease: 'elastic.out(1, 0.78)'
    })
  }
}
