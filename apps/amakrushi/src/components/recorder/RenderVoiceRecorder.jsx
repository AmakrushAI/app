import { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Stop from '../../assets/icons/stop.gif';
import Start from '../../assets/icons/startIcon.svg';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder';
import { Grid } from '@material-ui/core';
import styles from './styles.module.css';
import toast from 'react-hot-toast';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';

const RenderVoiceRecorder = ({ setInputMsg }) => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const [recordAudio, setRecordAudio] = useState('');

  const handleStopRecording = () => {
    setRecordAudio(RecordState.STOP);
  };

  const handleStartRecording = () => {
    setRecordAudio(RecordState.START);
  };

  const blobToBase64 = (blob) => {
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
    if(recordAudio === RecordState.START){
      return;
    }
    try {
      const base64Data = await blobToBase64(data.blob);
      makeComputeAPICall(base64Data);
    } catch (error) {
      console.error('Error converting Blob to Base64:', error);
    }
  };

  const makeComputeAPICall = async (base) => {
    try {
      console.log("base", base);
      const prefix = "data:audio/wav;base64,";
      const actualBase64 = base.substring(prefix.length);
      const audioData = Uint8Array.from(atob(actualBase64), c => c.charCodeAt(0));
      
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
      
      context?.setSttReq(true);
      // Send the WAV data to the API
      const resp = await fetch(apiEndpoint+'/aitools/asr', {
        method: 'POST',
        body: formData
      });
  
      context?.setSttReq(false);
      if (resp.ok) {
        const rsp_data = await resp.json();
          console.log('hi', rsp_data);
          setInputMsg(rsp_data.text);
          sessionStorage.setItem('asrId', rsp_data.id);
      } else {
        toast.error("Something went wrong. Try again later.");
        console.log(resp);
      }
    } catch (error) {
      context?.setSttReq(false);
      console.error(error);
      if(error.message === "Unexpected end of JSON input"){
        toast.error(`${t('label.no_audio')}`);
      }else{
        toast.error(error.message);
      }
    }
  };

  return (
    <div>
      <div>
        {recordAudio === 'start' ? (
          <div className={styles.center}>
            <Image
              src={Stop}
              alt="stopIcon"
              onClick={() => handleStopRecording()}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />{' '}
          </div>
        ) : (
          <div className={styles.center}>
            <Image
              src={Start}
              alt="startIcon"
              onClick={() => {
                handleStartRecording();
              }}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />{' '}
          </div>
        )}
      </div>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <div style={{ display: 'none' }}>
          <AudioReactRecorder
            state={recordAudio}
            onStop={onStopRecording}
            style={{ display: 'none' }}
          />
        </div>
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <Grid container spacing={1}>
          <Grid
            item
            xs={4}
            sm={12}
            md={2}
            lg={2}
            xl={2}
            className={styles.flexEndStyle}>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default RenderVoiceRecorder;
