<template>
  <div role="none" class="webgl">
    <canvas id="canvas-3D" ref="webglCanvas" />
  </div>
</template>

<script lang="ts">
import Webgl from '~/webgl/index'
import EvolutionScene from '~/webgl/scenes/Evolution/index'

interface DataTypes {
  webgl?: Webgl,
  scene?: EvolutionScene
}

export default {
  data (): DataTypes {
    return {
      webgl: undefined,
      scene: undefined
    }
  },
  mounted () {
    this.webgl = new Webgl({
      canvas: this.$refs.webglCanvas as HTMLCanvasElement
    })
    this.scene = new EvolutionScene()
    this.webgl.scene = this.scene.scene

    this.webgl.render()

    window.addEventListener('resize', this.resize)
    window.addEventListener('focus', this.focus)
    window.addEventListener('blur', this.blur)
  },
  methods: {
    resize () {
      if (this.webgl) { this.webgl.resize(window.innerWidth, window.innerHeight) }
    },
    focus () {
      if (this.webgl) { this.webgl.hasFocus = true }
    },
    blur () {
      if (this.webgl) { this.webgl.hasFocus = false }
    }
  }
}
</script>

<style lang="stylus">
.webgl
  position absolute;
  top 0;
  left 0;
  width 100%;
  height 100%;
  overflow hidden;

  canvas
    position absolute;
    top 0;
    left 0;
    width 100%;
    height 100%;
</style>
