"use client"
import { TranscriptionEdition } from '@/components/Edition.js'
import React, {useEffect, useState} from 'react';

export default function App() {
    const [ transcription, setTranscription] = useState([]);

    useEffect(() => {
        fetch('/data/transcript-example.json')
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            console.log(data);
            setTranscription(data);
          });
      }, []);

    return (
    <section className="flex">
         <TranscriptionEdition transcription={transcription} />
    </section>
  );
}

