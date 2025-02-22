"use client";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from "markdown-to-jsx";

export default function Home() {
  const [words, setWords] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [stopTime, setStopTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  async function runGemini() {
    const genAI = new GoogleGenerativeAI(
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = words[0]; // assigns the string (person talking) into the state //

    const parameter =
      "What you are reading now is content for an interview I am practicing. Can you grade me and evaluate my attempt, based on my vocabulary and clarity of my speaking and topics? The question I was asked was, 'Tell me about yourself?' Here is my content: ";

    const timing = `The whole talking time took ${stopTime - startTime} in msec. Always convert my time into regular seconds. Dont even show the miliseconds anymore`;

    const result = await model.generateContent(parameter + prompt + timing);
    console.log(result.response.text());
    setAiText(result.response.text());
    setIsLoading(false);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      const startMic = () => {
        recognition.start();
        setIsListening(true);
        setStartTime(new Date().getTime());
        console.log("Recognition started");
      };

      const stopMic = () => {
        recognition.abort();
        setIsListening(false);
        setStopTime(new Date().getTime());
        setIsLoading(true);
        console.log("Recognition stopped");
      };

      recognition.onresult = (event) => {
        let results = event.results;
        let transcriptsArray = [];

        for (let i = 0; i < results.length; i++) {
          let speechRecognitionResult = results[i];
          for (let j = 0; j < speechRecognitionResult.length; j++) {
            let alternative = speechRecognitionResult[j];
            transcriptsArray.push(alternative.transcript);
          }
        }

        setWords([...transcriptsArray]);
      };

      recognition.onerror = (e) => {
        console.log("Error: ", e.error);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
      };

      recognition.onsoundend = () => {
        console.log("SOUND HAS STOPPED");
      };

      recognition.onspeechend = () => {
        console.log("TALKING HAS STOPPED");
      };

      window.startMic = startMic;
      window.stopMic = stopMic;

      return () => {
        recognition.abort();
      };
    }
  }, []);

  useEffect(() => {
    console.log(words);
  }, [words]);

  useEffect(() => {
    if (!isListening && words.length > 0) {
      runGemini();
    } else {
      setWords([]);
      setAiText("");
    }
  }, [isListening]);

  return (
    <div className="text-center h-screen flex flex-col justify-center max-w-screen-lg m-auto p-8">
      <div className="mb-4">
        <p className>Question 1</p>
        <h3 className="text-lg font-bold">Tell me about yourself...</h3>
      </div>
      <div className={`h-full text-left border rounded-sm p-5 overflow-auto border-white/20 ${isListening ? "border-green-500" : ""} ${isLoading ? "border-blue-300" : ""}`}>
        {words.length > 0 && (
          <p className="max-w-[70%] bg-blue-500 px-4 py-3 w-fit rounded">
            {words.map((word, index) => (
              <span className="input-words" key={index}>{word}</span>
            ))}
          </p>
        )}
        {aiText.length > 0 && (
          <div
            id="response"
            className="mt-10 text-left max-w-[70%] ml-auto bg-blue-500 px-4 py-3 rounded prose prose-invert text-white input-words"
          >
            <Markdown>{aiText}</Markdown>
          </div>
        )}
      </div>

      <div className="flex py-3 gap-6 justify-center text-center">
        <button
          className="hover:text-white/50 w-fit"
          onClick={() => window.startMic()}
        >
          START LISTENING
        </button>
        <button
          className="hover:text-white/50 w-fit"
          onClick={() => window.stopMic()}
        >
          STOP LISTENING
        </button>
      </div>
    </div>
  );
}
