<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ApiService } from './services/apiService'
import * as Tone from 'tone'

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const scales = ['Major', 'Minor']
const genres = ['LoFi', 'Jazz', 'Pop', 'Classical', 'R&B']

const rootNote = ref('C')
const scale = ref('Major')
const genre = ref('LoFi')
const numberOfChords = ref(4)
const bpm = ref(90)
const generatedProgressions = ref([])
const selectedProgressionIndex = ref(0)
const generatedChords = ref([])
const isPlaying = ref(false)
const currentPlayingIndex = ref(-1)

const apiService = new ApiService()
const synth = new Tone.PolySynth().toDestination()

const generateChords = async () => {
    try {
      const response = await apiService.generateChordProgression({
        key: rootNote.value,
        scale: scale.value,
        chords: numberOfChords.value,
        bpm: bpm.value,
        genre: genre.value
      })
      
      generatedChords.value = response.chords
      generatedProgressions.value = [response.chords] // Оборачиваем в массив для совместимости с UI
      bpm.value = response.bpm // Обновляем BPM из ответа сервера
    } catch (error) {
      console.error('Failed to generate chords:', error)
    }
}

const playChordAtTime = (chord, time, duration) => {
  synth.triggerAttackRelease(chord.notes, duration, time, 0.8)
}

const stopPlayback = () => {
  Tone.Transport.stop()
  Tone.Transport.cancel()
  synth.releaseAll()
}

const playProgression = async () => {
  if (isPlaying.value) {
    stopPlayback()
    isPlaying.value = false
    currentPlayingIndex.value = -1
    return
  }

  try {
    await Tone.start()
    isPlaying.value = true
    
    // Set up the Transport
    Tone.Transport.cancel()
    Tone.Transport.stop()
    Tone.Transport.bpm.value = bpm.value

    // Создаем Part для воспроизведения аккордов
    const part = new Tone.Part((time, chord) => {
      playChordAtTime(chord, time, (60 / bpm.value) * 2)
    }, generatedChords.value.map((chord, index) => [index * (60 / bpm.value) * 2, chord]))

    // Добавляем обновление UI
    const uiPart = new Tone.Part((time, index) => {
      currentPlayingIndex.value = index
    }, generatedChords.value.map((_, index) => [index * (60 / bpm.value) * 2 - 0.01, index]))

    // Запускаем воспроизведение
    part.start(0)
    uiPart.start(0)

    // Останавливаем воспроизведение в конце
    const endTime = generatedChords.value.length * (60 / bpm.value) * 2
    Tone.Transport.schedule(() => {
      isPlaying.value = false
      currentPlayingIndex.value = -1
      Tone.Transport.stop()
    }, endTime)

    // Start playback
    Tone.Transport.start()
  } catch (error) {
    console.error('Error playing progression:', error)
    isPlaying.value = false
    currentPlayingIndex.value = -1
  }
}

const removeChord = (index: number) => {
  if (isPlaying.value) return
  
  generatedChords.value = generatedChords.value.filter((_, i) => i !== index)
  // Optionally, we could regenerate the progression here to maintain musical coherence
}
</script>

<template>
  <div class="min-h-screen w-full bg-warm-beige text-slate-700 noise-bg">
    <div class="flex flex-col items-center justify-start py-8 lg:py-12 px-4">
      <header class="mb-8 lg:mb-12 text-center relative glitch-container">
        <div class="absolute inset-0 glitch-text" aria-hidden="true">Chord Progression Generator</div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl retro-font relative">Chord Progression Generator</h1>
        <div class="mt-2 handwritten-font text-lg sm:text-xl text-warm-orange opacity-80">create your lofi vibes</div>
      </header>
      
      <main class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl w-full">
        <div class="bg-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-soft">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div class="control-group">
              <label class="block mb-2 retro-font text-sm lg:text-base">Genre</label>
              <select v-model="genre" class="w-full control-input">
                <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>

            <div class="control-group">
              <label class="block mb-2 retro-font text-sm lg:text-base">Root Note & Scale</label>
              <div class="flex gap-2">
                <select v-model="rootNote" class="w-1/2 control-input">
                  <option v-for="note in notes" :key="note" :value="note">{{ note }}</option>
                </select>
                <select v-model="scale" class="w-1/2 control-input">
                  <option v-for="s in scales" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div class="control-group">
              <label class="block mb-2 retro-font text-sm lg:text-base">Number of Chords</label>
              <input 
                type="number" 
                v-model="numberOfChords" 
                min="2" 
                max="16" 
                class="w-full control-input"
              >
            </div>
            
            <div class="control-group">
              <label class="block mb-2 retro-font text-sm lg:text-base">BPM</label>
              <input 
                type="number" 
                v-model="bpm" 
                min="60" 
                max="200" 
                class="w-full control-input"
              >
            </div>
          </div>

          <button 
            @click="generateChords" 
            class="w-full sm:w-auto mt-6 generate-btn"
          >
            Generate Progressions
          </button>

          <div v-if="generatedProgressions.length" class="mt-6 sm:mt-8">
            <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button 
                v-for="(progression, index) in generatedProgressions" 
                :key="index"
                @click="selectProgression(index)"
                class="progression-variant-btn"
                :class="{ 'active': selectedProgressionIndex === index }"
              >
                Variant {{ index + 1 }}
              </button>
            </div>

            <div class="space-y-4 sm:space-y-6">
              <div 
                v-for="row in Math.ceil(generatedChords.length / 4)" 
                :key="row"
                class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
              >
                <div 
                  v-for="i in 4" 
                  :key="i"
                  class="chord-card"
                  :class="{ 
                    'playing': currentPlayingIndex === (row - 1) * 4 + (i - 1),
                    'hidden': !generatedChords[(row - 1) * 4 + (i - 1)]
                  }"
                >
                  <template v-if="generatedChords[(row - 1) * 4 + (i - 1)]">
                    <button 
                      @click="removeChord((row - 1) * 4 + (i - 1))"
                      class="remove-btn"
                    >
                      ×
                    </button>
                    <div class="text-center">
                      <div class="text-base sm:text-lg lg:text-xl retro-font font-bold">
                        {{ generatedChords[(row - 1) * 4 + (i - 1)].name }}
                      </div>
                      <div class="text-xs sm:text-sm text-warm-orange/80 handwritten-font">
                        <div v-for="note in generatedChords[(row - 1) * 4 + (i - 1)].notes" :key="note">
                          {{ note }}
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div class="mt-6 sm:mt-8 flex justify-center">
              <button 
                @click="playProgression" 
                class="play-btn"
              >
                {{ isPlaying ? 'Stop' : 'Play' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Caveat&display=swap');

/* Add styles for the entire page */
:root {
  min-height: 100vh;
  background-color: theme('colors.warm-beige');
}

body {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background-color: theme('colors.warm-beige');
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: theme('colors.warm-beige');
}

.retro-font {
  font-family: 'Press Start 2P', monospace;
}

.handwritten-font {
  font-family: 'Caveat', cursive;
}

.noise-bg {
  background-color: theme('colors.warm-beige');
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  background-blend-mode: overlay;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shadow-soft {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.control-input {
  @apply bg-white/70 rounded-lg p-2 sm:p-3 border-2 border-warm-orange/20 focus:border-warm-orange/50 outline-none transition-all duration-300;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
}

@screen sm {
  .control-input {
    font-size: 0.8rem;
  }
}

.generate-btn {
  @apply bg-neon-pink hover:bg-neon-pink/90 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-300 retro-font text-sm sm:text-base lg:text-lg transform hover:scale-[1.02] hover:shadow-neon hover:shadow-neon-pink mx-auto block;
}

.play-btn {
  @apply bg-neon-blue hover:bg-neon-blue/90 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 retro-font transform hover:scale-[1.02] hover:shadow-neon hover:shadow-neon-blue text-sm sm:text-base;
}

.chord-card {
  @apply relative bg-white/70 p-3 sm:p-4 rounded-lg transition-all duration-300 hover:shadow-md;
  min-height: 90px;
}

@screen sm {
  .chord-card {
    min-height: 110px;
  }
}

@screen lg {
  .chord-card {
    min-height: 120px;
  }
}

.chord-card.hidden {
  @apply opacity-0 pointer-events-none invisible;
  transform: translateY(10px);
}

.chord-card.playing {
  @apply bg-neon-pink/10 shadow-neon shadow-neon-pink;
  animation: pulse 1s infinite;
}

.remove-btn {
  @apply absolute -top-2 -right-2 bg-neon-pink/80 hover:bg-neon-pink text-white rounded-full w-6 h-6 flex items-center justify-center transition-all duration-300;
}

.glitch-container {
  position: relative;
}

.glitch-text {
  clip: rect(0, 900px, 0, 0);
  animation: glitch 3s infinite linear alternate-reverse;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@keyframes glitch {
  0% { clip: rect(44px, 900px, 56px, 0); }
  20% { clip: rect(67px, 900px, 31px, 0); }
  40% { clip: rect(22px, 900px, 73px, 0); }
  60% { clip: rect(91px, 900px, 11px, 0); }
  80% { clip: rect(33px, 900px, 82px, 0); }
  100% { clip: rect(17px, 900px, 94px, 0); }
}

.shadow-neon {
  box-shadow: 0 0 15px theme('colors.neon-pink');
}

.control-checkbox {
  @apply w-4 h-4 rounded border-2 border-warm-orange/20 focus:border-warm-orange/50 outline-none transition-all duration-300;
}

.progression-variant-btn {
  @apply px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-300 retro-font text-sm whitespace-nowrap;
}

.progression-variant-btn.active {
  @apply bg-neon-pink text-white shadow-neon shadow-neon-pink;
}
</style>
