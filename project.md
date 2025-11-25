# Overview
You are making a website for tracking root games over time. It should work from mobile, and be lightweight/simple.

# Features

## Users

The website should have a standardized user login flow with either oauth flows or username/password.
Users will have both their website username as well as their direwolf username. This will be important for attributing wins later.

## Leagues

Users can create/join leagues. Leagues are password protected. The creater of the league is the league admin, but can make other users admins. Admins can kick users and delete the league.

## Game tracking

The core of the website is game tracking. There will be a mechanism for adding played games and then break downs including metrics like win percentage, average score, and stats about faction choice/map choice. 
There are two mechanisms for uploading games. One is manually. Each played game will have the following fields:
- Date (defaults to current date)
- Names of players
- For each player final score (exactly one player should have a score of 30+, unless someone has won via dominance+. This player is the winner). If a player has gone for a dominance victory instead that should be noted instead of a score. Note that it is possible to have both a score and go for dominance victory. Note that it is also possible for the vagabond faction to win alongside another faction by playing for dominance. If so they should also get marked as a winner but of a special type. There can be multiple of these vagabond secondary winners
- For each player, faction played
- Map name

The second method of adding played games is to upload an image of the score screen. This screen then must be processed to infer the aformentioned fields. We should figure out what the best way to do this is reliabley and cheaply. Examples of score screens are available in the scores folder

## Game analysis

We want some basic analysis to start per league like win rates, most chosen factions, etc. We can come up with a few views that are interesting and expand as we get more data.
