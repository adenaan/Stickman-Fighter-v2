// Weather System for Stickman Fighter
// This file handles weather effects like rain, snow, and lightning

class WeatherSystem {
  constructor(canvas, ctx) {
    this.canvas = canvas
    this.ctx = ctx
    this.weatherType = "none" // none, rain, snow, storm, fog
    this.particles = []
    this.maxParticles = 200
    this.windDirection = 0 // -1 left, 0 none, 1 right
    this.windStrength = 0
    this.fogOpacity = 0
    this.lightningActive = false
    this.lightningAlpha = 0
    this.lastLightningTime = 0

    // Weather transition variables
    this.transitioning = false
    this.transitionProgress = 0
    this.transitionTarget = "none"
    this.transitionSpeed = 0.01

    // Weather cycle variables
    this.autoCycle = false
    this.weatherDuration = 30000 // 30 seconds per weather
    this.lastWeatherChange = Date.now()
    this.availableWeathers = ["none", "rain", "snow", "storm", "fog"]
  }

  // Initialize the weather system
  init() {
    // Start with no weather
    this.setWeather("none")
  }

  // Set a specific weather type with optional transition
  setWeather(type, transition = true) {
    if (!this.availableWeathers.includes(type)) {
      console.error(`Weather type "${type}" not recognized`)
      return
    }

    if (transition && this.weatherType !== type) {
      // Start transition to new weather
      this.transitioning = true
      this.transitionTarget = type
      this.transitionProgress = 0
    } else {
      // Immediately set weather
      this.weatherType = type
      this.resetWeatherProperties()
      this.generateParticles()
    }

    console.log(`Weather changing to: ${type}`)
  }

  // Reset weather properties based on current type
  resetWeatherProperties() {
    // Clear existing particles
    this.particles = []

    // Set properties based on weather type
    switch (this.weatherType) {
      case "none":
        this.maxParticles = 0
        this.windDirection = 0
        this.windStrength = 0
        this.fogOpacity = 0
        break

      case "rain":
        this.maxParticles = 200
        this.windDirection = Math.random() > 0.5 ? -1 : 1
        this.windStrength = 1 + Math.random() * 2
        this.fogOpacity = 0.1
        break

      case "snow":
        this.maxParticles = 150
        this.windDirection = Math.random() > 0.5 ? -1 : 1
        this.windStrength = 0.5 + Math.random()
        this.fogOpacity = 0.15
        break

      case "storm":
        this.maxParticles = 250
        this.windDirection = Math.random() > 0.5 ? -1 : 1
        this.windStrength = 3 + Math.random() * 3
        this.fogOpacity = 0.25
        break

      case "fog":
        this.maxParticles = 50
        this.windDirection = 0
        this.windStrength = 0.2
        this.fogOpacity = 0.4
        break
    }
  }

  // Generate particles based on current weather type
  generateParticles() {
    this.particles = []

    for (let i = 0; i < this.maxParticles; i++) {
      this.addParticle()
    }
  }

  // Add a single particle
  addParticle() {
    if (this.particles.length >= this.maxParticles) return

    const particle = {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: 1,
      speed: 1,
      opacity: 1,
      wind: 0,
    }

    // Customize particle based on weather type
    switch (this.weatherType) {
      case "rain":
        particle.y = Math.random() * -100
        particle.size = 1 + Math.random()
        particle.speed = 10 + Math.random() * 10
        particle.wind = this.windDirection * this.windStrength
        particle.length = 10 + Math.random() * 20
        particle.opacity = 0.6 + Math.random() * 0.4
        break

      case "snow":
        particle.y = Math.random() * -50
        particle.size = 2 + Math.random() * 3
        particle.speed = 1 + Math.random() * 2
        particle.wind = this.windDirection * this.windStrength
        particle.wobble = Math.random() * 0.1
        particle.wobbleSpeed = 0.01 + Math.random() * 0.05
        particle.wobblePos = Math.random() * Math.PI * 2
        particle.opacity = 0.7 + Math.random() * 0.3
        break

      case "storm":
        particle.y = Math.random() * -100
        particle.size = 1 + Math.random() * 2
        particle.speed = 15 + Math.random() * 15
        particle.wind = this.windDirection * this.windStrength
        particle.length = 15 + Math.random() * 25
        particle.opacity = 0.5 + Math.random() * 0.5
        break

      case "fog":
        particle.x = Math.random() * this.canvas.width
        particle.y = this.canvas.height - 50 - Math.random() * 100
        particle.size = 50 + Math.random() * 100
        particle.speed = 0.2 + Math.random() * 0.3
        particle.wind = this.windDirection * this.windStrength
        particle.opacity = 0.05 + Math.random() * 0.1
        break
    }

    this.particles.push(particle)
  }

  // Update weather system
  update(deltaTime) {
    // Handle automatic weather cycling
    if (this.autoCycle && !this.transitioning) {
      const now = Date.now()
      if (now - this.lastWeatherChange > this.weatherDuration) {
        // Pick a new random weather that's different from current
        let newWeather
        do {
          const randomIndex = Math.floor(Math.random() * this.availableWeathers.length)
          newWeather = this.availableWeathers[randomIndex]
        } while (newWeather === this.weatherType)

        this.setWeather(newWeather)
        this.lastWeatherChange = now
      }
    }

    // Handle weather transitions
    if (this.transitioning) {
      this.transitionProgress += this.transitionSpeed * (deltaTime / 16.67)

      if (this.transitionProgress >= 1) {
        this.transitioning = false
        this.weatherType = this.transitionTarget
        this.resetWeatherProperties()
        this.generateParticles()
      }
    }

    // Update particles based on weather type
    this.updateParticles(deltaTime)

    // Handle lightning for storm weather
    if (this.weatherType === "storm" || (this.transitioning && this.transitionTarget === "storm")) {
      this.updateLightning(deltaTime)
    } else {
      this.lightningActive = false
      this.lightningAlpha = 0
    }
  }

  // Update all particles
  updateParticles(deltaTime) {
    // Normalize for 60fps
    const timeScale = deltaTime / 16.67

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]

      // Apply movement based on weather type
      switch (this.weatherType) {
        case "rain":
        case "storm":
          p.y += p.speed * timeScale
          p.x += p.wind * timeScale

          // Remove if out of bounds
          if (p.y > this.canvas.height) {
            this.particles.splice(i, 1)
            this.addParticle()
          }
          break

        case "snow":
          p.y += p.speed * timeScale
          p.wobblePos += p.wobbleSpeed * timeScale
          p.x += p.wind * timeScale + Math.sin(p.wobblePos) * 2

          // Remove if out of bounds
          if (p.y > this.canvas.height) {
            this.particles.splice(i, 1)
            this.addParticle()
          }
          break

        case "fog":
          p.x += p.wind * timeScale

          // Wrap around if out of bounds
          if (p.x > this.canvas.width + p.size) {
            p.x = -p.size
          } else if (p.x < -p.size) {
            p.x = this.canvas.width + p.size
          }
          break
      }
    }

    // Add new particles if needed
    while (this.particles.length < this.maxParticles && this.weatherType !== "none") {
      this.addParticle()
    }
  }

  // Update lightning effect for storm weather
  updateLightning(deltaTime) {
    const now = Date.now()

    // If lightning is active, fade it out
    if (this.lightningActive) {
      this.lightningAlpha -= 0.05 * (deltaTime / 16.67)
      if (this.lightningAlpha <= 0) {
        this.lightningActive = false
        this.lightningAlpha = 0
      }
    }
    // Otherwise, randomly trigger new lightning
    else if (now - this.lastLightningTime > 3000) {
      // At least 3 seconds between strikes
      if (Math.random() < 0.01 * (deltaTime / 16.67)) {
        this.lightningActive = true
        this.lightningAlpha = 0.8 + Math.random() * 0.2
        this.lastLightningTime = now

        // Play thunder sound if available
        if (window.playSound && Math.random() < 0.7) {
          setTimeout(
            () => {
              if (window.soundEnabled) {
                window.playSound("thunder")
              }
            },
            300 + Math.random() * 1000,
          ) // Thunder delay after lightning
        }
      }
    }
  }

  // Draw weather effects
  draw() {
    // Skip if no weather or fully transitioning out
    if (this.weatherType === "none" && !this.transitioning) return
    if (this.transitioning && this.transitionTarget === "none" && this.transitionProgress > 0.9) return

    // Calculate opacity based on transition
    let opacity = 1
    if (this.transitioning) {
      if (this.transitionTarget === "none") {
        opacity = 1 - this.transitionProgress
      } else if (this.weatherType === "none") {
        opacity = this.transitionProgress
      }
    }

    // Draw lightning flash
    if (this.lightningActive) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningAlpha * opacity})`
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    // Draw fog overlay
    if (this.fogOpacity > 0) {
      const fogOpacity = this.transitioning ? this.fogOpacity * opacity : this.fogOpacity

      this.ctx.fillStyle = `rgba(200, 215, 220, ${fogOpacity})`
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    // Draw particles
    for (const p of this.particles) {
      // Skip if fully transparent
      if (p.opacity * opacity <= 0) continue

      this.ctx.save()

      switch (this.weatherType) {
        case "rain":
        case "storm":
          // Draw rain drop
          this.ctx.strokeStyle = `rgba(200, 230, 255, ${p.opacity * opacity})`
          this.ctx.lineWidth = p.size
          this.ctx.beginPath()
          this.ctx.moveTo(p.x, p.y)
          this.ctx.lineTo(p.x + p.wind * 0.5, p.y + p.length)
          this.ctx.stroke()
          break

        case "snow":
          // Draw snowflake
          this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * opacity})`
          this.ctx.beginPath()
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          this.ctx.fill()
          break

        case "fog":
          // Draw fog particle
          const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
          gradient.addColorStop(0, `rgba(230, 240, 245, ${p.opacity * opacity})`)
          gradient.addColorStop(1, `rgba(230, 240, 245, 0)`)

          this.ctx.fillStyle = gradient
          this.ctx.beginPath()
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          this.ctx.fill()
          break
      }

      this.ctx.restore()
    }
  }

  // Enable automatic weather cycling
  enableAutoCycle(duration = 30000) {
    this.autoCycle = true
    this.weatherDuration = duration
    this.lastWeatherChange = Date.now()
    console.log(`Auto weather cycling enabled (${duration / 1000}s per weather)`)
  }

  // Disable automatic weather cycling
  disableAutoCycle() {
    this.autoCycle = false
    console.log("Auto weather cycling disabled")
  }
}

// Export the WeatherSystem class
export default WeatherSystem
