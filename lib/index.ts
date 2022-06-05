import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { AnimationClip } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
//@ts-ignore
import TWEEN from "@tweenjs/tween.js";
class Three {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  control: OrbitControls;
  CSSRender: CSS2DRenderer;
  element: HTMLElement;
  mixers: THREE.AnimationMixer[];
  composers: Array<EffectComposer>;
  clock: THREE.Clock;
  renderMixins: Array<Function>;
  stats: any;
  constructor(element: HTMLElement) {
    this.element = element;
    this.scene = this.initScene();
    this.camera = this.initCamera(element);
    this.renderer = this.initRenderer(element);
    this.CSSRender = this.initCSSRender(element);
    this.control = this.initControl();
    this.stats = null;
    this.mixers = [];
    this.composers = [];
    this.renderMixins = [];
    this.clock = new THREE.Clock();
  }
  initScene(): THREE.Scene {
    const scene = new THREE.Scene();
    return scene;
  }
  initCSSRender(element: HTMLElement): CSS2DRenderer {
    const CSSRender = new CSS2DRenderer();
    CSSRender.setSize(element.offsetWidth, element.offsetHeight);
    CSSRender.domElement.style.position = "absolute";
    CSSRender.domElement.style.top = "0px";
    element.appendChild(CSSRender.domElement);
    return CSSRender;
  }
  initCamera(element: HTMLElement): THREE.PerspectiveCamera {
    const fov = 20;
    const aspect = element.offsetWidth / element.offsetHeight;
    const near = 0.1;
    const far = 5 * 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 3);
    return camera;
  }
  initRenderer(element: HTMLElement) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true;
    renderer.setSize(element.offsetWidth, element.offsetHeight);
    element.appendChild(renderer.domElement);
    return renderer;
  }
  initControl() {
    const control = new OrbitControls(this.camera, this.CSSRender.domElement);
    return control;
  }
  initHelp(size: number) {
    const axesHelper = new THREE.AxesHelper(size);
    this.scene.add(axesHelper);
  }
  initStats() {
    //@ts-ignore
    this.stats = new Stats();
    this.element.appendChild(this.stats.dom);
  }
  loadGLTF(url: string, onProgress = (progress: number) => {}): Promise<GLTF> {
    const loader = new GLTFLoader();
    return new Promise<GLTF>((resolve) => {
      loader.load(
        url,
        (object: any) => resolve(object),
        (xhr: any) => onProgress(Number((xhr.loaded / xhr.total) * 100))
      );
    });
  }
  playModelAnimate(
    mesh: THREE.Object3D | THREE.AnimationObjectGroup,
    animations: AnimationClip[],
    animationName: string
  ) {
    const mixer = new THREE.AnimationMixer(mesh);
    const clip = THREE.AnimationClip.findByName(animations, animationName);
    if (!clip) return void 0;
    const action = mixer.clipAction(clip);
    action.play();
    this.mixers.push(mixer);
  }
  render() {
    const delta = new THREE.Clock().getDelta();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
    const mixerUpdateDelta = this.clock.getDelta();
    this.mixers.forEach((mixer) => mixer.update(mixerUpdateDelta));
    this.composers.forEach((composer) => composer.render(delta));
    this.renderMixins.forEach((mixin) => mixin());
    TWEEN.update();
    this.stats && this.stats?.update();
  }
}
export default Three;
