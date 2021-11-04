import { Object3D, PerspectiveCamera, Points, BufferGeometry, BufferAttribute, ShaderMaterial, Vector2 } from 'three'
// @ts-ignore
import PoissonDiskSampling from 'poisson-disk-sampling'

// @ts-ignore
import vertexShader from '~/webgl/shaders/particles.vert'
// @ts-ignore
import fragmentShader from '~/webgl/shaders/particles.frag'

import { getSizeAtZ } from '~/webgl/utils/sizing'
import Mouse from '~/webgl/utils/Mouse'

const PARTICLES_Z = 0
const MAX_Z = 40

interface OptionsTypes {
  mouse: Mouse
  camera?: PerspectiveCamera
}

export default class Particles {
  mouse: Mouse
  points: Points
  wrapper: Object3D
  camera: PerspectiveCamera
  material: ShaderMaterial
  mouseVector: Vector2
  timeElapsed: number

  constructor ({ camera, mouse }: OptionsTypes) {
    this.wrapper = new Object3D()
    this.wrapper.name = 'particles'
    this.mouse = mouse
    this.camera = camera as PerspectiveCamera
    this.timeElapsed = 0
    this.mouseVector = new Vector2(this.mouse.xCoords, this.mouse.yCoords)

    const pointGeometry = new BufferGeometry()

    const { width, height } = getSizeAtZ(PARTICLES_Z, this.camera, 30)
    const maxWidth = width + 10
    const maxHeight = height + 10
    const p = new PoissonDiskSampling({
      shape: [maxWidth, maxHeight, MAX_Z],
      minDistance: 4,
      maxDistance: 8,
      tries: 30
    })
    const points = p.fill()
    const positions = points.flatMap((point: number[]) =>
      [point[0] - maxWidth / 2, point[1] - maxHeight / 2, point[2] - MAX_Z / 2])
    const positionAttr = positions.flatMap((point: number[]) => {
      const { width, height } = getSizeAtZ(point[2], this.camera)
      return [point[0] / width, point[1] / height]
    })

    pointGeometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(positions), 3)
    )
    pointGeometry.setAttribute('aPosition',
      new BufferAttribute(new Float32Array(positionAttr), 2)
    )

    this.material = new ShaderMaterial({
      transparent: true,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: this.timeElapsed },
        uMouse: { value: [this.mouse.xCoords, this.mouse.yCoords] }
      }
    })
    this.points = new Points(pointGeometry, this.material)
    this.points.position.z = PARTICLES_Z
    this.wrapper.add(this.points)
  }

  render () {
    this.timeElapsed += 0.01

    this.material.uniforms.uTime.value = this.timeElapsed

    const currentMouse = new Vector2(this.mouse.xCoords, this.mouse.yCoords)
    this.mouseVector.lerp(currentMouse, 0.05)

    this.material.uniforms.uMouse.value = [this.mouseVector.x, this.mouseVector.y]
  }
}
