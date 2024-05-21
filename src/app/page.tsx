"use client"
import { TranscriptionEdition } from '@/components/Edition.js'
import React, {useEffect, useState} from 'react';
import { TranscriptContext } from '@/components/TranscriptContext';

export default function App() {
    const [transcription, setTranscription] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/data/transcript-example.json')
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            console.log(data);
            setIsLoading(false);
            setTranscription(data);
          });
      }, []);

    return (
    <section className="flex">
        <TranscriptContext.Provider value={transcription}>
            {!isLoading &&
                <TranscriptionEdition />
            }
        </TranscriptContext.Provider>
    </section>
  );
}

