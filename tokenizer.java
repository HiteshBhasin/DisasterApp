
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class tokenizer {
   
    public void TokenizerMethod(String file_path) throws Exception {
        BufferedReader fileReader =  new BufferedReader(new FileReader(file_path));
        Map <String , List<String>> tokenMap =  new HashMap<>();
        String line = fileReader.readLine(); 

        while(line!=null){
            String [] stringArray = line.trim().split("\\s+");
            for(String s: stringArray){
                if (s.length()>1){
                    for(char c : s.toCharArray()){
                        if (Character.isDigit(c)){
                            tokenMap.computeIfAbsent("NUMBER", k -> new ArrayList<>()).add(String.valueOf(c));
                        } if (Character.isAlphabetic(c)){
                            String newString="";
                            newString+=c;
                             tokenMap.computeIfAbsent("KEYWORD", k -> new ArrayList<>()).add(newString);
                        } else if (c=='+'|| c=='-'|| c=='*'|| c=='/'|| c=='%'){
                              tokenMap.computeIfAbsent("OPERATOR", k -> new ArrayList<>()).add(String.valueOf(c));
                        } else if(c=='('){
                             tokenMap.computeIfAbsent("LPARENTH", k -> new ArrayList<>()).add(String.valueOf(c));
                        } else if(c==')'){
                             tokenMap.computeIfAbsent("RPARENTH", k -> new ArrayList<>()).add(String.valueOf(c));
                        }
                        } 
                    } if (s.length()==1){
                         tokenMap.computeIfAbsent("IDENTIFIER", k -> new ArrayList<>()).add(s);
                } 
            }
        
        }



    }
}
