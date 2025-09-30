#include <stdio.h>
#include <stdlib.h>

const int NB = 10;
const int NB_LIST[] = {5, 2, 3, 14, 6, 8, 7, 9, 1, 4, 0};
int list_size = sizeof(NB_LIST) / sizeof(int);

typedef struct node
{
    int number;
    struct node *next;
} node;

void free_memory(node *list);

int main(void)
{
    // Build initial list pointer
    node *list = NULL;
    int element_value;

    // Loop on each element raw value list (simulate input by a user)
    for (int i = 0; i < list_size; i++)
    {
        // Get next element value
        element_value = NB_LIST[i];
        
        // Create new memory block for the next node element to add
        node *nx = malloc(sizeof(node));
        if (nx == NULL)
        {
            free_memory(list);
            return 1;
        }

        // Initialize values of the new node
        nx->number = element_value;
        nx->next = NULL;

        // If the resulting list is empty, the list is the new block pointer
        if (list == NULL)
        {
            list = nx;
        }

        // Else if the new element is smaller than the 1st element in the chain, then add it as
        // first element of the chain
        else if (element_value < list->number)
        {
            nx->next = list;
            list = nx;
        }

        // Else if the new element should be inserted elsewhere
        else
        {
            // Loop on each node of the chain
            for (node *nl = list; nl != NULL; nl = nl->next)
            {
                // If the end of the chain is reached, put the element at the end
                // And stop looping
                if (nl->next == NULL)
                {
                    nl->next = nx;
                    break;
                }

                // Else (there is a next element in the chain)
                // 
                if (element_value < nl->next->number)
                {
                    nx->next = nl->next;
                    nl->next = nx;
                    break;
                }
            }
        }
    }

    // Print numbers of the list in their order
    node *n = list;

    while (n != NULL)
    {
        printf("%i\n", n->number);
        n = n->next;
    }

    free_memory(list);
}

// ------------------------------------------------------------------------------------------
// Function to free memory of the list
// ------------------------------------------------------------------------------------------
void free_memory(node *list)

{

    node *tmp = NULL;
    while (list != NULL)
    {
        tmp = list->next;
        free(list);
        list = tmp;
    }
}
    