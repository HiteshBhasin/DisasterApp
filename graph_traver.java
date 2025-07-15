import java.util.*;
public class graph_traver {
    private class Node{
        private int data;
        private Node adjNode;
        private int position;
        List<Node> nodeList;
        public Node(int data) {

            this.data = data;
            adjNode = new Node(data);
        }

        public int getData() {
            return data;
        }

        public Node getAdjNode() {
            return adjNode;
        }


        public void addNeighbours(Node node){
            adjNode = node;
           nodeList =  new ArrayList<>();
            nodeList.add(adjNode);

        }

        public int getPosition(Node node){
            position = nodeList.indexOf(node);
            return position;
        }

    }

    private int data;
    private Node node; 
    private int size;
    private HashMap<Node, List<Node>> edgedGraph;
    public graph_traver() {
        node =  new Node(data);
        size = 0;
        edgedGraph =  new HashMap<>();
    }

    public int getSize(){
        return size;
    }
    
    public void addEdge(Node srcNode, Node destNode){
        edgedGraph.get(srcNode).add(destNode);
    }

    public void addNode(Node Node ){
        node.addNeighbours(Node);
    }

    public List<Node> getNeighbour(Node node){
        return edgedGraph.get(node);
    }


    public void Graph_traverse_dfs(graph_traver graph, Node node){
        boolean [] visited = new boolean[graph.getSize()];
        Stack<Node> holdingStack =  new Stack<>();
        int position =  node.getPosition(node);
        if(!visited[position]){
            visited[position] = true;
            holdingStack.add(node);
        }
        for (Node n :getNeighbour(node)){
            position = n.getPosition(n);
             if(!visited[position]){
            visited[position] = true;
            holdingStack.add(n);
            Graph_traverse_dfs(graph, n);
        }
        holdingStack.pop();
        
    }
    
}
