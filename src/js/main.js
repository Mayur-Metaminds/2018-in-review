import '../scss/style.scss'
import Timeline from './components/Timeline'

let timeline = null

function cleanup() {
    if (!timeline) return

    window.assets = timeline.assets
    timeline.renderer.domElement.removeEventListener('wheel', timeline.scroll)
    window.removeEventListener('resize', timeline.resize)
    timeline.renderer.domElement.removeEventListener('mousedown', timeline.mouseDown)
    timeline.renderer.domElement.removeEventListener('mouseup', timeline.mouseUp)
    window.removeEventListener('mousemove', timeline.mouseMove)
    
    const canvas = document.querySelector('canvas')
    if (canvas) canvas.remove()
    
    if (timeline.renderer) {
        timeline.renderer.forceContextLoss()
        timeline.renderer.context = null
        timeline.renderer.domElement = null
        timeline.renderer = null
    }
    
    if (timeline.animationId) {
        cancelAnimationFrame(timeline.animationId)
    }
    
    if (timeline.gesture) {
        timeline.gesture.destroy()
    }
}

// Initial HMR Setup
if (import.meta.hot) {
    import.meta.hot.accept()
    import.meta.hot.dispose(cleanup)
}

function init() {
    timeline = new Timeline()
    window.timeline = timeline
}

init()