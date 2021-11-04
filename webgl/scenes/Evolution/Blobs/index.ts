// eslint-disable-next-line import/no-named-as-default
import gsap from 'gsap'
// @ts-ignore
import PoissonDiskSampling from 'poisson-disk-sampling'
import { Object3D, ShaderMaterial, SphereGeometry, PerspectiveCamera, Vector2, Matrix4, InstancedMesh, InstancedBufferAttribute } from 'three'

// @ts-ignore
import vertexShader from '~/webgl/shaders/blob.vert'
// @ts-ignore
import fragmentShader from '~/webgl/shaders/blob.frag'
import Mouse from '~/webgl/utils/Mouse'
import { getSizeAtZ } from '~/webgl/utils/sizing'

const MAX_Z = -10
const BASE_HSL_S = 70
const BASE_HSL_L = 95

const getColor = () => {
  return [Math.random() * 360, BASE_HSL_S, BASE_HSL_L]
}

interface OptionsTypes {
  size: number,
  mouse: Mouse,
  camera: PerspectiveCamera
  mergedBlobs: number[]
}

export default class Blobs {
  size: number
  // @ts-ignore
  mesh: InstancedMesh
  mouse: Mouse
  camera: PerspectiveCamera
  wrapper: Object3D
  material: ShaderMaterial
  mergedBlobs: number[]
  timeElapsed: number
  mouseVector: Vector2
  blobGeometry: SphereGeometry
  blobPositions: number[][]

  constructor ({ size, mouse, camera, mergedBlobs }: OptionsTypes) {
    this.wrapper = new Object3D()
    this.size = size
    this.mouse = mouse
    this.camera = camera
    this.mergedBlobs = mergedBlobs
    this.timeElapsed = 0
    this.blobPositions = []

    this.mouseVector = new Vector2(this.mouse.xCoords, this.mouse.yCoords)
    this.blobGeometry = new SphereGeometry(size, 48, 48)
    this.material = new ShaderMaterial({
      transparent: true,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: this.timeElapsed },
        uMouse: { value: [this.mouse.xCoords, this.mouse.yCoords] },
        uScale: { value: this.size },
        uMergedScale: { value: this.size }
      }
    })

    this.setBlobs()
  }

  setBlobs () {
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
    this.blobPositions = [
      [0, 0, 0],
      ...points.map((point: number[]) =>
        [point[0] - maxWidth / 2, point[1] - maxHeight / 2, -1 + point[2] + MAX_Z])
    ]

    this.mesh = new InstancedMesh(this.blobGeometry, this.material, this.blobPositions.length)

    const matrix: Matrix4 = new Matrix4()
    const colorAttr: number[] = []
    const offsetAttr: number[] = []
    const positionAttr: number[] = []
    const mergedAttr: number[] = []
    this.blobPositions.forEach((point: number[], i: number) => {
      matrix.setPosition(
        point[0],
        point[1],
        point[2]
      )

      const { width, height } = getSizeAtZ(point[2], this.camera)
      this.mesh.setMatrixAt(i, matrix)
      colorAttr.push(...getColor())
      offsetAttr.push(i)
      positionAttr.push(point[0] / width, point[1] / height)
      mergedAttr.push(this.mergedBlobs.includes(i) ? 1 : 0)
    })

    this.mesh.instanceMatrix.needsUpdate = true
    this.blobGeometry.setAttribute('aColor',
      new InstancedBufferAttribute(new Float32Array(colorAttr), 3)
    )
    this.blobGeometry.setAttribute('aOffset',
      new InstancedBufferAttribute(new Float32Array(offsetAttr), 1)
    )
    this.blobGeometry.setAttribute('aPosition',
      new InstancedBufferAttribute(new Float32Array(positionAttr), 2)
    )
    this.blobGeometry.setAttribute('aMerged',
      new InstancedBufferAttribute(new Float32Array(mergedAttr), 1)
    )

    this.wrapper.add(this.mesh)
  }

  render () {
    this.timeElapsed += 0.01

    this.material.uniforms.uTime.value = this.timeElapsed

    const currentMouse = new Vector2(this.mouse.xCoords, this.mouse.yCoords)
    this.mouseVector.lerp(currentMouse, 0.05)

    this.material.uniforms.uMouse.value = [this.mouseVector.x, this.mouseVector.y]
  }

  mergeWithMain (id: number) {
    const position = this.blobPositions[id]
    const matrix: Matrix4 = new Matrix4()

    gsap.to(position, {
      0: this.blobPositions[0][0],
      1: this.blobPositions[0][1],
      2: this.blobPositions[0][2],
      duration: 1,
      ease: 'elastic.out(1, 0.78)',
      onUpdate: () => {
        matrix.setPosition(
          position[0],
          position[1],
          position[2]
        )
        this.mesh.setMatrixAt(id, matrix)
        this.mesh.instanceMatrix.needsUpdate = true
      }
    })
  }

  grow (mergedBlobs: number[]) {
    const blobsAttr = Array.from(this.blobGeometry.getAttribute('aMerged').array)
    const blobsToMerge = mergedBlobs.flatMap((blobId) => {
      if (blobsAttr[blobId] !== 1) { return [{ val: blobsAttr[blobId], id: blobId }] }
      return []
    })

    gsap.to(blobsToMerge, {
      val: 1,
      duration: 1,
      ease: 'elastic.out(1, 0.78)',
      onUpdate: () => {
        blobsToMerge.forEach((blob) => {
          blobsAttr[blob.id] = blob.val
        })
        this.blobGeometry.setAttribute('aMerged',
          new InstancedBufferAttribute(new Float32Array(blobsAttr), 1)
        )
      }
    })

    gsap.to(this.material.uniforms.uMergedScale, {
      value: 1 + (mergedBlobs.length - 1) * 0.2,
      duration: 1,
      ease: 'elastic.out(1, 0.78)'
    })
  }
}
