# Project Mayday

## Components

Project Mayday is a flight simulator that is composed of three parts:
- The Controllers: `teamOne.js`, `teamTwo.js`, `teamLive.js`
- The Physics Engine: `simulation.es6`
- The 3D Graphics Engine: `graphics.js`

### The Controllers:

A valid controller is a file that exposes two functions: `initState(globalState)` and `getCommands(globalState, dt)`.

`initState(globalState)` takes in a dictionary that describes the entire global state. You can use this function to set your own internal state. This will only be called once, at the beginning of the simulation.

`getCommands(globalState, dt)` takes in a dictionary that describes the entire global state for a particular moment in time, as well as a dt measured in seconds. dt describes how long it has been since the last time the `getCommands` function was called. Note that dt is measured in simulation time, not real time.

This function returns a list of commands, where each command is a dictionary. A single command is something like "elevator: .4", which sets a control surface to a position between -1 and 1.

For example implementations, see `teamOne.js` and `teamTwo.js`.

### Physics Engine:

The physics engine is initialized by calling `initialize(red, blue)`, where `red` and `blue` are valid controllers. The physics engine will take care of initializing the controllers and the simulated environment.

It exposes a `step(globalState, dt)` function that propagates the simulation forward a single step. It also exposes `run(globalState, timesteps, dt)`, which runs `step` many times in series.

### The 3D Graphics Engine:

The graphics engine exposes many functions such as `buildRenderer()` and `buildScene()`. The API for this has not yet been ironed out.


## Combinability

The purpose of building the engine in three distinct parts is to combine them in different ways so that multiple use cases can be met:

### Command Line Simulation

If you are programming a controller, the best way to test it is to forego any 3d graphics and instead run the simulation to completion on the command line. You can dump data from the simulation by simply using `console.log("data", data);`. Since it runs on the command line, you can pipe the output to a file, grep for just the lines you want, and then graph the data however you prefer.

For the command line program, only the physics engine and the controllers are bundled together.

### Watching A Past Simulation

If you have already run a simulation on the command line, it can be fun to watch it unfold as a movie. To do so, simply change `visualizer.es6` to `grabData` from the appropriate .dat file, and open the file `visualizer.js` in a browser. The simulation will unfold before you like a movie.

When watching this type of visualization, only the 3D graphics engine is operating--no physics need to be propagated.

### Watching Controllers Operate

The file `interactive.es6` allows you to pit whichever two controllers you like against each other. This produces an experience similar to the visualizer mentioned above, but all code blocks are operating at once: The controllers, the physics engine, and the 3D graphics engine are all moving in lock step. This is especially helpful for debugging certain types of controller issues.

### Interactive flight simulator

When running in interactive mode, a special type of controller is available which asks the running browser for any available gamepads or joysticks. If it finds one, it will read the joystick inputs and produce controller commands that reflect the position of the joystick.

In other words: **you can fly the simulator in real time and dogfight against the controller you programmed**.


## Build Instructions

The program is built using webpack. Running `webpack` will build all three variants for you. If you are actively developing, I recommend using `webpack -w`.

You can also build using npm: `npm run build`, but that just runs webpack.
