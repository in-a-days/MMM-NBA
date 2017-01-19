# NBA Score Parser by in-a-days
# Inspired by MMM-NFL by fewieden
# MIT License
# Please Use and Please Distribute
#!/usr/bin/python

import urllib2
import sys

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

def to_node(type, message):
    # convert to json and print (node helper will read from stdout)
    try:
        print(json.dumps({type: message}))
    except Exception:
        pass
    # stdout has to be flushed manually to prevent delays in the node helper communication
    sys.stdout.flush()

to_node("status", "NBA Scores started...")

url = 'http://www.espn.com/nba/bottomline/scores'
response = urllib2.urlopen(url)
scoreData = response.read()

# Set up Variables

games = 0
gameNum = 1
findData = 999
intHolder = 0
currentPosition = 0
strHolder = ""

# String cleanup

scoreData = scoreData.replace("%20", " ")
scoreData = scoreData.replace("&nba_s_", " ")
scoreData = scoreData.replace("delay=120", "")
scoreData = scoreData.replace("left", "")
scoreData = scoreData.replace("right", "")
scoreData = scoreData.replace("stamp", "")
scoreData = scoreData.replace("loaded=true", "")
scoreData = scoreData.replace("count", "")

# Build more variables

arraySize = len(scoreData)-1
intHolder = scoreData[arraySize-1]
findData = scoreData[arraySize-2]

# Find # of games played

if findData == '=':
	games = int(intHolder)	
else:	
	games = int(findData * 10) + int(intHolder)

intHolder = 0
complete = False

# Build Arrays

class gameData:
    homeTeam = [None] * (games+1)
    awayTeam = [None] * (games+1)
    homeScore = [None] * (games+1)
    awayScore = [None] * (games+1)
    gameTime = [None] * (games+1)
    winningTeam = [None] * (games+1)

# Begin Parse / Main Program

while currentPosition < arraySize:
	complete = False
	if is_number(scoreData[currentPosition]) == True:
		intHolder = int(scoreData[currentPosition])
		if intHolder == gameNum and scoreData[currentPosition+1] == '=' and scoreData[currentPosition-1] != '_':
			currentPosition += 2
			if scoreData[currentPosition] == '^':
				gameData.winningTeam[gameNum] = 'Away'
				currentPosition += 1
			else:
				gameData.winningTeam[gameNum] = 'Home'

# Find Away Team Name

			while is_number(scoreData[currentPosition]) == False and complete == False:
				strHolder += scoreData[currentPosition]
				currentPosition += 1
				if scoreData[currentPosition] == 'a' and scoreData[currentPosition+1] == 't' and scoreData[currentPosition+2] == ' ':
					strHolder = strHolder[0:len(strHolder)-1]
					gameData.awayTeam[gameNum] = strHolder
					strHolder = ""
					currentPosition += 2
					complete = True
				elif is_number(scoreData[currentPosition]) == True:
                                        strHolder = strHolder[0:len(strHolder)-1]
                                        gameData.awayTeam[gameNum] = strHolder
                                        strHolder = ""	
					intHolder = int(scoreData[currentPosition])
					gameData.awayScore[gameNum] = intHolder
					currentPosition += 1
					complete = True

# Parse Away Team Scores

					if is_number(scoreData[currentPosition]) == True:
						gameData.awayScore[gameNum] *= 10	
						intHolder = int(scoreData[currentPosition])
						gameData.awayScore[gameNum] += intHolder
					if is_number(scoreData[currentPosition+1]) == True:
						gameData.awayScore[gameNum] *= 10
						currentPosition += 1
						intHolder = int(scoreData[currentPosition])
						gameData.awayScore[gameNum] += intHolder

# Find Home Team Names & Scores
			
			while is_number(scoreData[currentPosition]) == True:
				currentPosition += 1
			while scoreData[currentPosition] == ' ':
				currentPosition += 1
			while scoreData[currentPosition] != '(' and is_number(scoreData[currentPosition]) == False:
				if scoreData[currentPosition] == '^':
					currentPosition += 1
				strHolder += scoreData[currentPosition]
				currentPosition += 1
			strHolder = strHolder[0:len(strHolder)-1]
			gameData.homeTeam[gameNum] = strHolder
			strHolder = ""
			while is_number(scoreData[currentPosition]) == False and scoreData[currentPosition] != '(':
	  			currentPosition += 1
			if is_number(scoreData[currentPosition]) == True:
				intHolder = int(scoreData[currentPosition])
				gameData.homeScore[gameNum] = intHolder
				currentPosition += 1
				if is_number(scoreData[currentPosition]) == True:
					gameData.homeScore[gameNum] *= 10
	                        	intHolder = int(scoreData[currentPosition])
	                       	 	gameData.homeScore[gameNum] += intHolder
		        	if is_number(scoreData[currentPosition+1]) == True:
	                        	gameData.homeScore[gameNum] *= 10
	                        	currentPosition += 1
                   	        	intHolder = int(scoreData[currentPosition])
	                        	gameData.homeScore[gameNum] += intHolder

# Get Game Times

			if scoreData[currentPosition] != '(':
				currentPosition += 1
			while scoreData[currentPosition-1] != ')':
				strHolder += scoreData[currentPosition]
				currentPosition += 1
			gameData.gameTime[gameNum] = strHolder
			strHolder = ""

#Report

			print 'Game', gameNum, gameData.awayTeam[gameNum], gameData.awayScore[gameNum], '@', gameData.homeTeam[gameNum], gameData.homeScore[gameNum], gameData.gameTime[gameNum]
			gameNum += 1
		else:
			currentPosition = currentPosition+1
	else: currentPosition = currentPosition+1

to_node("message", gameData.homeTeam)
