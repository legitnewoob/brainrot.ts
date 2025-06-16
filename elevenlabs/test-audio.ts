import { createAudioFileFromText } from './tts.mjs';

const test = async () => {
  const ssmlText = `<speak>
    <prosody rate="slow">Hey Lois...</prosody>
    <break time="1s"/>
    <prosody rate="fast">Check this out!</prosody>
  </speak>`;

  try {
    const file = await createAudioFileFromText(ssmlText);
    console.log('Audio file saved as:', file);
  } catch (err) {
    console.error('Error creating audio file:', err);
  }
};

test();