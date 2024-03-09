import { useState, useEffect } from 'react';
import Image from 'next/image';
import stop from '../../assets/icons/stop.gif';
import processing from '../../assets/icons/process.gif';
import error from '../../assets/icons/error.gif';
import start from '../../assets/icons/startIcon.png';
import styles from './styles.module.css';
import toast from 'react-hot-toast';
import { useLocalization } from '../../hooks';
import { useFlags } from 'flagsmith/react';

const RenderVoiceRecorder = ({ setInputMsg, tapToSpeak, includeDiv = false }) => {
  const t = useLocalization();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [apiCallStatus, setApiCallStatus] = useState('idle');
  const [userClickedError, setUserClickedError] = useState(false);

  const flags = useFlags(['delay_between_dialog']);
  let VOICE_MIN_DECIBELS = -35;
  let DELAY_BETWEEN_DIALOGS = flags?.delay_between_dialog?.value || 2500;
  let DIALOG_MAX_LENGTH = 60 * 1000;
  let IS_RECORDING = false;

  const startRecording = async () => {
    IS_RECORDING = true;
    record();
  };

  const stopRecording = () => {
    IS_RECORDING = false;
    if (mediaRecorder !== null) {
      mediaRecorder.stop();
      setMediaRecorder(null); // Set mediaRecorder state to null after stopping
    }
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

      // const audioElement = new Audio();

      // const blobUrl = URL.createObjectURL(blob);
      // audioElement.src = blobUrl;
      // console.log(audioElement)
      // audioElement.play();

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
        if (rsp_data.text === '')
          throw new Error('Unexpected end of JSON input');
        setInputMsg(rsp_data.text);
        sessionStorage.setItem('asrId', rsp_data.id);
      } else {
        toast.error(`${t('message.recorder_error')}`);
        console.log(resp);
        // Set userClickedError to true when an error occurs
        setUserClickedError(false);

        // Automatically change back to startIcon after 3 seconds
        setTimeout(() => {
          // Check if the user has not clicked the error icon again
          if (!userClickedError) {
            setApiCallStatus('idle');
          }
        }, 2500);
      }
      setApiCallStatus('idle');
    } catch (error) {
      console.error(error);
      setApiCallStatus('error');
      toast.error(`${t('message.recorder_error')}`);
      // Set userClickedError to true when an error occurs
      setUserClickedError(false);

      // Automatically change back to startIcon after 3 seconds
      setTimeout(() => {
        // Check if the user has not clicked the error icon again
        if (!userClickedError) {
          setApiCallStatus('idle');
        }
      }, 2500);
    }
  };

  return (
    <div>
      <div>
        {mediaRecorder && mediaRecorder.state === 'recording' ? (
          <div className={styles.center}>
            {includeDiv ? <div className={styles.imgContainer}>
              <Image
                priority
                src={stop}
                alt="stopIcon"
                onClick={() => {
                  stopRecording();
                }}
                style={{ cursor: 'pointer' }}
                layout="responsive"
              />
            </div>
              :
              <Image
                priority
                src={stop}
                alt="stopIcon"
                onClick={() => {
                  stopRecording();
                }}
                style={{ cursor: 'pointer' }}
                layout="responsive"
              />
            }
          </div>
        ) : (
          <div className={styles.center}>
            {apiCallStatus === 'processing' ? (
              includeDiv ? <div className={styles.imgContainer}>
                <Image
                  priority
                  src={processing}
                  alt="processingIcon"
                  style={{ cursor: 'pointer' }}
                  layout="responsive"
                />
              </div> :
                <Image
                  priority
                  src={processing}
                  alt="processingIcon"
                  style={{ cursor: 'pointer' }}
                  layout="responsive"
                />
            ) : apiCallStatus === 'error' ? (
              includeDiv ? <div className={styles.imgContainer}>
                <Image
                  priority
                  src={error}
                  alt="errorIcon"
                  onClick={() => {
                    setUserClickedError(true);
                    startRecording();
                  }}
                  style={{ cursor: 'pointer' }}
                  layout="responsive"
                />
              </div>
                : <Image
                  priority
                  src={error}
                  alt="errorIcon"
                  onClick={() => {
                    setUserClickedError(true);
                    startRecording();
                  }}
                  style={{ cursor: 'pointer' }}
                  layout="responsive"
                />
            ) : (
              <>
                {includeDiv ? <div className={styles.imgContainer}>
                  <Image
                    priority
                    src={start}
                    alt="startIcon"
                    onClick={() => {
                      setUserClickedError(true);
                      startRecording();
                    }}
                    style={{ cursor: 'pointer' }}
                    height={'10px !important'}
                    width={'10px !important'}
                    layout="responsive"
                  />
                </div>
                  : <Image
                    priority
                    src={start}
                    alt="startIcon"
                    onClick={() => {
                      setUserClickedError(true);
                      startRecording();
                    }}
                    style={{ cursor: 'pointer' }}
                    height={'10px !important'}
                    width={'10px !important'}
                    layout="responsive"
                  />
                }
                {tapToSpeak ? (
                  <p style={{ color: 'black', fontSize: '12px', marginTop: '4px' }}>
                    {t('label.tap_to_speak')}
                  </p>
                ) : (
                  <></>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RenderVoiceRecorder;