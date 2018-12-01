# Jeoparty!
A competitive Jeopardy! game that features Jackbox style gameplay. Run the "board" screen on your laptop and use your mobile device as your controller to select clues, buzz in, and answer questions.

# A note on installation
The current installation system is obviously not ideal. It relies on AirConsole, a game development API that allowed me to use JS-powered phone to screen interaction that resembles Kahoot and Jackbox. AirConsole does have a store for published games but due to copyright issues, it would be problematic for me to post it there. Thus, the only current way to play is by using AirConsole's testing system on a local server. I apoligize for the inconvenice. Jeoparty! without reliance on the AirConsole API is hopefully on the way soon.

# Installation guide

## 1. Get the source code
Download this repository and save it wherever you like. Make sure to unzip it as well.

## 2. Run a local web server
*For the purposes of this installation guide I will explain how to use the 'Web Server for Chrome' chrome extension, which I personally endorse. If you have another method of running a local web server that you prefer, feel free to use it.*

Download the Web Server for Chrome extension on Google Chrome. Once it's installed, open up the extension. Select the 'Choose Folder' button and pick the folder where you have Jeoparty's sourownce code saved. If it says that your server is started make sure to turn it off and back on again at this point so it can refresh now that you've connected the game folder. It should now be displaying two IP addresses. The first will be 127.0.0.1 which is every computer's local IP, don't use this later on in the guide. The second one is the IP we will use to run the game. The second address will be randomized each time you start the server, but for the sake of this guide, let's say the IP address is http://18.40.63.233.

*Obviously, the above link should not work for you because it is not an actual URL available on the internet.*

## 3. Open the AirConsole test URL
AirConsole allows developers to test their games using this address: http://www.airconsole.com/#http://xx.xx.xx.xxx/. In the case of the example I provided in step 2, the URL would be http://www.airconsole.com/#http://18.40.63.233/. Change the URL to include the IP address you found in step 2 and navigate to it on your browser (which doesn't neccessarily need to be Chrome, I might add).

## 4. Connect to the game
If the server is running correctly and you've navigated to the right URL, you should now be ready to play. At this point, there should be a game code displayed on screen. Players can either navigate to https://www.airconsole.com or download the AirConsole app from the App or Play store and connect from there. No matter how they are connecting, each player needs to select 'Connect with game code' and punch in the game code displayed on screen.

*While testing this game we found that the AirConsole app is **much** better than the browser for latency. If you hope to win a lot of toss up buzzes, make sure to download the app.*

## 5. Play the game
Instructions that are relevant to gameplay can be found by clicking the 'Help' button on your phone screen, once you've connected to the game. The first player to join has control of starting the game, so wait until every player is connected, start the game, and enjoy!

# Future plans
I would like to move away from using AirConsole's API implementing a completely new 'phone to screen' game engine. Game logic and visuals can continue to be used regardless, but the system of having a host screen and multiple player screens independent of AirConsole would be best so the installation and play process wouldn't have to be so involved.
