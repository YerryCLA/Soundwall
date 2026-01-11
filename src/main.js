import './style.css'

class SoundWall {
  constructor() {
    this.soundGrid = document.getElementById('sound-grid')
    this.visualizer = document.getElementById('visualizer')
    this.currentAudio = null
    this.currentButton = null
    this.sounds = []

    this.init()
  }

  async init() {
    this.showLoading()
    await this.loadSounds()
    this.renderSoundButtons()
  }

  showLoading() {
    this.soundGrid.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">LOADING SOUNDS...</div>
      </div>
    `
  }

  async loadSounds() {
    try {
      const response = await fetch('./sounds/sounds.json')
      if (!response.ok) throw new Error('Failed to load sounds')
      this.sounds = await response.json()
    } catch (error) {
      console.error('Error loading sounds:', error)
      this.sounds = []
    }
  }

  formatSoundName(filename) {
    return filename
      .replace(/\.mp3$/i, '')
      .replace(/\.wav$/i, '')
      .replace(/\.ogg$/i, '')
      .replace(/-By-.*$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  createSoundButton(soundFile) {
    const button = document.createElement('button')
    button.className = 'sound-btn'
    button.dataset.sound = soundFile

    const icon = document.createElement('div')
    icon.className = 'sound-icon'
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    `

    const name = document.createElement('span')
    name.className = 'sound-name'
    name.textContent = this.formatSoundName(soundFile)

    button.appendChild(icon)
    button.appendChild(name)

    button.addEventListener('click', () => this.playSound(soundFile, button))

    return button
  }

  renderSoundButtons() {
    this.soundGrid.innerHTML = ''

    if (this.sounds.length === 0) {
      this.soundGrid.innerHTML = `
        <div class="no-sounds">
          <h2>NO SOUNDS FOUND</h2>
          <p>Add MP3 files to the sounds folder and update sounds.json</p>
        </div>
      `
      return
    }

    this.sounds.forEach(sound => {
      const button = this.createSoundButton(sound)
      this.soundGrid.appendChild(button)
    })
  }

  playSound(soundFile, button) {
    // Stop current audio if playing
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      if (this.currentButton) {
        this.currentButton.classList.remove('playing')
      }
      this.visualizer.classList.remove('active')

      // If clicking the same button, just stop
      if (this.currentButton === button) {
        this.currentAudio = null
        this.currentButton = null
        return
      }
    }

    // Play new sound
    const audio = new Audio(`./sounds/${soundFile}`)
    this.currentAudio = audio
    this.currentButton = button

    button.classList.add('playing')
    this.visualizer.classList.add('active')

    audio.play().catch(error => {
      console.error('Error playing sound:', error)
      button.classList.remove('playing')
      this.visualizer.classList.remove('active')
    })

    audio.addEventListener('ended', () => {
      button.classList.remove('playing')
      this.visualizer.classList.remove('active')
      this.currentAudio = null
      this.currentButton = null
    })

    audio.addEventListener('error', () => {
      button.classList.remove('playing')
      this.visualizer.classList.remove('active')
      this.currentAudio = null
      this.currentButton = null
    })
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SoundWall()
})
