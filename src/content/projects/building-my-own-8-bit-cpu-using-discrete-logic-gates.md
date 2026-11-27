---
title: '8-bit cpu'
type: 'project'
headline: 'Building my own 8-bit cpu using discrete logic gates'
timeline: 'Nov 27'
date: '2026-11-27'
tech:
  - 'Verilog'
  - 'C'
---

Earlier this year I worked at [Tenstorrent](https://tenstorrent.com/en). Great company btw.

It was the first internship I had where I got to build on top of something physical, and I realized I really enjoyed that. There's something that rewards me with deep ikigai about working on a real, working object that will someday be in homes, centers and probably across the world in a few short years.

So naturally, it set off this aha moment in me to go deeper into understanding how the f all of this works, especially as someone who's been pure software forrrr around 4 years now. I've always admired the individuals around me who've disassembled things to their core to understand how things work.

I've felt like I haven't been technically challenged as much as I'd like to. I wanted a project I could really sink into, where almost everything is unknown territory. I want it to open up new possibilities for me technically and pull me out of the domain I'm so familiar with.

![image](/blog-img/building-my-own-8-bit-cpu-using-discrete-logic-gates-1795802946881.png)


### How I'm getting started

I'm using Ben Eater's [guide](https://eater.net/) for building the CPU on a breadboard, but making a few design adjustments to fit within the parts I have and goals I have for this project.

### Goals

#### CPU build

The full 8-bit computer on breadboards, out of individual logic chips I bought after doom scrolling on AliExpress yay. Clock, registers, ALU, RAM, program counter, and the control logic that ties it all together.

#### My own assembly code

I want to be able to run something on this design, so I'll create an instruction set myself, write programs in my own assembly, and build a little assembler in Python that turns it into the 1s and 0s I flip into RAM.

#### Verilog

For each module I build, I'll rewrite it in Verilog and test it with Python (cocotb) so the code behaves exactly like the hardware on my desk.

#### MAC unit

A multiply-accumulate unit so it can do dot products (which is the core math behind every neural network). This unit is at the core of a lot of the AI-forward chips we've been seeing from Tenstorrent, NVIDIA and Google, so I wanna build one too.

#### FPGA

Scale that up into a tiny systolic array (a grid of MAC units, the same idea inside AI chips like the ones at Tenstorrent) and run a small neural net on hardware I designed myself.

### What I'm trying to get out of this

I think as our technology has become more ingrained into the naturalness of our routines, the next big thing will be to make all of these interactions we have with intelligent systems *come alive*. I dream of working at the companies that are making that possible right now, but I realized the current technical proficiency I have doesn't even let me scrape the surface of what it means to be an engineer at these companies. I hope by seeing this project through end to end I'll be able to learn a system, a process, and then be able to judge what I enjoyed most.

### Tech stack

- **Timing:** NE555 timers
- **Logic:** 74LS series chips (74LS04 NOT, 74LS08 AND, 74LS32 OR, 74LS173 registers, 74LS245 bus buffers, 74LS283 adders, 74LS86 XOR)
- **Build:** 830-point breadboards, 22 AWG solid-core wire, a 5V breadboard power supply
- **Debugging:** a multimeter and a DIY LED probe (you'll see why)
- **Next:** Verilog, Python + cocotb for testbenches, an FPGA board

Next up we'll talk in depth about each module, starting with the clock, aka the part that took me way longer than it should have 🙃
