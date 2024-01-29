import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import crossIcon from '../../assets/icons/crossIcon.svg';
import styles from './index.module.css';
import Image from 'next/image';
import { useLocalization } from '../../hooks';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AppContext } from '../../context';

const DialerPopup: React.FC<any> = ({ setShowDialerPopup }) => {
  const t = useLocalization();
  const [reviewSubmitted, reviewSubmitError] = useMemo(
    () => [t('message.review_submitted'), t('error.fail_to_submit_review')],
    [t]
  );
  const context = useContext(AppContext);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
  const [transliterationConfig, setTransliterationConfig] = useState({
    auth: '',
    serviceId: '',
  });
  const [review, setReview] = useState('');
  const inputRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const submitReview = useCallback(
    (r: string) => {
      axios
        .post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/feedback/${context?.currentQuery}`,
          {
            feedback: r,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem('auth')}`,
            },
          }
        )
        .then((response) => {
          toast.success(reviewSubmitted);
          context?.setCurrentQuery("")
          setShowDialerPopup(false);
        })
        .catch((error) => {
          toast.error(reviewSubmitError);
          //@ts-ignore
          logEvent(analytics, 'console_error', {
            error_message: error.message,
          });
        });
    },
    [reviewSubmitError, reviewSubmitted, setShowDialerPopup]
  );

  const suggestionHandler = (e: any, index: number) => {
    setActiveSuggestion(index);
  };

  const suggestionClickHandler = useCallback(
    (e: any) => {
      const words = review.split(' ');

      // Find the word at the cursor position
      //@ts-ignore
      const cursorPosition = inputRef.current.selectionStart;
      let currentIndex = 0;
      let selectedWord = '';

      // console.log(cursorPosition, inputMsg.length);

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (
          currentIndex <= cursorPosition &&
          cursorPosition <= currentIndex + word.length
        ) {
          selectedWord = word;
          break;
        }
        currentIndex += word.length + 1; // +1 to account for the space between words
      }

      // Replace the selected word with the transliterated suggestion
      if (selectedWord !== '') {
        const newInputMsg = review.replace(
          selectedWord,
          cursorPosition === review.length ? e + ' ' : e
        );

        setSuggestions([]);
        setSuggestionClicked(true);
        setActiveSuggestion(0);

        setReview(newInputMsg);

        //@ts-ignore
        inputRef.current && inputRef.current.focus();
      }
    },
    [review]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (suggestions.length > 0) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveSuggestion((prevActiveSuggestion) =>
            prevActiveSuggestion > 0
              ? prevActiveSuggestion - 1
              : prevActiveSuggestion
          );
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveSuggestion((prevActiveSuggestion) =>
            prevActiveSuggestion < suggestions.length - 1
              ? prevActiveSuggestion + 1
              : prevActiveSuggestion
          );
        } else if (e.key === ' ') {
          e.preventDefault();
          if (activeSuggestion >= 0 && activeSuggestion < suggestions?.length) {
            suggestionClickHandler(suggestions[activeSuggestion]);
            setSuggestions([]);
          } else {
            setReview((prevInputMsg) => prevInputMsg + ' ');
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          submitReview(review);
        }
      }
    },
    [
      activeSuggestion,
      review,
      submitReview,
      suggestionClickHandler,
      suggestions,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (review && review.length > 0 && !(localStorage.getItem('locale') === 'en')) {
      if (suggestionClicked) {
        setSuggestionClicked(false);
        return;
      }
      if (!sessionStorage.getItem('computeFetched')) {
        sessionStorage.setItem('computeFetched', 'true');
        fetch(
          'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ulcaApiKey: '13900b794f-49de-4b42-8ee5-6e0289fe8833',
              userID: '737078729ae04552822e4e7e3093575c',
            },
            body: JSON.stringify({
              pipelineTasks: [
                {
                  taskType: 'transliteration',
                  config: {
                    language: {
                      sourceLanguage: 'en',
                      targetLanguage: 'or',
                    },
                  },
                },
              ],
              pipelineRequestConfig: {
                pipelineId: '64392f96daac500b55c543cd',
              },
            }),
          }
        )
          .then((response) => response.json())
          .then((data) => {
            setTransliterationConfig({
              serviceId:
                data?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId,
              auth: data?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value,
            });
          })
          .catch((error) => {
            console.error('Error fetching models pipeline:', error);
          });
      }

      setSuggestions([]);

      const words = review.split(' ');
      const wordUnderCursor = words.find(
        (word, index) =>
          cursorPosition >= review.indexOf(word) &&
          cursorPosition <= review.indexOf(word) + word.length
      );

      if (!wordUnderCursor) return;
      fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
        method: 'POST',
        headers: {
          Accept: ' */*',
          'User-Agent': ' Thunder Client (https://www.thunderclient.com)',
          Authorization:
            transliterationConfig.auth ||
            'L6zgUQ59QzincUafIoc1pZ8m54-UfxRdDKTNb0bVUDjm6z6HbXi6Nv7zxIJ-UyQN',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipelineTasks: [
            {
              taskType: 'transliteration',
              config: {
                language: {
                  sourceLanguage: 'en',
                  targetLanguage: 'or',
                },
                serviceId:
                  transliterationConfig.serviceId ||
                  'ai4bharat/indicxlit--cpu-fsv2',
                isSentence: false,
                numSuggestions: 3,
              },
            },
          ],
          inputData: {
            input: [
              {
                source: wordUnderCursor,
              },
            ],
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setSuggestions(data?.pipelineResponse?.[0]?.output?.[0]?.target);
        })
        .catch((error) => {
          console.error('Error fetching transliteration:', error);
        });
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review, cursorPosition]);

  const handleInputChange = (e: any) => {
    const inputValue = e.target.value;
    setReview(inputValue);
    // Store the cursor position
    const cursorPosition = e.target.selectionStart;
    setCursorPosition(cursorPosition);
    // setShowExampleMessages(inputValue.length === 0);
    // Adjust textarea height dynamically based on content
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.style.height = 'auto';
      //@ts-ignore
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={styles.main}>
      <div
        className={styles.crossIconBox}
        onClick={() => { context?.setCurrentQuery(""); setShowDialerPopup(false) }}>
        <Image src={crossIcon} alt="crossIcon" layout="responsive" />
      </div>
      <p>{t('label.comment')}</p>
      <div className={styles.dialerBox}>
        <div className={styles.suggestions}>
          {suggestions.map((elem, index) => {
            return (
              <div
                key={index}
                onClick={() => suggestionClickHandler(elem)}
                className={`${styles.suggestion} ${activeSuggestion === index ? styles.active : ''
                  }`}
                onMouseEnter={(e) => suggestionHandler(e, index)}>
                {elem}
              </div>
            );
          })}
        </div>
        <textarea
          ref={inputRef}
          value={review}
          onChange={handleInputChange}
          name="experience-feedback"
          id="experience-feedback"
          cols={35}
          rows={5}
          placeholder={t('message.comment_description')}></textarea>

        <button onClick={() => submitReview(review)}>
          {t('label.submit_feedback')}
        </button>
      </div>
    </div>
  );
};

export default DialerPopup;
