package lap;
public class UserInterface {

	
	public static void main(String[] args)
	{
		if (args.length > 0)
		{
			//  Concatenate the command-line arguments
			StringBuffer buffer = new StringBuffer();
			for (int i = 0; i < args.length; i++)
			{
				buffer.append((i > 0 ? " " : "") + args[i]);
			}
		}
		else
		{
			System.err.println("You must specify " +
					"a word form for which to retrieve synsets.");
		}
		
		Game g = new Game() ; 	
		
		g.play() ; 
		
		
		
	}

}
