# Jeoparty!
A local multiplayer Jeopardy! game. Run the board screen on your laptop and use your mobile device as your controller to select clues, buzz in, and answer questions. Play alone, or with a limitless number of friends!

# How to Play

## 1. Download the repository
Download this repository onto your computer by clicking the green
"Clone or Download" button in the upper right hand corner of the GitHub page.
Make sure to unzip it before going on.

## 2. Navigate to the game folder
Use the terminal to navigate to the folder where you saved the repository. For
this example I saved the folder in /Documents/GitHub/jeoparty.

In terminal:
```
cd Documents/GitHub/jeoparty
```

## 3. Download Node dependencies
This game requires a few packages from Node.js in order to function so now we
need to install all of the things the game needs in the game folder.

In terminal:
```https://www.socket.io
npm install
```

## 3. Run the node server
Now we need to turn on a server so that the website can run locally.

In terminal:
```
node server
```

## 4. Go to the game URL
If the node server was enabled correctly, it should print out the URL of the
game website. Go to this URL on your computer. I strongly recommend using Google
Chrome when playing, the graphics and text to speech functions run much more
smoothly. Despite this, other browsers can run the game just the same.

## 5. Enjoy!
Go to the same URL as you did on your computer with your mobile devies and join the game. Plug your laptop into a TV or monitor for maximum enjoyment.

# Future Plans
I plan to publish this game to a website online so that no downloads or personal installation is neccessary.

# Copyright
The Jeopardy! game show and all elements thereof, including but not limited to copyright and trademark thereto, are the property of Jeopardy Productions, Inc. and are protected under law. This website is not affiliated with, sponsored by, or operated by Jeopardy Productions, Inc.

# Credits
Libraries used:
* [Socket.io](socket.io)
* [Express.js](expressjs.com)
* [Node.js](nodejs.com)
* [Node IP](github.com/indutny/node-ip)
