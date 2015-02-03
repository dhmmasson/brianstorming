package lap;

import java.util.LinkedList;

public class Game {
	LinkedList<Round> rounds ; 
	int maxRound ; 
	Player [] players ; 
	final SecretWordProducer sp = new SecretWordProducer(); 
	public Game() {
		rounds = new LinkedList<Round>() ;
		maxRound = 10 ; 
		
		players = new Player[3] ;
		for (int i = 0 ; i < 3 ; i++) {
			players[i] = new Player( "john" + i) ; 
		}
		//create an intial round 
		
	
	}
	/**
	 * go through the game
	 */
	void play () {
		while (!isFinished()) nextRound () ; 
	}
	void nextRound () {
		System.out.println("playing round " + rounds.size());
		//create a new round 
		Round currentRound = new Round (sp, players) ; 
		currentRound.play(rounds) ; 
		rounds.push(currentRound) ; 
		
	}
	boolean isFinished() {
		return rounds.size() >= maxRound  ;
	}
	
}
