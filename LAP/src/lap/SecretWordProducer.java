package lap;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;

public class SecretWordProducer implements WordProducer {
	ArrayList<String> words ;
	
	public SecretWordProducer() {
		words = new ArrayList<String>(Arrays.asList(
					"beer", "pen", "cat", "phone", "glass", "shell", "coin", "key", "plate", "camera", "dice", "perfume",
					"sock", "star", "candy","wings","salutations","power","string","carburetor","shopping","blond","steak",
					"speakers","grimace","case","stubborn","couch","announcement","cat","elevator","marker"));
	
	
	}
	
	
	@Override
	public	String nextWord(String[] context) {
		int i = (int) (Math.random()*words.size()) ;
		String s = words.get(i) ;
		words.remove(i) ;
		return s ;
	
	}

}
