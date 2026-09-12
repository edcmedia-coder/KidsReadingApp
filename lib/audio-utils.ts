/**
 * Audio helper to convert raw 16-bit PCM (from Gemini TTS model gemini-3.1-flash-tts-preview)
 * into a valid standard WAV audio buffer and data URL.
 */

export function pcmToWavBuffer(pcmBuffer: Buffer, sampleRate: number = 24000, channels: number = 1): Buffer {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const subChunk2Size = pcmBuffer.length;
  const chunkSize = 36 + subChunk2Size;

  const wavHeader = Buffer.alloc(44);

  // RIFF chunk descriptor
  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(chunkSize, 4);
  wavHeader.write("WAVE", 8);

  // fmt sub-chunk
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavHeader.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  wavHeader.writeUInt16LE(channels, 22); // NumChannels (1 = Mono)
  wavHeader.writeUInt32LE(sampleRate, 24); // SampleRate (24000)
  wavHeader.writeUInt32LE(byteRate, 28);   // ByteRate
  wavHeader.writeUInt16LE(blockAlign, 32); // BlockAlign (2 bytes)
  wavHeader.writeUInt16LE(16, 34);         // BitsPerSample (16 bits)

  // data sub-chunk
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(subChunk2Size, 40);

  return Buffer.concat([wavHeader, pcmBuffer]);
}

export function pcmBase64ToWavDataUrl(pcmBase64: string, sampleRate: number = 24000): string {
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const wavBuffer = pcmToWavBuffer(pcmBuffer, sampleRate, 1);
  return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
}
