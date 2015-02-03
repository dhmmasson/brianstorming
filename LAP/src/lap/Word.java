package lap;

public class Word {
	String logos ; 
	Player origin ; 
	
	public Word(Player _origin, String _logos) {
		logos = _logos ; 
		origin = _origin ; 
	}

	public String toString() {
		
		// TODO Auto-generated method stub
		return (origin.name + " " + logos) ; 
	}
}
