package lap;

import java.util.LinkedList;

/**
 * Represents a player of the game
 * @author dimitrimasson
 *
 */
public class Player {
	/**
	 * name of the player
	 */
	static Player secretPlayer ;  
	String name ;  
	Word currentSecretWord ; 
	/**
	 * Player's score, updated at the end of each turn
	 */
	int score ; 
	/**
	 * List of word already said by the users. 
	 * is this useful ?
	 */
	LinkedList<Word> words ; 
	final BasicWordnet wp = new BasicWordnet() ; 
	static Player getSecretPlayer () {
		if (secretPlayer == null) secretPlayer = new Player ("secret") ; 
		return secretPlayer ; 
	}
	
	Word play (LinkedList<Word> previousWords) {
		Word wd = new Word(this, wp.nextWord( previousWords, currentSecretWord.logos )); 
		System.out.println(wd.toString());
		return wd ;  
	}
	
	
	Player guessAlone () {
	//TODO stub
		return this ; 
	}
	void setCurrentSecretWord (Word secretWord) {
		currentSecretWord = secretWord ; 
	}
	public Player(String _name) {
		name = _name ; 
	}

	public void updateScore() {
		// TODO Auto-generated method stub
		
	}
}
