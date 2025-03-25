interface GenerateRequest {
  key: string
  scale: string
  chords: number
  bpm: number
  genre?: string
}

interface ChordData {
  name: string
  duration: string
}

interface MidiNote {
  note: string
  duration: string
  velocity: number
}

interface GenerateResponse {
  bpm: number
  chords: ChordData[]
  midi: MidiNote[]
}

export class ApiService {
  private baseUrl = 'http://localhost:3000'

  async generateChordProgression(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: request.key,
          scale: request.scale.toLowerCase(), // сервер ожидает 'major' или 'minor' в нижнем регистре
          chords: request.chords,
          bpm: request.bpm,
          genre: request.genre?.toLowerCase() || 'jazz'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error calling API:', error)
      throw error
    }
  }
} 