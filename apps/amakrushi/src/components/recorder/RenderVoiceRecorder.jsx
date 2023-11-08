import { useContext, useState, useEffect } from 'react';
import Image from 'next/image';
import stop from '../../assets/icons/stop.gif';
import processing from '../../assets/icons/process.gif';
import error from '../../assets/icons/error.gif';
import start from '../../assets/icons/startIcon.png';
import { Grid } from '@material-ui/core';
import styles from './styles.module.css';
import toast from 'react-hot-toast';
// import { AppContext } from '../../context';
import { useLocalization } from '../../hooks';

const RenderVoiceRecorder = ({ setInputMsg }) => {
  // const context = useContext(AppContext);
  const t = useLocalization();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [apiCallStatus, setApiCallStatus] = useState('idle');
  let VOICE_MIN_DECIBELS = -35;
  let DELAY_BETWEEN_DIALOGS = 1500;
  let DIALOG_MAX_LENGTH = 60 * 1000;
  let IS_RECORDING = false;

  const startRecording = async () => {
    IS_RECORDING = true;
    record();
  };

  const stopRecording = () => {
    IS_RECORDING = false;
    if (mediaRecorder !== null) mediaRecorder.stop();
  };

  //record:
  function record() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      //start recording:
      const recorder = new MediaRecorder(stream);
      recorder.start();
      setMediaRecorder(recorder);

      //save audio chunks:
      const audioChunks = [];
      recorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      //analisys:
      const audioContext = new AudioContext();
      const audioStreamSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.minDecibels = VOICE_MIN_DECIBELS;
      audioStreamSource.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const domainData = new Uint8Array(bufferLength);

      //loop:
      let time = new Date();
      let startTime,
        lastDetectedTime = time.getTime();
      let anySoundDetected = false;
      const detectSound = () => {
        //recording stoped by user:
        if (!IS_RECORDING) return;

        time = new Date();
        let currentTime = time.getTime();

        //time out:
        if (currentTime > startTime + DIALOG_MAX_LENGTH) {
          recorder.stop();
          return;
        }

        //a dialog detected:
        if (
          anySoundDetected === true &&
          currentTime > lastDetectedTime + DELAY_BETWEEN_DIALOGS
        ) {
          recorder.stop();
          return;
        }

        //check for detection:
        analyser.getByteFrequencyData(domainData);
        for (let i = 0; i < bufferLength; i++)
          if (domainData[i] > 0) {
            anySoundDetected = true;
            time = new Date();
            lastDetectedTime = time.getTime();
          }

        //continue the loop:
        window.requestAnimationFrame(detectSound);
      };
      window.requestAnimationFrame(detectSound);

      //stop event:
      recorder.addEventListener('stop', () => {
        //stop all the tracks:
        stream.getTracks().forEach((track) => track.stop());
        if (!anySoundDetected) return;

        //send to server:
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        makeComputeAPICall(audioBlob);
      });
    });
  }

  const makeComputeAPICall = async (blob) => {
    try {
      setApiCallStatus('processing');
      console.log('base', blob);
      toast.success(`${t('message.recorder_wait')}`);

      // Define the API endpoint
      const apiEndpoint = process.env.NEXT_PUBLIC_BASE_URL;

      // Create a FormData object
      const formData = new FormData();

      // Append the WAV file to the FormData object
      formData.append('file', blob, 'audio.wav');
      formData.append('phoneNumber', localStorage.getItem('phoneNumber'));

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
        {mediaRecorder && mediaRecorder.state === "recording" ? (
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
            className={styles.flexEndStyle}></Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default RenderVoiceRecorder;
