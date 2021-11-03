<template>
  <div role="none" class="webgl">
    <canvas id="canvas-3D" ref="webglCanvas" />
  </div>
</template>

<script lang="ts">
export default {
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
