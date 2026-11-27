---
title: 'Audibly'
type: 'project'
headline: 'Somehow programming a real-time ASL translation model <24h'
timeline: 'Feb 2026'
searchDescription: 'Real-time sign language and speech-to-text translation for video calls'
date: '2026-02-01'
tech:
  - 'Python'
  - 'TensorFlow'
  - 'MediaPipe'
  - 'VOSK'
links:
  - name: 'github'
    link: 'https://github.com/rumezaa/audibly'
---

A few weeks before this hackathon, I made a project for my deep learning class that translated alphabet-level ASL signs into text.

I wanted to challenge myself over a weekend to build on that project for a hackathon, and instead improve and train the model to translate WLASL, a dataset of full ASL words.


---

The first step was collecting data, but this became a point of contention (as I'll mention later), since most of the videos in the dataset were well-lit and perfectly positioned clips of people signing.

I was pretty confused about how to build the parsing pipeline so the model would be real-time enough to translate motions from a camera input, but I ended up coming up with this workflow:


![image](/blog-img/audibly-1795738328257.png)


That meant transforming the dataset I had. Instead of standalone videos, each sign became a packet of frames I could combine to form the word.

#### Turning a frame into numbers

For every frame, I used MediaPipe to find 33 points on the body and 21 points on each hand. Each body point has an x, y, z and a visibility score, and each hand point has an x, y and z. Flattened out, that's one list of 258 numbers per frame. If a hand isn't in view, its spots get filled with zeros, so every frame is always exactly 258 long.

extract_keypoints in asl.py

Packing frames so the model can see motion

One frame is just one pose, and a sign is movement. So I stacked 30 frames in order, which turns every sign into a 30 × 258 grid (7,740 numbers). That grid is what the model actually learns from. Training data has the same shape, just with lots of packets: (num_clips, 30, 258).

Packing frames into 30 × 258 packets

A rolling window for live video

Live video never tells you where a sign starts or ends. So the app keeps a rolling window of the most recent 30 frames (about one second). Every new frame pushes the oldest one out, and the window gets fed to the model. Frames only get added while hands are in view, and the model only runs once hands have shown up in at least half of those 30 frames.

A rolling window over the live feed

The rolling window in asl.py

Step 3: the model

The model reads the 30 frames in order using GRU layers, which are built for sequences. That's what lets it learn how a sign moves, not just what one pose looks like. The first layer is bidirectional, so it reads the motion both forwards and backwards. At the end, it outputs 9 probabilities that add up to 1, one for each word it knows: agree, hello, no, ok, problem, question, thank you, understand and yes.

Inside the model

Step 4: making it less jumpy

The first live version was so jumpy. Because the model guesses on every frame, it would fire on half-finished gestures and words would flash on screen while my hands were still moving.

So a guess has to pass a few checks before it becomes a word. It has to be at least 40% confident, win a majority vote over the last 10 guesses, be at least 50% confident, and stay the same word for half a second. I also added a delay before the same word can repeat, which helped the system tell where one sign ended and the next began, so the other person sees a sentence forming instead of random words popping up.

Deciding when a word is real

The smoothing logic in asl.py

These are all the knobs, in one place:

Config values in asl.py

Step 5: the data problem comes back

Remember the perfectly lit videos? When I tested Audibly on an actual call, it mostly fell apart. Signs were coming back as the wrong words. The model wasn't unsure, it was confidently wrong, which is how I knew the problem was the data and not the model.

Almost every training clip was clean, centered and well lit, and a real call is none of that. The shaky, off-center landmarks from a live call ended up looking closer to some other sign's clean pattern than to their own.

So I made the training data worse on purpose. I added noise, jitter and rotations so the model saw messy versions of every sign, and recognition on live calls got so much better.

Making the training data messier on purpose

Step 6: getting it into the call

The last piece was getting the captions somewhere people would actually see them. Audibly draws the captions onto the video and sends it to a virtual camera, alongside speech-to-text in 10+ languages using VOSK. In your video call, you just pick Audibly as your camera.

Sending frames to the virtual camera

What I learned

We placed top 3 out of 100+ teams at Hack The Bias! The biggest thing I took away from it: don't trust results from an environment you built yourself. Test it where it's actually going to live.

Built with Python, TensorFlow, MediaPipe, OpenCV, VOSK and pyvirtualcam.
