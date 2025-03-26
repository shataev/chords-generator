# Chords Generator

A modern web application that generates chord progressions using OpenAI's GPT model. This tool helps musicians and composers create interesting chord sequences for their music.

## Features

- Generate chord progressions using AI
- Real-time chord playback
- Beautiful and intuitive user interface
- Support for different musical styles and moods
- Visual representation of chords
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/shataev/chords-generator.git
cd chords-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```bash
VITE_OPENAI_API_KEY=your_api_key_here
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. Open the application in your browser
2. Select your preferred musical style and mood
3. Click "Generate Chords" to create a new progression
4. Use the playback controls to listen to the generated chords
5. Generate new progressions as needed

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- OpenAI API
- Tone.js for audio playback

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT model
- The Tone.js team for the audio library
- All contributors and users of this project
