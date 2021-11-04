import { PerspectiveCamera } from 'three'

export const getSizeAtZ = (z: number, camera: PerspectiveCamera, cameraCustomZ?: number) => {
  const cameraZ = cameraCustomZ || camera.position.z
  const distance = cameraZ - z

  const vFov = camera.fov * Math.PI / 180

  const finalHeight = 2 * Math.tan(vFov / 2) * distance
  const finalWidth = finalHeight * camera.aspect
  return { width: finalWidth, height: finalHeight }
}
