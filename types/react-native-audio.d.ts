declare module 'react-native-audio' {
  interface AudioRecorderOptions {
    SampleRate?: number;
    Channels?: number;
    AudioQuality?: 'Low' | 'Medium' | 'High';
    AudioEncoding?: 'aac' | 'aac_eld' | 'lpcm';
    MeteringEnabled?: boolean;
    IncludeBase64?: boolean;
  }

  interface AudioProgress {
    currentTime: number;
    currentMetering: number;
  }

  export const AudioRecorder: {
    prepareRecordingAtPath: (path: string, options: AudioRecorderOptions) => Promise<void>;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    onProgress: ((data: AudioProgress) => void) | null;
    onFinished: ((data: { audioFileURL: string }) => void) | null;
  };

  export const AudioUtils: {
    DocumentDirectoryPath: string;
    MainBundlePath: string;
    CachesDirectoryPath: string;
    LibraryDirectoryPath: string;
  };
}