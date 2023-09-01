import { useContext, useState } from 'react';
import Image from 'next/image';
import stop from '../../assets/icons/stop.gif';
import processing from '../../assets/icons/process.gif';
import error from '../../assets/icons/error.gif';
import start from '../../assets/icons/startIcon.png';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder';
import { Grid } from '@material-ui/core';
import styles from './styles.module.css';
import toast from 'react-hot-toast';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';

const RenderVoiceRecorder = ({ setInputMsg }) => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const [recordAudio, setRecordAudio] = useState(RecordState.NONE);
  const [apiCallStatus, setApiCallStatus] = useState('idle');

  const handleStopRecording = () => {
    setRecordAudio(RecordState.STOP);
  };

  const handleStartRecording = () => {
    setRecordAudio(RecordState.START);
  };

  const blobToBase64 = async (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(blob);
    });
  };

  const onStopRecording = async (data) => {
    if (recordAudio === RecordState.START) {
      return;
    }
    try {
      setApiCallStatus('processing');
      const base64Data = await blobToBase64(data.blob);
      makeComputeAPICall(base64Data);
    } catch (error) {
      console.error('Error converting Blob to Base64:', error);
      setApiCallStatus('error');
    }
  };

  const makeComputeAPICall = async (base) => {
    try {
      console.log("base", base);
      const prefix = 'data:audio/wav;base64,';
      const actualBase64 = base.substring(prefix.length);
      const audioData = Uint8Array.from(atob(actualBase64), (c) =>
        c.charCodeAt(0)
      );

      toast.success(`${t('message.recorder_wait')}`);

      // Define the API endpoint
      const apiEndpoint = process.env.NEXT_PUBLIC_BASE_URL;

      // Create a FormData object
      const formData = new FormData();

      // Append the WAV file to the FormData object
      // Here, we're creating a Blob from the decoded data and appending it to the FormData
      const blob = new Blob([audioData], { type: 'audio/wav' });
      // console.log("This is the file", file);
      formData.append('file', blob, 'audio.wav');

      // Send the WAV data to the API
      const resp = await fetch(apiEndpoint + '/aitools/asr', {
        method: 'POST',
        body: formData,
      });

      if (resp.ok) {
        const rsp_data = await resp.json();
        console.log('hi', rsp_data);
        if (rsp_data.text === '')
          throw new Error('Unexpected end of JSON input');
        setInputMsg(rsp_data.text.trim());
        sessionStorage.setItem('asrId', rsp_data.id);
      } else {
        toast.error('Something went wrong. Try again later.');
        console.log(resp);
      }
      setApiCallStatus('idle');
    } catch (error) {
      console.error(error);
      setApiCallStatus('error');
      if (error.message === 'Unexpected end of JSON input') {
        toast.error(`${t('label.no_audio')}`);
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div>
      {recordAudio === RecordState.START ? (
        <div className={styles.center}>
          <Image
            src={stop}
            alt="stopIcon"
            onClick={() => {
              handleStopRecording();
            }}
            style={{ cursor: 'pointer' }}
            layout="responsive"
          />
        </div>
      ) : (
        <div className={styles.center}>
          {apiCallStatus === 'processing' ? (
            <Image
              src={processing}
              alt="processingIcon"
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />
          ) : apiCallStatus === 'error' ? (
            <Image
              src={error}
              alt="errorIcon"
              onClick={() => handleStartRecording()}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />
          ) : (
            <Image
              src={start}
              alt="startIcon"
              onClick={() => handleStartRecording()}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />
          )}
        </div>
      )}
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <div style={{ display: 'none' }}>
          <AudioReactRecorder
            state={recordAudio}
            onStop={onStopRecording}
            style={{ display: 'none' }}
          />
        </div>
      </Grid>
    </div>
  );
};

export default RenderVoiceRecorder;
