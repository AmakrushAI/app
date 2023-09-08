import { useContext, useState, useEffect } from 'react';
import Image from 'next/image';
import stop from '../../assets/icons/stop.gif';
import processing from '../../assets/icons/process.gif';
import error from '../../assets/icons/error.gif';
import start from '../../assets/icons/startIcon.png';
import { Grid } from '@material-ui/core';
import styles from './styles.module.css';
import toast from 'react-hot-toast';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';

const RenderVoiceRecorder = ({ setInputMsg }) => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [apiCallStatus, setApiCallStatus] = useState('idle');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          makeComputeAPICall(event.data);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error(error);
      setApiCallStatus('error');
      toast.error(`${t('message.recorder_error')}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  const makeComputeAPICall = async (blob) => {
    try {
      setApiCallStatus('processing');
      console.log("base", blob)
      toast.success(`${t('message.recorder_wait')}`);

      // Define the API endpoint
      const apiEndpoint = process.env.NEXT_PUBLIC_BASE_URL;

      // Create a FormData object
      const formData = new FormData();

      // Append the WAV file to the FormData object
      formData.append('file', blob, 'audio.wav');
      
      // Send the WAV data to the API
      const resp = await fetch(apiEndpoint + '/aitools/asr', {
        method: 'POST',
        body: formData,
      });
  
      if (resp.ok) {
        const rsp_data = await resp.json();
          console.log('hi', rsp_data);
          if (
            rsp_data.text === 'ଦୟାକରି ପୁଣିଥରେ ଚେଷ୍ଟା କରନ୍ତୁ' ||
            rsp_data.text === ''
          )
            throw new Error('Unexpected end of JSON input');
          setInputMsg(rsp_data.text);
          sessionStorage.setItem('asrId', rsp_data.id);
      } else {
        toast.error(`${t('message.recorder_error')}`);
        console.log(resp);
      }
      setApiCallStatus('idle');
    } catch (error) {
      console.error(error);
      setApiCallStatus('error');
      toast.error(`${t('message.recorder_error')}`);
    }
  };

  return (
    <div>
      <div>
      {mediaRecorder && mediaRecorder.state === 'recording' ? (
        <div className={styles.center}>
          <Image
            src={stop}
            alt="stopIcon"
            onClick={() => {
              stopRecording();
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
              onClick={() => startRecording()}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />
          ) : (
            <Image
              src={start}
              alt="startIcon"
              onClick={() => startRecording()}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />
          )}
        </div>
      )}
      </div>
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
