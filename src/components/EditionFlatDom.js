"use client";
import React from "react";
import { useState, useContext } from 'react';
import { TranscriptContext } from '@/components/TranscriptContext';
import {findDifferences, moveLine, moveFirstWordAbove} from "@/components/DataStructure";


export function GenerateDomTextFromData(childrenUUIDs) {
    const {transcription, setTranscription} = useContext(TranscriptContext);
    let parts = '';
    childrenUUIDs.map((partUUID, index) => {
        const part = transcription[partUUID];
        const className =  index == 0 ? "firstWord" : "";
        if (part.kind == 'edition') {
            let editedNode = `<span x-data-uuid="${partUUID}" class="${className}">${part.content}</span>`;
            parts += editedNode;
        } else {
            const subwords = part.children.map(subwordUUID  => {
                const subword = transcription[subwordUUID]
                const p = "p" + (100 * subword.p.toFixed(1));
                return  `<span x-data-uuid="${subwordUUID}" x-data-p="${subword.p}" x-data-ms-start="${subword.ms_start}" x-data-ms-end="${subword.ms_end}" class="${p}">${subword.content}</span>`;
            }).join("");
            const wordClassName = "word" + (index == 0 ? " firstWord" : "");
            let word = `<span x-data-uuid="${partUUID}" class="${wordClassName}">${subwords}</span>`;
            parts += word;
        }
    });
    return parts;
}

export function ReverseDataFromDom(lineNode) {
    // 1. remove ux blocks
    let interestingPart = Array.from(lineNode.children);

    // 2. for each part, either its an edition or a word containing subwords
    let reversedData = [];
    for (let i=0; i<interestingPart.length; i++) {
        if (interestingPart[i].childElementCount == 0){
            let edition_node = {
                "kind": "edition",
                "content": interestingPart[i].textContent,
                "uuid": interestingPart[i].getAttribute('x-data-uuid')
            }
            reversedData.push(edition_node);
        } else {
            let word_node = {
                "kind": "word",
                "uuid": interestingPart[i].getAttribute('x-data-uuid'),
                "children": []
            }
            for (let j=0; j<interestingPart[i].childElementCount; j++){
                let subword = {
                    "uuid": interestingPart[i].children[j].getAttribute('x-data-uuid'),
                    "content": interestingPart[i].children[j].textContent
                }
                word_node.children.push(subword);
            }
            reversedData.push(word_node);
        }
    }
    return reversedData;
}

/**
 * From the detected reversed dom, generate updates to be applied on transaction context
 */
export function IdentifyUpdatesFromReversedDataFromDom(lineUUID, newDomData, transcription) {
    let topChildren = [];
    let updates = {};
    for (let i=0; i<newDomData.length; i++) {
        const currentEltUUID = newDomData[i]["uuid"];
        topChildren.push(currentEltUUID);
        if (newDomData[i].kind == "edition") {
            if (newDomData[i].content != transcription[currentEltUUID].content) {
                updates[currentEltUUID] = {
                    ...transcription[currentEltUUID],
                    "content": newDomData[i].content
                }
            }
        } else {
            let wordChildren = [];
            for (let j=0; j<newDomData[i].children.length; j++) {
                const subword = newDomData[i].children[j];
                const subwordUUID = subword["uuid"];
                wordChildren.push(subwordUUID);
                if (subword['content'] != transcription[subwordUUID].content) {
                    updates[subwordUUID] = {
                        ...transcription[subwordUUID],
                        "content": subword["content"]
                    }
                }
            }
            updates = findDifferences(updates, currentEltUUID, transcription[currentEltUUID], wordChildren);
        }
    }
    updates = findDifferences(updates, lineUUID, transcription[lineUUID], topChildren);
    return updates;
}


export function TranscriptionLineDom({uuid}) {
    const {transcription, setTranscription} = useContext(TranscriptContext);
    const onMoveLineAbove = (e) => {
        e.stopPropagation();
        console.log("moveLineAbove:" + uuid);
        const updates = moveLine(uuid, transcription);
        const newTranscription = {
            ...transcription,
            ...updates
        }
        setTranscription(newTranscription)
    }
    const onMoveFirstWordAbove = (e) => {
        e.stopPropagation();
        console.log("onMoveFirstWordAbove:" + uuid);
        const updates = moveFirstWordAbove(uuid, transcription);
        const newTranscription = {
            ...transcription,
            ...updates
        }
        setTranscription(newTranscription)
    }
    const onGetLineJSON = (e) => {
        e.stopPropagation();
        console.log(JSON.stringify(transcription));
    }
    const changeNotificationHandler = (e) => {
        e.stopPropagation();
        console.log("TranscriptionLine > changeNotificationHandler.");
    }
    const inputChangeHandler = (e) => {
        e.stopPropagation();
        console.log("TranscriptionLine > inputChangeHandler.");
        const newDomData = ReverseDataFromDom(e.target);
        const updates = IdentifyUpdatesFromReversedDataFromDom(uuid, newDomData, transcription);
        if (Object.keys(updates).length > 0) {
            console.log(updates);
            const newTranscription = {
                ...transcription,
                ...updates
            }
            setTranscription(newTranscription);
        }
    }
    const partAsDom = GenerateDomTextFromData(transcription[uuid].children);
    let x = (
       <p className="transcriptionLine"
          role="textbox" tabIndex={0}>
            <span className="moveLine uxOnly" onClick={onMoveLineAbove}>^</span>
            <span className="showJson uxOnly" onClick={onGetLineJSON}>json</span>
            <span className="moveFirstWord uxOnly" onClick={onMoveFirstWordAbove}>..</span>
            <span className="editableLine" contentEditable={true} spellCheck="false"
                  x-data-uuid={uuid}
                  onBlur={inputChangeHandler}
                  onInput={changeNotificationHandler}
                  dangerouslySetInnerHTML={{__html: partAsDom}}>
            </span>
        </p>
    );
    return x;
}