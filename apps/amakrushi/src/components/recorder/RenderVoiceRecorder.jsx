import { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Stop from '../../assets/icons/stop.gif';
import Start from '../../assets/icons/startIcon.svg';
import { Grid } from '@material-ui/core';
import styles from './styles.module.css';
import toast from 'react-hot-toast';
import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';
import { useAudioRecorder } from 'react-audio-voice-recorder';

const RenderVoiceRecorder = ({ setInputMsg }) => {
  const context = useContext(AppContext);
  const t = useLocalization();
  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder,
  } = useAudioRecorder();

  useEffect(() => {
    if(!recordingBlob) return;
    
    makeComputeAPICall(recordingBlob);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingBlob])
  

  const makeComputeAPICall = async (blob) => {
    try {
      console.log('blob', blob);

      toast.success(`${t('message.recorder_wait')}`);

      // Define the API endpoint
      const apiEndpoint = process.env.NEXT_PUBLIC_BASE_URL;

      // Create a FormData object
      const formData = new FormData();

      // Append the WAV file to the FormData object
      formData.append('file', blob, 'audio.wav');

      context?.setSttReq(true);
      // Send the WAV data to the API
      const resp = await fetch(apiEndpoint + '/aitools/asr', {
        method: 'POST',
        body: formData,
      });

      context?.setSttReq(false);
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
        toast.error('Something went wrong. Try again later.');
        console.log(resp);
      }
    } catch (error) {
      context?.setSttReq(false);
      console.error(error);
      if (error.message === 'Unexpected end of JSON input') {
        toast.error(`${t('label.no_audio')}`);
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div>
      <div>
        {isRecording ? (
          <div className={styles.center}>
            <Image
              src={Stop}
              alt="stopIcon"
              onClick={() => {
                stopRecording();
              }}
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
                startRecording();
              }}
              style={{ cursor: 'pointer' }}
              layout="responsive"
            />{' '}
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
            className={styles.flexEndStyle}></Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default RenderVoiceRecorder;
