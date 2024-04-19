"use client";
import Image from "next/image";
import { TranscriptionEdition } from '@/components/Edition.js'
import {DATA_SPEECH_DEMO} from "@/data/transcript-example";
import React, { useState } from 'react';

export default function App() {
    const transcription_example = DATA_SPEECH_DEMO;
    return (
    <section className="flex">
         <TranscriptionEdition transcription={transcription_example} />
    </section>
  );
}

