import OpenAI from 'openai';
import { config } from '../config';
import logger from '../utils/logger';
import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      logger.info('Downloading audio from URL', { audioUrl });

      // Download audio file
      const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
      });

      const audioBuffer = Buffer.from(response.data);

      // Create a file-like object for OpenAI API
      const audioFile = new File([audioBuffer], 'audio.ogg', {
        type: 'audio/ogg',
      });

      logger.info('Transcribing audio with Whisper', {
        size: audioBuffer.length,
      });

      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'pt', // Portuguese
        response_format: 'text',
      });

      logger.info('Audio transcribed successfully', {
        transcription: transcription.substring(0, 100),
      });

      return transcription;
    } catch (error) {
      logger.error('Error transcribing audio:', error);
      throw error;
    }
  }

  async transcribeAudioBuffer(audioBuffer: Buffer, format = 'ogg'): Promise<string> {
    try {
      logger.info('Transcribing audio buffer with Whisper', {
        size: audioBuffer.length,
        format,
      });

      const audioFile = new File([audioBuffer], `audio.${format}`, {
        type: `audio/${format}`,
      });

      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'pt',
        response_format: 'text',
      });

      logger.info('Audio buffer transcribed successfully');

      return transcription;
    } catch (error) {
      logger.error('Error transcribing audio buffer:', error);
      throw error;
    }
  }
}

export default new OpenAIService();
