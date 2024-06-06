"use client"
import { TranscriptionEdition } from '@/components/Edition.js'
import React, {useEffect, useState} from 'react';
import { TranscriptContext } from '@/components/TranscriptContext';
import {TranscriptSpeakerContext} from "@/components/TranscriptSpeakerContext";

export default function App() {
    const [transcription, setTranscription] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/data/transcript-example.json')
          .then((res) => { return res.json(); })
          .then((data) => {
                console.log(data);
                setTranscription(data);
                // setIsLoading(false);
          })
          .then(() => fetch('/data/speakers.json'))
          .then((res) => { return res.json(); })
          .then((data) => {
              console.log(data);
              setSpeakers(data);
              setIsLoading(false);
          })
      }, []);

    return (
    <section className="flex">
        <TranscriptContext.Provider value={transcription}>
            <TranscriptSpeakerContext.Provider value={speakers}>
                {!isLoading &&
                    <TranscriptionEdition />
                }
            </TranscriptSpeakerContext.Provider>
        </TranscriptContext.Provider>
    </section>
  );
}

