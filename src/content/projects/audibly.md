---
title: 'Audibly'
headline: 'Somehow programming a real-time ASL translation model <24h'
timeline: 'Feb 2026'
type: 'project'
tech:
  - 'Python'
  - 'TensorFlow'
  - 'MediaPipe'
  - 'VOSK'
searchDescription: 'Real-time sign language and speech-to-text translation for video calls'
date: '2026-02-01'
links:
  - name: 'github'
    link: 'https://github.com/rumezaa/audibly'
---

Audibly is an accessibility app that translates American Sign Language and speech to text in real time, outputting to a virtual camera you can plug into Zoom, Teams, or Google Meet. The ASL side uses TensorFlow and MediaPipe for hand gesture and pose detection across 9 recognized signs, with a majority-vote pipeline and text-to-speech output. The speech-to-text side runs on VOSK with support for 10+ languages. Both modes render live captions onto a virtual camera feed so the person on the other end can read along.
