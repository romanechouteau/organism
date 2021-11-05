// eslint-disable-next-line import/no-named-as-default
import gsap from 'gsap'
import { Scene, AmbientLight, PerspectiveCamera, Raycaster, Vector2, FogExp2 } from 'three'

import Blobs from './Blobs'
import Particles from './Particles'
import Background from './Background'
import Webgl from '~/webgl'
import Mouse from '~/webgl/utils/Mouse'

const BLOB_SIZE = 1
const BLOB_COUNT_STEP_2 = 7
const BLOB_COUNT_STEP_3 = 13
const BLOB_COUNT_STEP_4 = 6

interface OptionsTypes {
  webgl: Webgl,
  camera?: PerspectiveCamera,
  mouse?: Mouse
}

export default class Evolution {
  step: number
  mouse: Mouse
  webgl: Webgl
  scene: Scene
  camera: PerspectiveCamera
  light?: AmbientLight
  blobs?: Blobs
  raycaster: Raycaster
  particles?: Particles
  background?: Background
  mergedBlobs: number[]

  constructor ({ webgl, camera, mouse }: OptionsTypes) {
    this.mouse = mouse as Mouse
    this.webgl = webgl
    this.step = 1
    this.camera = camera as PerspectiveCamera
    this.raycaster = new Raycaster()
    this.mergedBlobs = [0]

    this.scene = new Scene()

    this.setLight()
    this.setBlobs()
    this.setParticles()
    this.setBackground()
    this.setFog()
    this.setClick()
  }

  setClick () {
    window.addEventListener('click', this.onClick.bind(this))
  }

  onClick () {
    const mouseVector = new Vector2(this.mouse.xCoords, this.mouse.yCoords)
    this.raycaster.setFromCamera(mouseVector, this.camera)

    if (this.step < 3) {
      const intersects = this.raycaster.intersectObjects(this.scene.children.filter(
        child => child.name !== 'particles' && child.name !== 'background'
      ))
      if (intersects[0]) {
        const blobId = intersects[0].instanceId
        if (blobId && this.blobs) {
          if (!this.mergedBlobs.includes(blobId)) {
            this.mergedBlobs.push(blobId)
            this.blobs.mergeWithMain([blobId])
            window.setTimeout(this.mergeBlobs.bind(this), 300)

            if (this.mergedBlobs.length === BLOB_COUNT_STEP_2) {
              this.stepTwo()
            } else if (this.mergedBlobs.length === BLOB_COUNT_STEP_3) {
              this.stepThree()
            }
          }
        }
      }
    } else if (this.step > 3 && this.blobs) {
      const blobId = Math.floor(Math.random() * (this.mergedBlobs.length - 1)) + 1
      this.mergedBlobs = this.mergedBlobs.filter(blob => blob !== blobId)
      this.unmergeBlobs()
      this.blobs.removeFromMain([blobId])

      if (this.mergedBlobs.length === this.blobs.blobPositions.length - BLOB_COUNT_STEP_4) {
        window.setTimeout(this.stepFive.bind(this), 300)
      }
    }
  }

  mergeBlobs () {
    if (this.blobs) { this.blobs.grow(this.mergedBlobs) }
  }

  unmergeBlobs () {
    if (this.blobs) { this.blobs.shrink(this.mergedBlobs) }
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

  setParticles () {
    this.particles = new Particles({
      camera: this.camera,
      mouse: this.mouse
    })
    this.scene.add(this.particles.wrapper)
  }

  setFog () {
    this.scene.fog = new FogExp2(0x1B3371, 0.035)
  }

  stepOne () {
    this.step = 1
    this.blobs?.stepOne()
  }

  stepTwo () {
    this.step = 2
    gsap.to(this.camera.position, {
      delay: 0.2,
      z: 20,
      duration: 1,
      ease: 'power2.easeOut',
      onComplete: () => {
        if (this.blobs) { this.blobs.stepTwo() }
      }
    })
  }

  stepThree () {
    this.step = 3
    gsap.to(this.camera.position, {
      delay: 0.2,
      z: 30,
      duration: 1,
      ease: 'power2.easeOut'
    })

    if (this.blobs) {
      const blobsToMerge = Array.from(
        this.blobs.blobPositions.keys())
        .filter(blobId => !this.mergedBlobs.includes(blobId)
        )

      this.blobs.mergeWithMain(blobsToMerge, 0.5, 0.005, 0.5, 'elastic.in(1, 0.78)')
      window.setTimeout(() => {
        this.mergedBlobs.push(...blobsToMerge)
        this.blobs?.grow(this.mergedBlobs, 1.5, 0, 0.5, 'elastic.inOut(1, 0.78)')
        this.stepFour()
      }, 700)
    }
  }

  stepFour () {
    this.step = 4
  }

  stepFive () {
    this.step = 5
    gsap.to(this.camera.position, {
      delay: 0.8,
      z: 10,
      duration: 1,
      ease: 'power2.easeOut',
      onComplete: () => this.stepOne()
    })

    if (this.blobs) {
      this.blobs.removeFromMain(this.mergedBlobs, 1.8, 0, 0.2, 'elastic.inOut(1, 0.78)')
      this.mergedBlobs = []
      this.blobs.shrink(this.mergedBlobs, 1.8, 0, 0.2, 'elastic.inOut(1, 0.78)')
    }
  }

  render () {
    if (this.background) { this.background.render() }
    if (this.blobs) { this.blobs.render() }
    if (this.particles) { this.particles.render() }
  }
}
