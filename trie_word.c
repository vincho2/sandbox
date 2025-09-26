#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define ALPHABET_SIZE 26

// Structure of a node of the trie
typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];
    char value[25];
} TrieNode;


TrieNode *create_node();
void insert(TrieNode *root, const char *input_key, char *output_value);
void translate(TrieNode *root, const char *input_key);

// Example of usage
int main() {
    
    // Initialize the intitial empty node of the trie that will store the data 
    TrieNode *root = create_node();
    if (root == NULL) {
        printf("Not enough memory to create new node");
        return 1;
    }

    // Insert input_keys and values in the tree
    insert(root, "Bonjour", "Hello");
    insert(root, "Bonsoir", "Good Night");
    insert(root, "Au revoir", "Good bye");

    translate(root, "Bonjour");
    translate(root, "Bonsoir");
    translate(root, "Au revoir");
    translate(root, "Bon matin");

    return 0;
}

//-------------------------------------------------------------------------------------------------
// Fonction to insert a input_key in the trie
//-------------------------------------------------------------------------------------------------
void insert(TrieNode *root, const char *input_key, char *output_value) {

    // Define traversal pointer to navigate across the tree
    TrieNode *traversal = root;
    
    // Loop in each letter of the input input_key
    for (int i = 0; input_key[i] != '\0'; i++) {
        
        // Set index (a or A = 0, b or B = 1, etc) 
        int index = tolower(input_key[i]) - 'a';                 // Ignore case 
        if (index < 0 || index >= ALPHABET_SIZE) continue;      // Ignore non-alphabetic characters

        // If the node where the current letter should be stored does not exist, then create it
        if (traversal->children[index] == NULL) {
            traversal->children[index] = create_node();
        }
        // Go to next node (existing or just created) before checking the next letter 
        traversal = traversal->children[index];
    }
    // When reaching the last letter, se the end of input_key flag to 1 (to indicate the end of the input_key) 
    strcpy(traversal->value, output_value);
}

//-------------------------------------------------------------------------------------------------
// Fonction to Search a input_key in the trie
//-------------------------------------------------------------------------------------------------
void translate(TrieNode *root, const char *input_key) {

    // Define traversal pointer to navigate across the tree
    TrieNode *traversal = root;

    // Initialize translated word to display
    char translated_word[25] = "not found";
    
    // Loop on each letter of the input_key to check for its existence
    for (int i = 0; input_key[i] != '\0'; i++) {
        int index = tolower(input_key[i]) - 'a';
        if (index < 0 || index >= ALPHABET_SIZE) continue;

        if (traversal->children[index] == NULL) {
            printf("Translation of %s is %s\n", input_key, translated_word);
            return;
        }
        traversal = traversal->children[index];
    }

    if (strlen(traversal->value) > 0) {
        strcpy(translated_word, traversal->value);
    }
    // Print results
    printf("Translation of %s is %s\n", input_key, translated_word);
}
//-------------------------------------------------------------------------------------------------
// Function to create a new virgin node
//-------------------------------------------------------------------------------------------------
TrieNode *create_node() {

    // Define node pointer and allocate memory to this new node
    TrieNode *node = malloc(sizeof(TrieNode));

    // Return null in case of memory fail
    if (node == NULL) {
        return NULL;
    }
    // Set value to NULL
    node->value[0] = '\0';
    // Set each child pointe to NULL
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        node->children[i] = NULL;
    }
    // Return the brand new virgin node
    return node;
}