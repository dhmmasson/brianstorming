package lap;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.jar.Attributes.Name;

import edu.smu.tspell.wordnet.Synset;
import edu.smu.tspell.wordnet.WordNetDatabase;

public class BasicWordnet implements WordProducer {
	public String nextWord(String[] context) {
		String[] s = getCloseWords(context[0].toString()) ; 
		return s[0];
	}
	
	public String[] getCloseWords (String wordForm ) {
	
		
		//  Get the synsets containing the wrod form
		WordNetDatabase database = WordNetDatabase.getFileInstance();
		Synset[] synsets = database.getSynsets(wordForm,null, true) ;
		//  Display the word forms and definitions for synsets retrieved
		
		ArrayList<String> words = new ArrayList<String>(); 
		if (synsets.length > 0)
		{

			for (int i = 0; i < synsets.length; i++)
			{
				String[] wordForms = 					
						synsets[i].getWordForms();		
				
				for (int j = 0; j < wordForms.length; j++) {
					words.addAll(Arrays.asList(wordForms[j].split(" "))) ;
				}
				words.addAll(Arrays.asList(synsets[i].getDefinition().split(" "))) ;
				
				
				//	System.out.println(": " + synsets[i].getDefinition());
			}
		}
		
		
		String[] s = new String[1] ;
		s = (String[]) words.toArray(s);
		//System.out.println(words);
		
		return s;
	}

	public String nextWord(LinkedList<Word> previousWords, String secret) {
		String str ;
		ArrayList<String> al = new ArrayList<String>() ; 
		int safety = 0 ; 
		for (Word word : previousWords) {
			al.add(word.logos);
		}
		String [] strArray = getCloseWords(secret);
		do {
			str = strArray[((int) (Math.random () * strArray.length))];
			str = str.toLowerCase() ;
			if (!str.contains(secret) && !secret.contains(str)  && !al.contains(str)) return str ;
			if (safety ++> 1000) {
				System.err.println("oups");
				return str ; 
			}
		} while (true) ;
		
	}

}
