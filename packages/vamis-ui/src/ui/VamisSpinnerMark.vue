<template>
  <!--
    中心对称 loading：一枚原点 → 四向裂开 → 菱形依次连线 → 线依次消失 → 收回原点。
    同一 2.7s 时钟、repeatCount indefinite（不要 begin 链式，Vue 动态 id 下会播完就停）。
    色走 currentColor / --spinner-color。菱形不是 Amis 六边形。
  -->
  <svg
    class="vamis-spinner-v"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    overflow="visible"
  >
    <polygon
      class="vamis-spinner-v__stroke"
      fill="none"
      stroke="currentColor"
      stroke-width="3.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      points="32 10 54 32 32 54 10 32"
      pathLength="100"
      stroke-dasharray="100 100"
      stroke-dashoffset="100"
    >
      <animate
        attributeName="stroke-dashoffset"
        dur="2.7s"
        repeatCount="indefinite"
        calcMode="spline"
        values="100; 100; 0; 0; -100; -100"
        keyTimes="0; 0.28; 0.48; 0.52; 0.72; 1"
        keySplines="0 0 1 1; 0.5 0 0.5 1; 0 0 1 1; 0.5 0 0.5 1; 0 0 1 1"
      />
    </polygon>
    <!-- 四枚都从圆心出发，叠在一起就是那颗原点 -->
    <circle fill="currentColor" cx="32" cy="32" r="5">
      <animateTransform
        attributeName="transform"
        type="translate"
        dur="2.7s"
        repeatCount="indefinite"
        calcMode="spline"
        values="0 0; 0 0; 0 -22; 0 -22; 0 0; 0 0"
        keyTimes="0; 0.08; 0.28; 0.72; 0.92; 1"
        keySplines="0 0 1 1; 0.5 0 0.5 1; 0 0 1 1; 0.5 0 0.5 1; 0 0 1 1"
      />
    </circle>
    <circle fill="currentColor" cx="32" cy="32" r="5">
      <animateTransform
        attributeName="transform"
        type="translate"
        dur="2.7s"
        repeatCount="indefinite"
        calcMode="spline"
        values="0 0; 0 0; 22 0; 22 0; 0 0; 0 0"
        keyTimes="0; 0.08; 0.28; 0.72; 0.92; 1"
        keySplines="0 0 1 1; 0.5 0 0.5 1; 0 0 1 1; 0.5 0 0.5 1; 0 0 1 1"
      />
    </circle>
    <circle fill="currentColor" cx="32" cy="32" r="5">
      <animateTransform
        attributeName="transform"
        type="translate"
        dur="2.7s"
        repeatCount="indefinite"
        calcMode="spline"
        values="0 0; 0 0; 0 22; 0 22; 0 0; 0 0"
        keyTimes="0; 0.08; 0.28; 0.72; 0.92; 1"
        keySplines="0 0 1 1; 0.5 0 0.5 1; 0 0 1 1; 0.5 0 0.5 1; 0 0 1 1"
      />
    </circle>
    <circle fill="currentColor" cx="32" cy="32" r="5">
      <animateTransform
        attributeName="transform"
        type="translate"
        dur="2.7s"
        repeatCount="indefinite"
        calcMode="spline"
        values="0 0; 0 0; -22 0; -22 0; 0 0; 0 0"
        keyTimes="0; 0.08; 0.28; 0.72; 0.92; 1"
        keySplines="0 0 1 1; 0.5 0 0.5 1; 0 0 1 1; 0.5 0 0.5 1; 0 0 1 1"
      />
    </circle>
  </svg>
</template>
