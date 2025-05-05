import * as THREE from 'three'
import SVGLoader from 'three-svg-loader'
import { MeshLine, MeshLineMaterial } from 'three.meshline'
import greenscreen from '../shaders/greenscreen.frag'
import vert from '../shaders/default.vert'
import { gsap } from 'gsap'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export default class Section extends THREE.Group {

    constructor({ timeline, section }) {

        super()
        this.timeline = timeline
        this.section = section

        if (this.section === 'intro') this.createIntroSection()
        else if (this.section === 'end') this.createEndSection()
        else if (this.section === 'contact') this.createContactSection()
        else this.create()

    }

    create() {

        const textGeom =(this.timeline.months[this.section].name, {
            font: this.timeline.assets.fonts['Schnyder L'],
            size: 200,
            height: 0,
            curveSegments: 10
        }).center()

        const monthName = new THREE.Mesh(textGeom, this.timeline.textMat)
        monthName.position.set(this.timeline.months[this.section].offset || 0, 0, 0)
        this.add(monthName)

    }

    createIntroSection() {

        const sansTextGeom =('YEAR IN REVIEW', {
            font: this.timeline.assets.fonts['SuisseIntl-Bold'],
            size: 60,
            height: 0,
            curveSegments: 4
        }).center()

        const sansText = new THREE.Mesh(sansTextGeom, this.timeline.textMat)
        this.add(sansText)

        const serifTextGeom =('2018', {
            font: this.timeline.assets.fonts['Schnyder_Edit Outline'],
            size: 640,
            height: 0,
            curveSegments: 15
        }).center()

        const serifText = new THREE.Mesh(serifTextGeom, this.timeline.textOutlineMat)
        serifText.position.set(0, 0, -500)
        this.add(serifText)

        const material = new THREE.MeshBasicMaterial({ 
            map: this.timeline.assets.textures['intro']['ok.png'], 
            transparent: true 
        })
        const geom = new THREE.PlaneGeometry(1, 1)
        const hand = new THREE.Mesh(geom, material)
        hand.scale.set(800, 800, 1)
        hand.position.set(0, 0, -250)
        this.add(hand)

        this.addIntroBadge()

    }

    addIntroBadge() {

        this.badge = new THREE.Group()

        const texture = new THREE.TextureLoader().load('images/highlights.png')
        texture.magFilter = texture.minFilter = THREE.LinearFilter
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
        const geom = new THREE.PlaneGeometry(1, 1)
        this.circle = new THREE.Mesh(geom, material)
        this.circle.scale.set(200, 200, 1)
        this.badge.add(this.circle)

        const serifTextGeom =('2018-19', {
            font: this.timeline.assets.fonts['Schnyder L'],
            size: 26,
            height: 0,
            curveSegments: 6
        }).center()

        const serifText = new THREE.Mesh(serifTextGeom, this.timeline.textMat)
        serifText.position.set(0, 0, 1)
        this.badge.add(serifText)

        this.badge.position.set(0, 0, 50)
        this.badge.position.y = this.timeline.c.size.w < 600 
            ? -this.timeline.c.size.h + 90 
            : -this.timeline.c.size.h / 2 + 90

        if (this.timeline.c.size.w < 600) {
            this.badge.scale.set(1.5, 1.5, 1)
        }

        this.add(this.badge)

    }

    createEndSection() {

        const sansTextGeom =('SEE YOU NEXT YEAR', {
            font: this.timeline.assets.fonts['SuisseIntl-Bold'],
            size: 60,
            height: 0,
            curveSegments: 4
        }).center()

        const sansText = new THREE.Mesh(sansTextGeom, this.timeline.textMat)
        this.add(sansText)

        const serifTextGeom =('END', {
            font: this.timeline.assets.fonts['Schnyder_Edit Outline'],
            size: 580,
            height: 0,
            curveSegments: 15
        }).center()

        const serifText = new THREE.Mesh(serifTextGeom, this.timeline.textOutlineMat)
        serifText.position.set(0, 0, -300)
        this.add(serifText)

        const geometry = new THREE.PlaneGeometry(1, 1)
        const material = new THREE.ShaderMaterial({
            uniforms: {
                fogColor: { value: this.timeline.scene.fog.color },
                fogNear: { value: this.timeline.scene.fog.near },
                fogFar: { value: this.timeline.scene.fog.far },
                texture: { value: this.timeline.assets.textures['end']['wave.mp4'] }
            },
            fragmentShader: greenscreen,
            vertexShader: vert,
            fog: true,
            transparent: true
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.scale.set(700, 700, 1)
        mesh.position.set(0, 0, -200)

        this.timeline.videoItems.push(mesh)
        this.add(mesh)

        this.addWhooshButton()

    }

    addWhooshButton() {

        this.whoosh = new THREE.Group()

        const whooshTexture = new THREE.TextureLoader().load('images/whoooosh.png')
        whooshTexture.magFilter = whooshTexture.minFilter = THREE.LinearFilter
        const whooshMaterial = new THREE.MeshBasicMaterial({ 
            map: whooshTexture, 
            transparent: true, 
            depthWrite: false 
        })
        const whooshGeom = new THREE.PlaneGeometry(1, 1)
        this.circle = new THREE.Mesh(whooshGeom, whooshMaterial)
        this.circle.scale.set(200, 200, 1)
        this.whoosh.add(this.circle)

        const texture = new THREE.TextureLoader().load('images/arrowdown.png')
        texture.anisotropy = this.timeline.renderer.capabilities.getMaxAnisotropy()
        texture.magFilter = texture.minFilter = THREE.LinearFilter
        const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true, 
            side: THREE.DoubleSide, 
            depthWrite: false 
        })
        const geom = new THREE.PlaneGeometry(1, 1)
        this.arrow = new THREE.Mesh(geom, material)
        this.arrow.scale.set(90, 90, 1)
        this.arrow.position.z = 20
        this.whoosh.add(this.arrow)

        this.whoosh.position.set(0, -450, 50)
        if (this.timeline.c.size.w < 600) {
            this.whoosh.scale.set(1.5, 1.5, 1)
        }

        this.add(this.whoosh)

    }

    createContactSection() {

        this.position.set(0, 2000 / this.timeline.scene.scale.y, 0)
        this.visible = false

        const sansTextGeom =('SAY HELLO', {
            font: this.timeline.assets.fonts['SuisseIntl-Bold'],
            size: 10,
            height: 0,
            curveSegments: 4
        }).center()

        const sansText = new THREE.Mesh(sansTextGeom, this.timeline.textMat)
        sansText.position.set(0, 60, 0)
        this.add(sansText)

        const lineOneGeom = new TextGeometry("Let's make 2019 just as memorable with more", {
            font: this.timeline.assets.fonts['Schnyder L'],
            size: 30,
            height: 0,
            curveSegments: 4
        }).center()

        const lineOne = new THREE.Mesh(lineOneGeom, this.timeline.textMat)
        lineOne.position.set(0, 0, 0)
        this.add(lineOne)

        const lineTwoGeom =("amazing projects and collaborations.", {
            font: this.timeline.assets.fonts['Schnyder L'],
            size: 30,
            height: 0,
            curveSegments: 4
        }).center()

        const lineTwo = new THREE.Mesh(lineTwoGeom, this.timeline.textMat)
        lineTwo.position.set(0, -40, 0)
        this.add(lineTwo)

        const lineThreeGeom = new TextGeometry("Get in touch at", {
            font: this.timeline.assets.fonts['Schnyder L'],
            size: 30,
            height: 0,
            curveSegments: 4
        }).center()

        const lineThree = new THREE.Mesh(lineThreeGeom, this.timeline.textMat)
        lineThree.position.set(0, -100, 0)
        this.add(lineThree)

        const lineFourGeom =("hello@metaminds.studio", {
            font: this.timeline.assets.fonts['Schnyder L'],
            size: 30,
            height: 0,
            curveSegments: 4
        }).center()

        const lineFour = new THREE.Mesh(lineFourGeom, this.timeline.textMat)
        lineFour.position.set(0, -140, 0)
        this.add(lineFour)

    }

}