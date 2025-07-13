import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DFA {


    private List<State> stateList =  new ArrayList<>();

    public DFA() {

    }

    public void dfa_run(String input_string){
        boolean isFinal= false;
        Map<Character,List<State>> stateMap =  new HashMap<>();
        State startState =  new State();
        State current_state = startState;

        for (int pos=0; pos<input_string.length(); pos++){
          char c = input_string.charAt(pos);

          State finalState = new State();

          stateMap.computeIfAbsent(c, k -> new ArrayList<>()).add(finalState);
          finalState = current_state;

        }

      }
    is
}




}