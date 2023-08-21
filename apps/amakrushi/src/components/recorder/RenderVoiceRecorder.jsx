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
  const [gender, setGender] = useState('female');
  const [recordAudio, setRecordAudio] = useState('');
  const [base, setBase] = useState('');
  const [data, setData] = useState('');
  const [outputBase64, setOutputBase64] = useState('');
  const [suggestEditValues, setSuggestEditValues] = useState({
    asr: '',
    translation: '',
  });
  const [audio, setAudio] = useState('');
  const [output, setOutput] = useState({
    asr: '',
    translation: '',
  });
  const [filter, setFilter] = useState({
    src: 'hi',
    tgt: 'en',
    asr: '',
    translation: '',
    tts: '',
  });

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

  useEffect(() => {
    if (data && base) {
      handleCompute();
      setData();
      setBase();
    }
  }, [data, handleCompute, base]);

  const onStopRecording = async (data) => {
    setData(data.url);
    try {
      const base64Data = await blobToBase64(data.blob);
      setBase(base64Data);
      //  setTimeout(()=>{
      //   handleCompute()
      //  },50)
      // setOutput({
      //   asr: '',
      //   translation: '',
      // });
    } catch (error) {
      console.error('Error converting Blob to Base64:', error);
    }
  };

  const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  const makeComputeAPICall = async (type) => {
    try {
      // console.log("base", base)
      const prefix = "data:audio/wav;base64,";
      const actualBase64 = base.substring(prefix.length);
      const audioData = Uint8Array.from(atob(actualBase64), c => c.charCodeAt(0));
      
      toast.success(`${t('message.recorder_wait')}`);
      setAudio(null);
      
      // Define the API endpoint
      const apiEndpoint = process.env.NEXT_PUBLIC_ASR_API;
      
      // Create a FormData object
      const formData = new FormData();
      
      // Append the WAV file to the FormData object
      // Here, we're creating a Blob from the decoded data and appending it to the FormData
      const blob = new Blob([audioData], { type: 'audio/wav' });
      // console.log("This is the file", file);
      formData.append('file', blob, 'audio.wav');
      
      context?.setSttReq(true);
      // Send the WAV data to the API
      const resp = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      });
  
      context?.setSttReq(false);
      if (resp.ok) {
        const rsp_data = await resp.text();
        if (rsp_data !== '') {
          console.log('hi', rsp_data);
          setInputMsg(rsp_data);
        }
      } else {
        toast.error("Something went wrong. Try again later.");
        console.log(resp);
      }
    } catch (error) {
      context?.setSttReq(false);
      console.error(error);
      toast.error(error.message);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCompute = () => {
    makeComputeAPICall('voice');
  };
  console.log('ghji', { output });
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
        {/* <div className={styles.center}>
          <Typography style={{ height: '12px' }} variant="caption">
            {recordAudio === 'start' ? 'Recording...' : ''}
          </Typography>{' '}
        </div> */}
        <div style={{ display: 'none' }}>
          <AudioReactRecorder
            state={recordAudio}
            onStop={onStopRecording}
            style={{ display: 'none' }}
          />
        </div>
        {/* <div className={styles.centerAudio} style={{ height: '60px' }}>
          {data ? (
            <audio
              src={data}
              style={{ minWidth: '100%' }}
              controls
              id="sample"></audio>
          ) : (
            <></>
          )}
        </div> */}
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <Grid container spacing={1}>
          {/* <Grid item xs={8} sm={12} md={10} lg={10} xl={10}>
            <Typography variant={'caption'}>Max duration: 1 min</Typography>
          </Grid> */}
          <Grid
            item
            xs={4}
            sm={12}
            md={2}
            lg={2}
            xl={2}
            className={styles.flexEndStyle}>
            {/* <Button
              style={{}}
              color="primary"
              variant="contained"
              size={'small'}
              disabled={data ? false : true}
              onClick={() => handleCompute()}>
              Convert
            </Button> */}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default RenderVoiceRecorder;
