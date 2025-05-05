import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import frag from '../shaders/item.frag'
import vert from '../shaders/default.vert'

export default class Item extends THREE.Group {
    constructor({ timeline, texture, data, month, itemIndex, itemIndexTotal }) {
        super()
        this.timeline = timeline
        this.texture = texture
        this.data = data
        this.month = month
        this.itemIndex = itemIndex
        this.itemIndexTotal = itemIndexTotal

        this.create()
    }

    create() {
        this.uniforms = {
            time: { value: 1.0 },
            fogColor: { value: this.timeline.scene.fog.color },
            fogNear: { value: this.timeline.scene.fog.near },
            fogFar: { value: this.timeline.scene.fog.far },
            texture: { value: this.texture },
            opacity: { value: 1.0 },
            progress: { value: 0.0 },
            gradientColor: { value: new THREE.Color(0x1b42d8) }
        }

        this.geometry = new THREE.PlaneGeometry(1, 1)
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: frag,
            vertexShader: vert,
            fog: true,
            transparent: true
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.scale.set(this.texture.size.x, this.texture.size.y, 1)

        // Update size of meshes after texture has been loaded
        this.texture.onUpdate = () => {
            if (this.mesh.scale.x !== this.texture.size.x || this.mesh.scale.y !== this.texture.size.y) {
                this.mesh.scale.set(this.texture.size.x, this.texture.size.y, 1)
                this.texture.onUpdate = null
            }
        }

        // Position mapping based on alignment
        const positions = {
            0: [-350, 350],  // bottom left
            1: [350, 350],   // bottom right
            2: [350, -350],  // top right
            3: [-350, -350]  // top left
        }

        const align = this.itemIndexTotal % 4
        const pos = new THREE.Vector2(...positions[align])

        this.align = align
        this.position.set(pos.x, pos.y, (this.itemIndex * -300) - 200)
        this.origPos = new THREE.Vector2(pos.x, pos.y)

        this.add(this.mesh)
        this.addCaption()

        this.timeline.itemMeshes.push(this.mesh)

        if (this.texture.mediaType === 'video') {
            this.timeline.videoItems.push(this.mesh)
        }
    }

    addCaption() {
        if (!this.data.caption && !this.data.link) return

        if (this.data.caption) {
            const captionGeom = new TextGeometry(this.data.caption, {
                font: this.timeline.assets.fonts['Schnyder L'],
                size: 18,
                height: 0,
                curveSegments: 4
            }).center()

            this.caption = new THREE.Mesh(captionGeom, this.timeline.captionTextMat)
            this.caption.position.set(0, -this.mesh.scale.y / 2 - 50, 0)
            this.caption.visible = false

            this.add(this.caption)
        }
    }
}