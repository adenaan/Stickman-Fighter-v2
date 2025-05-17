// Background Manager for Stickman Fighter
// This file handles dynamic backgrounds and transitions

class BackgroundManager {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.currentBackground = "dojo"
    this.backgrounds = {
      // Default background
      dojo: {
        layers: [
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/dojo-bg.png", x: 0, y: 0, parallax: 0 },
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/dojo-floor.png", x: 0, y: 0, parallax: 0.1 },
        ],
        floorY: 50,
        skyColor: "#1a2a3a",
        floorColor: "#554433",
      },
      // Mountain background
      mountain: {
        layers: [
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/mountain-sky.png", x: 0, y: 0, parallax: 0 },
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/mountain-far.png", x: 0, y: 0, parallax: 0.1 },
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/mountain-mid.png", x: 0, y: 0, parallax: 0.2 },
          {
            image: null,
            src: "/Stickman-Fighter-v2/assets/backgrounds/mountain-ground.png",
            x: 0,
            y: 0,
            parallax: 0.3,
          },
        ],
        floorY: 50,
        skyColor: "#4a6a8a",
        floorColor: "#5d4b35",
      },
      // City background
      city: {
        layers: [
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/city-sky.png", x: 0, y: 0, parallax: 0 },
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/city-buildings.png", x: 0, y: 0, parallax: 0.1 },
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/city-street.png", x: 0, y: 0, parallax: 0.3 },
        ],
        floorY: 50,
        skyColor: "#3a4a5a",
        floorColor: "#333333",
      },
      // Beach background
      beach: {
        layers: [
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/beach-sky.png", x: 0, y: 0, parallax: 0 },
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/beach-ocean.png", x: 0, y: 0, parallax: 0.05 },
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/beach-sand.png", x: 0, y: 0, parallax: 0.2 },
        ],
        floorY: 50,
        skyColor: "#87ceeb",
        floorColor: "#f5deb3",
      },
      // Night forest background
      forest: {
        layers: [
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/forest-sky.png", x: 0, y: 0, parallax: 0 },
          {
            image: null,
            src: "/Stickman-Fighter-v2/assets/backgrounds/forest-trees-far.png",
            x: 0,
            y: 0,
            parallax: 0.1,
          },
          {
            image: null,
            src: "/Stickman-Fighter-v2/assets/backgrounds/forest-trees-near.png",
            x: 0,
            y: 0,
            parallax: 0.2,
          },
          { image: null, src: "/Stickman-Fighter-v2/assets/backgrounds/forest-ground.png", x: 0, y: 0, parallax: 0.3 },
        ],
        floorY: 50,
        skyColor: "#0a1a2a",
        floorColor: "#2a1a0a",
      },
    }

    // Transition properties
    this.transitioning = false
    this.transitionProgress = 0
    this.transitionSpeed = 0.02
    this.transitionTarget = ""

    // Background animation properties
    this.animationOffset = 0
    this.animationSpeed = 0.2
    this.parallaxOffset = 0

    // Time of day effect
    this.timeOfDay = "day" // day, sunset, night, dawn
    this.timeOverlay = 0
    this.timeColor = "rgba(0, 0, 0, 0)"

    // Auto cycle properties
    this.autoCycle = false
    this.cycleDuration = 60000 // 60 seconds per background
    this.lastCycleTime = Date.now()
    this.availableBackgrounds = Object.keys(this.backgrounds)

    // Placeholder images until real assets are loaded
    this.placeholderImages = {}
  }

  // Initialize the background manager
  async init() {
    // Create placeholder images for backgrounds
    await this.createPlaceholders()

    // Load the current background
    await this.loadBackground(this.currentBackground)

    console.log("Background manager initialized")
  }

  // Create placeholder images for backgrounds
  async createPlaceholders() {
    // For each background type
    for (const [bgName, bg] of Object.entries(this.backgrounds)) {
      this.placeholderImages[bgName] = []

      // For each layer in the background
      for (let i = 0; i < bg.layers.length; i++) {
        // Create a placeholder canvas
        const placeholderCanvas = document.createElement("canvas")
        placeholderCanvas.width = this.canvas.width
        placeholderCanvas.height = this.canvas.height
        const placeholderCtx = placeholderCanvas.getContext("2d")

        // Draw a gradient background
        const gradient = placeholderCtx.createLinearGradient(0, 0, 0, placeholderCanvas.height)

        // Different colors based on layer index and background type
        if (i === 0) {
          // Sky layer
          gradient.addColorStop(0, bg.skyColor)
          gradient.addColorStop(1, this.lightenColor(bg.skyColor, 30))
        } else if (i === bg.layers.length - 1) {
          // Ground/floor layer
          gradient.addColorStop(0, this.darkenColor(bg.floorColor, 20))
          gradient.addColorStop(1, bg.floorColor)
        } else {
          // Middle layers
          const midColor = this.blendColors(bg.skyColor, bg.floorColor, i / bg.layers.length)
          gradient.addColorStop(0, this.lightenColor(midColor, 10))
          gradient.addColorStop(1, this.darkenColor(midColor, 10))
        }

        placeholderCtx.fillStyle = gradient
        placeholderCtx.fillRect(0, 0, placeholderCanvas.width, placeholderCanvas.height)

        // Add some random elements based on background type
        placeholderCtx.fillStyle = "rgba(255, 255, 255, 0.1)"

        if (bgName === "mountain") {
          // Draw mountain silhouettes
          this.drawMountainSilhouette(placeholderCtx, i)
        } else if (bgName === "city") {
          // Draw building silhouettes
          this.drawCitySilhouette(placeholderCtx, i)
        } else if (bgName === "beach") {
          // Draw waves or palm trees
          this.drawBeachElements(placeholderCtx, i)
        } else if (bgName === "forest") {
          // Draw tree silhouettes
          this.drawForestSilhouette(placeholderCtx, i)
        }

        // Store the placeholder image
        this.placeholderImages[bgName].push(placeholderCanvas)
      }
    }
  }

  // Helper method to draw mountain silhouettes
  drawMountainSilhouette(ctx, layerIndex) {
    if (layerIndex === 0) return // Skip sky layer

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"

    const height = ctx.canvas.height
    const width = ctx.canvas.width

    // Draw a series of mountain peaks
    ctx.beginPath()
    ctx.moveTo(0, height)

    const peaks = 3 + layerIndex * 2
    const peakWidth = width / peaks

    for (let i = 0; i <= peaks; i++) {
      const x = i * peakWidth
      const peakHeight = 50 + Math.random() * 100

      if (i === 0) {
        ctx.lineTo(x, height - peakHeight / 2)
      } else {
        ctx.lineTo(x - peakWidth / 3, height - peakHeight / 3)
        ctx.lineTo(x, height - peakHeight)
        ctx.lineTo(x + peakWidth / 3, height - peakHeight / 3)
      }
    }

    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fill()
  }

  // Helper method to draw city silhouettes
  drawCitySilhouette(ctx, layerIndex) {
    if (layerIndex === 0) return // Skip sky layer

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"

    const height = ctx.canvas.height
    const width = ctx.canvas.width

    // Draw a series of buildings
    ctx.beginPath()
    ctx.moveTo(0, height)

    const buildings = 10 + layerIndex * 5
    const buildingWidth = width / buildings

    for (let i = 0; i < buildings; i++) {
      const x = i * buildingWidth
      const buildingHeight = 30 + Math.random() * 150

      ctx.lineTo(x, height - buildingHeight)
      ctx.lineTo(x, height - buildingHeight)
      ctx.lineTo(x + buildingWidth, height - buildingHeight)
      ctx.lineTo(x + buildingWidth, height)
    }

    ctx.closePath()
    ctx.fill()
  }

  // Helper method to draw beach elements
  drawBeachElements(ctx, layerIndex) {
    const height = ctx.canvas.height
    const width = ctx.canvas.width

    if (layerIndex === 1) {
      // Draw ocean waves
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)"

      for (let i = 0; i < 5; i++) {
        const y = height / 2 + i * 20

        ctx.beginPath()
        ctx.moveTo(0, y)

        for (let x = 0; x < width; x += 20) {
          ctx.quadraticCurveTo(x + 10, y - 5 - Math.random() * 5, x + 20, y)
        }

        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()
        ctx.fill()
      }
    } else if (layerIndex === 2) {
      // Draw palm trees
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"

      for (let i = 0; i < 3; i++) {
        const x = width * (0.2 + i * 0.3)
        const trunkHeight = 100 + Math.random() * 50

        // Draw trunk
        ctx.beginPath()
        ctx.moveTo(x - 5, height)
        ctx.lineTo(x - 5, height - trunkHeight)
        ctx.lineTo(x + 5, height - trunkHeight)
        ctx.lineTo(x + 5, height)
        ctx.closePath()
        ctx.fill()

        // Draw palm leaves
        ctx.beginPath()
        for (let j = 0; j < 5; j++) {
          const angle = (Math.PI / 5) * j
          const leafLength = 30 + Math.random() * 20

          ctx.moveTo(x, height - trunkHeight)
          ctx.quadraticCurveTo(
            x + Math.cos(angle) * leafLength * 0.6,
            height - trunkHeight - Math.sin(angle) * leafLength * 0.6,
            x + Math.cos(angle) * leafLength,
            height - trunkHeight - Math.sin(angle) * leafLength,
          )
        }
        ctx.stroke()
      }
    }
  }

  // Helper method to draw forest silhouettes
  drawForestSilhouette(ctx, layerIndex) {
    if (layerIndex === 0) return // Skip sky layer

    const height = ctx.canvas.height
    const width = ctx.canvas.width

    // Draw trees
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"

    const trees = 5 + layerIndex * 3
    const treeSpacing = width / trees

    for (let i = 0; i < trees; i++) {
      const x = (i + 0.5) * treeSpacing
      const treeHeight = 80 + Math.random() * 120

      // Draw tree trunk
      ctx.fillRect(x - 5, height - treeHeight, 10, treeHeight)

      // Draw tree crown
      ctx.beginPath()
      ctx.arc(x, height - treeHeight, 30 + Math.random() * 20, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Helper method to lighten a color
  lightenColor(color, amount) {
    return this.adjustColor(color, amount)
  }

  // Helper method to darken a color
  darkenColor(color, amount) {
    return this.adjustColor(color, -amount)
  }

  // Helper method to adjust a color's brightness
  adjustColor(color, amount) {
    // Convert hex to rgb
    let r, g, b

    if (color.startsWith("#")) {
      const hex = color.substring(1)
      r = Number.parseInt(hex.substr(0, 2), 16)
      g = Number.parseInt(hex.substr(2, 2), 16)
      b = Number.parseInt(hex.substr(4, 2), 16)
    } else if (color.startsWith("rgb")) {
      const match = color.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?$$/)
      if (match) {
        r = Number.parseInt(match[1])
        g = Number.parseInt(match[2])
        b = Number.parseInt(match[3])
      } else {
        return color
      }
    } else {
      return color
    }

    // Adjust brightness
    r = Math.max(0, Math.min(255, r + amount))
    g = Math.max(0, Math.min(255, g + amount))
    b = Math.max(0, Math.min(255, b + amount))

    return `rgb(${r}, ${g}, ${b})`
  }

  // Helper method to blend two colors
  blendColors(color1, color2, ratio) {
    // Convert colors to rgb
    let r1, g1, b1, r2, g2, b2

    // Parse color1
    if (color1.startsWith("#")) {
      const hex = color1.substring(1)
      r1 = Number.parseInt(hex.substr(0, 2), 16)
      g1 = Number.parseInt(hex.substr(2, 2), 16)
      b1 = Number.parseInt(hex.substr(4, 2), 16)
    } else if (color1.startsWith("rgb")) {
      const match = color1.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?$$/)
      if (match) {
        r1 = Number.parseInt(match[1])
        g1 = Number.parseInt(match[2])
        b1 = Number.parseInt(match[3])
      } else {
        return color1
      }
    } else {
      return color1
    }

    // Parse color2
    if (color2.startsWith("#")) {
      const hex = color2.substring(1)
      r2 = Number.parseInt(hex.substr(0, 2), 16)
      g2 = Number.parseInt(hex.substr(2, 2), 16)
      b2 = Number.parseInt(hex.substr(4, 2), 16)
    } else if (color2.startsWith("rgb")) {
      const match = color2.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?$$/)
      if (match) {
        r2 = Number.parseInt(match[1])
        g2 = Number.parseInt(match[2])
        b2 = Number.parseInt(match[3])
      } else {
        return color2
      }
    } else {
      return color2
    }

    // Blend colors
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio)
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio)
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio)

    return `rgb(${r}, ${g}, ${b})`
  }

  // Load a background by name
  async loadBackground(name) {
    if (!this.backgrounds[name]) {
      console.error(`Background "${name}" not found`)
      return false
    }

    const bg = this.backgrounds[name]

    // Load all layer images
    const promises = bg.layers.map((layer, index) => {
      return new Promise((resolve) => {
        if (layer.image) {
          // Image already loaded
          resolve()
          return
        }

        // Create a new image
        const img = new Image()

        // Set up load handler
        img.onload = () => {
          layer.image = img
          resolve()
        }

        // Set up error handler
        img.onerror = () => {
          console.warn(`Failed to load background image: ${layer.src}`)
          // Use placeholder instead
          layer.image = this.placeholderImages[name][index]
          resolve()
        }

        // Set crossOrigin to avoid CORS issues
        img.crossOrigin = "anonymous"

        // Start loading
        img.src = layer.src
      })
    })

    try {
      await Promise.all(promises)
      console.log(`Background "${name}" loaded`)
      return true
    } catch (error) {
      console.error(`Error loading background "${name}":`, error)
      return false
    }
  }

  // Set the current background with optional transition
  async setBackground(name, transition = true) {
    if (!this.backgrounds[name]) {
      console.error(`Background "${name}" not found`)
      return false
    }

    // Don't transition to the same background
    if (name === this.currentBackground && !this.transitioning) {
      return true
    }

    // Load the background first
    const loaded = await this.loadBackground(name)
    if (!loaded) return false

    if (transition) {
      // Start transition
      this.transitioning = true
      this.transitionProgress = 0
      this.transitionTarget = name
    } else {
      // Immediately set background
      this.currentBackground = name
    }

    return true
  }

  // Set time of day effect
  setTimeOfDay(time) {
    this.timeOfDay = time

    switch (time) {
      case "day":
        this.timeOverlay = 0
        this.timeColor = "rgba(0, 0, 0, 0)"
        break

      case "sunset":
        this.timeOverlay = 0.3
        this.timeColor = "rgba(255, 150, 50, 0.3)"
        break

      case "night":
        this.timeOverlay = 0.5
        this.timeColor = "rgba(0, 20, 50, 0.5)"
        break

      case "dawn":
        this.timeOverlay = 0.3
        this.timeColor = "rgba(150, 120, 200, 0.3)"
        break
    }
  }

  // Enable automatic background cycling
  enableAutoCycle(duration = 60000) {
    this.autoCycle = true
    this.cycleDuration = duration
    this.lastCycleTime = Date.now()
    console.log(`Auto background cycling enabled (${duration / 1000}s per background)`)
  }

  // Disable automatic background cycling
  disableAutoCycle() {
    this.autoCycle = false
    console.log("Auto background cycling disabled")
  }

  // Update background animations and transitions
  update(deltaTime) {
    // Handle automatic background cycling
    if (this.autoCycle && !this.transitioning) {
      const now = Date.now()
      if (now - this.lastCycleTime > this.cycleDuration) {
        // Pick a new random background that's different from current
        let newBackground
        do {
          const randomIndex = Math.floor(Math.random() * this.availableBackgrounds.length)
          newBackground = this.availableBackgrounds[randomIndex]
        } while (newBackground === this.currentBackground)

        this.setBackground(newBackground)
        this.lastCycleTime = now
      }
    }

    // Update animation offset for parallax effect
    this.animationOffset += this.animationSpeed * (deltaTime / 16.67)
    if (this.animationOffset > 1000) this.animationOffset -= 1000

    // Update transition progress
    if (this.transitioning) {
      this.transitionProgress += this.transitionSpeed * (deltaTime / 16.67)

      if (this.transitionProgress >= 1) {
        this.transitioning = false
        this.currentBackground = this.transitionTarget
        this.transitionProgress = 0
      }
    }
  }

  // Draw the current background
  draw(playerPositions = null) {
    // Update parallax offset based on player positions
    if (playerPositions && playerPositions.player1 && playerPositions.player2) {
      // Calculate the center point between players
      const centerX = (playerPositions.player1.x + playerPositions.player2.x) / 2

      // Calculate normalized position (0-1) across the screen
      const normalizedX = centerX / 800

      // Set parallax offset
      this.parallaxOffset = (normalizedX - 0.5) * 100
    }

    // Get current background
    const currentBg = this.backgrounds[this.currentBackground]

    // If transitioning, also get target background
    const targetBg = this.transitioning ? this.backgrounds[this.transitionTarget] : null

    // Draw current background layers
    this.drawBackgroundLayers(currentBg, targetBg)

    // Draw time of day overlay
    if (this.timeOverlay > 0) {
      this.ctx.fillStyle = this.timeColor
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  // Draw background layers with optional transition
  drawBackgroundLayers(currentBg, targetBg) {
    // Calculate canvas dimensions
    const width = this.canvas.width
    const height = this.canvas.height

    // Draw current background layers
    for (let i = 0; i < currentBg.layers.length; i++) {
      const layer = currentBg.layers[i]

      // Skip if no image
      if (!layer.image) continue

      // Calculate parallax offset
      const parallaxX = this.parallaxOffset * layer.parallax

      // Calculate animation offset for some layers
      let animX = 0
      if (layer.parallax > 0) {
        animX = (this.animationOffset * layer.parallax) % width
      }

      // Draw the layer
      this.ctx.globalAlpha = this.transitioning ? 1 - this.transitionProgress : 1

      // Draw the layer (potentially twice for seamless scrolling)
      this.ctx.drawImage(layer.image, parallaxX - animX, 0, width, height)

      // If the layer has parallax, draw it again for seamless scrolling
      if (animX > 0) {
        this.ctx.drawImage(layer.image, parallaxX - animX + width, 0, width, height)
      }
    }

    // If transitioning, draw target background layers
    if (this.transitioning && targetBg) {
      for (let i = 0; i < targetBg.layers.length; i++) {
        const layer = targetBg.layers[i]

        // Skip if no image
        if (!layer.image) continue

        // Calculate parallax offset
        const parallaxX = this.parallaxOffset * layer.parallax

        // Calculate animation offset for some layers
        let animX = 0
        if (layer.parallax > 0) {
          animX = (this.animationOffset * layer.parallax) % width
        }

        // Draw the layer with transition opacity
        this.ctx.globalAlpha = this.transitionProgress

        // Draw the layer (potentially twice for seamless scrolling)
        this.ctx.drawImage(layer.image, parallaxX - animX, 0, width, height)

        // If the layer has parallax, draw it again for seamless scrolling
        if (animX > 0) {
          this.ctx.drawImage(layer.image, parallaxX - animX + width, 0, width, height)
        }
      }
    }

    // Reset global alpha
    this.ctx.globalAlpha = 1
  }

  // Get the floor Y position for the current background
  getFloorY() {
    const bg = this.backgrounds[this.currentBackground]
    return this.canvas.height - bg.floorY
  }
}

// Export the BackgroundManager class
export default BackgroundManager
