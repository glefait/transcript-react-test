"use client"
import { TranscriptionEdition } from '@/components/EditionFlat.js'
import React, {useEffect, useState} from 'react';
import { TranscriptContext } from '@/components/TranscriptContext';
import { DomManualManagementContext } from '@/components/DomManualManagementContext';
import {addSomeReferencesInFlatDataStructure} from "@/components/DataStructure";

export function AppWithDom(domManualManagement= false) {
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
        <DomManualManagementContext.Provider value={ domManualManagement }>
            <TranscriptContext.Provider value={{ transcription, setTranscription }}>
                {!isLoading &&
                    <TranscriptionEdition uuid={ rootUUID } />
                }
            </TranscriptContext.Provider>
        </DomManualManagementContext.Provider>
    </section>
  );
}

export default function App() {
    return AppWithDom(false);
}
