"use client";
import '../styles/modal.css';
import {useContext, useEffect, useState} from "react";
import {TranscriptContext} from "@/components/TranscriptContext";
import {TranscriptSpeakerContext} from "@/components/TranscriptSpeakerContext";




export const ModalSpeaker = ({showModal, handleClick, blockUUID, replacementCandidateUUID, setReplacementCandidateUUID}) => {
    const {transcription, setTranscription} = useContext(TranscriptContext);
    const {speakers, setSpeakers} = useContext(TranscriptSpeakerContext);
    const [replaceAll, setReplaceAll] = useState(false);

    const showHideClassName = showModal ? "modal display-block" : "modal display-none";

    if (typeof blockUUID === "undefined") {
        return <></>;
    }
    const block = transcription[blockUUID];
    const username = speakers[block['user']].name;
    const current_uuid = block['user'];

    const replacementCandidateName = (replacementCandidateUUID == "") ? "" : speakers[replacementCandidateUUID].name;

    function form_process_replacement(formData) {
        if (replacementCandidateUUID == "") {
            //noop
            return;
        }
        if (formData.get("submit") == "submit") {
            const replace_all = formData.has("replace_all");
            console.log(replacementCandidateUUID + " -|process_replacement|-> " + current_uuid + " (" + replace_all + "). State replace_all=" + replaceAll);
            // update transaction
            let updates = {};
            let blockUuidsToUpdate = new Set([blockUUID]);
            if (replace_all) {
                for (const [blockUUID, value] of Object.entries(transcription)) {
                    if (value.hasOwnProperty("user") && value.user == current_uuid) {
                        blockUuidsToUpdate.add(blockUUID);
                    }
                }
            }
            for (const blockUuidToUpdate of blockUuidsToUpdate) {
            console.log("will update block.user " + blockUuidToUpdate + " => " + replacementCandidateUUID);
                updates[blockUuidToUpdate] = {
                    ...transcription[blockUuidToUpdate],
                    "user": replacementCandidateUUID
                }
            }
            console.log(updates);
            const newTranscription = {
                ...transcription,
                ...updates
            }
            setTranscription(newTranscription)
            // remove replacement
            setReplacementCandidateUUID("");
            // close modal
            handleClick();
        } else { // cancel form
            setReplacementCandidateUUID("");
        }
        setReplaceAll(false);
    }

    let parts = [];
    for (const [key, value] of Object.entries(speakers)) {
        const specific_class = (current_uuid == key) ? "current-speaker" : "select-another-speaker";
        console.log(current_uuid + "==" + key + " -> " + specific_class);
        console.log("*****>" + value.name);
        const modal_speaker_key = `modal-${key}`
        const onclick = (key == current_uuid) ? () => void(0) : () => setReplacementCandidateUUID(key);
        const o = (
            <li className={`"rounded-lg bg-white shadow hover:bg-sky-700 p-2 ${specific_class} max-h-32 items-center justify-center flex flex-col"`}
                onClick={onclick} key={modal_speaker_key}
                   >
                <p className="text-sm font-medium text-gray-900 text-center">{value["name"]}</p>
            </li>
        );
        parts.push(o);
    }

    //     <input type="hidden" name="replace_uuid" value={replacementCandidateUUID}/>
    // { ... (replacementCandidateUUID == "") ? { checked: false } : {} }
    return (
        <div className={showHideClassName}>
            <section className="modal-main rounded-lg">
                <div className="text-right">
                    <button onClick={handleClick} type="button" title="close"
                            className="rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 close">
                        <svg className="h-5 w-5" viewBox="0 0 53.7 53.7" fill="currentColor" aria-hidden="true">
                            <path
                                d="M35.6 34.4L28 26.8l7.6-7.6c.2-.2.2-.5 0-.7l-.5-.5c-.2-.2-.5-.2-.7 0l-7.6 7.6-7.5-7.6c-.2-.2-.5-.2-.7 0l-.6.6c-.2.2-.2.5 0 .7l7.6 7.6-7.6 7.5c-.2.2-.2.5 0 .7l.5.5c.2.2.5.2.7 0l7.6-7.6 7.6 7.6c.2.2.5.2.7 0l.5-.5c.2-.2.2-.5 0-.7z"/>
                        </svg>
                    </button>
                </div>
                <div className="flex flexRow">
                    <div className="flex basis-1/4 flex-col">
                        <div className="current basis-64">
                            Personne actuelle : {username}
                        </div>
                        <div className="modification basis-64">
                            <form action={form_process_replacement}>
                                <h2 className="text-base font-semibold leading-7 text-gray-900">Modification :</h2>
                                <div className="sm:col-span-4">
                                    <label htmlFor="username"
                                           className="block text-sm font-medium leading-6 text-gray-900">
                                        Speaker :
                                    </label>
                                    <p className="text-gray-900 font-bold pt-2 pb-2">{replacementCandidateName}</p>
                                </div>
                                <div className="relative flex gap-x-3">
                                    <div className="flex h-6 items-center">
                                        <input
                                            name="replace_all"
                                            id="replace_all"
                                            type="checkbox"
                                        checked={replaceAll}
                                        onChange={() => { console.log("==>==>==>"); console.log(this); setReplaceAll(!replaceAll)}}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                        />
                                    </div>
                                    <div className="text-sm leading-6">
                                        <label htmlFor="replace_all" className="font-medium text-gray-900">
                                            Tout remplacer
                                        </label>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-end gap-x-6"

                                >
                                    <button
                                        type="submit"
                                        value="cancel"
                                        name="submit"
                                        className="rounded-md bg-red-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        value="submit"
                                        name="submit"
                                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Sauver
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="flex basis-3/4 max-h-[80vh] overflow-y-auto pl-4 pr-4">
                        <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {parts}
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};
