interface GenerateRequest {
  key: string
  scale: string
  chords: number
  bpm: number
  genre?: string
}

interface ChordData {
  name: string
  notes: string[]
  duration: string
}

interface GenerateResponse {
  bpm: number
  chords: ChordData[]
}

export class ApiService {
  private openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY

  private extractJsonFromMarkdown(content: string): string {
    // Удаляем markdown-форматирование и извлекаем только JSON
    const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return jsonMatch[1]
    }
    return content
  }

  private isCompleteJson(jsonString: string): boolean {
    try {
      // Пробуем распарсить JSON
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }

  async generateChordProgression(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const prompt = `Generate a ${request.chords}-chord progression in ${request.key} ${request.scale} scale for ${request.genre || 'jazz'} genre. 
      Return only the chord progression as a JSON array of objects with 'chord', 'notes', and 'duration' properties. 
      Example format: [
        {"chord": "Cmaj", "notes": ["C4", "E4", "G4"], "duration": "1"}, 
        {"chord": "Gmaj", "notes": ["G4", "B4", "D5"], "duration": "1"}
      ]
      Use common chord progressions for the specified genre. Each chord should be represented by its root note and type (e.g., Cmaj, Dm, G7).
      For each chord, include an array of its notes in standard MIDI note format (e.g., "C4", "E4", "G4").
      IMPORTANT: Make sure to return a complete JSON array with all ${request.chords} chords.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a music theory expert. Generate chord progressions in the specified format. Always return complete JSON arrays.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000 // Увеличиваем количество токенов
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      const jsonContent = this.extractJsonFromMarkdown(content)

      // Проверяем, что JSON полный
      if (!this.isCompleteJson(jsonContent)) {
        throw new Error('Incomplete JSON response from OpenAI')
      }

      const chordProgression = JSON.parse(jsonContent)

      // Проверяем, что получили нужное количество аккордов
      if (chordProgression.length !== request.chords) {
        throw new Error(`Expected ${request.chords} chords, got ${chordProgression.length}`)
      }

      // Преобразуем аккорды в нужный формат
      const chords = chordProgression.map((chord: { chord: string, notes: string[], duration: string }) => ({
        name: chord.chord,
        notes: chord.notes,
        duration: chord.duration
      }))

      return {
        bpm: request.bpm,
        chords
      }
    } catch (error) {
      console.error('Error generating chord progression:', error)
      throw error
    }
  }
} 