import React, {useEffect, useState} from "react";
import {addSomeReferencesInFlatDataStructure} from "../components/DataStructure";
import {TranscriptFlatRootContext} from "../components/TranscriptFlatRootContext";
import {DomManualManagementContext} from "../components/DomManualManagementContext";
import {TranscriptContext} from "../components/TranscriptContext";
import {TranscriptSpeakerContext} from "../components/TranscriptSpeakerContext";
import {TranscriptionEdition} from "../components/EditionFlat";

export function AppWithDom(domManualManagement= false) {
    const [transcription, setTranscription] = useState([]);
    const [speakers, setSpeakers] = useState([]);
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
            setTranscription(data);
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

        <TranscriptFlatRootContext.Provider value={rootUUID}>
            <DomManualManagementContext.Provider value={ domManualManagement }>
                <TranscriptContext.Provider value={{ transcription, setTranscription }}>
                     <TranscriptSpeakerContext.Provider value={{ speakers, setSpeakers }}>
                        {!isLoading &&
                            <TranscriptionEdition uuid={ rootUUID } />
                        }
                    </TranscriptSpeakerContext.Provider>
                </TranscriptContext.Provider>
            </DomManualManagementContext.Provider>
        </TranscriptFlatRootContext.Provider>
    </section>
  );
}
