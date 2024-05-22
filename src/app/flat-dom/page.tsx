"use client"
import { TranscriptionEdition } from '@/components/EditionFlatDom.js'
import React, {useEffect, useState} from 'react';
import { TranscriptContext } from '@/components/TranscriptContext';
import { addSomeReferencesInFlatDataStructure } from '@/components/DataStructure';

export default function App() {
    const [transcription, setTranscription] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rootUUID, setRootUUID] = useState("");

    useEffect(() => {
        fetch('/data/transcript-example-flat.json')
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            console.log(data);
            data = addSomeReferencesInFlatDataStructure(data);
            for (const key of Object.keys(data)) {
                if (data[key].kind == "transcription") {
                    setRootUUID(key);
                }
            }
            setIsLoading(false);
            setTranscription(data);
          });
      }, []);

    return (
    <section className="flex">
        <TranscriptContext.Provider value={{ transcription, setTranscription }}>
            {!isLoading &&
                <TranscriptionEdition uuid={ rootUUID } />
            }
        </TranscriptContext.Provider>
    </section>
  );
}

