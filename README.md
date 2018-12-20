# Jeoparty!
A local multiplayer Jeopardy! game. Run the board screen on your laptop and use your mobile device as your controller to select clues, buzz in, and answer questions. Play alone, or with a limitless number of friends!

# Installation Guide (to play locally)

## 1. Download the repository
Download this repository onto your computer by clicking the green
"Clone or Download" button in the upper right hand corner of the repository's front page.
Make sure to unzip it before going on.

## 2. Navigate to the game folder
Use the terminal to navigate to the folder where you saved the repository.

```
cd Documents/GitHub/jeoparty
```

## 3. Download Node dependencies
This game requires a few packages from Node.js in order to function so now we
need to install all of the things that the game needs. Node.js lets you do this easily with one command.

```
npm install
```

## 3. Run the node server
Now we need to turn on a server so that the website has a local host.

```
node server
```

## 4. Go to the game URL
If the node server was enabled correctly, it should print out the URL of the
game website and the session ID. Go to the given URL on your computer's browser. I strongly recommend using Google
Chrome when playing, the graphics and text to speech functions run much more
smoothly.

## 5. Enjoy!
Go to the same URL as you did on your computer with your mobile device. Then, join the session by entering the session ID displayed on screen and in the terminal. From there, follow the instructions on screen and have fun! Plug your laptop into a TV or monitor for maximum enjoyment.

# Credits
## Tools used:
* [jService.io](http://jservice.io)
* [Socket.io](https://socket.io)
* [Node](https://nodejs.org/en/)
* [Express](https://expressjs.com)
* [Node IP](https://github.com/indutny/node-ip)
* [NoSleep](https://github.com/richtr/NoSleep.js?files=1)
* [Remove Accents](https://github.com/tyxla/remove-accents)
* [Number to Words](https://github.com/marlun78/number-to-words)
* [Words to Numbers](https://github.com/finnfiddle/words-to-numbers)

## Special thanks to:
* Matt Morningstar
* Max Thomsen
* Matt Baldwin
* Pranit Nanda
* Attic Stein Beats

# Copyright
The Jeopardy! game show and all elements thereof, including but not limited to copyright and trademark thereto, are the property of Jeopardy Productions, Inc. and are protected under law. This repository is not affiliated with, sponsored by, or operated by Jeopardy Productions, Inc.

Jeoparty! is not and never will be for profit, there are NO advertisements, and NO price to pay. If this game is distributed elsewhere with either of those costs, it is without my knowledge, and without my consent.
