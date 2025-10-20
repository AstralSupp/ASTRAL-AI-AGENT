import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';
import { AudioProcessingResult, ElevenLabsVoiceSettings } from '../types';

class ElevenLabsService {
  private apiKey: string;
  private voiceId: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = config.elevenlabs.apiKey;
    this.voiceId = config.elevenlabs.voiceId;
  }

  async textToSpeech(
    text: string,
    voiceSettings?: ElevenLabsVoiceSettings
  ): Promise<AudioProcessingResult> {
    try {
      logger.info('Converting text to speech with ElevenLabs', {
        textLength: text.length,
        voiceId: this.voiceId,
      });

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2', // Supports Portuguese
          voice_settings: voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
        }
      );

      const audioBuffer = Buffer.from(response.data);

      logger.info('Text-to-speech conversion successful', {
        audioSize: audioBuffer.length,
      });

      // Estimate duration (rough approximation: ~150 words per minute)
      const words = text.split(/\s+/).length;
      const estimatedDurationMs = (words / 150) * 60 * 1000;

      return {
        audio_buffer: audioBuffer,
        duration_ms: estimatedDurationMs,
        format: 'mp3',
      };
    } catch (error) {
      logger.error('Error in text-to-speech conversion:', error);
      throw error;
    }
  }

  async getVoices() {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return response.data.voices;
    } catch (error) {
      logger.error('Error fetching voices:', error);
      throw error;
    }
  }

  async getVoiceSettings(voiceId?: string) {
    try {
      const id = voiceId || this.voiceId;
      const response = await axios.get(`${this.baseUrl}/voices/${id}/settings`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching voice settings:', error);
      throw error;
    }
  }
}

export default new ElevenLabsService();
