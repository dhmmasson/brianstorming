package lap;

import java.util.LinkedList;
import java.util.Random;

public class Round {
	Word[] secret ;
	Player[] players, team1, team2 ; 
	
	LinkedList<Word> words ; 
	
	
	public Round(SecretWordProducer sp, Player[] _players) {
		players = _players ; 
		//create the two secret password		
		secret = new Word[2] ; 
		
		secret[0] = new Word(Player.getSecretPlayer(), sp.nextWord(null));
		secret[1] = new Word(Player.getSecretPlayer(), sp.nextWord(null));
		
		//create the two teams 
		int alone = (int) Math.floor(Math.random() * 3) ; 
		team1 = new Player[1];
		team1[0] = players[alone] ;
		team2 = new Player[2];
		team2[0] = players[(alone > 0) ? 0 : 1 ] ;
		team2[1] = players[(alone == 2) ? 1 : 2 ] ;
		//assign secrets word to team
		team1[0].setCurrentSecretWord(secret[0]);
		team2[0].setCurrentSecretWord(secret[1]) ;
		team2[1].setCurrentSecretWord(secret[1]) ;	
		
		System.out.println("secrets words are " + secret[0].logos + "("+team1[0].name  + ") "  + secret[1].logos);
		
		words = new LinkedList<Word>() ; 
 	}
	void play (LinkedList<Round> previousRound) {
		while (!isFinished() )
			nextPlayer() ; 
		teamResolution () ; 
	}
	//ask the nex player to say his word add it to the list
	void nextPlayer () {
		words.push(players[words.size()%3].play (words));
	}
	//ask each players his guess for the teams ; 
	//and notify them if they are correct or not
	//and update their score
	void teamResolution () {
		for (Player p : players) {
			if (p.guessAlone () == team1[0]) {
				//TODO apply rules correctly
				p.updateScore () ; 
			}
		}
	}
	boolean isFinished () {
		return words.size() == 6 ; 
	}
}
